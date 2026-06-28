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

## Autenticação do git nesta máquina (resolvido em 2026-06-27)
Nesta máquina (Hera), `git push`/`pull` para `origin`
(`https://github.com/f3ll1p3C0rr31a/ClassLog.git`, HTTPS) **já funciona sem
intervenção manual**:
- `gh` CLI (GitHub CLI) está instalado (`pacman -S github-cli`) e autenticado
  como `f3ll1p3C0rr31a` (`gh auth login --git-protocol ssh --web`, fluxo de
  device code confirmado pelo usuário no navegador).
- `gh auth setup-git` configurou `~/.gitconfig` com
  `credential.helper = !/usr/bin/gh auth git-credential` para
  `https://github.com` e `https://gist.github.com`. Isso faz qualquer
  `git push`/`pull`/`fetch` via HTTPS autenticar automaticamente usando o
  token do `gh`, sem prompt, sem chave SSH e sem o usuário digitar nada.
- Identidade local do git (`user.name`/`user.email`) está configurada como
  `fellipecorreia <fellipecorreia@users.noreply.github.com>`, igual aos
  commits anteriores.
- Confirme com `gh auth status` (deve mostrar `Logged in to github.com
  account f3ll1p3C0rr31a`) e `git config --get credential.helper` antes de
  assumir que está quebrado de novo.

**Se isso parar de funcionar numa sessão/máquina nova** (ex.: outra IA, outro
PC): instale o `gh` CLI e rode `gh auth login` (gera um device code +
URL — peça para o usuário abrir o link e digitar o código no navegador; o
comando fica bloqueado esperando, então rode com `run_in_background` e um
timeout generoso) e depois `gh auth setup-git`. Não existe forma de logar sem
essa confirmação do usuário no navegador (ou um token colado por ele) — não
adianta tentar `ssh -T git@github.com` ou inventar credencial sozinho.

## `www/` é gerado, não editar à mão
`www/` é uma cópia espelhada da raiz, gerada por
`scripts/prepare-web-assets.js` (rodado em `npm run web:prepare`,
`npm run mobile:sync`, e no workflow de deploy). Editar `app.js`/`*.html`/
`styles.css`/`service-worker.js` na raiz **sem** rodar `web:prepare` deixa
`www/` desatualizado — só importa para o build mobile (Capacitor/Android); a
versão web/PWA é servida a partir da raiz pelo `server.js`.
