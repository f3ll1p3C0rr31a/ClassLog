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

## Deploy automático
- O workflow `.github/workflows/deploy.yml` copia os arquivos do app para `/home/fellipecorreia/sites/classlog/app` no servidor e reinicia o container `classlog-api`.
- Configure no GitHub os secrets `CLASSLOG_DEPLOY_HOST`, `CLASSLOG_DEPLOY_USER`, `CLASSLOG_DEPLOY_KEY`, `CLASSLOG_DEPLOY_PORT` e `CLASSLOG_DEPLOY_PATH`.
- Para esse servidor, o host do deploy deve ser `100.95.135.105` via Tailscale.
- O proxy reverso já aponta para `classlog-api:3000`, então não é necessário mudar o Nginx Proxy Manager para `127.0.0.1:3001`.

## Próximas melhorias sugeridas
- Cadastro de alunos por turma.
- Filtro por período e por aluno.
- Exportação em PDF.
- Sincronização com servidor remoto.
- Assinatura do responsável ou confirmação pedagógica.
- Histórico individual por aluno.
