const path = require("path");
const { question, onlyNumbers } = require("./utils");
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  isJidStatusBroadcast,
  proto,
  makeInMemoryStore,
  isJidNewsletter,
} = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { load } = require("./loader");
const {
  warningLog,
  infoLog,
  errorLog,
  sayLog,
  successLog,
} = require("./utils/logger");

const msgRetryCounterCache = new NodeCache();
const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

// Servidor Localhost Satánico
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let connectionStatus = "desconectado";
let pairingCode = "N/A";

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Krampus Stats</title>
        <style>
          body {
            background-color: #0a0000;
            color: #ff0000;
            font-family: 'Creepster', cursive;
            text-align: center;
            padding: 50px;
          }
          h1 {
            font-size: 50px;
            text-shadow: 0 0 10px #ff0000, 0 0 30px #ff0000;
            animation: flicker 1.5s infinite alternate;
          }
          .status {
            font-size: 30px;
            margin-top: 20px;
          }
          .pairing {
            font-size: 20px;
            margin-top: 10px;
          }
          @keyframes flicker {
            from { text-shadow: 0 0 10px #ff0000; }
            to { text-shadow: 0 0 30px #ff0000, 0 0 60px #ff0000; }
          }
        </style>
      </head>
      <body>
        <h1>🔥 Krampus Bot 🔥</h1>
        <div class="status">Estado: <span id="status">Cargando...</span></div>
        <div class="pairing">Código: <span id="pairing">Esperando...</span></div>
        <script src="/socket.io/socket.io.js"></script>
        <script>
          const socket = io();
          socket.on('statusUpdate', data => {
            document.getElementById('status').textContent = data.connection;
            document.getElementById('pairing').textContent = data.pairingCode || 'N/A';
          });
        </script>
      </body>
    </html>
  `);
});

server.listen(3000, () => {
  console.log("Servidor satánico corriendo en http://localhost:3000");
});

async function getMessage(key) {
  if (!store) {
    return proto.Message.fromObject({});
  }
  const msg = await store.loadMessage(key.remoteJid, key.id);
  return msg ? msg.message : undefined;
}

async function connect() {
  const { state, saveCreds } = await useMultiFileAuthState(
    path.resolve(__dirname, "..", "assets", "auth", "baileys")
  );

  const { version } = await fetchLatestBaileysVersion();

  const socket = makeWASocket({
    version,
    logger: pino({ level: "error" }),
    printQRInTerminal: false,
    defaultQueryTimeoutMs: 60 * 1000,
    auth: state,
    shouldIgnoreJid: (jid) =>
      isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
    keepAliveIntervalMs: 60 * 1000,
    markOnlineOnConnect: true,
    msgRetryCounterCache,
    shouldSyncHistoryMessage: () => false,
    getMessage,
  });

  if (!socket.authState.creds.registered) {
    warningLog("Credenciales no configuradas!");
    infoLog('Ingrese su numero sin el + (ejemplo: "13733665556"):');
    const phoneNumber = await question("Ingresa el numero: ");
    if (!phoneNumber) {
      errorLog('Numero inválido! Reinicia con "npm start".');
      process.exit(1);
    }
    const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));
    sayLog(`Código de Emparejamiento: ${code}`);
    pairingCode = code;
    io.emit("statusUpdate", { connection: connectionStatus, pairingCode });
  }

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    connectionStatus = connection;
    if (update.pairingCode) pairingCode = update.pairingCode;

    io.emit("statusUpdate", {
      connection: connectionStatus,
      pairingCode,
    });

    if (connection === "close") {
      const statusCode =
        lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (statusCode === DisconnectReason.loggedOut) {
        errorLog("Kram desconectado!");
      } else {
        switch (statusCode) {
          case DisconnectReason.badSession:
            warningLog("Sesion no válida!");
            break;
          case DisconnectReason.connectionClosed:
            warningLog("Conexion cerrada!");
            break;
          case DisconnectReason.connectionLost:
            warningLog("Conexion perdida!");
            break;
          case DisconnectReason.connectionReplaced:
            warningLog("Conexion de reemplazo!");
            break;
          case DisconnectReason.multideviceMismatch:
            warningLog("Dispositivo incompatible!");
            break;
          case DisconnectReason.forbidden:
            warningLog("Conexion prohibida!");
            break;
          case DisconnectReason.restartRequired:
            infoLog('Krampus reiniciado! Reinicia con "npm start".');
            break;
          case DisconnectReason.unavailableService:
            warningLog("Servicio no disponible!");
            break;
        }
        const newSocket = await connect();
        load(newSocket);
      }
    } else if (connection === "open") {
      successLog("Operacion Marshall");
    } else {
      infoLog("Cargando datos...");
    }
  });

  socket.ev.on("creds.update", saveCreds);

  return socket;
}

exports.connect = connect;
