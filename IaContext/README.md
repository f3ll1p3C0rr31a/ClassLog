# IaContext — Contexto do projeto ClassLog para IAs

Esta pasta existe para que qualquer assistente de IA (Claude, GPT, Gemini, etc.)
consiga entender o projeto rapidamente sem precisar varrer todo o código do zero.
Sincronizada via Syncthing (`.stfolder/`) entre as máquinas do Fellipe — não apagar
essa subpasta.

## Índice
- [`overview.md`](overview.md) — o que é o ClassLog, stack, páginas, papéis de usuário.
- [`data-model.md`](data-model.md) — onde os dados ficam e como são estruturados.
- [`grading-rules.md`](grading-rules.md) — regras de negócio do cálculo de menções
  (História/Filosofia, Bimestral/Retomada, ATV/CEV). **Leia antes de tocar em
  `calculateStudentGrades` em `app.js`.**
- [`deployment.md`](deployment.md) — como o deploy funciona (push → GitHub Actions
  → runner self-hosted "Jupiter" → Docker) e a pegadinha do cache do Service Worker.
- [`deploy.md`](deploy.md) — guia **generalizado** para replicar esta arquitetura
  de deploy (GitHub Actions + runner self-hosted + Docker + gh CLI) em outro projeto,
  incluindo checklist de verificação de ambiente para múltiplas máquinas.
- [`android.md`](android.md) — app Android (Capacitor), widget do horário,
  notificações e publicação via Obtainium. **Leia antes de tocar em `android/`
  ou na ponte `callNative()` do `app.js`.**
- [`gotchas.md`](gotchas.md) — armadilhas já encontradas que custaram tempo de debug.
- [`AGENTS.md`](AGENTS.md) e a pasta [`docs/`](docs/) — instruções e histórico de
  decisões usados antes desta reorganização; ainda válidos como referência.

## Regra de ouro ao editar este projeto
Toda alteração em `app.js`, `styles.css`, `*.html` ou `service-worker.js` precisa:
1. Ser espelhada em `www/` rodando `npm run web:prepare` (ou o `git commit`/push vai
   fazer isso automaticamente via GitHub Actions, mas localmente fica desatualizado
   até rodar o comando).
2. Rodar `npm test` (lógica de grade horária + filtros do histórico + layout do
   widget). É rápido e pega quebra de contrato entre `server.js` e `app.js`.
3. Subir a versão de `CACHE_NAME` em `service-worker.js` — senão os clientes (PWA)
   continuam servindo os arquivos antigos do cache, mesmo depois do deploy. Ver
   [`gotchas.md`](gotchas.md).
