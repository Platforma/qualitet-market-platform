'use strict';

require('dotenv').config();

const http = require('http');
const { WebSocketServer } = require('ws');
const app = require('./app');
const wsManager = require('./services/websocket');

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
wsManager.attach(wss);

server.listen(PORT, () => {
  console.log(`QUALITETMARKET PLATFORMA API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log(`WebSocket server initialized on port ${PORT}`);
});

module.exports = server;
