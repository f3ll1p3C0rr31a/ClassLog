# ClassLog

Protótipo mobile-first para registrar ocorrências escolares rapidamente, agora com autenticação, histórico centralizado e auditoria de alterações.

## O que faz
- Seleção rápida de um ou mais alunos com busca.
- Tipos de ocorrência já pré-cadastrados.
- Campo para ocorrência personalizada.
- Registro de data da ocorrência.
- Captura de localização pelo navegador.
- Anexo de foto pela câmera ou galeria.
- Histórico filtrado por aluno ou visão geral.
- Login por usuário e senha.
- Edição do registro com data original preservada e trilha de auditoria.
- Comentários e andamento para acompanhamento da coordenação.

## Páginas
- `index.html`: seleção de alunos.
- `occurrence.html`: escolha da ocorrência.
- `finalize.html`: data, localização, foto, observação e salvamento.
- `history.html`: histórico.
- `login.html`: acesso ao sistema.

## Como usar
1. Execute `npm start`.
2. Abra `http://localhost:3000`.
3. Entre com `coordenacao` / `ClassLog@2026`.
4. Selecione um ou mais alunos.
5. Escolha ou escreva a ocorrência.
6. Capture a localização, se quiser registrar.
7. Adicione foto e observações.
8. Encerre e salve a ocorrência.

## Observações importantes
- O histórico agora é salvo no servidor local em `data/classlog-db.json`.
- A autenticação usa sessão por cookie no servidor.
- Fotos continuam sendo armazenadas como `data URL` no registro, então o limite depende do navegador e do banco JSON.
- Para uso oficial em produção, o próximo passo recomendado é trocar o JSON por um banco relacional e revisar as permissões por perfil.

## Próximas melhorias sugeridas
- Cadastro de alunos por turma.
- Filtro por período e por aluno.
- Exportação em PDF.
- Sincronização com servidor remoto.
- Assinatura do responsável ou confirmação pedagógica.
- Histórico individual por aluno.
