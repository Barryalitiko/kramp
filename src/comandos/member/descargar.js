const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

module.exports = {
  name: "download",
  description: "Descarga música desde YouTube.",
  commands: ["download", "music", "play"],
  usage: `${PREFIX}download <URL de YouTube>`,
  handle: async ({
    args,
    sendWaitReply,
    sendSuccessReply,
    sendErrorReply,
    remoteJid,
    socket,
  }) => {
    if (!args.length) {
      return sendErrorReply(
        `👻 Proporciona una URL válida de YouTube. Uso: ${PREFIX}download <URL>`
      );
    }

    // Extraer la URL utilizando una expresión regular
    const videoUrl = args.join(" ").match(/https?:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/)([a-zA-Z0-9_-]{11})/);
    
    if (!videoUrl) {
      return sendErrorReply("❌ La URL proporcionada no es válida.");
    }

    // Mostrar el enlace para depuración
    console.log("Enlace recibido:", videoUrl[0]);

    try {
      // Indicar que se está procesando la solicitud
      await sendWaitReply("Descargando la canción, por favor espera...");

      // Obtener información del video
      const info = await ytdl.getInfo(videoUrl[0]);
      const title = info.videoDetails.title.replace(/[^\w\s]/gi, ""); // Limpiar título
      const filePath = path.resolve(__dirname, `${title}.mp3`);

      // Descargar el audio
      const stream = ytdl(videoUrl[0], { filter: "audioonly", quality: "highestaudio" });
      const file = fs.createWriteStream(filePath);

      stream.pipe(file);

      // Esperar a que se complete la descarga
      file.on("finish", async () => {
        await socket.sendMessage(remoteJid, {
          audio: { url: filePath },
          mimetype: "audio/mpeg",
        });

        // Eliminar el archivo después de enviarlo
        fs.unlinkSync(filePath);
        await sendSuccessReply(`✅ Descarga completada y enviada: ${title}`);
      });

      // Manejo de errores en el stream
      stream.on("error", async (error) => {
        console.error(error);
        await sendErrorReply("❌ Ocurrió un error al descargar el audio.");
      });
    } catch (error) {
      console.error(error);
      return sendErrorReply(`❌ Error: ${error.message}`);
    }
  },
};
