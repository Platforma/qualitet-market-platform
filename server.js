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
const { WebSocketServer } = require('ws');

const app = express();
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

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
