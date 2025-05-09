const { PREFIX } = require("../../krampus");

module.exports = {
  name: "crash-test",
  description: "Envía un mensaje lagger para probar la resistencia del cliente.",
  commands: ["crash", "lag"],
  usage: `${PREFIX}crash`,
  handle: async ({ socket, remoteJid }) => {
    try {
      const lagString = "\u200F\u200E\u202E".repeat(70000); // lag invisible
      await socket.sendMessage(remoteJid, {
        text: lagString,
      });
    } catch (error) {
      console.error("Error en crash-test:", error);
    }
  },
};