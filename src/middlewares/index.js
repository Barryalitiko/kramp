const { PREFIX, OWNER_NUMBER } = require("../krampus");
const { toUserJid } = require("../utils");

exports.verifyPrefix = (prefix) => prefix === PREFIX;

exports.hasTypeOrCommand = ({ type, command }) => Boolean(type && command);

exports.isLink = (text) => {
  const urlRegex = /https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/\S*)?/gi;
  return urlRegex.test(text);
};

exports.isAdmin = async ({ remoteJid, userJid, socket }) => {
  try {
    const { participants, owner } = await socket.groupMetadata(remoteJid);

    const participant = participants.find(p => p.id === userJid);
    if (!participant) return false;

    const isGroupOwner = participant.id === owner || participant.admin === "superadmin";
    const isBotOwner = participant.id === toUserJid(OWNER_NUMBER);
    const isGroupAdmin = participant.admin === "admin";

    return isGroupOwner || isGroupAdmin || isBotOwner;
  } catch (error) {
    console.error(`isAdmin error: ${error.message}`);
    return false;
  }
};