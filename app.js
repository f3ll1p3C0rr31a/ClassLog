const classGroups = [
  {
    key: '6ano',
    label: '6 ano',
    students: [
      'ARTHUR CARVALHO THOELE',
      'ARTHUR ZAMBONI AMORAS',
      'BEATRIZ DE ALMEIDA SOUZA',
      'CLARICE LEMOS DE BARROS',
      'ERICK MACÊDO SILVA',
      'GUSTAVO DA SILVA ROCHA',
      'HEITOR MONTEIRO REIS SANTOS',
      'HELENA ARAÚJO DA SILVEIRA',
      'HELENA MARIA DE OLIVEIRA BESSAS',
      'ÍRIS WEYL DA CUNHA AMOURY',
      'JOSÉ HENRIQUE MONFREDO MENDES',
      'JULIA ZEQUE SANTOS CÓRDULA DE ARÚJO',
      'KAMILY VITORIA DA SILVA LIMA',
      'LAURA HOLZ FELDKIRCHER OLIVEIRA',
      'LORENZO NASCIMENTO DOS SANTOS',
      'LUCAS DE PAIVA CAJAZEIRA',
      'MATEUS CHAVES CERQUEIRA DE MELO',
      'MIGUEL BETTIOL BORGES DA MATTA CLEMENTINO',
      'MIGUEL COUTINHO SOUZA',
      'MIGUEL MAIA DE OLIVEIRA FERREIRA LIMA',
      'SOPHIE AVELINA MONÇÃO RIBEIRO',
      'TEODORA DA COSTA LIMA',
    ],
  },
  {
    key: '7ano',
    label: '7 ano',
    students: [
      'AGNES MARIA FERNANDES GUIMARÃES',
      'ANA CAROLINA FREIRE GLOWACKI',
      'BENTO PINHEIRO GUEDES',
      'CECÍLIA DE CARVALHO MEDINA',
      'CLARICE MARIA TEIXEIRA DE ANDRADE',
      'DAVI COUTINHO SOUZA',
      'FLORA MAGALHÃES MEDEIROS VIANA',
      'ISADORA ZANINI NALDI COELHO PESSOA',
      'JOÃO GABRIEL DE OLIVEIRA GARCIA',
      'JOÃO PEDRO ALVES JONES',
      'LARA LETÍCIA BORGES',
      'LAURA LAIS BENTO PAIVA',
      'LIS DO NASCIMENTO SALVADOR',
      'LORENZO COSTA MIRANDA VASCONCELOS',
      'LUCAS RODRIGUES ALVES LOPES',
      'MARIA FERNANDA FIGUEIREDO PAES',
      'MIGUEL CÂNDIDO DE RESENDE MOREIRA',
      'MIGUEL PASSARELA BARROS',
      'MIGUEL ROTA MORAES',
      'MÔNICA AZEVEDO CHAVES',
      'SOPHIA HELENA URCINO DOS SANTOS GUEDES',
      'YSADORA VITÓRIA DANTAS DE OLIVEIRA',
    ],
  },
  {
    key: '8ano',
    label: '8 ano',
    students: [
      'ALICE LEITE FLORENTINO MAIA',
      'ARTHUR DE CARVALHO TRINDADE',
      'ARTHUR VELOSO SILVA DE OLIVEIRA',
      'BEATRIZ VAZ GOMES MADRID',
      'BENICIO SEGOVIA TOBIAS GAGLIANO',
      'CAIO RESENDE GUTIERRES',
      'DAVI CHAVES CERQUEIRA DE MELO',
      'DAVI HAUPTMAN',
      'DAVI TIERLING BONFIM',
      'DÉBORA SOUZA GALEIGO',
      'EDUARDO PIUBELLI AZEVEDO',
      'FELIPE FLORENCIO DE FARIAS',
      'FELIPE SANTANA MONTEIRO',
      'GABRIEL MAIA DE OLIVEIRA FERREIRA LIMA',
      'GABRIEL MARQUES JORGE',
      'GUILHERME QUEIROZ IORIO SANTANA',
      'HEITOR BARROS VITORIANO',
      'HENRIQUE AUGUSTO BARRETO CASCÃO DE PAULA',
      'HENRIQUE DE LUCENA ROCHA',
      'IGOR AZEVEDO CHAVES',
      'JOÃO FELIPE ZICA CARNEIRO',
      'JOÃO MENDONÇA DE OLIVEIRA BARBOSA',
      'JOSÉ ANTÔNIO SANTANA DE ALENCAR',
      'LÍVIA DA CÂMARA LOBÃO BARROSO',
      'LUCAS CORREIA BEZERRA DE CASTRO',
      'LUÍSA BALZACCHI BRITO GONTIJO',
      'MARIA LUIZA BEZERRA VENTILARI',
      'MATHEUS SANTOS OLIVEIRA DE MELO',
      'MIGUEL DE QUEIROZ CARVALHO',
      'PEDRO SALIM FIGUEIREDO GEDEON',
      'SOFIA D` AVILA SILVEIRA',
      'SOFIA HELENA PACIFICI RANGEL ALCÂNTARA',
      'VINICIUS DANTAS OLIVEIRA RODRIGUES',
    ],
  },
  {
    key: '9ano',
    label: '9 ano',
    students: [
      'ALINE ALBUQUERQUE MARQUES GARCIA',
      'ANA CAROLINA MOTTA DE CASTRO',
      'ARTHUR PATRIOTA BENITES',
      'BERNARDO MENDES BARBOSA',
      'BRYAN MARQUES MARTINS',
      'CECÍLIA LEMOS DE BARROS',
      'DAVI OLIVEIRA DE LISCIO',
      'DAVI PILARES CANTUÁRIA',
      'EDUARDO RORIZ DE MELO VASCONCELOS',
      'FELIPE BARRETO DE ALBUQUERQUE VINHAS',
      'GABRIELA FERREIRA SOARES NEIVA',
      'GABRIELA REDONDO DO OURO',
      'GEOVANNA PEIXOTO MEDEIROS',
      'GUILHERME URANI AGUIAR SALOMÃO',
      'GUILHERME VELOSO MIRANDA',
      'ISABEL CUNHA OLIVEIRA SANTOS',
      'ISABELLE BIONE CORREIA',
      'ISADORA DAIGE LINO',
      'IURI EMANUEL CRUZ CAMPOS',
      'JOÃO GUILHERME CARDOSO CARVALHO',
      'JOAO MIGUEL CARVALHO BUCIOLOTTI',
      'JOÃO MIGUEL SILVÉRIO',
      'JOÃO VICTOR SANTOS DE MELO',
      'JOÃO VÍTOR DANTAS MACHADO BUONAFINA',
      'JOÃO VITOR MOURA DE RESENDE',
      'KALIQ FAWZI DA CRUZ',
      'LUIZA MARTINS RIBEIRO',
      'LUIZ GUSTAVO GIUSTI',
      'LUIZ RENATO ALVES GUIMARÃES',
      'MARIA CLARA CAIED CARVALHO',
      'MATHEUS ALVARES LUZ BELTRÃO',
      'NICOLE CORDEIRO DUARTE',
      'PEDRO MANUEL CIRILO GONSALVES TORRES TOURINO',
      'PEDRO OLIVEIRA SILVA',
      'PRISCILA DOS SANTOS LIMA',
      'SAMUEL TEIXEIRA DE MELO',
    ],
  },
];

