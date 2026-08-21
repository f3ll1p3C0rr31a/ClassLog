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

## 4. Git push — resolvido via `gh` CLI (não precisa mais de SSH)
Ver detalhes em [`deployment.md`](deployment.md). Resumo: `gh auth setup-git`
já deixou o `git push`/`pull` via HTTPS autenticado automaticamente nesta
máquina. Se em outra máquina/sessão o push falhar com "could not read
Username", **não** tente inventar credencial sozinho — instale `gh`, rode
`gh auth login` em background com timeout (ele imprime um device code + URL),
peça para o usuário confirmar no navegador, e então `gh auth setup-git`.

## 5. Momento disciplinar não pode ser aplicado à turma inteira
Por design — `app.js` bloqueia explicitamente com alerta
("O momento disciplinar deve ser aplicado a alunos individuais, não à turma
inteira.") e filtra `targetType !== 'class'` antes de salvar. Não é um bug, é
regra de negócio.

## 6. `window.Capacitor.Plugins` está vazio — use `nativePromise`
O projeto não tem bundler e não empacota `@capacitor/core`. O `native-bridge.js`
injetado no WebView **não** popula `Capacitor.Plugins`; quem faz isso é o
`registerPlugin()` do core. Chamar `Capacitor.Plugins.ClassLogNative.setTimetable()`
não lança erro visível — só devolve `undefined` e o widget nunca recebe a grade.
A via correta aqui é `window.Capacitor.nativePromise('ClassLogNative', metodo, opcoes)`,
encapsulada em `callNative()` no `app.js`. Ver [`android.md`](android.md).

## 7. Salvar configuração quase apagou a grade horária
`PUT /api/settings` normaliza o payload inteiro, e `normalizeSettings` semeia a
grade padrão quando `timetable` vem `undefined`. Como `saveSettings()` (tela de
configuração) manda só `{ schools, holidays }`, sem a guarda explícita no handler
qualquer salvamento de cor/horário da escola ressemearia a grade por cima do que
o usuário montou. A guarda está no handler; se alguém refatorar aquele bloco,
tem que preservá-la.

## 8. Layout de widget do Android quebra em silêncio
View fora da lista do `RemoteViews`, view customizada (com ponto no nome) ou
referência de tema (`?attr/...`) compilam normalmente e só falham no aparelho,
com "não foi possível adicionar o widget". `scripts/check-widget-layout.mjs`
(dentro de `npm test`) barra os três casos.

## 9. Capacitor 7 não compila com o JDK 17
`~/android-toolchain/jdk` é o 17 e o build morre com `invalid source release: 21`.
O JDK 21 está em `~/android-toolchain/jdk21`, que é o padrão do
`scripts/release-android.sh`.

## 10. Lista fixa de arquivos no deploy deixou página nova fora de produção
O `deploy-production.sh` do tempo do Jupiter copiava uma **lista literal** de
arquivos (`FILES=(...)`) para produção. Página nova que não fosse adicionada à
lista simplesmente não subia — e não havia erro nenhum: o deploy passava, o
health check passava, e a página dava 404 em produção. Foi o que teria
acontecido com `schedule.html`. Hoje o `Dockerfile` faz `COPY . .` e quem decide
o que fica de fora é o `.dockerignore`, que erra para o lado seguro.

## 11. Health check que não olha o commit não prova nada
O check antigo batia em `/api/auth/me` e considerava sucesso qualquer 200. Como
o container antigo continua no ar quando um deploy falha, o check passava
felizmente servindo código velho. Agora `/api/version` devolve o
`APP_COMMIT_SHA` gravado no build da imagem, e o deploy só passa quando o commit
servido é o que acabou de ser publicado.

## 12. O CT do runner (ct-web) não tem Node instalado
E é de propósito: a única versão de Node que importa é a da imagem que vai para
produção. Por isso o passo de validação do workflow roda dentro de um
`docker run --rm node:22-alpine`. Adicionar `run: npm ...` direto no workflow
falha com `command not found`.
