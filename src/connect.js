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
  isJidNewsletter,
} = require("@whiskeysockets/baileys");

const NodeCache = require("node-cache");
const pino = require("pino");
const { load } = require("./loader");
const {
  warningLog,
  infoLog,
  errorLog,
  sayLog,
  successLog,
} = require("./utils/logger");

const msgRetryCounterCache = new NodeCache();
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectAttempts = 0;

async function deleteJsonFiles() {
  const authPath = path.resolve(__dirname, "..", "assets", "auth", "baileys");
  const files = fs.readdirSync(authPath);

  files.forEach(file => {
    if (file.endsWith(".json") && file !== "creds.json") { // No eliminamos creds.json
      fs.unlinkSync(path.join(authPath, file));
      console.log(`Archivo ${file} eliminado.`);
    }
  });
}

async function connect() {
  reconnectAttempts = 0;

  const authPath = path.resolve(__dirname, "..", "assets", "auth", "baileys");
  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  const { version } = await fetchLatestBaileysVersion();

  const socket = makeWASocket({
    version,
    logger: pino({ level: "warn" }), // Filtra los logs molestos
    printQRInTerminal: true,
    defaultQueryTimeoutMs: 60 * 1000,
    auth: state,
    shouldIgnoreJid: (jid) =>
      isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
    keepAliveIntervalMs: 60 * 1000,
    markOnlineOnConnect: true,
    msgRetryCounterCache,
    shouldSyncHistoryMessage: () => false,
    getMessage: async (key) => {
      console.warn("Intento de reenvío de mensaje no disponible:", key);
      return undefined; // evita bucles de cifrado
    },
  });

  if (!socket.authState.creds.registered) {
    warningLog("¡Credenciales no configuradas!");

    infoLog('Ingrese su número sin el + (ejemplo: "13733665556"):');

    const phoneNumber = await question("Ingresa el número: ");

    if (!phoneNumber) {
      errorLog(
        '¡Número de teléfono inválido! Reinicia con el comando "npm start".'
      );
      process.exit(1);
    }

    const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));

    sayLog(`Código de emparejamiento: ${code}`);
  }

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;

      if (statusCode === DisconnectReason.loggedOut) {
        errorLog("¡Sesión cerrada! Reinicia manualmente.");
        process.exit(1);
      } else {
        switch (statusCode) {
          case DisconnectReason.badSession:
            warningLog("¡Sesión no válida! Elimina la carpeta de autenticación.");
            break;
          case DisconnectReason.connectionClosed:
            warningLog("¡Conexión cerrada inesperadamente!");
            break;
          case DisconnectReason.connectionLost:
            warningLog("¡Conexión perdida! Intentando reconectar...");
            break;
          case DisconnectReason.connectionReplaced:
            warningLog("¡Sesión iniciada en otro dispositivo! Cerrando.");
            process.exit(1);
            break;
          case DisconnectReason.multideviceMismatch:
            warningLog("¡Dispositivo incompatible! Elimina la sesión y vuelve a intentarlo.");
            process.exit(1);
            break;
          case DisconnectReason.forbidden:
            warningLog("¡Acceso prohibido! Verifica tu número.");
            process.exit(1);
            break;
          case DisconnectReason.restartRequired:
            infoLog('Reiniciando... Usa "npm start" para volver a iniciar.');
            break;
          case DisconnectReason.unavailableService:
            warningLog("¡Servicio de WhatsApp no disponible temporalmente!");
            break;
          default:
            warningLog("Desconexión inesperada.");
            break;
        }

        // Borra los archivos .json cuando el bot se descontrole
        deleteJsonFiles();

        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          const delay = reconnectAttempts * 5000;

          warningLog(`Intento de reconexión ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} en ${delay / 1000} segundos...`);

          setTimeout(async () => {
            const newSocket = await connect();
            load(newSocket);
          }, delay);
        } else {
          errorLog("¡Máximo de intentos de reconexión alcanzado! Reinicia manualmente.");
          process.exit(1);
        }
      }
    } else if (connection === "open") {
      successLog("¡Bot conectado exitosamente!");
    } else {
      infoLog("Cargando datos...");
    }
  });

  socket.ev.on("creds.update", saveCreds);

  return socket;
}

exports.connect = connect;