const CACHE_NAME = 'classlog-static-v12';
const OFFLINE_DB_NAME = 'classlog-offline';
const OFFLINE_DB_VERSION = 2;
const ASSETS = [
  '/login.html',
  '/index.html',
  '/occurrence.html',
  '/finalize.html',
  '/history.html',
  '/grades.html',
  '/settings.html',
  '/styles.css',
  '/offline-store.js',
  '/handwriting.js',
  '/app.js',
  '/privacy.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => {
      if (key !== CACHE_NAME) {
        return caches.delete(key);
      }
      return null;
    }))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (requestUrl.pathname.startsWith('/api/')) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(requestUrl.pathname).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response?.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(requestUrl.pathname, response.clone()));
            }
            return response;
          })
          .catch(() => null);
        if (cached) {
          networkFetch.catch(() => {});
          return cached;
        }
        return networkFetch.then((response) => response || caches.match('/index.html'));
      }),
    );
    return;
  }

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        });

      if (cached) {
        networkFetch.catch(() => {});
        return cached;
      }

      return networkFetch.catch(() => caches.match('/login.html'));
    }),
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag !== 'classlog-sync') return;
  event.waitUntil(syncPendingReportsFromWorker());
});

function openOfflineDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains('sessions')) database.createObjectStore('sessions', { keyPath: 'key' });
      if (!database.objectStoreNames.contains('contexts')) database.createObjectStore('contexts', { keyPath: 'scope' });
      if (!database.objectStoreNames.contains('drafts')) database.createObjectStore('drafts', { keyPath: 'scope' });
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

function idbRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

async function readActiveSession(database) {
  const transaction = database.transaction('sessions', 'readonly');
  const done = transactionDone(transaction);
  const session = await idbRequest(transaction.objectStore('sessions').get('active'));
  await done;
  return session;
}

async function readQueue(database, scope) {
  const transaction = database.transaction('queue', 'readonly');
  const done = transactionDone(transaction);
  const queue = await idbRequest(transaction.objectStore('queue').index('scope').getAll(IDBKeyRange.only(scope)));
  await done;
  return queue;
}

async function persistSyncSuccess(database, item, report) {
  const transaction = database.transaction(['queue', 'reports', 'photos'], 'readwrite');
  const done = transactionDone(transaction);
  transaction.objectStore('queue').delete(item.clientRequestId);
  transaction.objectStore('reports').delete(item.clientRequestId);
  transaction.objectStore('reports').put({
    ...report,
    scope: item.scope,
    localKey: report.clientRequestId || report.id,
  });
  if (item.photoKey) transaction.objectStore('photos').delete(item.photoKey);
  await done;
}

async function persistPermanentError(database, item, errorCode) {
  const transaction = database.transaction(['queue', 'reports'], 'readwrite');
  const done = transactionDone(transaction);
  const localReport = {
    ...item.localReport,
    syncState: 'error',
    syncError: errorCode,
  };
  transaction.objectStore('queue').put({
    ...item,
    localReport,
    status: 'error',
    attempts: Number(item.attempts || 0) + 1,
    lastError: errorCode,
    nextAttemptAt: null,
  });
  transaction.objectStore('reports').put({
    ...localReport,
    scope: item.scope,
    localKey: item.clientRequestId,
  });
  await done;
}

async function notifyClients() {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  clients.forEach((client) => client.postMessage({ type: 'CLASSLOG_SYNC' }));
}

async function syncPendingReportsFromWorker() {
  const database = await openOfflineDatabase();
  try {
    const session = await readActiveSession(database);
    if (!session || session.locked || Number(session.expiresAt) <= Date.now()) return;
    const scope = `${session.user.username}::${session.activeSchoolId}`;
    const queue = await readQueue(database, scope);
    const ready = queue.filter((item) => (
      item.status !== 'error'
      && (!item.nextAttemptAt || item.nextAttemptAt <= Date.now())
    ));

    for (const item of ready) {
      let photoDataUrl = item.payload.photoDataUrl || '';
      if (item.photoKey) {
        const transaction = database.transaction('photos', 'readonly');
        const done = transactionDone(transaction);
        const photo = await idbRequest(transaction.objectStore('photos').get(item.photoKey));
        await done;
        photoDataUrl = photo?.dataUrl || '';
      }
      const response = await fetch('/api/reports', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item.payload, photoDataUrl }),
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok) {
        await persistSyncSuccess(database, item, body.report);
      } else if (response.status === 401) {
        break;
      } else if (response.status >= 400 && response.status < 500 && response.status !== 401) {
        await persistPermanentError(database, item, body.error || 'sync_failed');
      } else {
        throw new Error(body.error || 'sync_retry');
      }
    }
  } finally {
    database.close();
    await notifyClients();
  }
}
