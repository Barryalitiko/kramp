const { PREFIX } = require("../../krampus");
const axios = require("axios");

module.exports = {
  name: "estilizado",
  description: "Envía un mensaje con formato especial y simula que es respuesta a un WhatsApp Business o un contacto.",
  commands: ["krampus"],
  usage: `${PREFIX}estilizado`,
  handle: async ({ sendReply, socket, remoteJid }) => {
    try {
      // 1. Descargar la imagen de prueba.
      const imageUrl = "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png";
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const imageBuffer = Buffer.from(response.data, "binary");

      // 2. Definir textos para caption y catálogo.
      const imageCaption = "KrampusOM"; // Texto que acompaña la imagen.
      const catalogMessage = "¡Oferta especial en KrampusOM!"; // Texto para el mensaje estilo catálogo.

      // 3. Crear el mensaje principal con la imagen.
      const messageContent = {
        image: imageBuffer,
        caption: imageCaption,
        mimetype: "image/png",
      };

      // 4. Crear un objeto ficticio (fakeQuoted) que simula un mensaje recibido de un contacto o WhatsApp Business.
      // De esta forma, en la previsualización se verá como si el mensaje fuera una respuesta.
      const fakeQuoted = {
        key: {
          remoteJid: remoteJid,         // El chat donde se envía el mensaje.
          fromMe: false,
          id: "FAKE-QUOTE-ID",           // ID arbitraria.
          participant: "0@s.whatsapp.net", // Simula que el mensaje proviene de WhatsApp Business.
        },
        message: {
          conversation: "¡Hola! Gracias por contactarnos, aquí tienes la oferta."
        }
      };

      // 5. Construir un objeto con orderMessage para dar un formato especial (especialmente visible en Android).
      const estilo = {
        key: {
          fromMe: false,
          participant: "573182165511@s.whatsapp.net",
        },
        message: {
          orderMessage: {
            itemCount: 0,             // Número de ítems (valor arbitrario).
            status: 2,                // Estado (según lo que requiera la API).
            surface: 2,               // Indica la “superficie” o modo de renderizado.
            message: catalogMessage,  // Texto que se mostrará en el catálogo.
            orderTitle: "Bang",       // Título (opcional).
            thumbnail: imageBuffer,   // Miniatura de la imagen.
            thumbnailMimeType: "image/png",
            sellerJid: "0@s.whatsapp.net", // Vendedor simulado (WhatsApp Business).
          }
        }
      };

      // 6. Enviar el mensaje principal usando el fake quoted para simular que fue enviado como respuesta.
      await socket.sendMessage(remoteJid, messageContent, { quoted: fakeQuoted });

      // 7. Adicionalmente, enviar el mensaje con el formato orderMessage (fallback) en caso de que el cliente soporte ese estilo.
      await socket.sendMessage(remoteJid, messageContent, { quoted: estilo });

    } catch (error) {
      console.error("❌ Error enviando el mensaje estilizado:", error);
      sendReply("⚠️ Ocurrió un error al enviar el mensaje estilizado.");
    }
  },
};
