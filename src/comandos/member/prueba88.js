const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");

module.exports = {
  name: "fijar",
  description: "Fija un mensaje en el chat.",
  commands: ["fijar"],
  usage: `${PREFIX}fijar <mensaje>`,
  handle: async ({ args, sendReply, pinChatMessage, remoteJid }) => {
    try {
      if (!args[0]) {
        await sendReply("Debes proporcionar un mensaje para fijar.");
        return;
      }

      const mensaje = args.join(" ");
      const mensajeId = await sendReply(mensaje);
      await pinChatMessage(remoteJid, mensajeId.key.id);

      console.log(`Mensaje fijado en el chat ${remoteJid}: ${mensaje}`);
      await sendReply("Mensaje fijado con éxito.");
    } catch (error) {
      console.error("Error al fijar mensaje:", error);
      await sendReply("Error al fijar mensaje.");
    }
  },
};