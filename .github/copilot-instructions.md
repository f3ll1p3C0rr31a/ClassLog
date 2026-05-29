# Copilot Instructions

Este workspace contém o ClassLog, um protótipo mobile-first para registro de ocorrências escolares.

## Objetivo
- Priorizar uso em celular.
- Permitir seleção rápida do aluno.
- Registrar ocorrência com tipos pré-definidos e campo livre.
- Capturar data, hora, localização e foto/anexo.
- Manter persistência local no navegador para o MVP.

## Diretriz arquitetural
- Concluir e refinar as funcionalidades centrais antes de autenticação e controle de acesso.
- Preparar novas estruturas de dados, tabelas, entidades, APIs e componentes para futuro suporte a múltiplas escolas, múltiplos usuários e perfis de acesso.
- Não implementar login, cadastro, recuperação de senha, JWT, OAuth ou qualquer mecanismo de autenticação neste momento.
- Sempre que possível, prever relacionamentos como `school_id`, `user_id`, `teacher_id`, `created_by` e `updated_by`, mesmo que inicialmente opcionais.
- Manter o foco em estabilidade, correção de bugs, experiência de uso e compatibilidade estrutural para crescimento futuro.

## Regras do projeto
- Prefira mudanças pequenas e focadas.
- Preserve a simplicidade do fluxo principal.
- Quando possível, mantenha os dados no navegador antes de introduzir backend.
- Garanta acessibilidade básica e usabilidade em telas pequenas.
- Se uma funcionalidade depender de permissão do navegador, explique isso ao usuário na interface.

## Fluxo sugerido
- Selecionar o aluno.
- Escolher o tipo de ocorrência.
- Registrar observação livre, se necessário.
- Capturar localização e foto opcionalmente.
- Salvar e manter o registro visível na lista recente.

## Nome do projeto
- ClassLog.

## Evolução futura
- Sincronização com backend.
- Exportação em PDF/CSV.
- Login por perfil de professor/coordenador.
- Agrupamento por turma e filtros por período.
- Histórico por aluno.
