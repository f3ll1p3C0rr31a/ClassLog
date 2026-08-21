# App Android, widget e notificações

Detalhe operacional completo em [`../android/README.md`](../android/README.md).
Aqui fica só o que uma IA precisa saber antes de mexer.

## Arquitetura em uma frase
Capacitor (assets de `www/` embutidos no APK, API remota) + código Java nativo
para widget, notificações do horário e impressão em PDF. Publicação: build
**local assinado** → Release do GitHub → Obtainium no celular.

## As três armadilhas deste pedaço

### 1. `window.Capacitor.Plugins` está vazio neste projeto
O app não empacota `@capacitor/core` (não há bundler). O `native-bridge.js` que
o WebView injeta **não** popula `Capacitor.Plugins` — quem faz isso é o JS do
core, via `registerPlugin()`. A via que funciona sem bundler é
`window.Capacitor.nativePromise('ClassLogNative', metodo, opcoes)`, que é o que
`callNative()` em `app.js` usa. Se alguém "consertar" isso para
`Capacitor.Plugins.ClassLogNative`, o widget para de receber a grade **em
silêncio**, sem erro no console.

### 2. O JSON da grade é um contrato entre três lugares
`settings.timetable` (server.js) → `getTimetable()` (app.js) →
`Timetable.java` (Android). Nada valida isso em tempo de compilação. Renomear um
campo em dois dos três lugares dá widget vazio no aparelho e mais nada.
`npm test` cobre a ponta servidor↔cliente; o lado Java não é coberto.

### 3. Capacitor 7 exige JDK 21
O `~/android-toolchain/jdk` é o 17 e falha com `invalid source release: 21`.
O JDK 21 está em `~/android-toolchain/jdk21` — é o que `scripts/release-android.sh`
usa por padrão.

## Onde o widget pega os dados
De `SharedPreferences` (`classlog_timetable`), gravado pelo WebView em
`syncTimetableToNative()` na abertura do app e ao salvar a grade. O widget não
faz rede e não precisa de token — funciona offline, mas **só sabe o que o app
sincronizou da última vez**.

## Layout do widget quebra em silêncio
View fora da lista do `RemoteViews` compila normal e só falha no aparelho, com
"não foi possível adicionar o widget". `scripts/check-widget-layout.mjs` (dentro
de `npm test` e do `release-android.sh`) barra isso. Referência de tema (`?attr/...`)
também não resolve, porque o widget é inflado com o tema da launcher — por isso
o `ProgressBar` usa `@android:style/Widget.ProgressBar.Horizontal`.

## Impressão em PDF
O WebView do Android não implementa `window.print()`. O relatório do histórico
vai para o `PrintManager` via `printDocument` no plugin nativo; na web, o mesmo
botão usa um iframe escondido. Ver `exportHistoryReport()` em `app.js`.

## Estado de verificação
O APK compila e sai assinado. **Widget, notificações e impressão nunca foram
vistos rodando em aparelho.**
