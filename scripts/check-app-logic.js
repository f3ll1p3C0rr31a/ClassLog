/**
 * Testa a lógica pura do app.js (grade horária e filtros/relatório do histórico)
 * sem navegador: roda o arquivo inteiro num contexto de vm com stubs de DOM e
 * depois chama as funções de dentro desse mesmo contexto.
 *
 * A grade padrão é lida do server.js, então este teste também pega divergência
 * entre a semente do servidor e o que o cliente sabe interpretar.
 *
 *   node scripts/check-app-logic.js
 */
const fs = require('fs');
const vm = require('vm');
const nodePath = require('path');
const root = nodePath.resolve(__dirname, '..');
const path = nodePath.join(root, 'app.js');

const noopEl = new Proxy({}, {
  get: (t, k) => {
    if (k === 'dataset') return { page: 'schedule' };
    if (k === 'classList') return { toggle(){}, add(){}, remove(){} };
    if (k === 'style') return {};
    if (k === 'content') return { cloneNode: () => noopEl };
    if (typeof k === 'string' && ['appendChild','append','addEventListener','remove','querySelector','cloneNode','setAttribute'].includes(k)) return () => noopEl;
    return undefined;
  },
  set: () => true,
});

const document = {
  body: { dataset: { page: 'schedule' } },
  getElementById: () => null,
  createElement: () => noopEl,
  addEventListener: () => {},
};

const sandbox = {
  document,
  console,
  navigator: { onLine: false, serviceWorker: undefined },
  window: { location: { href: '', pathname: '/schedule.html', search: '' }, setInterval: () => 0, setTimeout: () => 0, addEventListener(){}, matchMedia: () => ({ matches: false, addEventListener(){} }) },
  localStorage: { getItem: () => null, setItem(){}, removeItem(){} },
  setTimeout, setInterval, clearInterval, clearTimeout,
  fetch: () => Promise.reject(new Error('offline')),
  Intl, Date, Math, JSON, Set, Map, Promise, URL,
  alert(){}, crypto: require('crypto').webcrypto,
};
sandbox.globalThis = sandbox;
sandbox.self = sandbox;
sandbox.window.ClassLogOffline = undefined;

const context = vm.createContext(sandbox);
process.on('unhandledRejection', () => {}); // initPage() falha por falta de rede: esperado

const code = fs.readFileSync(path, 'utf8');
vm.runInContext(code, context, { filename: 'app.js' });

const check = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? 'OK  ' : 'FALHA'} ${name}${ok ? '' : `\n      esperado ${JSON.stringify(expected)}\n      obtido   ${JSON.stringify(actual)}`}`);
  if (!ok) process.exitCode = 1;
};

// Semeia a grade do jeito que o servidor devolve
const server = fs.readFileSync(nodePath.join(root, 'server.js'), 'utf8');
const seedMatch = server.match(/const DEFAULT_TIMETABLE_ENTRIES = \[([\s\S]*?)\n\];/);
const entries = eval('[' + seedMatch[1] + ']').map((e, i) => ({ id: `seed-${i+1}`, location: '', classKey: '', schoolId: '', notes: '', ...e }));

vm.runInContext(`
  state.settings = { schools: [
    { id: 'fatima', name: 'Fátima', palette: {}, schedule: { start: '07:15', end: '12:30' }, occurrenceTypes: ['Outra'] },
    { id: 'ec303', name: 'EC303', palette: {}, schedule: { start: '13:00', end: '18:00' }, occurrenceTypes: ['Outra'] },
  ], holidays: [], timetable: { entries: ${JSON.stringify(entries)}, notificationsEnabled: true, reminderMinutes: 5, dailySummaryTime: '06:30' } };
  state.selectedSchoolId = 'fatima';
