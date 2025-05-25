const { OWNER_NUMBER } = require("../krampus");

exports.checkPermission = async ({ type, socket, userJid, remoteJid }) => {
  if (type === "member") return true;

  try {
    const metadata = await socket.groupMetadata(remoteJid);
    const participant = metadata.participants.find(p => p.id === userJid);

    if (!participant) return false;

    const isGroupOwner = participant.id === metadata.owner || participant.admin === "superadmin";
    const isAdmin = participant.admin === "admin";
    const isBotOwner = userJid === `${OWNER_NUMBER}@s.whatsapp.net`;

    switch (type) {
      case "admin":
        return isGroupOwner || isAdmin || isBotOwner;
      case "owner":
        return isGroupOwner || isBotOwner;
      default:
        return false;
    }
  } catch (err) {
    console.error(`checkPermission error: ${err.message}`);
    return false;
  }
};