const occurrenceTypes = [
  'Atraso',
  'Fora de sala',
  'Não fez atividade',
  'Não copiou',
  'Sem material',
  'Uso indevido do celular',
  'Conversando durante a explicação',
  'Outra',
];

const storageKeys = {
  draft: 'classlog-draft-v4',
  locationPrefill: 'classlog-location-prefill-v1',
};

const pageMap = {
  login: 'login.html',
  students: 'index.html',
  occurrence: 'occurrence.html',
  finalize: 'finalize.html',
  history: 'history.html',
};

const studentRoster = buildStudentRoster(classGroups);
const studentByName = new Map(studentRoster.map((student) => [student.fullName, student]));
const classByKey = new Map(classGroups.map((classGroup) => [classGroup.key, classGroup]));

const state = {
  page: document.body.dataset.page || 'students',
  selectedClass: classGroups[0]?.key || '6ano',
  selectedStudents: [],
  selectedOccurrence: occurrenceTypes[0],
  customOccurrence: '',
  notes: '',
  dateTime: '',
  photoDataUrl: '',
  location: null,
  reports: [],
  historyMode: 'selected',
  authUser: null,
  activeReportId: null,
  reportModalMode: 'edit',
};

function $(id) {
  return document.getElementById(id);
}

const elements = {
  title: $('pageTitle'),
  pageSubtitle: $('pageSubtitle'),
  pageDescription: $('pageDescription'),
  selectedSummary: $('selectedSummary'),
  classTabs: $('classTabs'),
  classHint: $('classHint'),
  todayCount: $('todayCount'),
  selectedCount: $('selectedCount'),
  lastSavedLabel: $('lastSavedLabel'),
  authUserLabel: $('authUserLabel'),
  logoutButton: $('logoutButton'),
  studentsPanel: $('studentsPanel'),
  studentSearch: $('studentSearch'),
  selectedStudentsStrip: $('selectedStudentsStrip'),
  studentChips: $('studentChips'),
  clearStudentButton: $('clearStudentButton'),
  studentNextButton: $('studentNextButton'),
  occurrencePanel: $('occurrencePanel'),
  occurrenceChips: $('occurrenceChips'),
  otherOccurrenceField: $('otherOccurrenceField'),
  otherOccurrence: $('otherOccurrence'),
  occurrenceHint: $('occurrenceHint'),
  occurrenceBackButton: $('occurrenceBackButton'),
  occurrenceNextButton: $('occurrenceNextButton'),
  finalizePanel: $('finalizePanel'),
  dateTime: $('dateTime'),
  captureLocationButton: $('captureLocationButton'),
  locationStatus: $('locationStatus'),
  locationDetail: $('locationDetail'),
  photoInput: $('photoInput'),
  photoPreview: $('photoPreview'),
  removePhotoButton: $('removePhotoButton'),
  notes: $('notes'),
  finalizeBackButton: $('finalizeBackButton'),
  saveButton: $('saveButton'),
  historyPanel: $('historyPanel'),
  historyHint: $('historyHint'),
  historySelectedButton: $('historySelectedButton'),
  historyAllButton: $('historyAllButton'),
  historyBackButton: $('historyBackButton'),
  records: $('records'),
  recordTemplate: $('recordTemplate'),
  recordModal: $('recordModal'),
  recordModalBackdrop: $('recordModalBackdrop'),
  closeRecordModal: $('closeRecordModal'),
  recordModalTitle: $('recordModalTitle'),
  recordModalSubtitle: $('recordModalSubtitle'),
  recordModalSummary: $('recordModalSummary'),
  recordEditForm: $('recordEditForm'),
  recordOccurredAt: $('recordOccurredAt'),
  recordStatus: $('recordStatus'),
  recordOccurrenceLabel: $('recordOccurrenceLabel'),
  recordNotes: $('recordNotes'),
  recordComments: $('recordComments'),
  recordCommentInput: $('recordCommentInput'),
  recordCommentButton: $('recordCommentButton'),
  recordSaveButton: $('recordSaveButton'),
  recordAudit: $('recordAudit'),
  recordDeleteSection: $('recordDeleteSection'),
  recordDeleteReason: $('recordDeleteReason'),
  recordDeleteButton: $('recordDeleteButton'),
  loginForm: $('loginForm'),
  loginUsername: $('loginUsername'),
  loginPassword: $('loginPassword'),
  loginHint: $('loginHint'),
  loginNext: $('loginNext'),
  loginButton: $('loginButton'),
};

function normalizeKey(value) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function titleCase(value) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

function buildStudentRoster(groups) {
  const names = groups.flatMap((group) => group.students);
  const firstNameCounts = names.reduce((counts, fullName) => {
    const firstName = normalizeKey(fullName.split(/\s+/)[0]);
    counts[firstName] = (counts[firstName] || 0) + 1;
    return counts;
  }, {});

  return groups.flatMap((group) => group.students.map((fullName) => {
    const parts = fullName.split(/\s+/);
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    const displayName = firstNameCounts[normalizeKey(firstName)] > 1 ? `${firstName} ${lastName}` : firstName;

    return {
      fullName,
      displayName: titleCase(displayName),
      firstName: titleCase(firstName),
      classKey: group.key,
      classLabel: group.label,
    };
  }));
}

