const { PREFIX } = require("../../krampus");
const { searchVideo } = require("../../services/ytdl"); // Usamos yt-search para búsqueda
const { fetchPlayDlAudio } = require("../../services/audioService"); // Usamos play-dl para obtener el audio
const { InvalidParameterError } = require("../../errors/InvalidParameterError");

module.exports = {
  name: "download-video",
  description: "Descargar el video de YouTube (solo audio)",
  commands: ["download-video", "dv"],
  usage: `${PREFIX}download-video <nombre del video>`,
  handle: async ({
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
    sendAudioFromURL,
    args,
  }) => {
    if (!args.length) {
      console.log("Error: No se proporcionaron argumentos.");
      throw new InvalidParameterError(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Indicame el video que deseas descargar"
      );
    }

    console.log(`Comando recibido con argumentos: ${args.join(" ")}`);
    await sendWaitReact();

    try {
      // Buscar el video en YouTube con el término proporcionado
      console.log("Buscando video en YouTube para:", args.join(" "));
      const video = await searchVideo(args.join(" ")); // Este servicio usa yt-search
      const videoUrl = video.url;

      console.log(`Video encontrado, URL directa: ${videoUrl}`);

      // Llamar a play-dl para obtener el audio del video
      console.log("Llamando al servicio para obtener el enlace de descarga...");
      const audioData = await fetchPlayDlAudio(videoUrl);

      if (!audioData || !audioData.downloadUrl) {
        console.log("Error: No se pudo obtener un enlace de descarga válido.");
        await sendErrorReply("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 No se pudo obtener el audio.");
        return;
      }

      console.log(`Enlace de descarga obtenido: ${audioData.downloadUrl}`);
      await sendSuccessReact();

      // Enviar el audio descargado
      console.log("Enviando el audio...");
      await sendAudioFromURL(audioData.downloadUrl);
      console.log("Audio enviado con éxito.");
    } catch (error) {
      console.error("Error en el manejo del comando:", error.message);
      await sendErrorReply(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Error al procesar la solicitud de video."
      );
    }
  },
};