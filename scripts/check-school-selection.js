/**
 * Regressão da troca manual de escola.
 *
 * Bug original: registrar de tarde uma ocorrência da manhã era impossível.
 * O usuário trocava para a Fátima em index.html e, ao avançar para
 * occurrence.html, o app voltava sozinho para a EC303.
 *
 * A causa não era a detecção automática em si — era a ordem e o escopo:
 * `loadContext()` roda antes de `loadDraft()`, e o rascunho é gravado por
 * escola (getOfflineScope inclui o schoolId). A flag "escolhi à mão" ficava
 * salva no escopo da Fátima e, quando a página seguinte carregava, o app já
 * havia trocado para a EC303 e procurava o rascunho no escopo errado.
 *
 * Este teste simula duas cargas de página seguidas compartilhando o mesmo
 * sessionStorage e o mesmo banco offline, que é exatamente o que o navegador
 * faz ao navegar de index.html para occurrence.html.
 *
 *   node scripts/check-school-selection.js
 */
const fs = require('fs');
const vm = require('vm');
const nodePath = require('path');

const root = nodePath.resolve(__dirname, '..');
// CLASSLOG_APP_JS existe para poder apontar o teste a uma versão antiga do
// app.js e confirmar que ele de fato reprova o bug que diz cobrir.
const appPath = process.env.CLASSLOG_APP_JS || nodePath.join(root, 'app.js');
const appSource = fs.readFileSync(appPath, 'utf8');

const SETTINGS = {
  schools: [
    { id: 'fatima', name: 'Fátima', palette: {}, schedule: { start: '07:15', end: '12:30' }, occurrenceTypes: ['Outra'], policies: {} },
    { id: 'ec303', name: 'EC303', palette: {}, schedule: { start: '13:00', end: '18:00' }, occurrenceTypes: ['Outra'], policies: {} },
  ],
  holidays: [],
  timetable: { entries: [], notificationsEnabled: true, reminderMinutes: 5, dailySummaryTime: '06:30' },
};
const USER = { id: 'u1', username: 'coordenacao', displayName: 'Coordenação', role: 'coordinator', schoolIds: ['fatima', 'ec303'] };

// É de tarde: o servidor detecta a EC303, como faria de verdade às 14h.
const DETECTED_SCHOOL = 'ec303';

/** Banco offline em memória, com o mesmo formato de chave por escopo do real. */
function createOfflineStore() {
  const drafts = new Map();
  const contexts = new Map();
  const sessions = new Map();
  return {
    _drafts: drafts,
    makeScope: (username, schoolId) => `${username || ''}::${schoolId || ''}`,
    getSession: async () => sessions.get('session') || null,
    saveSession: async (session) => { sessions.set('session', { ...session }); },
    lockSession: async () => {},
    getContext: async (scope) => contexts.get(scope) || null,
    saveContext: async (scope, context) => { contexts.set(scope, { ...context }); },
    getDraft: async (scope) => drafts.get(scope) || null,
    saveDraft: async (scope, draft) => { drafts.set(scope, { ...draft, scope }); },
    clearDraft: async (scope) => { drafts.delete(scope); },
    getReports: async () => [],
    replaceReports: async () => {},
    upsertReport: async () => {},
    removeReport: async () => {},
    getQueue: async () => [],
    updateQueue: async () => {},
    removeQueue: async () => {},
    savePendingReport: async () => {},
    getPhoto: async () => null,
    removePhoto: async () => {},
  };
}

/** sessionStorage de verdade: sobrevive à navegação, morre com o app. */
function createSessionStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
    _map: map,
  };
}

function createDomStubs(page) {
  const noop = new Proxy({}, {
    get: (target, key) => {
      if (key === 'dataset') return {};
      if (key === 'classList') return { toggle() {}, add() {}, remove() {}, contains: () => false };
      if (key === 'style') return {};
      if (key === 'content') return { cloneNode: () => noop };
      if (key === 'firstElementChild') return noop;
      if (typeof key === 'string') return () => noop;
      return undefined;
    },
    set: () => true,
  });
  return {
    body: { dataset: { page }, classList: { toggle() {}, add() {}, remove() {} } },
    documentElement: { style: { setProperty() {} }, dataset: {} },
    getElementById: () => null,
    createElement: () => noop,
    addEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
  };
}