async function apiRequest(pathname, options = {}) {
  const response = await fetch(pathname, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(body?.error || 'request_failed');
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

async function loadAuthUser() {
  try {
    const response = await apiRequest('/api/auth/me', { method: 'GET' });
    state.authUser = response.user;
    return response.user;
  } catch {
    state.authUser = null;
    return null;
  }
}

async function loadReports() {
  try {
    const response = await apiRequest('/api/reports', { method: 'GET' });
    state.reports = Array.isArray(response.reports) ? response.reports : [];
  } catch {
    state.reports = [];
  }
}

function syncAuthUi() {
  if (elements.authUserLabel) {
    elements.authUserLabel.textContent = state.authUser ? `Logado: ${state.authUser.displayName}` : '';
    elements.authUserLabel.classList.toggle('hidden', !state.authUser);
  }

  if (elements.logoutButton) {
    elements.logoutButton.classList.toggle('hidden', !state.authUser);
  }
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(storageKeys.draft);
    if (!raw) {
      return;
    }

    const draft = JSON.parse(raw);
    state.selectedClass = draft.selectedClass || classGroups[0]?.key || '6ano';
    state.selectedStudents = Array.isArray(draft.selectedStudents) ? draft.selectedStudents : [];
    state.selectedOccurrence = draft.selectedOccurrence || occurrenceTypes[0];
    state.customOccurrence = draft.customOccurrence || '';
    state.notes = draft.notes || '';
    state.dateTime = draft.dateTime || '';
    state.photoDataUrl = draft.photoDataUrl || '';
    state.location = draft.location || null;
    state.historyMode = draft.historyMode || 'selected';
  } catch {
    clearDraft();
  }
}

function saveDraft() {
  localStorage.setItem(
    storageKeys.draft,
    JSON.stringify({
      selectedStudents: state.selectedStudents,
      selectedClass: state.selectedClass,
      selectedOccurrence: state.selectedOccurrence,
      customOccurrence: state.customOccurrence,
      notes: state.notes,
      dateTime: state.dateTime,
      photoDataUrl: state.photoDataUrl,
      location: state.location,
      historyMode: state.historyMode,
    }),
  );
}

function clearDraft() {
  localStorage.removeItem(storageKeys.draft);
  state.selectedClass = classGroups[0]?.key || '6ano';
  state.selectedStudents = [];
  state.selectedOccurrence = occurrenceTypes[0];
  state.customOccurrence = '';
  state.notes = '';
  state.dateTime = '';
  state.photoDataUrl = '';
  state.location = null;
  state.historyMode = 'selected';
}

function shouldAutoPrefillLocation() {
  return localStorage.getItem(storageKeys.locationPrefill) === 'true';
}

function markAutoPrefillLocationEnabled() {
  localStorage.setItem(storageKeys.locationPrefill, 'true');
}

function getPageNextRedirect() {
  const params = new URLSearchParams(window.location.search);
  return params.get('next') || pageMap.students;
}

function toDateTimeLocalValue(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function statusLabel(value) {
  const labels = {
    aberta: 'Aberta',
    em_andamento: 'Em andamento',
    aguardando_retorno: 'Aguardando retorno',
    encaminhada: 'Encaminhada',
    concluida: 'Concluída',
    excluida: 'Excluída',
  };

  return labels[value] || titleCase(String(value || 'Aberta').replaceAll('_', ' '));
}

function formatReportEditSummary(report) {
  if (report.deletedAt) {
    return `Excluída em ${formatDateTime(report.deletedAt)}`;
  }

  const createdAt = report.createdAt ? formatDateTime(report.createdAt) : '--';
  const updatedAt = report.updatedAt ? formatDateTime(report.updatedAt) : '--';
  return report.updatedAt && report.updatedAt !== report.createdAt
    ? `Criado em ${createdAt} · Editado em ${updatedAt}`
    : `Criado em ${createdAt}`;
}

function buildChangeSummary(report) {
  if (!Array.isArray(report.auditTrail) || report.auditTrail.length === 0) {
    return 'Sem alterações auditadas.';
  }

  const latest = report.auditTrail[0];
  const parts = Array.isArray(latest.changes)
    ? latest.changes.map((change) => `${change.field}`)
    : [];

  return parts.length > 0 ? `Última edição: ${parts.join(', ')}` : 'Última edição registrada.';
}

function canEditReport(report) {
  if (!state.authUser || report.deletedAt) {
    return false;
  }

  return state.authUser.role === 'coordinator' || report.createdBy === state.authUser.username;
}

function canDeleteReport(report) {
  return Boolean(state.authUser && state.authUser.role === 'coordinator' && !report.deletedAt);
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatLocation(location) {
  if (!location) {
    return 'Localização não registrada';
  }

  return `Lat ${location.latitude.toFixed(5)} | Lng ${location.longitude.toFixed(5)} | ${Math.round(location.accuracy)}m`;
}

function getCurrentDateTimeLocal() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

function getSelectedStudents() {
  return state.selectedStudents.map((fullName) => studentByName.get(fullName)).filter(Boolean);
}

function summarizeSelectedStudents() {
  const selectedStudents = getSelectedStudents();

  if (selectedStudents.length === 0) {
    return 'Nenhum aluno selecionado';
  }

  if (selectedStudents.length === 1) {
    return selectedStudents[0].displayName;
  }

  if (selectedStudents.length === 2) {
    return `${selectedStudents[0].displayName} e ${selectedStudents[1].displayName}`;
  }

  return `${selectedStudents[0].displayName}, ${selectedStudents[1].displayName} +${selectedStudents.length - 2}`;
}

function navigate(pageName) {
  window.location.href = pageMap[pageName] || pageMap.students;
}

function updateHeader() {
  const pageTitles = {
    login: ['Acesso seguro', 'Entrar no ClassLog', 'Use seu usuário e senha para acessar o sistema centralizado.'],
    students: ['Etapa 1', 'Selecionar alunos', 'Escolha um ou mais alunos para iniciar a ocorrência.'],
    occurrence: ['Etapa 2', 'Escolher ocorrência', 'Selecione o tipo da ocorrência e salve para complementar os dados.'],
    finalize: ['Etapa 3', 'Complementar informações', 'Revise data, localização, foto e observação antes de salvar.'],
    history: ['Histórico', 'Ocorrências salvas', 'Veja registros recentes e filtre por alunos selecionados.'],
  };

  const [subtitle, title, description] = pageTitles[state.page] || pageTitles.students;
  if (elements.pageSubtitle) elements.pageSubtitle.textContent = subtitle;
  if (elements.title) elements.title.textContent = title;
  if (elements.pageDescription) elements.pageDescription.textContent = description;
}

function updateStats() {
  const today = new Date().toDateString();
  const todayReports = state.reports.filter((report) => new Date(report.createdAt).toDateString() === today);

  if (elements.todayCount) elements.todayCount.textContent = String(todayReports.length);
  if (elements.selectedCount) elements.selectedCount.textContent = String(state.selectedStudents.length);
  if (elements.lastSavedLabel) elements.lastSavedLabel.textContent = state.reports.length ? formatDateTime(state.reports[0].createdAt) : '--';
}

function renderSelectedStudentsStrip() {
  if (!elements.selectedStudentsStrip) return;

  elements.selectedStudentsStrip.innerHTML = '';
  const selectedStudents = getSelectedStudents();

  if (selectedStudents.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'selection-empty';
    empty.textContent = 'Nenhum aluno selecionado';
    elements.selectedStudentsStrip.appendChild(empty);
    return;
  }

  selectedStudents.forEach((student) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'selected-pill';
    button.innerHTML = `${student.displayName}<small>${student.classLabel}</small><span>×</span>`;
    button.addEventListener('click', () => {
      state.selectedStudents = state.selectedStudents.filter((fullName) => fullName !== student.fullName);
      saveDraft();
      renderAll();
    });
    elements.selectedStudentsStrip.appendChild(button);
  });
}

function renderStudentChips() {
  if (!elements.studentChips) return;

  const query = normalizeKey((elements.studentSearch?.value || '').trim());
  const filtered = studentRoster.filter((student) => {
    if (student.classKey !== state.selectedClass) return false;
    if (!query) return true;
    return (
      normalizeKey(student.displayName).includes(query) ||
      normalizeKey(student.fullName).includes(query) ||
      normalizeKey(student.firstName).includes(query)
    );
  });

  elements.studentChips.innerHTML = '';

  if (filtered.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'hint';
    empty.textContent = 'Nenhum aluno encontrado.';
    elements.studentChips.appendChild(empty);
    return;
  }

  filtered.forEach((student) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `chip ${state.selectedStudents.includes(student.fullName) ? 'active' : ''}`;
    button.textContent = student.displayName;
    button.setAttribute('aria-pressed', String(state.selectedStudents.includes(student.fullName)));
    button.addEventListener('click', () => {
      const isSelected = state.selectedStudents.includes(student.fullName);
      state.selectedStudents = isSelected
        ? state.selectedStudents.filter((fullName) => fullName !== student.fullName)
        : [...state.selectedStudents, student.fullName];
      saveDraft();
      renderAll();
    });
    elements.studentChips.appendChild(button);
  });
}

function renderClassTabs() {
  if (!elements.classTabs || !elements.classHint) return;

  elements.classTabs.innerHTML = '';

  classGroups.forEach((classGroup) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `chip class-tab ${state.selectedClass === classGroup.key ? 'active' : ''}`;
    button.innerHTML = `${classGroup.label}<small>${classGroup.students.length} alunos</small>`;
    button.setAttribute('aria-pressed', String(state.selectedClass === classGroup.key));
    button.addEventListener('click', () => {
      state.selectedClass = classGroup.key;
      saveDraft();
      renderAll();
    });
    elements.classTabs.appendChild(button);
  });

  const activeClass = classByKey.get(state.selectedClass) || classGroups[0];
  elements.classHint.textContent = activeClass
    ? `${activeClass.label}: escolha os alunos desta turma antes de avançar.`
    : 'Selecione uma turma para começar.';
}

