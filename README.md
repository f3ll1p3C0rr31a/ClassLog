# ClassLog

Protótipo mobile-first para registrar ocorrências escolares rapidamente, agora dividido em páginas por etapa.

## O que faz
- Seleção rápida de um ou mais alunos com busca.
- Tipos de ocorrência já pré-cadastrados.
- Campo para ocorrência personalizada.
- Registro de data e hora.
- Captura de localização pelo navegador.
- Anexo de foto pela câmera ou galeria.
- Histórico filtrado por aluno ou visão geral.

## Páginas
- `index.html`: seleção de alunos.
- `occurrence.html`: escolha da ocorrência.
- `finalize.html`: data, localização, foto, observação e salvamento.
- `history.html`: histórico.

## Como usar
1. Abra o arquivo `index.html` em um navegador moderno.
2. Selecione um ou mais alunos.
3. Escolha ou escreva a ocorrência.
4. Capture a localização, se quiser registrar.
5. Adicione foto e observações.
6. Encerre e salve a ocorrência.

## Observações importantes
- Este MVP salva os dados no próprio navegador.
- Fotos são armazenadas localmente no dispositivo, então o limite depende do navegador.
- Para uso oficial em produção, o próximo passo recomendado é adicionar login e um backend com banco de dados.

## Próximas melhorias sugeridas
- Cadastro de alunos por turma.
- Filtro por período e por aluno.
- Exportação em PDF.
- Sincronização com servidor.
- Assinatura do responsável ou confirmação pedagógica.
- Histórico individual por aluno.
