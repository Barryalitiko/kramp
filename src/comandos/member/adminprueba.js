const { PREFIX } = require("../../krampus");

module.exports = {
  name: "hide-tag-admins",
  description: "Menciona de forma oculta solo a los administradores.",
  commands: ["tagadmin", "88"],
  usage: `${PREFIX}tagadmin motivo`,
  handle: async ({ fullArgs, sendText, sendImageFromURL, sendStickerFromURL, socket, remoteJid, sendReact, isReply, webMessage, repliedMsg }) => {
    if (!remoteJid.endsWith("@g.us")) {
      await sendText("Este comando solo puede usarse en grupos.");
      return;
    }

    const groupMetadata = await socket.groupMetadata(remoteJid);
    const admins = groupMetadata.participants.filter(p => ["admin", "superadmin"].includes(p.admin));
    const mentions = admins.map(({ id }) => id);

    if (mentions.length === 0) {
      await sendText("No hay administradores en este grupo para etiquetar.");
      return;
    }

    await sendReact("🛡️"); // Un react diferente para identificarlo

    if (isReply) {
      if (repliedMsg && repliedMsg.message) {
        if (repliedMsg.message.imageMessage) {
          const imageUrl = repliedMsg.message.imageMessage.url;
          const caption = fullArgs || repliedMsg.message.caption || "Sin texto";
          await sendImageFromURL(imageUrl, caption, mentions);
        } else if (repliedMsg.message.videoMessage) {
          const videoUrl = repliedMsg.message.videoMessage.url;
          const caption = fullArgs || repliedMsg.message.caption || "Sin texto";
          await sendImageFromURL(videoUrl, caption, mentions);
        } else if (repliedMsg.message.stickerMessage) {
          const stickerUrl = repliedMsg.message.stickerMessage.url;
          await sendStickerFromURL(stickerUrl, mentions);
        } else if (repliedMsg.message.conversation) {
          const messageText = fullArgs || repliedMsg.message.conversation || "Sin texto";
          await sendText(messageText, mentions);
        } else {
          await sendText("No se pudo detectar el tipo de medio.", mentions);
        }
      } else {
        await sendText("No se pudo obtener el mensaje al que se respondió.", mentions);
      }
    } else {
      if (fullArgs) {
        await sendText(fullArgs, mentions);
      } else {
        await sendText("No se proporcionó texto al usar el comando.", mentions);
      }
    }
  },
};