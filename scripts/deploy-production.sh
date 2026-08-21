#!/usr/bin/env bash
set -Eeuo pipefail

# Deploy de produção no Saturno (Proxmox), dentro do CT 101 "ct-web".
# O checkout vive em /dados/sites/classlog/app e o arquivo de stack visível no
# Dockge em /opt/stacks/classlog.
#
# Roda a partir do runner self-hosted `classlog-saturno`, disparado por push em
# main. Não há passo manual.
BASE_DIR="${CLASSLOG_DEPLOY_BASE:-/dados/sites/classlog}"
STACK_DIR="${CLASSLOG_STACK_DIR:-/opt/stacks/classlog}"
APP_DIR="$BASE_DIR/app"
DATA_DIR="$BASE_DIR/data"
BACKUPS_DIR="$BASE_DIR/backups"
COMPOSE_FILE="docker-compose.production.yml"
PROJECT="classlog"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
WORKSPACE="${GITHUB_WORKSPACE:-$(pwd)}"
APP_COMMIT_SHA="${GITHUB_SHA:-$(git -C "$WORKSPACE" rev-parse HEAD)}"
export APP_COMMIT_SHA

mkdir -p "$APP_DIR" "$BACKUPS_DIR"

# O banco inteiro é um JSON só. Ele não pode ser recriado a partir do
# repositório, então nada segue adiante sem ele existir e ter conteúdo.
echo "==> Conferindo o banco"
if [ ! -s "$DATA_DIR/classlog-db.json" ]; then
  echo "ERRO: $DATA_DIR/classlog-db.json não existe ou está vazio. Restaure antes de publicar." >&2
  exit 1
fi

echo "==> Backup do banco"
gzip -c "$DATA_DIR/classlog-db.json" > "$BACKUPS_DIR/classlog-db-$TIMESTAMP.json.gz"
test -s "$BACKUPS_DIR/classlog-db-$TIMESTAMP.json.gz"
gzip -t "$BACKUPS_DIR/classlog-db-$TIMESTAMP.json.gz"
echo "Backup em $BACKUPS_DIR/classlog-db-$TIMESTAMP.json.gz"
ls -1t "$BACKUPS_DIR"/classlog-db-*.json.gz | tail -n +21 | xargs -r rm --

echo "==> Sincronizando o checkout em $APP_DIR"
rsync -a --delete \
  --exclude '.env' \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'data' \
  "$WORKSPACE/" "$APP_DIR/"

if [ ! -f "$APP_DIR/.env" ]; then
  echo "ERRO: $APP_DIR/.env não existe. Crie antes do primeiro deploy (precisa de CLASSLOG_SECRET)." >&2
  exit 1
fi

echo "==> Construindo e subindo os containers"
cd "$APP_DIR"
docker compose -p "$PROJECT" -f "$COMPOSE_FILE" up -d --build

echo "==> Espelhando o arquivo de stack para o Dockge ($STACK_DIR)"
if [ -d "$STACK_DIR" ]; then
  cp "$APP_DIR/$COMPOSE_FILE" "$STACK_DIR/compose.yml"
fi

echo "==> Limpando imagens órfãs"
docker image prune -f

# O health check compara o commit servido com o que acabou de ser publicado.
# Só checar se a porta responde não distingue "subiu a versão nova" de
# "o container antigo continua de pé".
echo "==> Health check"
for _ in $(seq 1 60); do
  VERSION_RESPONSE=$(curl -sf http://127.0.0.1:8097/api/version 2>/dev/null || true)
  if [[ "$VERSION_RESPONSE" == *"\"commit\":\"$APP_COMMIT_SHA\""* ]]; then
    if curl -sf http://127.0.0.1:8097/login.html >/dev/null; then
      echo "Health check passou para o commit $APP_COMMIT_SHA"
      exit 0
    fi
  fi
  sleep 2
done

echo "Health check FALHOU — despejando logs"
echo "Commit esperado: $APP_COMMIT_SHA"
echo "Endpoint de versão: ${VERSION_RESPONSE:-indisponível}"
docker compose -p "$PROJECT" -f "$COMPOSE_FILE" logs --tail 50 classlog-api
exit 1
