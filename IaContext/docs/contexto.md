# Contexto do Projeto

ClassLog e um prototipo mobile-first para registrar ocorrencias escolares rapidamente.

O app suporta:

- selecao de alunos e turmas;
- tipos de ocorrencia pre-cadastrados;
- registro personalizado;
- data da ocorrencia;
- localizacao pelo navegador;
- foto pela camera ou galeria;
- anotacao manuscrita com S Pen e Apple Pencil;
- historico centralizado;
- login;
- suporte multi-escola;
- auditoria de edicoes;
- comentarios e acompanhamento pela coordenacao;
- funcionamento offline parcial depois de login online.

O projeto tem uma versao web/PWA e uma versao Android via Capacitor.

Ambiente principal:

- Web local: `npm start`, abrindo `http://localhost:3000`.
- Servidor de producao: container `classlog-api`.
- Caminho de deploy no servidor: `/home/fellipecorreia/sites/classlog/app`.
- App Android: identificador `com.classlog.app`.
- API nativa Android: `https://classlog.fellipecorreia.com`.

Cuidados:

- O banco atual e JSON em `data/classlog-db.json`.
- Fotos sao salvas como `data URL` no registro.
- Em producao, preservar `data/classlog-db.json` e criar backup antes de substituir arquivos.
- Proximo passo estrutural recomendado: trocar o JSON por banco relacional e revisar permissoes por perfil.
