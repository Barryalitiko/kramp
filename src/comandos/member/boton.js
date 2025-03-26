const { PREFIX } = require("../../krampus");

module.exports = {
  name: "botones",
  description: "Envía un mensaje con botones interactivos",
  commands: ["botones"],
  usage: `${PREFIX}botones`,
  handle: async ({ sendReply, socket, remoteJid }) => {
    try {
      // Crear el mensaje con botones correctamente formateado
      const buttonMessage = {
        text: "Selecciona una opción:", // Texto principal del mensaje
        footer: "Krampus Bot", // Texto de pie de mensaje
        buttons: [
          { buttonId: "opcion1", buttonText: { displayText: "🔥 Opción 1" }, type: 1 },
          { buttonId: "opcion2", buttonText: { displayText: "💡 Opción 2" }, type: 1 },
          { buttonId: "opcion3", buttonText: { displayText: "⚡ Opción 3" }, type: 1 },
        ],
        headerType: 1, // Tipo de encabezado (1 = solo texto)
      };

      // Enviar el mensaje con botones
      await socket.sendMessage(remoteJid, buttonMessage);

      console.log("✅ Mensaje con botones enviado correctamente.");
    } catch (error) {
      console.error("❌ Error al enviar el mensaje con botones:", error);
      sendReply("⚠️ Ocurrió un error al enviar el mensaje con botones.");
    }
  },
};
