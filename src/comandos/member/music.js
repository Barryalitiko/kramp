const { PREFIX } = require("../../krampus");

module.exports = {
  name: "musica",
  description: "Buscar y descargar música desde YouTube",
  commands: ["musica"],
  usage: `${PREFIX}musica <nombre de la canción>`,
  handle: async ({
    args,
    sendReply,
    sendWaitReply,
    sendErrorReply,
    sendReact,
    searchYouTubeMusic,
    downloadYouTubeAudio,
    socket,
    remoteJid,
  }) => {
    console.log("[MUSICA] Comando recibido con argumentos:", args);

    if (!args.length) {
      await sendReact("❌");
      console.log("[MUSICA] No se proporcionaron argumentos.");
      return sendErrorReply("Por favor, proporciona el nombre de la canción.");
    }

    const query = args.join(" ");
    console.log("[MUSICA] Buscando en YouTube con el query:", query);
    await sendWaitReply(`Buscando "${query}" en YouTube...`);

    try {
      // Buscar la canción en YouTube
      const result = await searchYouTubeMusic(query);
      console.log("[MUSICA] Resultado de búsqueda:", result);

      if (!result || !result.videoId) {
        await sendReact("❌");
        console.log("[MUSICA] No se encontraron resultados para:", query);
        return sendErrorReply("No se encontraron resultados para tu búsqueda.");
      }

      const videoTitle = result.title;
      const videoUrl = `https://www.youtube.com/watch?v=${result.videoId}`;
      console.log("[MUSICA] Canción encontrada:", videoTitle, videoUrl);
      await sendReply(`🎵 Canción encontrada: *${videoTitle}*\n🔗 Enlace: ${videoUrl}`);

      // Obtener la URL de descarga en formato MP3
      await sendWaitReply(`Procesando la descarga de "${videoTitle}"...`);
      console.log("[MUSICA] Iniciando descarga para:", videoUrl);

      const audioFilePath = await downloadYouTubeAudio(videoUrl);
      console.log("[MUSICA] Audio descargado y guardado en:", audioFilePath);

      // Enviar el archivo de audio como mensaje
      await socket.sendMessage(remoteJid, {
        audio: { url: audioFilePath },
        mimetype: "audio/mpeg",
        fileName: `${videoTitle}.mp3`,
      });

      await sendReact("✅");
      console.log("[MUSICA] Descarga completada y enviada:", videoTitle);
      await sendReply(`🎶 Descarga completada: "${videoTitle}"`);
    } catch (error) {
      console.error("[MUSICA] Error al procesar el comando:", error.message);
      await sendReact("❌");
      await sendErrorReply("Hubo un error al procesar tu solicitud. Inténtalo de nuevo.");
    }
  },
};