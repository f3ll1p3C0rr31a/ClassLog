# Armadilhas já encontradas (não repetir)

## 1. Service Worker cacheia agressivamente — sempre suba `CACHE_NAME`
`service-worker.js` usa estratégia **cache-first** (`caches.match` retorna o
cache antes mesmo de tentar a rede, em ambos os handlers de `fetch`: navegação e
assets). O servidor (`server.js`) já envia `Cache-Control: no-store`, então o
HTTP cache normal **não** é o problema — é o cache programático do Service
Worker, que só é invalidado quando `CACHE_NAME` muda (linha 1 do arquivo).

Sintoma já visto: editar `app.js`, recarregar a página, e o comportamento
continuar idêntico ao antigo (cálculo de notas "errado", textos antigos na UI)
mesmo com o código fonte correto. **Sempre que editar `app.js`, `*.html`,
`styles.css` ou o próprio `service-worker.js`, suba a versão**
(`classlog-static-vN` → `vN+1`). Depois disso, o cliente ainda pode precisar de
**dois reloads** para o novo Service Worker assumir controle (`skipWaiting` +
`clients.claim`, mas o handler de fetch da página já aberta pode estar usando o
controller antigo até a navegação seguinte).

## 2. "A" cosmético vs "A" real nos campos de Bimestral/Retomada
Não confundir **texto de placeholder** com **valor usado no cálculo**. Já houve
um bug em que o dropdown mostrava "A" num campo de Retomada vazio (só texto
padrão do `<option>`), mas o cálculo tratava esse campo como **vazio de
verdade** (sem fallback), resultando em notas finais erradas (EP) que pareciam
inexplicáveis olhando só pra UI. A correção definitiva foi fazer o "A" virar
valor real (`|| 'A'`) tanto na exibição quanto no cálculo, e rotular a opção
automática como `"A (Auto)"` para não confundir com seleção manual. Ver
[`grading-rules.md`](grading-rules.md). Se alguém reportar "a nota não bate com
o que tá na tela", a primeira suspeita é essa categoria de bug (mismatch entre
exibição e dado real) ou o item 1 (cache do Service Worker).

## 3. Existe uma cópia duplicada do front-end em `www/`
`www/` não é só "mais uns arquivos" — é uma cópia byte-a-byte gerada de
`app.js`, `*.html`, `styles.css`, `service-worker.js` da raiz, usada pelo build
Android/Capacitor. Editar só a raiz e esquecer de rodar `npm run web:prepare`
deixa `www/` desatualizado (isso não afeta a versão web, mas afeta o próximo
build mobile). O workflow de deploy já roda `web:prepare` automaticamente antes
de publicar, então isso só importa para quem builda o app Android localmente.

## 4. Git: sem credencial de push configurada nesta máquina
Ver detalhes em [`deployment.md`](deployment.md). Resumo: não tente "resolver"
push sozinho sem credencial — não tem como, e a ferramenta de Bash não tem TTY
para receber senha digitada pelo usuário em tempo real.

## 5. Momento disciplinar não pode ser aplicado à turma inteira
Por design — `app.js` bloqueia explicitamente com alerta
("O momento disciplinar deve ser aplicado a alunos individuais, não à turma
inteira.") e filtra `targetType !== 'class'` antes de salvar. Não é um bug, é
regra de negócio.
