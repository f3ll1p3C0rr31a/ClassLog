# ClassLog

Protótipo mobile-first para registrar ocorrências escolares rapidamente, agora com autenticação, histórico centralizado, auditoria de alterações e suporte multi-escola.

## O que faz
- Seleção rápida de um ou mais alunos com busca.
- Tipos de ocorrência já pré-cadastrados.
- Campo para ocorrência personalizada.
- Registro de data da ocorrência.
- Captura de localização pelo navegador.
- Anexo de foto pela câmera ou galeria.
- Histórico filtrado por aluno ou visão geral.
- Troca automática de escola por horário.
- Configuração por escola (cores, horário, ocorrências e políticas).
- Registro de momento disciplinar por dias úteis com respeito a feriados.
- Login por usuário e senha.
- Edição do registro com data original preservada e trilha de auditoria.
- Comentários e andamento para acompanhamento da coordenação.

## Páginas
- `index.html`: seleção de alunos.
- `occurrence.html`: escolha da ocorrência.
- `finalize.html`: data, localização, foto, observação e salvamento.
- `history.html`: histórico.
- `login.html`: acesso ao sistema.
- `settings.html`: dashboard de configuração.

## Como usar
1. Execute `npm start`.
2. Abra `http://localhost:3000`.
3. Para a Escola Fátima, entre com `coordenacao` / `ClassLog@2026`.
4. Para a EC303, entre com `grasi` / `gra123`.
5. Selecione alunos ou uma turma inteira.
6. Escolha um ou mais tipos de Log ou Registro de Diário.
7. Adicione data, localização, foto e observações.
8. Salve o Log.

## Multi-escola (configuração padrão)
- `Fátima` (particular): 07:15 às 12:30.
- `EC303` (pública): 13:00 às 18:00.
- O sistema define automaticamente a escola ativa pelo horário atual.
- Você pode alternar manualmente no seletor de escola quando necessário.

## Momento disciplinar
- Disponível por padrão na `EC303`.
- O registro é feito em dias úteis, ignorando fins de semana e feriados cadastrados.
- Se você adicionar mais dias para o mesmo aluno, a contagem é estendida em cima do prazo atual.
- Alunos com prazo ativo aparecem destacados em vermelho na lista.

## Preparação para Android e iOS
1. Instale dependências: `npm install`.
2. Sincronize o projeto web para Capacitor: `npm run mobile:sync`.
3. Abrir Android Studio: `npm run mobile:android`.
4. Abrir Xcode (macOS): `npm run mobile:ios`.

Arquivos incluídos para mobile/PWA:
- `capacitor.config.json`
- `manifest.webmanifest`
- `service-worker.js`

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
