const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");
const gTTS = require("gtts");
const { exec } = require("child_process");

module.exports = {
  name: "voz",
  description: "Convierte texto en voz estilo Loquendo",
  commands: ["voz", "loquendo", "habla"],
  usage: `${PREFIX}voz <texto a convertir>`,
  handle: async ({
    socket,
    remoteJid,
    sendReply,
    args,
    sendWaitReact,
    webMessage,
  }) => {
    try {
      const texto = args.join(" ");
      if (!texto) {
        await sendReply("❌ Debes escribir el texto que quieres convertir en voz.");
        return;
      }

      await sendWaitReact("⏳");

      const filename = `voz_${Date.now()}`;
      const mp3Path = path.join(__dirname, "../../temp", `${filename}.mp3`);
      const opusPath = path.join(__dirname, "../../temp", `${filename}.opus`);

      const gtts = new gTTS(texto, 'es');
      gtts.save(mp3Path, async (err) => {
        if (err) {
          console.error("Error generando voz:", err);
          await sendReply("❌ Hubo un error al generar la voz.", { quoted: webMessage });
          return;
        }

        // Convertir MP3 a OPUS para compatibilidad con iPhone
        exec(`ffmpeg -y -i "${mp3Path}" -c:a libopus -b:a 96k "${opusPath}"`, async (error) => {
          if (error) {
            console.error("Error al convertir a OPUS:", error);
            await sendReply("❌ Error al convertir el audio para compatibilidad.", { quoted: webMessage });
            return;
          }

          await socket.sendMessage(remoteJid, {
            audio: { url: opusPath },
            mimetype: "audio/ogg; codecs=opus",
            ptt: true,
            contextInfo: {
              externalAdReply: {
                title: "Texto convertido a voz",
                body: "SOKY bot",
                mediaType: 2,
                thumbnailUrl: "https://i.imgur.com/KaSl1I9_d.webp",
                renderLargerThumbnail: true,
                showAdAttribution: true,
                sourceUrl: "https://sokybot.fake/voz",
              },
            },
          }, { quoted: webMessage });

          // Borrar ambos archivos
          setTimeout(() => {
            fs.unlink(mp3Path, () => {});
            fs.unlink(opusPath, () => {});
          }, 5000);
        });
      });

    } catch (error) {
      console.error("Error en el comando de voz:", error);
      await sendReply("❌ Hubo un error al procesar el comando de voz.", { quoted: webMessage });
    }
  },
};