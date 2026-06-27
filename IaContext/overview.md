# Visão geral

## O que é
ClassLog é um app mobile-first (PWA + Android via Capacitor) para professores e
coordenação registrarem ocorrências escolares (comportamento, atividades não
feitas, etc.), acompanharem momentos disciplinares e lançarem menções/notas
bimestrais. Multi-escola: cada escola tem cores, horário, tipos de ocorrência e
políticas próprias. A escola ativa troca automaticamente pelo horário do dia.

Escolas configuradas por padrão (ver `README.md`): **Fátima** (particular,
07:15–12:30) e **EC303** (pública, 13:00–18:00).

## Papéis de usuário
- **teacher**: só visualiza, não edita menções nem salva configurações.
- **coordinator**: cria/edita/exclui ocorrências, gerencia momento disciplinar,
  edita menções, acessa `settings.html`.
- **admin**: acesso multi-escola + tudo que coordinator tem.

Funções de checagem de papel em `server.js`: `canCoordinate(user)`,
`canAccessSchool(user, schoolId)`, `getAccessibleSettings(user)`. No client
(`app.js`), os gates equivalentes são `canManageSettings()`, `canEditGrades()`,
`canCoordinate()`.

## Stack — sem framework, sem build step
- **Backend**: Node.js puro (`http` nativo, sem Express) em `server.js`. Roteamento
  manual por `pathname`.
- **Frontend**: HTML estático + um único `app.js` vanilla (sem React/Vue, sem
  bundler) compartilhado por todas as páginas via `document.body.dataset.page`
  para diferenciar comportamento por página.
- **Sem banco de dados relacional**: tudo persiste em um JSON
  (`data/classlog-db.json`). Ver [`data-model.md`](data-model.md).
- **PWA**: `manifest.webmanifest` + `service-worker.js` (cache-first para
  estáticos, bypass de `/api/*`).
- **Offline**: IndexedDB via `offline-store.js` (filas de sincronização, sessão,
  rascunhos, fotos).
- **Mobile**: Capacitor (`capacitor.config.json`, pasta `android/`), webDir
  apontando para `www/` (uma cópia gerada dos arquivos da raiz).

## Páginas (todas em `data-page="..."` no `<body>`, lidas por `app.js`)
| Arquivo | Função |
|---|---|
| `login.html` | autenticação |
| `index.html` | seleção de alunos/turma |
| `occurrence.html` | escolha do tipo de ocorrência / "Registro de Diário" |
| `finalize.html` | data, localização, foto, observação, botão salvar |
| `history.html` | histórico de ocorrências, comentários, auditoria |
| `grades.html` | painel de menções (Bimestral/Retomada, Atv/CeV, Filosofia) |
| `settings.html` | dashboard de configuração (só coordinator/admin) |
| `privacy.html` | política de privacidade |

## Fluxo principal de uso
1. Login (`login.html`) → sessão por cookie (web) ou Bearer token (Android).
2. `index.html`: seleciona aluno(s) ou turma inteira.
3. `occurrence.html`: escolhe tipo(s) de ocorrência **ou** "Registro de Diário".
4. `finalize.html`: completa dados e salva — vai para IndexedDB primeiro
   (`window.ClassLogOffline.savePendingReport`), sincroniza com `/api/reports`
   quando online.
5. `history.html`: consulta/edita/comenta ocorrências já salvas.
6. `grades.html`: lança/ajusta menções bimestrais (só com permissão e online —
   ver `saveStudentGrade` em `app.js`, que bloqueia edição offline).

## Arquivos-chave para qualquer tarefa
- `app.js` — toda a lógica client-side (estado, render, regras de negócio do
  cálculo de notas, seleção de alunos, salvar ocorrência). É grande (~3000+
  linhas) e monolítico; busque pela função pelo nome em vez de ler linear.
- `server.js` — toda a API REST (`/api/...`), autenticação, persistência no JSON.
- `service-worker.js` — cache do PWA. **Sempre suba `CACHE_NAME` ao editar
  qualquer asset estático.**
- `offline-store.js` — wrapper de IndexedDB usado tanto pela página quanto pelo
  service worker (sincronização em background).
- `scripts/prepare-web-assets.js` — copia os arquivos da raiz para `www/` (usado
  pelo build mobile **e** pelo workflow de deploy).
