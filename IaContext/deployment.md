# Deploy

## Fluxo
1. `git push origin main` (HTTPS, remote `origin` configurado para
   `https://github.com/f3ll1p3C0rr31a/ClassLog.git`).
2. Dispara `.github/workflows/deploy.yml` (gatilho: push em `main`, ou manual via
   `workflow_dispatch`).
3. O job roda em um **runner self-hosted** chamado `Saturno-ClassLog`
   (`runs-on: [self-hosted, linux, x64, classlog-saturno]`), instalado em
   `/opt/actions-runner-classlog` **dentro do CT 101 "ct-web"** do servidor
   Saturno.
4. Passos do job:
   - **Checkout** com `git fetch` puro, não `actions/checkout` — baixar a action
     passa por `codeload.github.com`, que devolve 429 com frequência e derruba o
     job antes de qualquer coisa nossa rodar.
   - **Validate and prepare web assets**: `node --check` em todos os `.js`,
     `npm test` e `npm run web:prepare`, tudo dentro de um
     `docker run --rm node:22-alpine`. O CT não tem Node instalado de propósito.
   - **Deploy**: `bash scripts/deploy-production.sh`.
5. `scripts/deploy-production.sh`: confere que o banco existe → backup gzip do
   JSON → `rsync` do checkout para `/dados/sites/classlog/app` → `docker compose
   -p classlog -f docker-compose.production.yml up -d --build` → espelha o
   compose para `/opt/stacks/classlog/compose.yml` (Dockge) → `docker image
   prune -f` → health check.

Ou seja: **"basta dar o commit e fazer push"** — não há passo manual de deploy
depois disso.

## Onde tudo mora (Saturno / CT 101 "ct-web")

| Coisa | Caminho |
|---|---|
| Checkout de produção | `/dados/sites/classlog/app` |
| Banco (JSON único) | `/dados/sites/classlog/data/classlog-db.json` |
| Backups do banco | `/dados/sites/classlog/backups/` (20 mais recentes) |
| Stack visível no Dockge | `/opt/stacks/classlog/compose.yml` + `.env` |
| Runner | `/opt/actions-runner-classlog` |
| Serviço systemd | `actions.runner.f3ll1p3C0rr31a-ClassLog.Saturno-ClassLog` |
| Container | `classlog-api`, porta `8097:3000`, rede `classlog_interna` |
| Reverse proxy | Caddy no CT 102 "ct-proxy" → `192.168.0.241:8097` |

Acesso: `ssh saturno` (LAN `192.168.0.11`) ou `ssh saturno-ts` (Tailscale
`100.68.161.47`), chave `~/.ssh/proxmox`, usuário `root`. De dentro do host,
`pct exec 101 -- bash -lc '...'` entra no CT.

## Os dois `.env`
- `/dados/sites/classlog/app/.env` — só `CLASSLOG_SECRET`. É o `env_file` do
  container. **Excluído do rsync**, então o deploy nunca o sobrescreve.
- `/opt/stacks/classlog/.env` — `CLASSLOG_SECRET` + `CLASSLOG_APP_DIR`. Existe
  porque o Dockge abre o compose de `/opt/stacks/classlog`, onde `context: .`
  não apontaria para o checkout. O mesmo arquivo de compose serve aos dois
  lugares graças a `${CLASSLOG_APP_DIR:-.}`.

## O health check compara o commit, não só o status
`/api/version` devolve `APP_COMMIT_SHA`, injetado como `ARG` no build da imagem.
O deploy só passa quando o commit servido é o que acabou de ser publicado —
antes, o check batia em `/api/auth/me` e passava mesmo com o container antigo
ainda de pé.

## Histórico: a migração do Jupiter
Até agosto de 2026 isto rodava no NAS **Jupiter** (`192.168.0.10`), com o
container criado por um `docker run` avulso e o deploy copiando uma **lista
fixa de arquivos** para o diretório bind-montado. Jupiter saiu do ar; o
ClassLog agora vive no Saturno.

Duas coisas mudaram junto e vale saber por quê:
- **De lista fixa para imagem construída.** Aquela lista de arquivos em
  `deploy-production.sh` não incluía páginas novas: `schedule.html` teria ficado
  de fora de produção sem ninguém perceber. Agora o `Dockerfile` faz `COPY . .`
  e é o `.dockerignore` que decide o que fica de fora.
- **De `docker restart` para `compose up --build`.** Reiniciar um container que
  bind-monta o código não tem versão nem rollback. Agora cada deploy gera uma
  imagem carimbada com o commit.

## `www/` é gerado, não editar à mão
`www/` é uma cópia espelhada da raiz, gerada por
`scripts/prepare-web-assets.js`. Ela existe para o build mobile
(Capacitor/Android); a versão web é servida a partir da raiz pelo `server.js`, e
o `.dockerignore` mantém `www/` fora da imagem.

## Autenticação do git nesta máquina
`gh` CLI instalado e autenticado como `f3ll1p3C0rr31a`; `gh auth setup-git`
configurou o credential helper, então `git push`/`pull` via HTTPS autentica
sozinho. Confirme com `gh auth status` e `git config --get credential.helper`
antes de assumir que quebrou.

**Se parar de funcionar numa máquina nova**: instale o `gh`, rode `gh auth login`
(device code + URL, precisa da confirmação do usuário no navegador — rode com
`run_in_background` e timeout generoso) e depois `gh auth setup-git`. Não existe
forma de logar sem essa confirmação.
