# Deploy

## Fluxo
1. `git push origin main` (HTTPS, remote `origin` configurado para
   `https://github.com/f3ll1p3C0rr31a/ClassLog.git`).
2. Dispara `.github/workflows/deploy.yml` (gatilho: push em `main`, ou manual via
   `workflow_dispatch`).
3. O job roda em um **runner self-hosted** chamado `classlog-jupiter`
   (`runs-on: [self-hosted, linux, x64, classlog-jupiter]`) — uma máquina própria
   do usuário (host "Jupiter", `192.168.0.10` na rede local / acessível também
   via Tailscale), não um runner da nuvem do GitHub.
4. Passos do job: `node --check` em todos os `.js` principais →
   `npm run web:prepare` (regenera `www/`) → `npm audit --omit=dev` →
   `bash scripts/deploy-production.sh`.
5. `scripts/deploy-production.sh`: stage dos arquivos → backup do diretório de
   produção (`/home/fellipecorreia/sites/classlog/app`) → copia os arquivos →
   `docker restart classlog-api` → health-check em `/api/auth/me` por ~30s.

Ou seja: **"basta dar o commit e fazer push"** — não há passo manual de deploy
depois disso, desde que o push chegue ao GitHub e o runner em Jupiter esteja
online.

## Por isso o push é importante
Não basta commitar localmente — o pipeline só dispara com o `git push` chegando
no GitHub. Um commit local sem push **não** atualiza produção.

## Autenticação do git nesta máquina (estado conhecido)
Nesta máquina (Hera), no momento em que este documento foi escrito:
- O remote `origin` está em HTTPS e **não há credencial salva** (nem
  `~/.git-credentials`, nem `.netrc`, nem `gh` CLI instalado).
- Existem duas chaves SSH locais (`~/.ssh/id_ed25519`, `~/.ssh/jupiter`), mas
  **nenhuma delas está autorizada** na conta do GitHub
  (`f3ll1p3C0rr31a/ClassLog`) — testado com `ssh -T git@github.com`, retornou
  `Permission denied (publickey)`.
- Identidade local do git (`user.name`/`user.email`) precisou ser configurada
  manualmente (`fellipecorreia <fellipecorreia@users.noreply.github.com>`,
  igual aos commits anteriores) — não havia identidade global configurada.

**Se uma IA for pedir para fazer push e isso falhar de novo**: não existe
solução automática sem o usuário gerar um token
(https://github.com/settings/tokens) ou autorizar uma chave SSH em
https://github.com/settings/keys, ou rodar `gh auth login` interativamente.
Não há TTY na ferramenta de Bash do Claude Code para digitar senha — peça para
o usuário rodar o `git push` no terminal dele mesmo.

## `www/` é gerado, não editar à mão
`www/` é uma cópia espelhada da raiz, gerada por
`scripts/prepare-web-assets.js` (rodado em `npm run web:prepare`,
`npm run mobile:sync`, e no workflow de deploy). Editar `app.js`/`*.html`/
`styles.css`/`service-worker.js` na raiz **sem** rodar `web:prepare` deixa
`www/` desatualizado — só importa para o build mobile (Capacitor/Android); a
versão web/PWA é servida a partir da raiz pelo `server.js`.