function renderOccurrenceChips() {
  if (!elements.occurrenceChips) return;

  elements.occurrenceChips.innerHTML = '';
  const hasStudents = state.selectedStudents.length > 0;

  occurrenceTypes.forEach((type) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `chip ${state.selectedOccurrence === type ? 'active' : ''}`;
    button.textContent = type;
    button.disabled = !hasStudents;
    button.addEventListener('click', () => {
      state.selectedOccurrence = type;
      if (type !== 'Outra') {
        state.customOccurrence = '';
      }
      saveDraft();
      renderAll();
    });
    elements.occurrenceChips.appendChild(button);
  });
}

function renderCustomOccurrenceField() {
  if (!elements.otherOccurrenceField || !elements.otherOccurrence) {
    return;
  }

  const showCustomField = state.selectedOccurrence === 'Outra';
  elements.otherOccurrenceField.classList.toggle('hidden', !showCustomField);
  elements.otherOccurrence.disabled = !showCustomField;
  if (!showCustomField) {
    elements.otherOccurrence.value = '';
  }
}

function renderPhotoPreview() {
  if (!elements.photoPreview) return;

  elements.photoPreview.innerHTML = '';

  if (!state.photoDataUrl) {
    const placeholder = document.createElement('span');
    placeholder.textContent = 'Nenhuma imagem adicionada';
    elements.photoPreview.appendChild(placeholder);
    return;
  }

  const image = document.createElement('img');
  image.src = state.photoDataUrl;
  image.alt = 'Pré-visualização da foto anexada';
  elements.photoPreview.appendChild(image);
}

function renderLocation() {
  if (!elements.locationStatus || !elements.locationDetail) return;

  if (!state.location) {
    elements.locationStatus.textContent = 'Ainda não capturada';
    elements.locationDetail.textContent = 'Latitude e longitude serão preenchidas quando você permitir.';
    return;
  }

  elements.locationStatus.textContent = 'Capturada';
  elements.locationDetail.textContent = formatLocation(state.location);
}

async function autoPrefillFinalizeContext() {
  if (state.page !== 'occurrence' || !state.selectedStudents.length) {
    return;
  }

  if (!state.dateTime) {
    state.dateTime = getCurrentDateTimeLocal();
  }

  if (state.location) {
    return;
  }

  if (!navigator.geolocation) {
    return;
  }

  const canTryCapture = shouldAutoPrefillLocation();

  if (navigator.permissions?.query) {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'granted') {
        markAutoPrefillLocationEnabled();
        await captureLocation({ silent: true, updateButton: false });
        return;
      }
    } catch {
      // Fall through to the persisted preference below.
    }
  }

  if (canTryCapture) {
    await captureLocation({ silent: true, updateButton: false });
  }
}

