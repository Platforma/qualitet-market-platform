'use strict';

/**
 * Root entry point for Railway deployment.
 *
 * Loads the full application from backend/src/app.js and starts the
 * HTTP + WebSocket server.  All relative requires inside app.js are
 * resolved relative to that file, so no paths need to change.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const rateLimit = require('express-rate-limit');
const { WebSocketServer } = require('ws');

const app = express();
const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const ROOT_STATIC_FILES = new Set([
  'manifest.json',
  'service-worker.js'
]);
const SAFE_ROOT_FILE_PATTERN = /^[A-Za-z0-9._-]+$/;
const staticRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});
const ROOT_STATIC_PATHS = new Map(
  fs.readdirSync(PUBLIC_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => ROOT_STATIC_FILES.has(fileName) || path.extname(fileName) === '.html')
    .map((fileName) => [fileName, path.join(PUBLIC_DIR, fileName)])
);
const STATIC_ROUTE_ALIASES = new Map([
  ['generator', 'generator-sklepu']
]);
const FALLBACK_FILE_PATH = ROOT_STATIC_PATHS.get('404.html') || ROOT_STATIC_PATHS.get('index.html');

function sendRootStaticFile(req, res, next) {
  const requestPath = req.path === '/' ? 'index.html' : (req.params.file || '');
  const requestPathBase = path.extname(requestPath) === '.html'
    ? requestPath.slice(0, -5)
    : requestPath;
  const normalizedPath = STATIC_ROUTE_ALIASES.get(requestPathBase) || requestPathBase;
  const fileName = normalizedPath && path.extname(normalizedPath) === ''
    ? `${normalizedPath}.html`
    : normalizedPath;
  if (!fileName || fileName.includes('..') || !SAFE_ROOT_FILE_PATTERN.test(fileName)) {
    return next();
  }

  const filePath = ROOT_STATIC_PATHS.get(fileName);
  if (!filePath) {
    return next();
  }

  return res.sendFile(filePath);
}

function sendAppFallback(req, res, next) {
  if (req.path === '/health' || req.path === '/api' || req.path.startsWith('/api/')) {
    return next();
  }
  if (path.extname(req.path)) {
    return next();
  }
  if (!FALLBACK_FILE_PATH) {
    return next();
  }
  return res.sendFile(FALLBACK_FILE_PATH);
}

app.use(staticRateLimit, express.static(PUBLIC_DIR));
app.use('/public', staticRateLimit, express.static(PUBLIC_DIR));

app.get(['/owner-panel', '/owner-panel.html'], (_req, res) => {
  res.redirect(301, '/panel/owner-panel.html');
});

app.get('/', staticRateLimit, sendRootStaticFile);
app.get('/:file', staticRateLimit, sendRootStaticFile);
app.get('*', staticRateLimit, sendAppFallback);

const backendApp = require('./backend/src/app');
app.use(backendApp);

const wsManager = require('./backend/src/services/websocket');

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
wsManager.attach(wss);

server.listen(PORT, () => {
  console.log(`QUALITETMARKET PLATFORMA API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log(`WebSocket server active on port ${PORT}`);
});