/** Uma carga de página: cria o contexto, roda o app.js e espera o initPage. */
async function loadPage({ page, offline, session }) {
  const document = createDomStubs(page);
  const jsonResponse = (body) => ({
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    json: async () => body,
  });

  const sandbox = {
    document,
    console: { log() {}, warn() {}, error() {} },
    navigator: { onLine: true },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    sessionStorage: session,
    setTimeout, clearTimeout, setInterval: () => 0, clearInterval,
    AbortController,
    Intl, Date, Math, JSON, Set, Map, Promise, URL, Boolean, Number, String, Array, Object, Error,
    alert() {},
    addEventListener() {},
    removeEventListener() {},
    // navigate() troca a página de verdade no navegador; aqui só registra,
    // porque cada "carga de página" do teste é um contexto novo.
    location: { href: '', pathname: '/index.html', search: '' },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    fetch: async (url) => {
      if (String(url).includes('/api/auth/me')) return jsonResponse({ user: USER });
      if (String(url).includes('/api/context')) {
        return jsonResponse({ user: USER, settings: SETTINGS, activeSchoolId: DETECTED_SCHOOL });
      }
      if (String(url).includes('/api/reports')) return jsonResponse({ reports: [] });
      if (String(url).includes('/api/disciplinary-actions')) return jsonResponse({ actions: [] });
      if (String(url).includes('/api/grade-records')) return jsonResponse({ records: [] });
      return jsonResponse({});
    },
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  sandbox.window.ClassLogOffline = offline;

  const context = vm.createContext(sandbox);
  vm.runInContext(appSource, context, { filename: 'app.js' });

  // initPage() é disparado no fim do arquivo; deixa a fila de microtasks drenar.
  for (let i = 0; i < 50; i += 1) await new Promise((resolve) => setImmediate(resolve));

  return {
    read: (expr) => vm.runInContext(expr, context),
    run: (expr) => vm.runInContext(expr, context),
  };
}

const results = [];
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  results.push(ok);
  console.log(`${ok ? 'OK  ' : 'FALHA'} ${name}${ok ? '' : `\n      esperado ${JSON.stringify(expected)}\n      obtido   ${JSON.stringify(actual)}`}`);
}

(async () => {
  const offline = createOfflineStore();
  const session = createSessionStorage();

  console.log('--- 1ª página (index.html), 14h: detecção automática manda ---');
  const page1 = await loadPage({ page: 'students', offline, session });
  check('abre na escola detectada pelo horário', page1.read('state.selectedSchoolId'), 'ec303');
  check('nada marcado como escolha manual', page1.read('state.manualSchoolSelection'), false);

  console.log('\n--- usuário troca para a Fátima e escolhe o 9º ano ---');
  page1.run("onSchoolChange('fatima', true)");
  for (let i = 0; i < 50; i += 1) await new Promise((resolve) => setImmediate(resolve));
  check('trocou para a Fátima', page1.read('state.selectedSchoolId'), 'fatima');
  check('marcado como escolha manual', page1.read('state.manualSchoolSelection'), true);
  check('override gravado na sessão', session.getItem('classlog-school-override-v1'), 'fatima');

  page1.run("state.selectedClass = '9ano'; saveDraft();");
  for (let i = 0; i < 20; i += 1) await new Promise((resolve) => setImmediate(resolve));

  console.log('\n--- 2ª página (occurrence.html): é aqui que voltava sozinho ---');
  const page2 = await loadPage({ page: 'occurrence', offline, session });
  check('CONTINUA na Fátima', page2.read('state.selectedSchoolId'), 'fatima');
  check('escolha manual preservada', page2.read('state.manualSchoolSelection'), true);
  check('turma preservada', page2.read('state.selectedClass'), '9ano');

  console.log('\n--- 3ª página (finalize.html): a escolha atravessa o fluxo inteiro ---');
  const page3 = await loadPage({ page: 'finalize', offline, session });
  check('ainda na Fátima ao finalizar', page3.read('state.selectedSchoolId'), 'fatima');

  console.log('\n--- depois de salvar, a escolha da sessão continua valendo ---');
  page3.run('clearDraft()');
  for (let i = 0; i < 20; i += 1) await new Promise((resolve) => setImmediate(resolve));
  check('escolha manual sobrevive ao clearDraft', page3.read('state.manualSchoolSelection'), true);
  const page4 = await loadPage({ page: 'students', offline, session });
  check('nova ocorrência começa na Fátima', page4.read('state.selectedSchoolId'), 'fatima');

  console.log('\n--- app reaberto (sessionStorage novo): volta ao automático ---');
  const freshSession = createSessionStorage();
  const page5 = await loadPage({ page: 'students', offline, session: freshSession });
  check('volta para a escola do horário', page5.read('state.selectedSchoolId'), 'ec303');
  check('sem escolha manual', page5.read('state.manualSchoolSelection'), false);

  console.log('\n--- voltar para a escola detectada limpa o override ---');
  const session6 = createSessionStorage();
  const page6 = await loadPage({ page: 'students', offline, session: session6 });
  page6.run("onSchoolChange('fatima', true)");
  for (let i = 0; i < 30; i += 1) await new Promise((resolve) => setImmediate(resolve));
  page6.run("onSchoolChange('ec303', false)");
  for (let i = 0; i < 30; i += 1) await new Promise((resolve) => setImmediate(resolve));
  check('override limpo na troca automática', session6.getItem('classlog-school-override-v1'), null);

  const failed = results.filter((ok) => !ok).length;
  console.log(`\n${results.length - failed}/${results.length} verificações passaram`);
  if (failed > 0) process.exitCode = 1;
})();
