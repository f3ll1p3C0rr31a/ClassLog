# Tarefas

## Rotina antes de alterar

- Ler `README.md`.
- Ler `IA-Context/AGENTS.md`.
- Ler os arquivos em `IA-Context/docs/`.
- Checar `git status --short`.
- Entender se a mudanca afeta web, mobile, deploy ou dados.

## Validacao local sugerida

- Para alteracoes em JavaScript:
  - `node --check server.js`
  - `node --check app.js`
  - `node --check offline-store.js`
  - `node --check handwriting.js`
  - `node --check service-worker.js`
- Para assets web/mobile:
  - `npm run web:prepare`
  - `npm run mobile:sync`
- Para servidor local:
  - `npm start`

## Deploy

- Deploy automatico em push para `main`.
- Deploy manual disponivel por `workflow_dispatch`.
- Antes de mexer no deploy, revisar:
  - `.github/workflows/deploy.yml`
  - `scripts/deploy-production.sh`
- Manter restart restrito ao container `classlog-api`.
- Nao alterar Nginx Proxy Manager ou outros servicos sem necessidade explicita.

## Melhorias futuras registradas no README

- Cadastro de alunos por turma.
- Filtro por periodo e por aluno.
- Exportacao em PDF.
- Sincronizacao com servidor remoto.
- Assinatura do responsavel ou confirmacao pedagogica.
- Historico individual por aluno.
