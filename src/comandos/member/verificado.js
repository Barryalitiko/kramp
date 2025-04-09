const { PREFIX } = require("../../krampus");
const axios = require("axios");

module.exports = {
  name: "estilizado",
  description: "Envía un mensaje con un formato especial 🎭",
  commands: ["krampus"],
  usage: `${PREFIX}estilizado`,
  handle: async ({ sendReply, socket, remoteJid /*, clientType */ }) => {
    try {
      // URL de la imagen para la prueba.
      let imageUrl = "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png";

      // Descargar la imagen como buffer.
      let response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      let imageBuffer = Buffer.from(response.data, "binary");

      // Texto que acompaña la imagen.
      let imageCaption = "KrampusOM";  // Pie de la imagen.
      
      // Texto para el catálogo (mensaje del catálogo).
      let catalogMessage = "¡Oferta especial en KrampusOM!";  // Este texto aparecerá en el catálogo.

      // Crear el mensaje con la imagen y el caption.
      let messageContent = {
        image: imageBuffer,           // Buffer de la imagen descargada.
        caption: imageCaption,        // Mensaje que acompaña la imagen.
        mimetype: "image/png",        // Tipo MIME de la imagen (en este caso PNG).
      };

      // Estructura del mensaje estilizado usando orderMessage (funcionalidad probada mayormente en Android).
      let estilo = {
        key: {
          fromMe: false,
          participant: "573182165511@s.whatsapp.net",
        },
        message: {
          orderMessage: {
            itemCount: 0,            // Contador de items (valor arbitrario).
            status: 2,               // Estado del pedido (según la API de WhatsApp).
            surface: 2,              // Superficie para renderizar (según la implementación).
            message: catalogMessage, // Texto mostrado en el catálogo.
            orderTitle: "Bang",      // Título del mensaje (opcional).
            thumbnail: imageBuffer,  // Usar la imagen como thumbnail.
            thumbnailMimeType: "image/png",  // Tipo MIME para la miniatura.
            sellerJid: "0@s.whatsapp.net",     // ID del vendedor (por defecto).
          }
        }
      };

      // Enviar el mensaje estilizado (este se visualizará correctamente en dispositivos Android).
      await socket.sendMessage(remoteJid, messageContent, { quoted: estilo });

      // Enviar un mensaje de fallback (texto) para dispositivos que no soporten orderMessage.
      // Si se detecta el tipo de cliente, se puede condicionar el envío. En este ejemplo se envía en cualquier caso.
      await socket.sendMessage(remoteJid, { text: catalogMessage });

    } catch (error) {
      console.error("❌ Error enviando el mensaje estilizado:", error);
      sendReply("⚠️ Ocurrió un error al enviar el mensaje estilizado.");
    }
  },
};
