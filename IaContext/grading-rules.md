# Regras de cálculo de menções (História/Filosofia)

Toda a lógica vive em `calculateStudentGrades(student)` no `app.js` (procure por
esse nome — é uma função grande, ~80 linhas). O servidor não calcula nada, só
persiste o que vem do client.

## Conceito central: ATV/CEV compartilhados, Bimestral separado
- **ATV** (atividade) e **CEV** (comportamento/valores) são **compartilhados**
  entre História e Filosofia — calculados uma vez a partir das ocorrências reais
  do bimestre (`mentionFromPoints`), não são notas manuais.
- **Bimestral** (AB) e sua **Retomada** (RET.AB) são **separados por matéria**:
  História tem seu AB/RET.AB; Filosofia tem o próprio (`philosophyAb` /
  `philosophyAbRecovery`).
- **Integrada** (AI) e sua **Retomada** (RET.AI) são **compartilhadas** entre as
  duas matérias.
- Logo: um aluno pode **reprovar em Filosofia e passar em História** (ou
  vice-versa), mesmo compartilhando ATV/CEV/Integrada, porque o Bimestral
  específico de cada matéria pode divergir.

## Retomada sempre prevalece se for maior
```js
function bestMention(primary, recovery) {
  // retorna o de maior valor na mentionScale; se um dos dois estiver vazio,
  // usa o outro.
}
```
Usado para AB/RET.AB, AI/RET.AI e (AB Filo.)/(RET.AB Filo.). **Nunca** usa média
entre Bimestral e Retomada — usa o maior dos dois.

## Padrão "A" quando não preenchido — e por quê
Política deliberada do usuário: **por padrão o aluno está aprovado**, para a
coordenação não precisar preencher campo por campo. Logo, todo campo de
avaliação formal (`ab`, `abRecovery`, `ai`, `aiRecovery`, `philosophyAb`,
`philosophyAbRecovery`) usa `'A'` como valor **real** no cálculo quando vazio —
não é só um placeholder visual:

```js
const ab = bestMention(record?.formalAssessments?.ab || 'A',
                        record?.formalAssessments?.abRecovery || 'A');
```

Isso significa: se a Retomada nunca foi preenchida, ela conta como "A" de
verdade (não como "ausente"), então o maior entre Bimestral e essa Retomada
implícita normalmente vence com "A" — a não ser que o Bimestral já tenha sido
preenchido manualmente com algo melhor que A (`AL`/`AE`), o que é raro.

**Cuidado se for "corrigir" isso de volta**: antes dessa regra, um campo vazio
era tratado como "sem retomada" (ignorado no `bestMention`), o que causava
notas finais erradas mostrando EP mesmo quando a Retomada na tela aparecia como
"A" (era só cosmético — texto de placeholder, não valor real). Isso já confundiu
o usuário uma vez (ver [`gotchas.md`](gotchas.md)). **Não desfazer sem
confirmar com o usuário.**

### Rótulo "(Auto)" para diferenciar do valor manual
Na grade (`createFormalSelect` em `app.js`), a opção vazia do `<select>` mostra
`"${defaultMention} (Auto)"` (ex.: `"A (Auto)"`) em vez de apenas `"A"`, para
deixar claro que aquele valor é o padrão automático, não algo que um humano
escolheu. Selecionar manualmente a opção `"A"` da lista (sem o "(Auto)") grava
um valor real `'A'` no registro — resulta na mesma nota final, mas fica
registrado como decisão humana.

## Fórmula da média final — 4 partes iguais
**Importante**: a fórmula correta é a média de **4 componentes com peso igual**:
`(ATV + CEV + Bimestral-melhor + Integrada-melhor) / 4`. Uma versão anterior do
código fazia `(ATV + CEV + média(Bimestral, Integrada)) / 3`, que **não é** a
mesma coisa matematicamente (dava peso de 1/3 ao bloco Bimestral+Integrada
junto, e não 1/4 a cada um) — isso já foi corrigido, não reintroduzir.

```js
// História
const finalAverage = (
  mentionScale[ATV] + mentionScale[CEV]
  + mentionScale[ab] + mentionScale[ai]
) / 4;

// Filosofia (ATV/CEV/AI compartilhados, Bimestral próprio)
const philosophyFinalAverage = (
  mentionScale[ATV] + mentionScale[CEV]
  + mentionScale[philosophyAb] + mentionScale[ai]
) / 4;
```
`mentionFromAverage(points)` converte o número de volta para menção:
`<0→ND, <5→EP, <6→A, <9→AL, else AE`. `ND`/`EP` final = reprovado.

Existe uma sobrescrita manual (`overrides.formal`) que, se preenchida, substitui
**tanto** o Bimestral quanto a Integrada de História ao mesmo tempo (não tem
sobrescrita equivalente ainda para Filosofia — não foi pedido).

## Por que um aluno com ATV=EP reprova nas duas matérias mesmo com Bimestral=A
ATV e CEV são compartilhados e entram com peso 1/4 em **cada** matéria
separadamente. Um ATV=EP real (não é placeholder — vem de ocorrências reais tipo
"Não fez atividade") puxa a média de História **e** de Filosofia para baixo
igualmente. Isso é o comportamento esperado pela fórmula, não um bug — já
confirmado com o usuário no histórico desta conversa.
