# Modelo de dados

Persistência: **arquivo JSON único**, `data/classlog-db.json` (caminho
configurável via env `CLASSLOG_DATA_DIR`). Carregado em memória no boot
(`ensureDatabase()` em `server.js`) e regravado a cada mutação
(`persistDatabase()`). Não há banco relacional — o próprio README sugere isso
como melhoria futura antes de produção "oficial" em escala.

## Entidades (campos principais)

### `users`
`id`, `username`, `displayName`, `role` (`teacher`/`coordinator`/`admin`),
`schoolIds` (array — quais escolas o usuário acessa), `salt` + `hash` (senha via
scrypt). Credenciais de teste estão no `README.md` — não duplicar aqui.

### `reports` (ocorrências / registros de diário)
`id`, `schoolId`, `createdBy`, `selectedStudents[]` (cada item tem `fullName`,
`classKey`, `targetType`: `'student'` ou `'class'`), `occurrenceTypes[]`,
`recordKind` (`'occurrence'` ou `'daily'`), `occurredAt`, `notes`,
`photoDataUrl` (ou `photoKey` quando enfileirado offline), `handwritingData`,
`location`, `comments[]`, `auditTrail[]`, `status` (`'aberta'` etc.),
`deletedAt`/`deletedBy` (soft delete).

### `settings` (configuração por escola)
`schools[]` — cada escola: `id`, `name`, `palette`, `schedule` (`start`/`end`),
`occurrenceTypes[]`, `policies.disciplinaryMomentEnabled`. Também guarda
`holidays[]` (datas ISO) usadas no cálculo de dias úteis do momento disciplinar.

### `settings.timetable` (grade horária)
Objeto único na raiz de `settings`, **não** por escola:
`entries[]` (cada bloco: `id`, `weekday` 1–7 no padrão ISO com 1 = segunda,
`start`/`end` no formato `HH:MM`, `title`, `kind`
(`class`/`break`/`meal`/`university`/`other`), `schoolId`, `classKey`,
`location`, `notes`), mais `notificationsEnabled`, `reminderMinutes` e
`dailySummaryTime`.

Blocos podem se **sobrepor** de propósito (na grade real, aula da UFN das
13h30–15h10 convive com bloco de 13h50–14h10). Por isso o modelo é uma lista
plana, não uma matriz horário×dia; a guia Horário monta a tabela agrupando por
faixa `start|end` distinta.

A semente (`DEFAULT_TIMETABLE_ENTRIES` em `server.js`) só é aplicada quando
`settings.timetable` está **ausente**. Se estiver presente e vazio, respeita —
é o usuário que apagou tudo. Cuidado: `PUT /api/settings` recebe payload sem
`timetable` quando a tela de configuração salva; há uma guarda explícita no
handler para não ressemear por cima da grade nesse caso.

Este mesmo objeto é o que alimenta o widget e as notificações do Android — ver
[`android.md`](android.md).

### `disciplinaryActions` (momento disciplinar)
`id`, `schoolId`, `studentFullName`, `startDate`/`endDate` (`YYYY-MM-DD`),
`totalBusinessDays`, `status` (`'active'`/`'completed'`), `history[]` (dias
adicionados + quem/quando). Conta dias úteis ignorando fins de semana e feriados
cadastrados; só pode ser aplicado a alunos individuais, nunca à turma inteira
(checagem explícita em `app.js`, função de salvar momento disciplinar).

### `gradeRecords` (menções/notas)
`id`, `schoolId`, `classKey`, `studentFullName`, `termKey` (formato tipo
`2026-b2`, bimestre), `formalAssessments` (`ab`, `abRecovery`, `ai`,
`aiRecovery`, `philosophyAb`, `philosophyAbRecovery` — cada um string de menção
ou `''`/`undefined` quando não preenchido), `overrides` (`activity`,
`behaviorValues`, `formal`, `final` — sobrescritas manuais do cálculo
automático), `statusOverride`/`philosophyStatusOverride`
(`'approved'`/`'failed'`/`''`), `notes`.

> O cálculo real das menções **não** é feito no servidor — `server.js` só
> valida e persiste (`normalizeMention`, `normalizeGradeRecords`). Toda a lógica
> de média/aprovação vive em `calculateStudentGrades()` no `app.js`. Ver
> [`grading-rules.md`](grading-rules.md).

## Escala de menções
```js
const mentionScale = { ND: 0, EP: 3, A: 5, AL: 7, AE: 9 };
const mentionOrder = ['ND', 'EP', 'A', 'AL', 'AE'];
```
`ND` e `EP` = reprovado (`automaticStatus = 'failed'`); `A`/`AL`/`AE` = aprovado.

## Offline (IndexedDB, `classlog-offline` v2 — `offline-store.js`)
Object stores: `sessions`, `contexts`, `drafts`, `reports`, `queue` (fila de
envio pendente, indexada por `clientRequestId`), `photos`. O service worker
também abre esse banco para sincronizar em background (`sync` event).