`, context);

const run = (expr) => vm.runInContext(expr, context);

console.log('--- grade horária ---');
check('43 blocos carregados', run('getTimetable().entries.length'), 43);

// Segunda-feira 07:30 (dentro do 6º Ano de 07:15–08:05)
const monday = new Date(2026, 7, 24, 7, 30, 0); // 24/08/2026 é uma segunda
check('segunda 07:30 é segunda-feira', monday.getDay(), 1);
run(`globalThis.ref = new Date(${monday.getTime()})`);
check('aula atual às 7h30 de segunda', run('getTimetableStatus(ref).current.entry.title'), '6º Ano');
check('próxima aula', run('getTimetableStatus(ref).next.entry.title'), '7º Ano');
check('próxima começa 08:05', run('getTimetableStatus(ref).next.entry.start'), '08:05');
check('escola do bloco atual', run('getEntrySchoolName(getTimetableStatus(ref).current.entry)'), 'Fátima');

// Quarta 08:00: sem aula de manhã na quarta; próximo é o intervalo das 09:40
const wednesday = new Date(2026, 7, 26, 8, 0, 0);
run(`globalThis.ref2 = new Date(${wednesday.getTime()})`);
check('quarta 08:00 sem aula', run('getTimetableStatus(ref2).current'), null);
check('quarta próximo bloco', run('getTimetableStatus(ref2).next.entry.title'), 'Intervalo');

// Sexta 20:30 — depois do último bloco: precisa atravessar o fim de semana
const fridayNight = new Date(2026, 7, 28, 20, 30, 0);
run(`globalThis.ref3 = new Date(${fridayNight.getTime()})`);
check('sexta à noite → próxima é segunda 6º Ano', run('getTimetableStatus(ref3).next.entry.title'), '6º Ano');
check('próxima é daqui a 3 dias', run('getTimetableStatus(ref3).next.dayOffset'), 3);

// UFN na quinta 19:00
const thursdayNight = new Date(2026, 7, 27, 19, 0, 0);
run(`globalThis.ref4 = new Date(${thursdayNight.getTime()})`);
check('quinta 19h na UFN', run('getTimetableStatus(ref4).current.entry.title'), 'Pesquisa em Ensino');
check('local da UFN', run('getEntrySchoolName(getTimetableStatus(ref4).current.entry)'), 'UFN');

console.log('--- contagem regressiva ---');
check('45 min', run(`formatCountdown(new Date(ref.getTime() + 45*60000), ref)`), 'em 45 min');
check('2h', run(`formatCountdown(new Date(ref.getTime() + 120*60000), ref)`), 'em 2h');
check('2h30', run(`formatCountdown(new Date(ref.getTime() + 150*60000), ref)`), 'em 2h30');

console.log('--- filtros do histórico ---');
run(`
  state.reports = [
    { id: 'r1', schoolId: 'fatima', occurredAt: '2026-02-10T10:00:00.000Z', recordKind: 'occurrence', occurrenceLabel: 'Não fez atividade', occurrenceTypes: ['Não fez atividade'], status: 'aberta',
      selectedStudents: [{ fullName: 'ARTHUR CARVALHO THOELE', displayName: 'Arthur Thoele', classKey: '6ano', classLabel: '6 ano', targetType: 'student' }] },
    { id: 'r2', schoolId: 'fatima', occurredAt: '2026-05-10T10:00:00.000Z', recordKind: 'occurrence', occurrenceLabel: 'Ocorrência Positiva', occurrenceTypes: ['Ocorrência Positiva'], status: 'concluida',
      selectedStudents: [{ fullName: 'ARTHUR CARVALHO THOELE', displayName: 'Arthur Thoele', classKey: '6ano', classLabel: '6 ano', targetType: 'student' }] },
    { id: 'r3', schoolId: 'fatima', occurredAt: '2026-02-15T10:00:00.000Z', recordKind: 'daily', occurrenceLabel: 'Registro de Diário', occurrenceTypes: [], status: 'aberta',
      selectedStudents: [{ fullName: '__CLASS__:fatima:6ano', displayName: '6 ano', classKey: '6ano', classLabel: '6 ano', targetType: 'class' }] },
    { id: 'r4', schoolId: 'fatima', occurredAt: '2026-02-20T10:00:00.000Z', recordKind: 'occurrence', occurrenceLabel: 'Não copiou', occurrenceTypes: ['Não copiou'], status: 'aberta', deletedAt: '2026-02-21T00:00:00.000Z',
      selectedStudents: [{ fullName: 'ARTHUR CARVALHO THOELE', displayName: 'Arthur Thoele', classKey: '6ano', classLabel: '6 ano', targetType: 'student' }] },
  ];
`);

const ids = (expr) => run(`getFilteredReports().map((r) => r.id)`);

run(`state.historyFilters.subjectType = 'student'; state.historyFilters.subject = 'ARTHUR CARVALHO THOELE';`);
check('aluno: pega os dele + os da turma, sem os excluídos', ids(), ['r2','r3','r1']);

run(`state.historyFilters.includeClassWide = false;`);
check('aluno sem registros de turma', ids(), ['r2','r1']);

run(`state.historyFilters.includeClassWide = true; state.historyFilters.termKey = '2026-b1';`);
check('1º bimestre (jan–mar)', ids(), ['r3','r1']);

run(`state.historyFilters.termKey = '2026-b2';`);
check('2º bimestre (abr–jun)', ids(), ['r2']);

run(`state.historyFilters.termKey = ''; state.historyFilters.includeDeleted = true;`);
check('mostrando excluídos', ids(), ['r2','r4','r3','r1']);

run(`state.historyFilters.includeDeleted = false; state.historyFilters.subjectType = 'class'; state.historyFilters.subject = '6ano';`);
check('turma inteira', ids(), ['r2','r3','r1']);

run(`state.historyFilters.recordKind = 'daily';`);
check('só registro de diário', ids(), ['r3']);

run(`state.historyFilters.recordKind = ''; state.historyFilters.status = 'concluida';`);
check('só concluídas', ids(), ['r2']);

console.log('--- resumo ---');
run(`state.historyFilters.status = ''; state.historyFilters.subjectType = 'class'; state.historyFilters.subject = '6ano';`);
check('total', run('summarizeReports(getFilteredReports()).total'), 3);
check('positivas', run('summarizeReports(getFilteredReports()).positive'), 1);
check('negativas', run('summarizeReports(getFilteredReports()).negative'), 1);
check('diário', run('summarizeReports(getFilteredReports()).daily'), 1);

console.log('--- período descrito ---');
run(`state.historyFilters.termKey = '2026-b1';`);
check('rótulo do bimestre', run('describeHistoryPeriod()'), '1º Bimestre 2026');

console.log('--- documento PDF ---');
run(`state.authUser = { displayName: 'Fellipe' };`);
const html = run('buildHistoryReportDocument(getFilteredReports())');
check('tem doctype', html.slice(0, 15).toLowerCase(), '<!doctype html>');
check('cita a turma', html.includes('6 ano'), true);
check('escapa aspas/HTML', html.includes('<script'), false);
console.log(`     (documento com ${html.length} caracteres)`);
