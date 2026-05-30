const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'classlog-db.json');
const PORT = Number(process.env.PORT || 3000);
const SESSION_COOKIE = 'classlog_session';
const SESSION_SECRET = process.env.CLASSLOG_SECRET || 'classlog-dev-secret';
const DEFAULT_USERNAME = process.env.CLASSLOG_USERNAME || 'coordenacao';
const DEFAULT_PASSWORD = process.env.CLASSLOG_PASSWORD || 'ClassLog@2026';
const DEFAULT_DISPLAY_NAME = process.env.CLASSLOG_DISPLAY_NAME || 'Coordenação';
const OWNER_USERNAME = process.env.CLASSLOG_OWNER_USERNAME || 'fellipecorreia';
const OWNER_PASSWORD = process.env.CLASSLOG_OWNER_PASSWORD || 'kimilove';
const OWNER_DISPLAY_NAME = process.env.CLASSLOG_OWNER_DISPLAY_NAME || 'Fellipe Correia';

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

let database = null;

function nowIso() {
  return new Date().toISOString();
}

function createPasswordRecord(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

function createDefaultUser() {
  const passwordRecord = createPasswordRecord(DEFAULT_PASSWORD);
  return {
    id: crypto.randomUUID(),
    username: DEFAULT_USERNAME,
    displayName: DEFAULT_DISPLAY_NAME,
    role: 'coordinator',
    ...passwordRecord,
  };
}

function createDefaultProfessor() {
  const passwordRecord = createPasswordRecord(process.env.CLASSLOG_TEACHER_PASSWORD || 'Professor@2026');
  return {
    id: crypto.randomUUID(),
    username: process.env.CLASSLOG_TEACHER_USERNAME || 'professor',
    displayName: process.env.CLASSLOG_TEACHER_DISPLAY_NAME || 'Professor',
    role: 'teacher',
    ...passwordRecord,
  };
}

function createDefaultOwner() {
  const passwordRecord = createPasswordRecord(OWNER_PASSWORD);
  return {
    id: crypto.randomUUID(),
    username: OWNER_USERNAME,
    displayName: OWNER_DISPLAY_NAME,
    role: 'coordinator',
    ...passwordRecord,
  };
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function signSession(username) {
  const payload = Buffer.from(JSON.stringify({ username, issuedAt: nowIso() })).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifySession(token) {
  if (!token || !token.includes('.')) {
    return null;
  }

  const [payload, signature] = token.split('.');
  const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof data.username === 'string' ? data.username : null;
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader) {
  return (cookieHeader || '').split(';').reduce((acc, part) => {
    const [rawKey, ...rest] = part.trim().split('=');
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

async function ensureDatabase() {
  await fsp.mkdir(DATA_DIR, { recursive: true });

  try {
    const raw = await fsp.readFile(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.users) || parsed.users.length === 0) {
      parsed.users = [createDefaultUser()];
    }
    if (!parsed.users.some((entry) => entry.username === (process.env.CLASSLOG_TEACHER_USERNAME || 'professor'))) {
      parsed.users.push(createDefaultProfessor());
    }
    if (!parsed.users.some((entry) => entry.username === OWNER_USERNAME)) {
      parsed.users.push(createDefaultOwner());
    }
    if (!Array.isArray(parsed.reports)) {
      parsed.reports = [];
    }
    database = parsed;
    await persistDatabase();
  } catch {
    database = {
      users: [createDefaultUser()],
      reports: [],
    };
    await persistDatabase();
  }
}

async function persistDatabase() {
  await fsp.writeFile(DB_FILE, `${JSON.stringify(database, null, 2)}\n`, 'utf8');
}

function getUserFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  const username = verifySession(cookies[SESSION_COOKIE]);
  if (!username) {
    return null;
  }

  const user = database.users.find((entry) => entry.username === username);
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };
}

function getRequestUrl(req) {
  return new URL(req.url, `http://${req.headers.host || 'localhost'}`);
}

async function readJsonBody(req, maxSize = 20 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxSize) {
        reject(Object.assign(new Error('Payload too large'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(Object.assign(new Error('Invalid JSON body'), { statusCode: 400 }));
      }
    });

    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

function requireAuth(req, res) {
  const user = getUserFromRequest(req);
  if (!user) {
    sendJson(res, 401, { error: 'not_authenticated' });
    return null;
  }
  return user;
}

function normalizeStudents(students) {
  if (!Array.isArray(students)) {
    return [];
  }

  return students
    .map((student) => ({
      fullName: String(student.fullName || '').trim(),
      displayName: String(student.displayName || '').trim(),
    }))
    .filter((student) => student.fullName && student.displayName);
}

function normalizeComments(comments) {
  if (!Array.isArray(comments)) {
    return [];
  }

  return comments
    .map((comment) => ({
      id: comment.id || crypto.randomUUID(),
      text: String(comment.text || '').trim(),
      createdAt: comment.createdAt || nowIso(),
      createdBy: comment.createdBy || null,
      createdByName: comment.createdByName || 'Sistema',
    }))
    .filter((comment) => comment.text);
}

function normalizeAuditTrail(entries) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries.map((entry) => ({
    id: entry.id || crypto.randomUUID(),
    createdAt: entry.createdAt || nowIso(),
    createdBy: entry.createdBy || null,
    createdByName: entry.createdByName || 'Sistema',
    changes: Array.isArray(entry.changes) ? entry.changes : [],
  }));
}

function formatReportOccurrenceTime(occurredAt) {
  return formatDateTime(occurredAt || nowIso());
}

function sanitizeReport(report) {
  return {
    id: report.id,
    schoolId: report.schoolId || null,
    createdBy: report.createdBy || null,
    createdByName: report.createdByName || null,
    updatedBy: report.updatedBy || null,
    updatedByName: report.updatedByName || null,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    occurredAt: report.occurredAt,
    formalTime: report.formalTime || formatReportOccurrenceTime(report.occurredAt),
    selectedStudents: normalizeStudents(report.selectedStudents),
    occurrenceLabel: String(report.occurrenceLabel || '').trim(),
    notes: String(report.notes || '').trim(),
    location: report.location || null,
    photoDataUrl: report.photoDataUrl || '',
    status: report.status || 'aberta',
    deletedAt: report.deletedAt || null,
    deletedBy: report.deletedBy || null,
    deletedByName: report.deletedByName || null,
    deletedReason: report.deletedReason || '',
    comments: normalizeComments(report.comments),
    auditTrail: normalizeAuditTrail(report.auditTrail),
  };
}

function compareField(previousValue, nextValue) {
  return JSON.stringify(previousValue) !== JSON.stringify(nextValue);
}

function buildChanges(previousReport, nextReport) {
  const trackedFields = [
    'selectedStudents',
    'occurrenceLabel',
    'notes',
    'occurredAt',
    'location',
    'photoDataUrl',
    'status',
    'deletedAt',
    'deletedReason',
  ];

  return trackedFields
    .filter((field) => compareField(previousReport[field], nextReport[field]))
    .map((field) => ({
      field,
      before: previousReport[field] ?? null,
      after: nextReport[field] ?? null,
    }));
}

async function handleLogin(req, res, body) {
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const user = database.users.find((entry) => entry.username === username);

  if (!user) {
    sendJson(res, 401, { error: 'invalid_credentials' });
    return;
  }

  const passwordHash = crypto.scryptSync(password, user.salt, 64).toString('hex');
  const validHash = Buffer.from(passwordHash, 'hex');
  const storedHash = Buffer.from(user.hash, 'hex');

  if (validHash.length !== storedHash.length || !crypto.timingSafeEqual(validHash, storedHash)) {
    sendJson(res, 401, { error: 'invalid_credentials' });
    return;
  }

  const token = signSession(user.username);
  sendJson(
    res,
    200,
    {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
    },
    {
      'Set-Cookie': `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`,
    },
  );
}

function handleLogout(res) {
  sendJson(
    res,
    200,
    { ok: true },
    {
      'Set-Cookie': `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`,
    },
  );
}

async function createReport(req, res, body, user) {
  const selectedStudents = normalizeStudents(body.selectedStudents);
  const occurrenceLabel = String(body.occurrenceLabel || '').trim();
  const occurredAt = String(body.occurredAt || '').trim() || nowIso();

  if (selectedStudents.length === 0) {
    sendJson(res, 400, { error: 'missing_students' });
    return;
  }

  if (!occurrenceLabel) {
    sendJson(res, 400, { error: 'missing_occurrence' });
    return;
  }

  const timestamp = nowIso();
  const report = sanitizeReport({
    id: crypto.randomUUID(),
    schoolId: body.schoolId || null,
    createdBy: user.username,
    createdByName: user.displayName,
    updatedBy: user.username,
    updatedByName: user.displayName,
    createdAt: timestamp,
    updatedAt: timestamp,
    occurredAt,
    formalTime: formatReportOccurrenceTime(occurredAt),
    selectedStudents,
    occurrenceLabel,
    notes: String(body.notes || '').trim(),
    location: body.location || null,
    photoDataUrl: String(body.photoDataUrl || ''),
    status: 'aberta',
    comments: [],
    auditTrail: [],
  });

  database.reports.unshift(report);
  await persistDatabase();
  sendJson(res, 201, { report: sanitizeReport(report) });
}

async function updateReport(req, res, body, user, reportId) {
  const report = database.reports.find((entry) => entry.id === reportId);
  if (!report) {
    sendJson(res, 404, { error: 'report_not_found' });
    return;
  }

  if (report.deletedAt) {
    sendJson(res, 409, { error: 'report_deleted' });
    return;
  }

  const canEdit = user.role === 'coordinator' || report.createdBy === user.username;
  if (!canEdit) {
    sendJson(res, 403, { error: 'edit_forbidden' });
    return;
  }

  const nextReport = {
    ...report,
    selectedStudents: normalizeStudents(body.selectedStudents ?? report.selectedStudents),
    occurrenceLabel: String(body.occurrenceLabel ?? report.occurrenceLabel).trim(),
    notes: String(body.notes ?? report.notes).trim(),
    occurredAt: String(body.occurredAt ?? report.occurredAt).trim() || report.occurredAt,
    location: body.location === undefined ? report.location : body.location,
    photoDataUrl: body.photoDataUrl === undefined ? report.photoDataUrl : String(body.photoDataUrl || ''),
    status: String((body.status ?? report.status) || 'aberta').trim() || 'aberta',
    updatedAt: nowIso(),
    updatedBy: user.username,
    updatedByName: user.displayName,
  };
  nextReport.formalTime = formatReportOccurrenceTime(nextReport.occurredAt);

  const changes = buildChanges(report, nextReport);
  nextReport.auditTrail = normalizeAuditTrail(report.auditTrail);

  if (changes.length > 0) {
    nextReport.auditTrail.unshift({
      id: crypto.randomUUID(),
      createdAt: nextReport.updatedAt,
      createdBy: user.username,
      createdByName: user.displayName,
      changes,
    });
  }

  nextReport.comments = normalizeComments(report.comments);
  Object.assign(report, nextReport);
  await persistDatabase();
  sendJson(res, 200, { report: sanitizeReport(report) });
}

async function deleteReport(req, res, body, user, reportId) {
  const report = database.reports.find((entry) => entry.id === reportId);
  if (!report) {
    sendJson(res, 404, { error: 'report_not_found' });
    return;
  }

  if (user.role !== 'coordinator') {
    sendJson(res, 403, { error: 'delete_forbidden' });
    return;
  }

  if (report.deletedAt) {
    sendJson(res, 409, { error: 'report_already_deleted' });
    return;
  }

  const reason = String(body.reason || '').trim();
  if (!reason) {
    sendJson(res, 400, { error: 'missing_reason' });
    return;
  }

  const deletedAt = nowIso();
  const previousStatus = report.status;
  report.deletedAt = deletedAt;
  report.deletedBy = user.username;
  report.deletedByName = user.displayName;
  report.deletedReason = reason;
  report.status = 'excluida';
  report.updatedAt = deletedAt;
  report.updatedBy = user.username;
  report.updatedByName = user.displayName;
  report.auditTrail = normalizeAuditTrail(report.auditTrail);
  report.auditTrail.unshift({
    id: crypto.randomUUID(),
    createdAt: deletedAt,
    createdBy: user.username,
    createdByName: user.displayName,
    changes: [
      { field: 'deletedAt', before: null, after: deletedAt },
      { field: 'deletedReason', before: null, after: reason },
      { field: 'status', before: previousStatus, after: 'excluida' },
    ],
  });
  await persistDatabase();
  sendJson(res, 200, { report: sanitizeReport(report) });
}

async function addComment(req, res, body, user, reportId) {
  const report = database.reports.find((entry) => entry.id === reportId);
  if (!report) {
    sendJson(res, 404, { error: 'report_not_found' });
    return;
  }

  const text = String(body.comment || body.text || '').trim();
  if (!text) {
    sendJson(res, 400, { error: 'missing_comment' });
    return;
  }

  const comment = {
    id: crypto.randomUUID(),
    text,
    createdAt: nowIso(),
    createdBy: user.username,
    createdByName: user.displayName,
  };

  report.comments = normalizeComments(report.comments);
  report.comments.unshift(comment);

  if (body.status) {
    report.status = String(body.status).trim() || report.status;
  }

  report.updatedAt = nowIso();
  report.updatedBy = user.username;
  report.updatedByName = user.displayName;
  await persistDatabase();
  sendJson(res, 201, { comment });
}

async function handleApi(req, res, url) {
  if (url.pathname === '/api/auth/me' && req.method === 'GET') {
    const user = getUserFromRequest(req);
    sendJson(res, 200, { user: user || null });
    return;
  }

  if (url.pathname === '/api/auth/login' && req.method === 'POST') {
    const body = await readJsonBody(req);
    await handleLogin(req, res, body);
    return;
  }

  if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
    handleLogout(res);
    return;
  }

  const user = requireAuth(req, res);
  if (!user) {
    return;
  }

  if (url.pathname === '/api/reports' && req.method === 'GET') {
    const ordered = [...database.reports]
      .map((report) => sanitizeReport(report))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    sendJson(res, 200, { reports: ordered });
    return;
  }

  if (url.pathname === '/api/reports' && req.method === 'POST') {
    const body = await readJsonBody(req);
    await createReport(req, res, body, user);
    return;
  }

  if (url.pathname === '/api/reports' && req.method === 'DELETE') {
    sendJson(res, 405, { error: 'bulk_delete_not_allowed' });
    return;
  }

  const reportMatch = url.pathname.match(/^\/api\/reports\/([^/]+)$/);
  const commentMatch = url.pathname.match(/^\/api\/reports\/([^/]+)\/comments$/);

  if (reportMatch && req.method === 'PUT') {
    const body = await readJsonBody(req);
    await updateReport(req, res, body, user, decodeURIComponent(reportMatch[1]));
    return;
  }

  if (reportMatch && req.method === 'DELETE') {
    const body = await readJsonBody(req);
    await deleteReport(req, res, body, user, decodeURIComponent(reportMatch[1]));
    return;
  }

  if (commentMatch && req.method === 'POST') {
    const body = await readJsonBody(req);
    await addComment(req, res, body, user, decodeURIComponent(commentMatch[1]));
    return;
  }

  sendJson(res, 404, { error: 'not_found' });
}

async function serveFile(res, filePath) {
  try {
    const data = await fsp.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

function shouldProtectHtml(pathname) {
  return pathname.endsWith('.html') || pathname === '/';
}

async function serveApp(req, res) {
  const url = getRequestUrl(req);
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.join(ROOT, pathname.replace(/^\/+/, ''));
  const ext = path.extname(filePath).toLowerCase();
  const authUser = getUserFromRequest(req);

  if (url.pathname.startsWith('/api/')) {
    await handleApi(req, res, url);
    return;
  }

  if (pathname === '/login.html' && authUser) {
    redirect(res, '/index.html');
    return;
  }

  if (shouldProtectHtml(pathname) && pathname !== '/login.html' && !authUser) {
    redirect(res, `/login.html?next=${encodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)}`);
    return;
  }

  if (fs.existsSync(filePath)) {
    await serveFile(res, filePath);
    return;
  }

  if (ext === '') {
    redirect(res, '/index.html');
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}

async function main() {
  await ensureDatabase();

  const server = http.createServer((req, res) => {
    serveApp(req, res).catch((error) => {
      const statusCode = error.statusCode || 500;
      console.error(error);
      if (!res.headersSent) {
        sendJson(res, statusCode, { error: 'internal_error' });
      } else {
        res.end();
      }
    });
  });

  server.listen(PORT, () => {
    console.log(`ClassLog rodando em http://localhost:${PORT}`);
    console.log(`Credenciais iniciais: ${DEFAULT_USERNAME} / ${DEFAULT_PASSWORD}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});