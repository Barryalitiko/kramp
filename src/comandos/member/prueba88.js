const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");

module.exports = {
  name: "fijar",
  description: "Fija un mensaje en el chat.",
  commands: ["fijar"],
  usage: `${PREFIX}fijar`,
  handle: async ({ msg, sendReply, pinChatMessage, remoteJid }) => {
    try {
      if (!msg.quoted) {
        await sendReply("Debes citar un mensaje para fijar.");
        return;
      }

      const mensajeId = msg.quoted.key.id;
      await pinChatMessage(remoteJid, mensajeId);

      console.log(`Mensaje fijado en el chat ${remoteJid}: ${mensajeId}`);
      await sendReply("Mensaje fijado con éxito.");
    } catch (error) {
      console.error("Error al fijar mensaje:", error);
      await sendReply("Error al fijar mensaje.");
    }
  },
};