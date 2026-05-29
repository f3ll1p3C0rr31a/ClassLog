const studentNames = [
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
  reports: 'classlog-reports-v3',
  draft: 'classlog-draft-v3',
};

const pageMap = {
  students: 'index.html',
  occurrence: 'occurrence.html',
  finalize: 'finalize.html',
  history: 'history.html',
};

const studentRoster = buildStudentRoster(studentNames);
const studentByName = new Map(studentRoster.map((student) => [student.fullName, student]));

const state = {
  page: document.body.dataset.page || 'students',
  selectedStudents: [],
  selectedOccurrence: occurrenceTypes[0],
  customOccurrence: '',
  notes: '',
  dateTime: '',
  photoDataUrl: '',
  location: null,
  reports: [],
  historyMode: 'selected',
};

function $(id) {
  return document.getElementById(id);
}

const elements = {
  title: $('pageTitle'),
  pageSubtitle: $('pageSubtitle'),
  pageDescription: $('pageDescription'),
  selectedSummary: $('selectedSummary'),
  todayCount: $('todayCount'),
  selectedCount: $('selectedCount'),
  lastSavedLabel: $('lastSavedLabel'),
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
  exportButton: $('exportButton'),
  clearAllButton: $('clearAllButton'),
  historyBackButton: $('historyBackButton'),
  records: $('records'),
  recordTemplate: $('recordTemplate'),
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

function buildStudentRoster(names) {
  const firstNameCounts = names.reduce((counts, fullName) => {
    const firstName = normalizeKey(fullName.split(/\s+/)[0]);
    counts[firstName] = (counts[firstName] || 0) + 1;
    return counts;
  }, {});

  return names.map((fullName) => {
    const parts = fullName.split(/\s+/);
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    const displayName = firstNameCounts[normalizeKey(firstName)] > 1 ? `${firstName} ${lastName}` : firstName;

    return {
      fullName,
      displayName: titleCase(displayName),
      firstName: titleCase(firstName),
    };
  });
}

function loadReports() {
  try {
    const raw = localStorage.getItem(storageKeys.reports);
    state.reports = raw ? JSON.parse(raw) : [];
  } catch {
    state.reports = [];
  }
}

function saveReports() {
  localStorage.setItem(storageKeys.reports, JSON.stringify(state.reports));
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(storageKeys.draft);
    if (!raw) {
      return;
    }

    const draft = JSON.parse(raw);
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
  state.selectedStudents = [];
  state.selectedOccurrence = occurrenceTypes[0];
  state.customOccurrence = '';
  state.notes = '';
  state.dateTime = '';
  state.photoDataUrl = '';
  state.location = null;
  state.historyMode = 'selected';
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
    students: ['Etapa 1', 'Selecionar alunos', 'Escolha um ou mais alunos para iniciar a ocorrência.'],
    occurrence: ['Etapa 2', 'Escolher ocorrência', 'Selecione o tipo da ocorrência e avance.'],
    finalize: ['Etapa 3', 'Encerrar e salvar', 'Revise data, localização, foto e observação antes de salvar.'],
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
    button.innerHTML = `${student.displayName}<span>×</span>`;
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

function getFilteredReports() {
  if (state.historyMode === 'selected' && state.selectedStudents.length > 0) {
    const selectedNames = new Set(state.selectedStudents);
    return state.reports.filter((report) => report.students.some((student) => selectedNames.has(student.fullName)));
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
    const studentsWrap = card.querySelector('.record-students');
    const occurrence = card.querySelector('.record-occurrence');
    const datetime = card.querySelector('.record-datetime');
    const notes = card.querySelector('.record-notes');
    const meta = card.querySelector('.record-meta');
    const photoWrap = card.querySelector('.record-photo-wrap');

    report.students.forEach((student) => {
      const tag = document.createElement('span');
      tag.className = 'record-student-tag';
      tag.textContent = student.displayName;
      studentsWrap.appendChild(tag);
    });

    occurrence.textContent = report.occurrenceLabel;
    datetime.textContent = formatDateTime(report.createdAt);
    notes.textContent = report.notes || 'Sem observações adicionais.';

    const studentCountTag = document.createElement('span');
    studentCountTag.textContent = `${report.students.length} aluno(s)`;
    meta.appendChild(studentCountTag);

    const timeTag = document.createElement('span');
    timeTag.textContent = report.formalTime;
    meta.appendChild(timeTag);

    const locationTag = document.createElement('span');
    locationTag.textContent = report.location ? 'Local capturado' : 'Sem local';
    meta.appendChild(locationTag);

    const photoTag = document.createElement('span');
    photoTag.textContent = report.photoDataUrl ? 'Com foto' : 'Sem foto';
    meta.appendChild(photoTag);

    if (report.location) {
      const coordsTag = document.createElement('span');
      coordsTag.textContent = `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}`;
      meta.appendChild(coordsTag);
    }

    if (report.photoDataUrl) {
      const image = document.createElement('img');
      image.src = report.photoDataUrl;
      image.alt = `Foto anexada da ocorrência de ${report.students[0].displayName}`;
      photoWrap.appendChild(image);
    }

    elements.records.appendChild(card);
  });
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
      ? 'Escolha a ocorrência e avance para salvar.'
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

function captureLocation() {
  if (!navigator.geolocation) {
    alert('Este navegador não oferece suporte à localização.');
    return;
  }

  if (elements.captureLocationButton) {
    elements.captureLocationButton.disabled = true;
    elements.captureLocationButton.textContent = 'Capturando...';
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      state.location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        capturedAt: new Date().toISOString(),
      };
      saveDraft();
      renderLocation();
      updatePageState();
      if (elements.captureLocationButton) elements.captureLocationButton.textContent = 'Capturar local';
    },
    () => {
      alert('Não foi possível capturar a localização. Verifique a permissão do navegador.');
      if (elements.captureLocationButton) {
        elements.captureLocationButton.disabled = !state.selectedStudents.length;
        elements.captureLocationButton.textContent = 'Capturar local';
      }
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
  );
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
    id: crypto.randomUUID(),
    students: getSelectedStudents().map((student) => ({
      fullName: student.fullName,
      displayName: student.displayName,
    })),
    occurrenceLabel: normalizeOccurrenceLabel(),
    notes: state.notes.trim(),
    formalTime: formatDateTime(state.dateTime || new Date().toISOString()),
    createdAt: state.dateTime || new Date().toISOString(),
    location: state.location,
    photoDataUrl: state.photoDataUrl,
  };
}

function saveReport() {
  if (!state.selectedStudents.length) {
    alert('Selecione um ou mais alunos antes de salvar.');
    return;
  }

  const occurrenceLabel = normalizeOccurrenceLabel();
  if (!occurrenceLabel) {
    alert('Escolha ou escreva o tipo de ocorrência.');
    return;
  }

  const report = createReport();
  state.reports.unshift(report);
  saveReports();
  clearDraft();
  saveDraft();
  navigate('history');
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

function clearAllReports() {
  const confirmed = confirm('Isso vai apagar todos os registros salvos neste navegador. Deseja continuar?');
  if (!confirmed) return;
  state.reports = [];
  saveReports();
  renderHistory();
  updateStats();
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
    elements.occurrenceNextButton.addEventListener('click', () => navigate('finalize'));
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

  if (elements.clearAllButton) {
    elements.clearAllButton.addEventListener('click', clearAllReports);
  }

  if (elements.historyBackButton) {
    elements.historyBackButton.addEventListener('click', () => navigate('finalize'));
  }
}

function initPage() {
  loadReports();
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
}

initPage();
