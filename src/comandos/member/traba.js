const { PREFIX } = require("../../krampus");

module.exports = {
  name: "crash-test",
  description: "Envía un mensaje largo de prueba para evaluar resistencia.",
  commands: ["crash", "lag"],
  usage: `${PREFIX}crash`,
  handle: async ({ socket, remoteJid }) => {
    try {
      const lagString = "﷽".repeat(15000); // Carácter unicode raro repetido
      await socket.sendMessage(remoteJid, {
        text: lagString,
      });
    } catch (error) {
      console.error("Error en crash-test:", error);
    }
  },
};