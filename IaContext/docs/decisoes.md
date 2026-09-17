# Decisoes

## Contexto de IA fora do Git

Decisao: manter contexto de assistentes em `IA-Context/`, sincronizado por Syncthing e ignorado pelo Git.

Motivo: nao tentar sincronizar conversas; sincronizar o contexto do projeto entre maquinas.

## Caminho de contexto

Decisao: o contexto vivo fica dentro de `IA-Context/`, e nao em `docs/` na raiz.

Motivo: separar documentacao operacional de IA da documentacao publica/versionada do projeto.

## Deploy em producao

Decisao: deploy pelo GitHub Actions usando runner self-hosted no Jupiter.

Motivo: evitar dependencia de acesso SSH externo fragil ao servidor privado.

Contrato atual:

- workflow: `.github/workflows/deploy.yml`;
- script: `scripts/deploy-production.sh`;
- destino: `/home/fellipecorreia/sites/classlog/app`;
- container reiniciado: `classlog-api`;
- backup antes da copia;
- preservacao de `data/classlog-db.json`.

## Persistencia atual

Decisao: manter `data/classlog-db.json` por enquanto.

Motivo: projeto ainda e simples e leve.

Risco conhecido: banco JSON e limitado para uso oficial em producao. O README registra como proximo passo trocar por banco relacional e revisar permissoes por perfil.

## Nome de exibicao e apelidos dos alunos

Decisao: cada escola guarda `studentNames` (chave = nome oficial) com `displayName` e `nicknames[]`, editados na aba Configuracao.

Motivo: alunos sao conhecidos por outros nomes/sobrenomes; isso facilita achar o aluno na lista de selecao.

Regra: exibicao e apelidos valem so na tela. O PDF do Historico (que vai para os pais) usa sempre o nome oficial completo (`getStudentOfficialLabel`, `summarizeReports(..., { official: true })`). Os testes em `scripts/check-app-logic.js` barram apelido no PDF.
