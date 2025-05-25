const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { PREFIX, COMMANDS_DIR, TEMP_DIR } = require("../krampus");
const path = require("path");
const fs = require("fs");
const { writeFile } = require("fs/promises");
const readline = require("readline");
const axios = require("axios");

exports.question = (message) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(message, (answer) => {
    rl.close();
    resolve(answer);
  }));
};

exports.extractDataFromMessage = (webMessage) => {
  const msg = webMessage.message || {};
  const msgKey = webMessage.key || {};
  const msgContent = {
    text: msg.conversation || msg.extendedTextMessage?.text || msg.imageMessage?.caption || msg.videoMessage?.caption || null,
    isReply: !!msg.extendedTextMessage?.contextInfo?.quotedMessage,
    replyJid: msg.extendedTextMessage?.contextInfo?.participant || null,
    userJid: msgKey.participant?.replace(/:[0-9]+/g, "") || msgKey.remoteJid,
    remoteJid: msgKey.remoteJid,
    contextInfo: msg.extendedTextMessage?.contextInfo || null
  };

  // Clasificación de tipos de mensajes
  let messageType = "text";
  if (msg.audioMessage) messageType = msg.audioMessage.ptt ? "voice_note" : "audio";
  if (msg.videoMessage) messageType = msg.videoMessage.gifPlayback ? "gif" : (msg.videoMessage?.ptt ? "video_note" : "video");
  if (msg.imageMessage) messageType = "image";
  if (msg.stickerMessage) messageType = "sticker";
  if (msg.documentMessage) messageType = "document";
  if (msg.contactMessage) messageType = "contact";
  if (msg.contactsArrayMessage) messageType = "contacts";
  if (msg.locationMessage) messageType = "location";
  if (msg.liveLocationMessage) messageType = "live_location";
  if (msg.pollCreationMessage) messageType = "poll";

  // Preparar comando y argumentos
  const fullMessage = msgContent.text || `[${messageType.toUpperCase()}]`;
  const [cmd, ...args] = fullMessage.trim().split(/\s+/);
  const prefix = cmd?.charAt(0) || "";
  const commandName = exports.formatCommand(cmd?.replace(new RegExp(`^[${PREFIX}]+`), "") || "");

  return {
    args: exports.splitByCharacters(args.join(" "), ["\\", "|"]),
    commandName,
    fullArgs: args.join(" "),
    fullMessage,
    prefix,
    ...msgContent,
    messageType
  };
};

exports.splitByCharacters = (str, characters) => {
  const regex = new RegExp(`[${characters.map(c => c === "\\" ? "\\\\" : c).join("")}]`);
  return str.split(regex).map(s => s.trim()).filter(Boolean);
};

exports.formatCommand = (text) => {
  return exports.onlyLettersAndNumbers(exports.removeAccentsAndSpecialCharacters((text || "").toLowerCase().trim()));
};

exports.onlyLettersAndNumbers = (text) => {
  return text.replace(/[^a-zA-Z0-9]/g, "");
};

exports.removeAccentsAndSpecialCharacters = (text) => {
  return (text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

exports.baileysIs = (webMessage, context) => {
  return !!exports.getContent(webMessage, context);
};

exports.getContent = (webMessage, context) => {
  return (
    webMessage.message?.[`${context}Message`] ||
    webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.[`${context}Message`]
  );
};

exports.download = async (webMessage, fileName, context, extension) => {
  const content = exports.getContent(webMessage, context);
  if (!content) return null;

  const stream = await downloadContentFromMessage(content, context);
  let buffer = Buffer.from([]);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

  const filePath = path.resolve(TEMP_DIR, `${fileName}.${extension}`);
  await writeFile(filePath, buffer);
  return filePath;
};

exports.findCommandImport = (commandName) => {
  const commandModules = exports.readCommandImports();
  for (const [type, commands] of Object.entries(commandModules)) {
    const found = commands.find(cmd => cmd.commands.map(exports.formatCommand).includes(commandName));
    if (found) return { type, command: found };
  }
  return { type: "", command: null };
};

exports.readCommandImports = () => {
  const commandImports = {};
  for (const dirent of fs.readdirSync(COMMANDS_DIR, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue;
    const dirPath = path.join(COMMANDS_DIR, dirent.name);
    const commands = fs.readdirSync(dirPath)
      .filter(f => !f.startsWith("_") && /\.(js|ts)$/.test(f))
      .map(f => {
        try {
          return require(path.join(dirPath, f));
        } catch (err) {
          console.error(`Error importando ${f}:`, err);
          return null;
        }
      })
      .filter(Boolean);
    commandImports[dirent.name] = commands;
  }
  return commandImports;
};

exports.onlyNumbers = (text) => typeof text === "string" ? text.replace(/\D+/g, "") : "";

exports.toUserJid = (number) => `${exports.onlyNumbers(number)}@s.whatsapp.net`;

exports.getBuffer = async (url, options = {}) => {
  try {
    const { data } = await axios.get(url, {
      headers: { DNT: 1, "Upgrade-Insecure-Request": 1 },
      responseType: "arraybuffer",
      ...options,
    });
    return data;
  } catch (err) {
    console.error("Error al obtener buffer:", err.message);
    return null;
  }
};

exports.getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

exports.getRandomName = (extension) => {
  const name = exports.getRandomNumber(0, 999999).toString();
  return extension ? `${name}.${extension}` : name;
};

exports.handleCommandResponse = async (response, sendReply) => {
  if (typeof response === "object" && response.text) {
    await exports.sendQuotedMessage(sendReply, response);
  } else {
    await sendReply(response);
  }
};

exports.sendQuotedMessage = async (remoteJid, message) => {
  const context = message.contextInfo;
  const msg = context ? {
    text: message.text,
    contextInfo: {
      quotedMessage: context.quotedMessage,
      quotedParticipant: context.quotedParticipant,
      quotedExternalParticipant: context.quotedExternalParticipant,
      quotedMessageUrl: context.quotedMessageUrl,
    }
  } : { text: message.text };

  await socket.sendMessage(remoteJid, msg);
};