const { PREFIX } = require("../../krampus");
const ytSearch = require("yt-search");
const playdl = require("play-dl");

module.exports = {
  name: 'musica',
  description: 'Busca y envía música desde YouTube',
  commands: ['musica', 'play'],
  usage: `${PREFIX}musica <nombre de la canción o URL de YouTube>`,
  handle: async ({ args, remoteJid, sendReply, socket }) => {
    if (args.length < 1) {
      await sendReply(`Uso incorrecto. Por favor, proporciona el nombre de la canción o el URL. Ejemplo: ${PREFIX}musica [nombre o URL]`);
      return;
    }

    const query = args.join(" ");
    console.log(`Buscando música para: ${query}`);

    try {
      // Buscar música en YouTube usando yt-search
      const results = await ytSearch(query);
      if (!results || results.videos.length === 0) {
        return await sendReply("No se encontraron resultados para la búsqueda.");
      }

      // Obtener el primer resultado de video
      const video = results.videos[0];
      console.log(`Encontrado: ${video.title} - ${video.url}`);

      // Descargar el audio del video
      const audioStream = await playdl.stream(video.url);
      const audioBuffer = await audioStream.buffer(); // Cambiado de stream.buffer() a buffer()

      // Enviar el audio al usuario
      await socket.sendMessage(remoteJid, {
        audio: audioBuffer,
        mimetype: "audio/mpeg",
        caption: `🎶 Aquí tienes: ${video.title}`,
      });

      console.log(`Audio enviado con éxito: ${video.title}`);
    } catch (error) {
      console.error(`Error al buscar o descargar el audio: ${error}`);
      await sendReply("Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.");
    }
  },
};