function getFilteredReports() {
  if (state.historyMode === 'selected' && state.selectedStudents.length > 0) {
    const selectedNames = new Set(state.selectedStudents);
    return state.reports.filter((report) => (report.selectedStudents || []).some((student) => selectedNames.has(student.fullName)));
  }

  return state.reports;
}

function renderHistory() {
  if (!elements.records || !elements.recordTemplate || !elements.historyHint) return;

  const filteredReports = getFilteredReports();
  elements.records.innerHTML = '';

  if (state.historyMode === 'selected' && state.selectedStudents.length > 0) {
    elements.historyHint.textContent = `Mostrando ${filteredReports.length} ocorrência(s) de ${summarizeSelectedStudents()}.`;
  } else {
    elements.historyHint.textContent = `Visão geral com ${filteredReports.length} registro(s).`;
  }

  if (filteredReports.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'hint';
    empty.textContent = 'Nenhuma ocorrência encontrada nesta visão.';
    elements.records.appendChild(empty);
    return;
  }

  filteredReports.forEach((report) => {
    const card = elements.recordTemplate.content.cloneNode(true);
    const cardRoot = card.firstElementChild;
    const studentsWrap = card.querySelector('.record-students');
    const occurrence = card.querySelector('.record-occurrence');
    const datetime = card.querySelector('.record-datetime');
    const notes = card.querySelector('.record-notes');
    const meta = card.querySelector('.record-meta');
    const photoWrap = card.querySelector('.record-photo-wrap');
    const status = card.querySelector('.record-status');
    const timeline = card.querySelector('.record-timeline');
    const commentsPreview = card.querySelector('.record-comments-preview');
    const editButton = card.querySelector('.record-edit-button');
    const commentButton = card.querySelector('.record-comment-button');
    const isDeleted = Boolean(report.deletedAt);

    report.selectedStudents.forEach((student) => {
      const tag = document.createElement('span');
      tag.className = 'record-student-tag';
      tag.textContent = student.displayName;
      studentsWrap.appendChild(tag);
    });

    occurrence.textContent = report.occurrenceLabel;
    datetime.textContent = report.formalTime || formatDateTime(report.occurredAt || report.createdAt);
    notes.textContent = report.notes || 'Sem observações adicionais.';
    status.textContent = statusLabel(report.status);
    timeline.textContent = formatReportEditSummary(report);

    if (cardRoot) {
      cardRoot.classList.toggle('is-deleted', isDeleted);
    }

    const studentCountTag = document.createElement('span');
    studentCountTag.textContent = `${report.selectedStudents.length} aluno(s)`;
    meta.appendChild(studentCountTag);

    const timeTag = document.createElement('span');
    timeTag.textContent = `Ocorrência: ${report.formalTime || formatDateTime(report.occurredAt || report.createdAt)}`;
    meta.appendChild(timeTag);

    const createdTag = document.createElement('span');
    createdTag.textContent = `Criado em ${formatDateTime(report.createdAt)}`;
    meta.appendChild(createdTag);

    if (report.updatedAt && report.updatedAt !== report.createdAt) {
      const updatedTag = document.createElement('span');
      updatedTag.textContent = `Editado em ${formatDateTime(report.updatedAt)}`;
      meta.appendChild(updatedTag);
    }

    const statusTag = document.createElement('span');
    statusTag.textContent = `Status ${statusLabel(report.status)}`;
    meta.appendChild(statusTag);

    const locationTag = document.createElement('span');
    locationTag.textContent = report.location ? 'Local capturado' : 'Sem local';
    meta.appendChild(locationTag);

    const photoTag = document.createElement('span');
    photoTag.textContent = report.photoDataUrl ? 'Com foto' : 'Sem foto';
    meta.appendChild(photoTag);

    const commentsTag = document.createElement('span');
    commentsTag.textContent = `${Array.isArray(report.comments) ? report.comments.length : 0} comentário(s)`;
    meta.appendChild(commentsTag);

    if (isDeleted) {
      const deletedTag = document.createElement('span');
      deletedTag.textContent = `Excluída por ${report.deletedByName || 'Coordenação'}`;
      meta.appendChild(deletedTag);

      const reasonTag = document.createElement('span');
      reasonTag.textContent = `Motivo: ${report.deletedReason || 'não informado'}`;
      meta.appendChild(reasonTag);

      const deletionNote = document.createElement('div');
      deletionNote.className = 'record-deletion-note';
      deletionNote.textContent = `Esta ocorrência foi excluída por ${report.deletedByName || 'Coordenação'} em ${report.deletedAt ? formatDateTime(report.deletedAt) : 'data desconhecida'}. Motivo: ${report.deletedReason || 'não informado'}.`;
      commentsPreview.appendChild(deletionNote);
    }

    if (report.location) {
      const coordsTag = document.createElement('span');
      coordsTag.textContent = `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}`;
      meta.appendChild(coordsTag);
    }

    if (report.photoDataUrl) {
      const image = document.createElement('img');
      image.src = report.photoDataUrl;
      image.alt = `Foto anexada da ocorrência de ${report.selectedStudents[0].displayName}`;
      photoWrap.appendChild(image);
    }

    if (commentsPreview) {
      commentsPreview.innerHTML = '';
      const comments = Array.isArray(report.comments) ? report.comments.slice(0, 2) : [];

      if (comments.length === 0) {
        const emptyComments = document.createElement('span');
        emptyComments.textContent = 'Sem comentários.';
        commentsPreview.appendChild(emptyComments);
      } else {
        comments.forEach((comment) => {
          const commentBox = document.createElement('div');
          commentBox.className = 'record-comment';

          const author = document.createElement('strong');
          author.textContent = `${comment.createdByName || 'Sistema'} · ${formatDateTime(comment.createdAt)}`;

          const text = document.createElement('p');
          text.textContent = comment.text;

          commentBox.append(author, text);
          commentsPreview.appendChild(commentBox);
        });
      }
    }

    if (editButton) {
      editButton.disabled = !canEditReport(report);
      editButton.textContent = isDeleted ? 'Excluída' : 'Editar';
      editButton.addEventListener('click', () => openReportModal(report.id, 'edit'));
    }

    if (commentButton) {
      commentButton.disabled = isDeleted;
      commentButton.addEventListener('click', () => openReportModal(report.id, 'comment'));
    }

    elements.records.appendChild(card);
  });
}

