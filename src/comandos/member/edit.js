const ffmpeg = require("fluent-ffmpeg");
const { PREFIX } = require("../../krampus");
const fs = require("fs");

module.exports = {
  name: "textovideo",
  description: "Agregar un texto sutil a un video",
  commands: ["textovideo", "texto", "videoedit"],
  usage: `${PREFIX}textovideo <texto>`,
  handle: async ({ socket, remoteJid, sendReply, sendMessage, args, media, webMessage }) => {
    try {
      // Si no hay texto, le pedimos al usuario que lo ingrese
      if (!args.length) {
        return sendReply("❌ Escribe un texto para poner en el video.");
      }

      // Asegurarnos de que se haya recibido un video
      if (!media || media.mimetype.split("/")[0] !== "video") {
        return sendReply("❌ Por favor, responde a un video para agregarle el texto.");
      }

      const videoUrl = media.url; // La URL del video recibido
      const texto = args.join(" "); // El texto que se va a agregar

      // Definir el archivo de salida (temporal)
      const outputVideoPath = `./temp/output_${Date.now()}.mp4`;

      // Usamos FFmpeg para agregar texto al video
      ffmpeg(videoUrl)
        .output(outputVideoPath)
        .outputOptions([
          '-vf', `drawtext=text='${texto}':fontcolor=white@0.1:fontsize=24:x=(w-tw)/2:y=(h-th)/2`, // El texto es sutil (opacidad 10%)
          '-t', '30' // Limitar el video a 30 segundos si es necesario
        ])
        .on('end', async () => {
          // Enviar el video con el texto
          await sendMessage(remoteJid, {
            video: { url: outputVideoPath },
            mimetype: "video/mp4",
            ptt: false,
            caption: `🎬 Video con texto: ${texto}`,
            contextInfo: {
              externalAdReply: {
                title: "Video editado",
                body: "Bot editado con texto sutil",
                mediaType: 2,
                sourceUrl: videoUrl,
              },
            },
          });

          // Eliminar el archivo temporal después de enviarlo
          fs.unlinkSync(outputVideoPath);
        })
        .on('error', (err) => {
          console.error("Error al procesar el video:", err);
          sendReply("❌ Ocurrió un error al procesar el video.");
        })
        .run();
    } catch (error) {
      console.error("Error en el comando de video:", error);
      sendReply("❌ Algo salió mal. Intenta de nuevo.");
    }
  },
};