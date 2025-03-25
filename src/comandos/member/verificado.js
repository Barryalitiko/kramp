const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "estilizado",
  description: "Envía un mensaje con un formato especial 🎭",
  commands: ["estilizado"],
  usage: `${PREFIX}estilizado`,
  handle: async ({ sendReply, socket, remoteJid, webMessage }) => {
    try {
      // Ruta de la imagen
      let imagePath = path.join(__dirname, "../../../assets/images/goku.jpg");

      // Leer la imagen como base64
      let catalogo = fs.readFileSync(imagePath).toString("base64");

      // Definir el mensaje con el formato `orderMessage`
      let estilo = {
        key: {
          fromMe: false,
          participant: "0@s.whatsapp.net",
        },
        message: {
          orderMessage: {
            itemCount: -999999,
            status: 1,
            surface: 1,
            message: "👑【✫ᴍᴏɴᴛᴀɴᴀ✫】🪩",
            orderTitle: "Bang",
            thumbnail: Buffer.from(catalogo, "base64"), // Convertir base64 a buffer
            thumbnailMimeType: "image/jpeg", // MIME tipo correcto
            sellerJid: "0@s.whatsapp.net"
          }
        }
      };

      // Enviar el mensaje con el formato especial
      await socket.sendMessage(remoteJid, estilo);
    } catch (error) {
      console.error("❌ Error enviando el mensaje estilizado:", error);
      sendReply("⚠️ Ocurrió un error al enviar el mensaje estilizado.");
    }
  },
};
