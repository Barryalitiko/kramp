const { PREFIX } = require("../../krampus");
const { downloadMusic } = require("../../services/ytdpl");
const ytSearch = require("yt-search");
const fs = require("fs");
const cooldowns = new Map();

module.exports = {
  name: "dedicar",
  description: "Dedica una canción a alguien",
  commands: ["dedicar", "dedica", "dedicatory"],
  usage: `${PREFIX}dedicar <nombre del video> @persona`,
  handle: async ({
    socket,
    remoteJid,
    sendReply,
    args,
    sendWaitReact,
    sendMusicReact,
    webMessage,
    sendMessage,
  }) => {
    try {
      const userId = remoteJid;
      const now = Date.now();
      const cooldownTime = 20 * 1000;

      if (cooldowns.has(userId)) {
        const lastUsed = cooldowns.get(userId);
        if (now - lastUsed < cooldownTime) {
          const remainingTime = Math.ceil((cooldownTime - (now - lastUsed)) / 1000);
          await sendReply(`❌ Estás en cooldown. Espera ${remainingTime} segundos para usar el comando nuevamente.`);
          return;
        }
      }

      cooldowns.set(userId, now);

      // Detectar menciones desde contextInfo
      const mentions = webMessage.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

      if (mentions.length === 0) {
        await sendReply("❌ Debes etiquetar a alguien para dedicarle la canción.");
        return;
      }

      const videoQuery = args.join(" ");
      if (!videoQuery) {
        await sendReply("❌ Por favor, proporciona el nombre del video que deseas dedicar.");
        return;
      }

      await sendWaitReact("⏳");

      const searchResult = await ytSearch(videoQuery);
      const video = searchResult.videos[0];

      if (!video) {
        await sendReply("❌ No se encontró ningún video con ese nombre.", { quoted: webMessage });
        return;
      }

      const videoUrl = video.url;
      const videoTitle = video.title;
      const videoAuthor = video.author.name;
      const videoViews = video.views;

      const message = `🎶 *${videoTitle}* 

📺 Canal: *${videoAuthor}*
👀 Visualizaciones: *${videoViews}*

🎧 *Dedicado para:* @${mentions[0].split("@")[0]}`;

      const firstMessage = await sendReply(message, { quoted: webMessage, mentions });

      setTimeout(async () => {
        await socket.sendMessage(remoteJid, {
          delete: {
            remoteJid: remoteJid,
            fromMe: true, 
            id: firstMessage.key.id, 
          },
        });
        console.log(`Primer mensaje eliminado: ${firstMessage.key.id}`);
      }, 15000);

      const musicPath = await downloadMusic(videoUrl);
      console.log(`Música descargada correctamente: ${musicPath}`);

      await sendMusicReact("🎵");

      await socket.sendMessage(remoteJid, {
        audio: { url: musicPath },
        mimetype: "audio/mp4",
        ptt: true,
        caption: `🎶 ${videoTitle}\n🎧 Dedicado para: @${mentions[0].split("@")[0]}`,
        mentions,
        contextInfo: {
          externalAdReply: {
            title: videoTitle,
            body: "SOKY bot",
            mediaType: 2,
            thumbnailUrl: "https://i.imgur.com/KaSl1I9_d.webp?maxwidth=760&fidelity=grand",
            renderLargerThumbnail: true,
            showAdAttribution: true,
            sourceUrl: "Oᴘᴇʀᴀᴄɪᴏɴ Mᴀʀsʜᴀʟʟ ༴༎𝙾𝙼༎",
          },
        },
      }, { quoted: webMessage });

      fs.unlinkSync(musicPath);
      console.log(`Archivo de música eliminado: ${musicPath}`);

    } catch (error) {
      console.error("Error al descargar o enviar la música:", error);
      await sendReply("❌ Hubo un error al procesar la música.", { quoted: webMessage });
    }
  },
};
