# ClassLog para Android

O app é o mesmo ClassLog da web, empacotado com **Capacitor**: os arquivos de
`www/` vão dentro do APK e a API continua sendo
`https://classlog.fellipecorreia.com`. Em cima disso há código nativo para o que
a web não faz sozinha: o **widget de tela inicial**, as **notificações do
horário** e a **impressão em PDF** dos relatórios.

> **Compilado e assinado** nesta máquina com JDK 21, SDK 35 e Gradle.
> O APK de release sai em `app/build/outputs/apk/release/app-release.apk`.
> **Não foi instalado em aparelho nenhum**: widget, notificação e impressão
> ainda não foram vistos rodando na tela.

## Por que Capacitor e não TWA

O ClassLog é offline-first — IndexedDB, fila de sincronização, sessão que dura
7 dias sem rede. Empacotar os assets no APK faz a primeira abertura funcionar
mesmo sem conexão, o que uma TWA (que depende do Chrome buscar o site) não
garante. O custo é que **mudança de tela exige APK novo**: só o servidor não
basta.

## O que cada parte faz

| Arquivo | Papel |
| --- | --- |
| `MainActivity.java` | Registra o plugin nativo e sobe o WebView do Capacitor |
| `ClassLogNativePlugin.java` | Ponte JS↔nativo: grade, impressão, permissão de notificação |
| `Timetable.java` | Lê o JSON da grade e responde "aula agora" / "próximas" |
| `ScheduleWidget.java` | Widget: aula atual com barra de progresso + 3 próximos blocos |
| `ScheduleAlarms.java` | Agenda o próximo instante relevante (aviso, resumo, virada de bloco) |
| `ScheduleAlarmReceiver.java` | Dispara o aviso, atualiza o widget e reagenda |
| `ScheduleNotifier.java` | Monta as notificações e cria os canais |
| `BootReceiver.java` | Refaz o agendamento após reboot ou atualização do app |

### Como a grade chega ao nativo

O WebView grava o JSON da grade em `SharedPreferences` (`classlog_timetable`)
toda vez que o app abre e toda vez que a grade é salva, via
`syncTimetableToNative()` em `app.js`. O widget e o agendador leem **só** essas
preferências — não fazem rede, não precisam de token e funcionam offline.

O formato é o mesmo objeto `settings.timetable` do servidor. **Mudar campo em
`app.js` ou `server.js` exige mudar `Timetable.java` junto** — não há nada que
valide isso em tempo de compilação. `npm test` compara a semente do `server.js`
com o que o cliente interpreta, mas não cobre o lado Java.

### Notificações

Duas, ambas locais (sem push, sem Firebase):

- **Antes de cada aula** — sai `reminderMinutes` antes do início de cada bloco
  do tipo *Aula*. Configurável na guia Horário.
- **Resumo do dia** — de manhã, no horário configurado, lista os blocos do dia.

O agendamento usa **um alarme por vez**: quando ele dispara, o receiver faz o
trabalho e agenda o seguinte. Isso mantém a grade e os alarmes sempre em sincronia
e sobrevive a edições da grade — basta salvar que `ScheduleAlarms.scheduleNext()`
roda de novo.

A permissão `POST_NOTIFICATIONS` (Android 13+) é pedida na primeira
sincronização da grade. Se for negada, o resto do app continua igual: o widget
funciona, só os avisos não aparecem.

### Impressão em PDF

O WebView do Android **não implementa `window.print()`**. Por isso o botão
"Exportar PDF" da guia Histórico chama `printDocument` no plugin, que monta uma
WebView fora da tela com o HTML do relatório e entrega ao `PrintManager` — daí
o usuário escolhe "Salvar como PDF" no diálogo do sistema. Na web, o mesmo botão
usa um iframe escondido + `window.print()`.

## Build

Pré-requisitos: **JDK 21** (o Capacitor 7 falha com o 17: `invalid source
release: 21`) e SDK do Android com a plataforma 35.

```bash
npm install
npm run mobile:build:android
```

Ou passo a passo:

```bash
npm run web:prepare                                    # espelha a raiz em www/
node node_modules/@capacitor/cli/bin/capacitor sync android
cd android
JAVA_HOME=~/android-toolchain/jdk21 ANDROID_HOME=~/android-toolchain/sdk \
  ./gradlew assembleRelease
```

Instalar no aparelho conectado por USB:

```bash
~/android-toolchain/sdk/platform-tools/adb install -r \
  app/build/outputs/apk/release/app-release.apk
```

## A chave de assinatura

`classlog.keystore` e `keystore.properties` ficam neste diretório e **não são
versionados**. Guarde uma cópia dos dois fora da máquina: sem essa chave o
Android recusa qualquer atualização do app já instalado — a única saída seria
desinstalar e perder a sessão offline guardada no aparelho.

Impressão digital SHA-256 atual:
`b6:68:ef:b0:5f:52:fc:c5:42:a7:b8:59:67:10:9d:0a:d1:c1:4c:d3:c1:e8:a6:2f:f3:9a:61:b9:86:b3:2c:cc`

Conferir a qualquer momento:

```bash
keytool -list -v -keystore classlog.keystore -alias classlog | grep SHA256
```

## Atualizar o app pelo Obtainium

O [Obtainium](https://github.com/ImranR98/Obtainium) vigia uma fonte de APK e
avisa quando sai versão nova. A fonte aqui são as **Releases do GitHub**.

Configurar uma vez, no celular:

1. **Add App** e cole a URL do repositório:
   `https://github.com/f3ll1p3C0rr31a/ClassLog`
2. Em **Filter APKs by Regular Expression**, use `classlog-.*\.apk` — o
   repositório é do site inteiro, e sem o filtro o Obtainium tentaria adivinhar
   qual anexo é o app.
3. Marque para receber notificação de atualização.

Publicar uma versão nova, aqui na máquina:

```bash
# 1. suba versionCode e versionName em android/app/build.gradle
# 2. publique
npm run android:release -- --notes "o que mudou"
```

O script confere o layout do widget, espelha `www/`, sincroniza o Capacitor,
compila, verifica que o APK saiu assinado (APK sem assinatura instala uma vez e
nunca mais atualiza) e cria a release com o APK anexado.

O build é local de propósito: a chave de assinatura nunca sai desta máquina.
Automatizar no GitHub Actions exigiria guardar o keystore nos Secrets.

## Limites conhecidos

- **Nada foi verificado rodando em aparelho.** O APK compila e está assinado,
  mas widget, notificações e impressão ainda não foram vistos na tela.
- O `updatePeriodMillis` de 30 min é limite do sistema; a precisão real vem dos
  alarmes agendados na virada de cada bloco.
- Alarme exato depende de `USE_EXACT_ALARM`/`SCHEDULE_EXACT_ALARM`. Se o
  aparelho negar, o aviso ainda sai, com folga de até 5 minutos.
- O widget mostra a aula atual e os 3 próximos blocos; não navega pela semana.
- Sem push: um bloco adicionado à grade pelo computador só chega ao celular
  quando o app for aberto lá.
- Otimização de bateria agressiva (Xiaomi, Samsung, Motorola) pode segurar os
  alarmes. Se os avisos falharem, tire o ClassLog da otimização de bateria.
