const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const MARRIAGE_FILE_PATH = path.resolve(process.cwd(), "assets/marriage.json");
const USER_ITEMS_FILE_PATH = path.resolve(process.cwd(), "assets/userItems.json");
const PENDING_MARRIAGES_FILE = path.resolve(process.cwd(), "assets/pending_marriages.json");

const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
};

const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error al escribir en el archivo ${filePath}: ${error.message}`);
  }
};

module.exports = {
  name: "boda",
  description: "Proponer matrimonio a alguien.",
  commands: ["boda"],
  usage: `${PREFIX}boda 💍 @usuario`,
  handle: async ({ socket, sendReply, userJid, args, isReply, replyJid, mentionedJid, remoteJid }) => {
    
    if (!args || args.length === 0) {
      await sendReply("❌ Debes incluir el anillo 💍 y etiquetar a la persona con quien quieres casarte.");
      return;
    }

    if (!args.includes("💍")) {
      await sendReply("❌ Debes usar el anillo 💍 en tu propuesta de matrimonio.");
      return;
    }

    let targetJid;
    if (isReply) {
      targetJid = replyJid;
    } else if (mentionedJid && mentionedJid.length > 0) {
      targetJid = mentionedJid[0];
    } else if (args.length > 1) {
      targetJid = args[1].replace("@", "") + "@s.whatsapp.net";
    }

    if (!targetJid) {
      await sendReply("❌ Debes etiquetar o responder a un usuario para proponer matrimonio.");
      return;
    }

    if (targetJid === userJid) {
      await sendReply("💍 No puedes casarte contigo mismo, busca a alguien especial.");
      return;
    }

    const userItems = readData(USER_ITEMS_FILE_PATH);
    const userItem = userItems.find((entry) => entry.userJid === userJid);

    if (!userItem || userItem.items.anillos <= 0) {
      await sendReply("💍 ¿Y el anillo pa' cuando? No tienes anillos para proponer matrimonio.");
      return;
    }

    const marriageData = readData(MARRIAGE_FILE_PATH);
    const existingMarriage = marriageData.find(
      (entry) => entry.userJid === userJid || entry.partnerJid === userJid
    );

    if (existingMarriage) {
      await sendReply("💔 Ya estás casado. No puedes proponer matrimonio hasta que te divorcies.");
      return;
    }

    const targetMarriage = marriageData.find(
      (entry) => entry.userJid === targetJid || entry.partnerJid === targetJid
    );

    if (targetMarriage) {
      await sendReply("💔 Esa persona ya está casada. No puedes proponerle matrimonio.");
      return;
    }

    let pendingMarriages = readData(PENDING_MARRIAGES_FILE);
    pendingMarriages = pendingMarriages.filter(entry => Date.now() - entry.timestamp < 60000);

    const alreadyProposed = pendingMarriages.find(
      (entry) => entry.proposer === userJid && entry.proposedTo === targetJid
    );

    if (alreadyProposed) {
      await sendReply("⏳ Ya has hecho una propuesta de matrimonio a esta persona. Espera a que responda.");
      return;
    }

    pendingMarriages.push({
      proposer: userJid,
      proposedTo: targetJid,
      timestamp: Date.now()
    });

    writeData(PENDING_MARRIAGES_FILE, pendingMarriages);

    await socket.sendMessage(remoteJid, {
      text: `💍 *@${userJid.split("@")[0]}* quiere casarse contigo, *@${targetJid.split("@")[0]}*!  
Responde con *#r si* para aceptar o *#r no* para rechazar.  
⏳ *Tienes 1 minuto para decidir.*`,
      mentions: [userJid, targetJid]
    });
  },
};