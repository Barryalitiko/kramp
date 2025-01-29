const { PREFIX } = require("../../krampus");
const path = require("path");
const fs = require("fs");

module.exports = {
  name: "audio",
  description: "Envía un audio como nota de voz.",
  commands: ["audio", "voz"],
  usage: `${PREFIX}audio`,
  handle: async ({ socket, remoteJid, sendReply, quoted, userJid }) => {
    try {
      // Verificar si el comando se usó respondiendo a alguien
      if (!quoted) {
        return await sendReply("❌ Debes responder a un mensaje para enviar el audio.");
      }

      // Ruta del archivo de audio
      const audioPath = path.join(__dirname, "../../assets/audio/prueba.mp3");

      // Verificar si el archivo existe
      if (!fs.existsSync(audioPath)) {
        return await sendReply("❌ El archivo de audio no se encuentra en la ruta especificada.");
      }

      // Enviar el audio como nota de voz en respuesta al mensaje citado
      await socket.sendMessage(remoteJid, {
        audio: { url: audioPath },
        mimetype: "audio/mp4",
        ptt: true,
      }, { quoted });

      // Reaccionar con 🎤 a la persona que usó el comando
      await socket.sendMessage(remoteJid, {
        react: {
          text: "🎤",
          key: { remoteJid, fromMe: false, id: userJid },
        },
      });

    } catch (error) {
      console.error("Error al enviar el audio:", error);
      await sendReply("❌ Hubo un error al enviar el audio.");
    }
  }
};