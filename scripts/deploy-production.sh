#!/usr/bin/env bash
set -Eeuo pipefail

BASE_DIR="${CLASSLOG_DEPLOY_BASE:-/home/fellipecorreia/sites/classlog}"
APP_DIR="${BASE_DIR}/app"
BACKUP_DIR="${BASE_DIR}/backups"
STAMP="$(date +%Y%m%d-%H%M%S)"
STAGE_DIR="${BASE_DIR}/.deploy-${GITHUB_SHA:-manual}-${STAMP}"
BACKUP_FILE="${BACKUP_DIR}/classlog-app-${STAMP}.tar.gz"

FILES=(
  package.json
  server.js
  app.js
  styles.css
  offline-store.js
  handwriting.js
  index.html
  occurrence.html
  finalize.html
  history.html
  login.html
  settings.html
  privacy.html
  manifest.webmanifest
  service-worker.js
  capacitor.config.json
  README.md
)

cleanup() {
  rm -rf -- "${STAGE_DIR}"
}
trap cleanup EXIT

mkdir -p "${STAGE_DIR}/icons" "${BACKUP_DIR}"

for file in "${FILES[@]}"; do
  install -D -m 0644 "${file}" "${STAGE_DIR}/${file}"
done

find icons -maxdepth 1 -type f -print0 | while IFS= read -r -d '' icon; do
  install -D -m 0644 "${icon}" "${STAGE_DIR}/${icon}"
done

node --check "${STAGE_DIR}/server.js"
node --check "${STAGE_DIR}/app.js"
node --check "${STAGE_DIR}/offline-store.js"
node --check "${STAGE_DIR}/handwriting.js"
node --check "${STAGE_DIR}/service-worker.js"

test -s "${APP_DIR}/data/classlog-db.json"
tar -C "${BASE_DIR}" -czf "${BACKUP_FILE}" app
test -s "${BACKUP_FILE}"
tar -tzf "${BACKUP_FILE}" >/dev/null

cp -a "${STAGE_DIR}/." "${APP_DIR}/"

node --check "${APP_DIR}/server.js"
node --check "${APP_DIR}/app.js"
test -s "${APP_DIR}/data/classlog-db.json"

docker restart classlog-api

for _ in $(seq 1 30); do
  if docker exec classlog-api wget -qO- http://127.0.0.1:3000/api/auth/me >/tmp/classlog-health.json 2>/dev/null; then
    cat /tmp/classlog-health.json
    echo
    echo "Backup created at ${BACKUP_FILE}"
    exit 0
  fi
  sleep 1
done

docker logs --tail 80 classlog-api >&2
exit 1
