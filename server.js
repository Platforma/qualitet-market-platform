'use strict';

/**
 * Root entry point for Railway deployment.
 *
 * Loads the full application from backend/src/app.js and starts the
 * HTTP + WebSocket server.  All relative requires inside app.js are
 * resolved relative to that file, so no paths need to change.
 */

const express = require('express');
const path = require('path');
const http = require('http');
const rateLimit = require('express-rate-limit');
const { WebSocketServer } = require('ws');

const app = express();
const ROOT_DIR = __dirname;
const STATIC_DIRS = ['assets', 'css', 'js'];
const ROOT_STATIC_FILES = new Set([
  '.nojekyll',
  'CNAME',
  '_redirects',
  'landing.css',
  'manifest.json',
  'panel.css',
  'service-worker.js',
  'shop.css',
  'shop.js',
  'stores.js',
  'styles.css'
]);
const staticRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false
});

function isAllowedRootFile(fileName){
  if (!fileName || fileName.includes('/') || fileName.includes('\\')) {
    return false;
  }

  return ROOT_STATIC_FILES.has(fileName) || path.extname(fileName) === '.html';
}

function sendRootStaticFile(req, res, next){
  const fileName = req.path === '/' ? 'index.html' : req.params.file;
  if (!isAllowedRootFile(fileName)) {
    return next();
  }

  return res.sendFile(path.join(ROOT_DIR, fileName));
}

STATIC_DIRS.forEach((dirName) => {
  app.use(`/${dirName}`, express.static(path.join(ROOT_DIR, dirName)));
});

app.get('/', staticRateLimit, sendRootStaticFile);
app.get('/:file', staticRateLimit, sendRootStaticFile);

const backendApp = require('./backend/src/app');
app.use(backendApp);

const wsManager = require('./backend/src/services/websocket');

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
wsManager.attach(wss);

server.listen(PORT, () => {
  console.log(`QUALITETMARKET PLATFORMA API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log(`WebSocket server active on ws://localhost:${PORT}`);
});