function getActiveReport() {
  return state.reports.find((report) => report.id === state.activeReportId) || null;
}

function renderReportModal() {
  const report = getActiveReport();
  if (!elements.recordModal || !elements.recordEditForm || !elements.recordModalSummary) {
    return;
  }

  if (!report) {
    elements.recordModal.classList.add('hidden');
    elements.recordModal.setAttribute('aria-hidden', 'true');
    return;
  }

  elements.recordModal.classList.remove('hidden');
  elements.recordModal.setAttribute('aria-hidden', 'false');
  if (elements.recordModalTitle) elements.recordModalTitle.textContent = report.occurrenceLabel;
  if (elements.recordModalSubtitle) elements.recordModalSubtitle.textContent = `Registro ${report.id.slice(0, 8)}`;

  elements.recordModalSummary.innerHTML = '';
  report.selectedStudents.forEach((student) => {
    const tag = document.createElement('span');
    tag.className = 'selected-pill';
    tag.textContent = student.displayName;
    elements.recordModalSummary.appendChild(tag);
  });

  if (elements.recordOccurredAt) elements.recordOccurredAt.value = toDateTimeLocalValue(report.occurredAt || report.createdAt);
  if (elements.recordStatus) elements.recordStatus.value = report.status || 'aberta';
  if (elements.recordOccurrenceLabel) elements.recordOccurrenceLabel.value = report.occurrenceLabel || '';
  if (elements.recordNotes) elements.recordNotes.value = report.notes || '';
  if (elements.recordCommentInput) elements.recordCommentInput.value = '';
  if (elements.recordDeleteReason) elements.recordDeleteReason.value = '';

  const canEdit = canEditReport(report);
  const canDelete = canDeleteReport(report);

  if (elements.recordOccurrenceLabel) elements.recordOccurrenceLabel.disabled = !canEdit;
  if (elements.recordNotes) elements.recordNotes.disabled = !canEdit;
  if (elements.recordOccurredAt) elements.recordOccurredAt.disabled = !canEdit;
  if (elements.recordStatus) elements.recordStatus.disabled = !canEdit;
  if (elements.recordSaveButton) elements.recordSaveButton.classList.toggle('hidden', !canEdit);
  if (elements.recordCommentButton) elements.recordCommentButton.classList.toggle('hidden', report.deletedAt || !state.authUser);
  if (elements.recordCommentInput) elements.recordCommentInput.disabled = Boolean(report.deletedAt);

  if (elements.recordDeleteSection) {
    elements.recordDeleteSection.classList.toggle('hidden', !canDelete);
  }

  if (elements.recordDeleteButton) {
    elements.recordDeleteButton.disabled = !canDelete;
  }

  if (elements.recordComments) {
    elements.recordComments.innerHTML = '';
    const comments = Array.isArray(report.comments) ? report.comments : [];

    if (comments.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'hint';
      empty.textContent = 'Nenhum comentário registrado.';
      elements.recordComments.appendChild(empty);
    } else {
      comments.forEach((comment) => {
        const commentBox = document.createElement('article');
        commentBox.className = 'record-comment';

        const heading = document.createElement('strong');
        heading.textContent = `${comment.createdByName || 'Sistema'} · ${formatDateTime(comment.createdAt)}`;

        const text = document.createElement('p');
        text.textContent = comment.text;

        commentBox.append(heading, text);
        elements.recordComments.appendChild(commentBox);
      });
    }
  }

  if (elements.recordAudit) {
    elements.recordAudit.innerHTML = '';
    const auditTrail = Array.isArray(report.auditTrail) ? report.auditTrail : [];

    if (auditTrail.length === 0) {
      const emptyAudit = document.createElement('p');
      emptyAudit.className = 'hint';
      emptyAudit.textContent = 'Nenhuma alteração anterior.';
      elements.recordAudit.appendChild(emptyAudit);
    } else {
      auditTrail.forEach((entry) => {
        const item = document.createElement('article');
        item.className = 'record-comment';

        const heading = document.createElement('strong');
        heading.textContent = `${entry.createdByName || 'Sistema'} · ${formatDateTime(entry.createdAt)}`;

        const details = document.createElement('p');
        details.textContent = Array.isArray(entry.changes) && entry.changes.length > 0
          ? entry.changes.map((change) => `${change.field}`).join(', ')
          : 'Alteração registrada.';

        item.append(heading, details);
        elements.recordAudit.appendChild(item);
      });
    }
  }

  if (elements.recordDeleteSection) {
    const deletedText = report.deletedAt
      ? `Esta ocorrência foi excluída em ${formatDateTime(report.deletedAt)} por ${report.deletedByName || 'Coordenação'}. Motivo: ${report.deletedReason || 'não informado'}.`
      : '';
    if (deletedText && elements.recordDeleteReason) {
      elements.recordDeleteReason.value = report.deletedReason || '';
    }
  }
}

function openReportModal(reportId, mode = 'edit') {
  state.activeReportId = reportId;
  state.reportModalMode = mode;
  renderReportModal();
}

function closeReportModal() {
  state.activeReportId = null;
  renderReportModal();
}

async function saveReportEdits() {
  const report = getActiveReport();
  if (!report) {
    return;
  }

  if (!canEditReport(report)) {
    alert('Você não tem permissão para editar esta ocorrência.');
    return;
  }

  const payload = {
    occurrenceLabel: elements.recordOccurrenceLabel ? elements.recordOccurrenceLabel.value.trim() : report.occurrenceLabel,
    notes: elements.recordNotes ? elements.recordNotes.value.trim() : report.notes,
    occurredAt: elements.recordOccurredAt ? elements.recordOccurredAt.value : report.occurredAt,
    status: elements.recordStatus ? elements.recordStatus.value : report.status,
  };

  if (!payload.occurrenceLabel) {
    alert('A ocorrência não pode ficar vazia.');
    return;
  }

  try {
    await apiRequest(`/api/reports/${encodeURIComponent(report.id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    await loadReports();
    renderAll();
    closeReportModal();
  } catch (error) {
    alert('Não foi possível salvar as alterações.');
  }
}

async function addReportComment() {
  const report = getActiveReport();
  if (!report || !elements.recordCommentInput) {
    return;
  }

  if (report.deletedAt) {
    alert('Não é possível comentar uma ocorrência excluída.');
    return;
  }

  const comment = elements.recordCommentInput.value.trim();
  if (!comment) {
    alert('Escreva um comentário antes de adicionar.');
    return;
  }

  try {
    await apiRequest(`/api/reports/${encodeURIComponent(report.id)}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        comment,
        status: elements.recordStatus ? elements.recordStatus.value : report.status,
      }),
    });
    await loadReports();
    renderAll();
    if (elements.recordCommentInput) elements.recordCommentInput.value = '';
    renderReportModal();
  } catch {
    alert('Não foi possível adicionar o comentário.');
  }
}

