# Instrucoes para o Codex

Sempre leia antes de alterar o projeto:

- `README.md`
- `IA-Context/README.md`
- `IA-Context/docs/contexto.md`
- `IA-Context/docs/arquitetura.md`
- `IA-Context/docs/tarefas.md`
- `IA-Context/docs/decisoes.md`

Padroes:

- Nao alterar estrutura sem explicar.
- Criar commits pequenos.
- Priorizar codigo simples e documentado.
- Manter mudancas de deploy bem restritas ao ClassLog.
- Ao mexer em producao, evitar afetar outros servicos do servidor.
- Validar alteracoes JavaScript com `node --check` nos arquivos tocados quando fizer sentido.
- Para mobile, rodar `npm run mobile:sync` antes de abrir ou compilar o Android.

Observacoes importantes:

- O contexto vivo deste projeto fica em `IA-Context/`, nao em `docs/` na raiz.
- Esta pasta e sincronizada fora do Git; nao coloque segredos nela.
- Se alguma decisao mudar, registre em `IA-Context/docs/decisoes.md`.
