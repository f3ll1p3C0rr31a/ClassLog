# Arquitetura

## Visao geral

ClassLog e um app Node.js simples com paginas HTML estaticas, JavaScript no cliente, um servidor `server.js` e suporte PWA/mobile via Capacitor.

## Principais arquivos

- `server.js`: servidor, APIs, autenticacao e persistencia.
- `app.js`: logica principal do cliente.
- `offline-store.js`: cache e sincronizacao local para uso com internet instavel.
- `handwriting.js`: anotacao manuscrita.
- `service-worker.js`: suporte PWA/offline.
- `index.html`: selecao de alunos.
- `occurrence.html`: escolha da ocorrencia.
- `finalize.html`: finalizacao e salvamento.
- `history.html`: historico.
- `login.html`: acesso.
- `settings.html`: configuracao.
- `capacitor.config.json`: configuracao Capacitor.
- `scripts/prepare-web-assets.js`: prepara arquivos web para mobile/PWA.
- `scripts/deploy-production.sh`: contrato de deploy em producao.

## Persistencia

O historico e as configuracoes ficam no servidor local em:

- `data/classlog-db.json`

Esse arquivo deve ser preservado em deploys.

## Mobile e PWA

O projeto Android fica em `android/`.

Comandos importantes:

- `npm run web:prepare`
- `npm run mobile:sync`
- `npm run mobile:android`
- `npm run mobile:build:android`
- `npm run mobile:assets`

## Deploy

O deploy automatico roda pelo GitHub Actions em:

- `.github/workflows/deploy.yml`

O workflow usa runner self-hosted no Jupiter:

- labels: `self-hosted`, `linux`, `x64`, `classlog-jupiter`

Fluxo do deploy:

1. checkout do codigo;
2. validacao JavaScript com `node --check`;
3. preparacao dos assets PWA;
4. `npm audit --omit=dev`;
5. execucao de `bash scripts/deploy-production.sh`;
6. backup da pasta atual;
7. copia dos arquivos para `/home/fellipecorreia/sites/classlog/app`;
8. restart apenas do container `classlog-api`;
9. health check em `http://127.0.0.1:3000/api/auth/me` dentro do container.