async function deleteReport() {
  const report = getActiveReport();
  if (!report || !canDeleteReport(report)) {
    alert('Somente a coordenação pode excluir ocorrências.');
    return;
  }

  const reason = elements.recordDeleteReason ? elements.recordDeleteReason.value.trim() : '';
  if (!reason) {
    alert('Informe o motivo da exclusão.');
    return;
  }

  const confirmed = confirm('A exclusão ficará registrada com motivo. Deseja continuar?');
  if (!confirmed) {
    return;
  }

  try {
    await apiRequest(`/api/reports/${encodeURIComponent(report.id)}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
    await loadReports();
    renderAll();
    closeReportModal();
  } catch {
    alert('Não foi possível excluir a ocorrência.');
  }
}

function updatePageState() {
  const hasStudents = state.selectedStudents.length > 0;
  const currentOccurrence = state.selectedOccurrence === 'Outra' ? state.customOccurrence.trim() : state.selectedOccurrence;
  const canMoveToOccurrence = hasStudents;
  const canMoveToFinalize = hasStudents && Boolean(currentOccurrence);
  const canSave = canMoveToFinalize;

  if (elements.studentSearch) elements.studentSearch.disabled = false;
  if (elements.clearStudentButton) elements.clearStudentButton.disabled = !hasStudents;
  if (elements.studentNextButton) elements.studentNextButton.disabled = !canMoveToOccurrence;
  if (elements.occurrenceBackButton) elements.occurrenceBackButton.disabled = false;
  if (elements.occurrenceNextButton) elements.occurrenceNextButton.disabled = !canMoveToFinalize;
  if (elements.otherOccurrence) elements.otherOccurrence.disabled = !hasStudents || state.selectedOccurrence !== 'Outra';
  if (elements.captureLocationButton) elements.captureLocationButton.disabled = !hasStudents;
  if (elements.saveButton) elements.saveButton.disabled = !canSave;
  if (elements.occurrenceHint) {
    elements.occurrenceHint.textContent = hasStudents
      ? 'Salve esta etapa para abrir os campos de complementação.'
      : 'Selecione um ou mais alunos para liberar esta etapa.';
  }

  if (elements.historySelectedButton) elements.historySelectedButton.classList.toggle('active', state.historyMode === 'selected');
  if (elements.historyAllButton) elements.historyAllButton.classList.toggle('active', state.historyMode === 'all');
}

function renderPageSpecificFields() {
  if (elements.studentSearch) elements.studentSearch.value = elements.studentSearch.value || '';
  if (elements.otherOccurrence) elements.otherOccurrence.value = state.customOccurrence;
  if (elements.notes) elements.notes.value = state.notes;
  if (elements.dateTime) elements.dateTime.value = state.dateTime || getCurrentDateTimeLocal();
  if (elements.selectedSummary) elements.selectedSummary.textContent = summarizeSelectedStudents();
  renderClassTabs();
  renderSelectedStudentsStrip();
  renderStudentChips();
  renderOccurrenceChips();
  renderCustomOccurrenceField();
  renderPhotoPreview();
  renderLocation();
  renderHistory();
  updatePageState();
}

function renderAll() {
  updateHeader();
  updateStats();
  renderPageSpecificFields();
}

async function captureLocation(options = {}) {
  const { silent = false, updateButton = true } = options;
  if (!navigator.geolocation) {
    if (!silent) alert('Este navegador não oferece suporte à localização.');
    return;
  }

  if (updateButton && elements.captureLocationButton) {
    elements.captureLocationButton.disabled = true;
    elements.captureLocationButton.textContent = 'Capturando...';
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        state.location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: new Date().toISOString(),
        };
        markAutoPrefillLocationEnabled();
        saveDraft();
        renderLocation();
        updatePageState();
        if (updateButton && elements.captureLocationButton) elements.captureLocationButton.textContent = 'Capturar local';
        resolve(true);
      },
      () => {
        if (!silent) {
          alert('Não foi possível capturar a localização. Verifique a permissão do navegador.');
        }
        if (updateButton && elements.captureLocationButton) {
          elements.captureLocationButton.disabled = !state.selectedStudents.length;
          elements.captureLocationButton.textContent = 'Capturar local';
        }
        resolve(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  });
}

function handlePhotoChange(event) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    state.photoDataUrl = String(reader.result || '');
    saveDraft();
    renderPhotoPreview();
  };
  reader.readAsDataURL(file);
}

function normalizeOccurrenceLabel() {
  return state.selectedOccurrence === 'Outra' ? state.customOccurrence.trim() : state.selectedOccurrence;
}

function createReport() {
  return {
    selectedStudents: getSelectedStudents().map((student) => ({
      fullName: student.fullName,
      displayName: student.displayName,
    })),
    occurrenceLabel: normalizeOccurrenceLabel(),
    notes: state.notes.trim(),
    occurredAt: state.dateTime || new Date().toISOString(),
    location: state.location,
    photoDataUrl: state.photoDataUrl,
  };
}

async function saveReport() {
  if (!state.selectedStudents.length) {
    alert('Selecione um ou mais alunos antes de salvar.');
    return;
  }

  const occurrenceLabel = normalizeOccurrenceLabel();
  if (!occurrenceLabel) {
    alert('Escolha ou escreva o tipo de ocorrência.');
    return;
  }

  try {
    await apiRequest('/api/reports', {
      method: 'POST',
      body: JSON.stringify(createReport()),
    });
    clearDraft();
    saveDraft();
    await loadReports();
    navigate('history');
  } catch {
    alert('Não foi possível salvar a ocorrência no servidor.');
  }
}

async function saveOccurrenceStep() {
  if (!state.selectedStudents.length) {
    alert('Selecione um ou mais alunos antes de salvar.');
    return;
  }

  const occurrenceLabel = normalizeOccurrenceLabel();
  if (!occurrenceLabel) {
    alert('Escolha ou escreva o tipo de ocorrência.');
    return;
  }

  if (!state.dateTime) {
    state.dateTime = getCurrentDateTimeLocal();
  }

  await autoPrefillFinalizeContext();
  saveDraft();
  navigate('finalize');
}

function exportReports() {
  const blob = new Blob([JSON.stringify(state.reports, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `classlog-ocorrencias-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  if (elements.studentSearch) {
    elements.studentSearch.addEventListener('input', renderStudentChips);
  }

  if (elements.clearStudentButton) {
    elements.clearStudentButton.addEventListener('click', () => {
      state.selectedStudents = [];
      saveDraft();
      renderAll();
    });
  }

  if (elements.studentNextButton) {
    elements.studentNextButton.addEventListener('click', () => {
      if (state.selectedStudents.length) {
        state.historyMode = 'selected';
        saveDraft();
        navigate('occurrence');
      }
    });
  }

  if (elements.otherOccurrence) {
    elements.otherOccurrence.addEventListener('input', () => {
      state.customOccurrence = elements.otherOccurrence.value;
      if (state.customOccurrence.trim()) {
        state.selectedOccurrence = 'Outra';
      }
      saveDraft();
      renderAll();
    });
  }

  if (elements.occurrenceBackButton) {
    elements.occurrenceBackButton.addEventListener('click', () => navigate('students'));
  }

  if (elements.occurrenceNextButton) {
    elements.occurrenceNextButton.addEventListener('click', saveOccurrenceStep);
  }

  if (elements.dateTime) {
    elements.dateTime.addEventListener('change', () => {
      state.dateTime = elements.dateTime.value;
      saveDraft();
      updatePageState();
    });
  }

  if (elements.captureLocationButton) {
    elements.captureLocationButton.addEventListener('click', captureLocation);
  }

  if (elements.photoInput) {
    elements.photoInput.addEventListener('change', handlePhotoChange);
  }

  if (elements.removePhotoButton) {
    elements.removePhotoButton.addEventListener('click', () => {
      state.photoDataUrl = '';
      if (elements.photoInput) elements.photoInput.value = '';
      saveDraft();
      renderPhotoPreview();
    });
  }

  if (elements.notes) {
    elements.notes.addEventListener('input', () => {
      state.notes = elements.notes.value;
      saveDraft();
    });
  }

  if (elements.finalizeBackButton) {
    elements.finalizeBackButton.addEventListener('click', () => navigate('occurrence'));
  }

  if (elements.saveButton) {
    elements.saveButton.addEventListener('click', saveReport);
  }

  if (elements.historySelectedButton) {
    elements.historySelectedButton.addEventListener('click', () => {
      state.historyMode = 'selected';
      saveDraft();
      renderHistory();
      updatePageState();
    });
  }

  if (elements.historyAllButton) {
    elements.historyAllButton.addEventListener('click', () => {
      state.historyMode = 'all';
      saveDraft();
      renderHistory();
      updatePageState();
    });
  }

  if (elements.historyBackButton) {
    elements.historyBackButton.addEventListener('click', () => navigate('finalize'));
  }

  if (elements.logoutButton) {
    elements.logoutButton.addEventListener('click', async () => {
      try {
        await apiRequest('/api/auth/logout', { method: 'POST' });
      } catch {
        // Continue logout flow even if the request fails.
      }
      clearDraft();
      navigate('login');
    });
  }

  if (elements.closeRecordModal) {
    elements.closeRecordModal.addEventListener('click', closeReportModal);
  }

  if (elements.recordModalBackdrop) {
    elements.recordModalBackdrop.addEventListener('click', closeReportModal);
  }

  if (elements.recordSaveButton) {
    elements.recordSaveButton.addEventListener('click', saveReportEdits);
  }

  if (elements.recordCommentButton) {
    elements.recordCommentButton.addEventListener('click', addReportComment);
  }

  if (elements.recordDeleteButton) {
    elements.recordDeleteButton.addEventListener('click', deleteReport);
  }

  if (elements.recordEditForm) {
    elements.recordEditForm.addEventListener('submit', (event) => {
      event.preventDefault();
      saveReportEdits();
    });
  }

  if (elements.loginForm) {
    elements.loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (elements.loginButton) elements.loginButton.disabled = true;
      if (elements.loginHint) elements.loginHint.textContent = 'Entrando...';

      try {
        await apiRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            username: elements.loginUsername ? elements.loginUsername.value.trim() : '',
            password: elements.loginPassword ? elements.loginPassword.value : '',
          }),
        });
        const nextPage = getPageNextRedirect();
        window.location.href = nextPage;
      } catch (error) {
        if (elements.loginHint) {
          const isNetworkError = !error || error.status == null;
          elements.loginHint.textContent = isNetworkError
            ? 'Servidor indisponível. Verifique se o `npm start` está em execução.'
            : 'Credenciais inválidas. Verifique o usuário e a senha.';
        }
        if (elements.loginButton) elements.loginButton.disabled = false;
      }
    });
  }
}

async function initPage() {
  await loadAuthUser();

  if (state.page === 'login') {
    if (state.authUser) {
      window.location.href = getPageNextRedirect();
      return;
    }

    updateHeader();
    bindEvents();
    if (elements.loginNext) elements.loginNext.value = getPageNextRedirect();
    if (elements.loginUsername) elements.loginUsername.focus();
    return;
  }

  if (!state.authUser) {
    navigate('login');
    return;
  }

  syncAuthUi();
  await loadReports();
  loadDraft();

  if (!state.dateTime) {
    state.dateTime = getCurrentDateTimeLocal();
  }

  if (elements.studentSearch) elements.studentSearch.value = '';
  if (elements.otherOccurrence) elements.otherOccurrence.value = state.customOccurrence;
  if (elements.notes) elements.notes.value = state.notes;
  if (elements.dateTime) elements.dateTime.value = state.dateTime;

  bindEvents();
  renderAll();
  updatePageState();

  if (state.page === 'occurrence') {
    await autoPrefillFinalizeContext();
    renderAll();
  }
}

initPage();
