(() => {
  const DB_NAME = 'classlog-offline';
  const DB_VERSION = 2;
  const SESSION_KEY = 'active';

  function requestToPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function transactionDone(transaction) {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains('sessions')) {
          database.createObjectStore('sessions', { keyPath: 'key' });
        }
        if (!database.objectStoreNames.contains('contexts')) {
          database.createObjectStore('contexts', { keyPath: 'scope' });
        }
        if (!database.objectStoreNames.contains('drafts')) {
          database.createObjectStore('drafts', { keyPath: 'scope' });
        }
        if (!database.objectStoreNames.contains('reports')) {
          const reports = database.createObjectStore('reports', { keyPath: 'localKey' });
          reports.createIndex('scope', 'scope', { unique: false });
        }
        if (!database.objectStoreNames.contains('queue')) {
          const queue = database.createObjectStore('queue', { keyPath: 'clientRequestId' });
          queue.createIndex('scope', 'scope', { unique: false });
        }
        if (!database.objectStoreNames.contains('photos')) {
          const photos = database.createObjectStore('photos', { keyPath: 'key' });
          photos.createIndex('scope', 'scope', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function withStore(storeName, mode, callback) {
    const database = await openDatabase();
    const transaction = database.transaction(storeName, mode);
    const done = transactionDone(transaction);
    const store = transaction.objectStore(storeName);
    const result = await callback(store, transaction);
    await done;
    database.close();
    return result;
  }

  async function get(storeName, key) {
    return withStore(storeName, 'readonly', (store) => requestToPromise(store.get(key)));
  }

  async function put(storeName, value) {
    return withStore(storeName, 'readwrite', (store) => requestToPromise(store.put(value)));
  }

  async function remove(storeName, key) {
    return withStore(storeName, 'readwrite', (store) => requestToPromise(store.delete(key)));
  }

  async function getAllByScope(storeName, scope) {
    return withStore(storeName, 'readonly', async (store) => {
      const index = store.index('scope');
      return requestToPromise(index.getAll(IDBKeyRange.only(scope)));
    });
  }

  async function replaceReports(scope, reports) {
    const database = await openDatabase();
    const transaction = database.transaction('reports', 'readwrite');
    const done = transactionDone(transaction);
    const store = transaction.objectStore('reports');
    const index = store.index('scope');
    const keys = await requestToPromise(index.getAllKeys(IDBKeyRange.only(scope)));
    keys.forEach((key) => store.delete(key));
    reports.forEach((report) => {
      const storedReport = report.photoKey ? { ...report, photoDataUrl: '' } : report;
      store.put({
        ...storedReport,
        scope,
        localKey: report.clientRequestId || report.id,
      });
    });
    try {
      await done;
    } finally {
      database.close();
    }
  }

  async function upsertReport(scope, report) {
    const storedReport = report.photoKey ? { ...report, photoDataUrl: '' } : report;
    return put('reports', {
      ...storedReport,
      scope,
      localKey: report.clientRequestId || report.id,
    });
  }

  async function removeReport(localKey) {
    return remove('reports', localKey);
  }

  async function hydrateReport(report) {
    if (!report?.photoKey || report.photoDataUrl) return report;
    const photo = await get('photos', report.photoKey);
    return { ...report, photoDataUrl: photo?.dataUrl || '' };
  }

  async function getHydratedReports(scope) {
    const reports = await getAllByScope('reports', scope);
    return Promise.all(reports.map(hydrateReport));
  }

  async function getHydratedQueue(scope) {
    const queue = await getAllByScope('queue', scope);
    return Promise.all(queue.map(async (item) => ({
      ...item,
      localReport: await hydrateReport(item.localReport),
    })));
  }

  async function savePendingReport(scope, item, report, photoDataUrl) {
    const database = await openDatabase();
    const transaction = database.transaction(['queue', 'reports', 'photos'], 'readwrite');
    const done = transactionDone(transaction);
    const photoKey = item.photoKey || '';
    const storedItem = photoKey
      ? {
        ...item,
        scope,
        payload: { ...item.payload, photoDataUrl: '' },
        localReport: { ...item.localReport, photoDataUrl: '' },
      }
      : { ...item, scope };
    const storedReport = photoKey ? { ...report, photoDataUrl: '' } : report;

    if (photoKey && photoDataUrl) {
      transaction.objectStore('photos').put({
        key: photoKey,
        scope,
        dataUrl: photoDataUrl,
        savedAt: new Date().toISOString(),
      });
    }
    transaction.objectStore('queue').put(storedItem);
    transaction.objectStore('reports').put({
      ...storedReport,
      scope,
      localKey: report.clientRequestId || report.id,
    });
    try {
      await done;
    } finally {
      database.close();
    }
  }

  window.ClassLogOffline = {
    sessionKey: SESSION_KEY,
    makeScope(username, schoolId) {
      return `${username || ''}::${schoolId || ''}`;
    },
    getSession() {
      return get('sessions', SESSION_KEY);
    },
    saveSession(session) {
      return put('sessions', { ...session, key: SESSION_KEY });
    },
    lockSession() {
      return get('sessions', SESSION_KEY).then((session) => (
        session ? put('sessions', { ...session, locked: true }) : undefined
      ));
    },
    clearSession() {
      return remove('sessions', SESSION_KEY);
    },
    getContext(scope) {
      return get('contexts', scope);
    },
    saveContext(scope, context) {
      return put('contexts', { ...context, scope });
    },
    getDraft(scope) {
      return get('drafts', scope);
    },
    saveDraft(scope, draft) {
      return put('drafts', { ...draft, scope, updatedAt: new Date().toISOString() });
    },
    clearDraft(scope) {
      return remove('drafts', scope);
    },
    getReports(scope) {
      return getHydratedReports(scope);
    },
    replaceReports,
    upsertReport,
    removeReport,
    getQueue(scope) {
      return getHydratedQueue(scope);
    },
    enqueue(scope, item) {
      const normalized = item.photoKey
        ? {
          ...item,
          payload: { ...item.payload, photoDataUrl: '' },
          localReport: { ...item.localReport, photoDataUrl: '' },
        }
        : item;
      return put('queue', { ...normalized, scope });
    },
    updateQueue(item) {
      const normalized = item.photoKey
        ? {
          ...item,
          payload: { ...item.payload, photoDataUrl: '' },
          localReport: { ...item.localReport, photoDataUrl: '' },
        }
        : item;
      return put('queue', normalized);
    },
    removeQueue(clientRequestId) {
      return remove('queue', clientRequestId);
    },
    savePendingReport,
    savePhoto(scope, key, dataUrl) {
      return put('photos', { key, scope, dataUrl, savedAt: new Date().toISOString() });
    },
    getPhoto(key) {
      return get('photos', key);
    },
    removePhoto(key) {
      return remove('photos', key);
    },
  };
})();
