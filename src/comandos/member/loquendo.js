const { PREFIX } = require("../../krampus");
const fs = require("fs");
const { join } = require("path");
const { exec } = require("child_process");
const gTTS = require("gtts");

module.exports = {
  name: "voz",
  description: "Convierte texto en voz (tipo Loquendo)",
  commands: ["voz", "loquendo", "habla"],
  usage: `${PREFIX}voz <texto>`,
  handle: async ({
    socket,
    remoteJid,
    sendReply,
    args,
    webMessage,
  }) => {
    try {
      const texto = args.join(" ");
      if (!texto) {
        await sendReply("❌ Escribe el texto que quieres convertir en voz.");
        return;
      }

      const filename = `voz_${Date.now()}.mp3`;
      const filepath = join(__dirname, "../../temp", filename); // Asegúrate que exista la carpeta /temp

      const gtts = new gTTS(texto, 'es');
      gtts.save(filepath, async (err) => {
        if (err) {
          console.error("Error generando voz:", err);
          await sendReply("❌ Ocurrió un error al generar la voz.");
          return;
        }

        await socket.sendMessage(remoteJid, {
          audio: { url: filepath },
          mimetype: "audio/mp4",
          ptt: true,
        }, { quoted: webMessage });

        // Borra el archivo después de enviarlo
        setTimeout(() => {
          fs.unlink(filepath, (err) => {
            if (err) console.error("Error al borrar el archivo de voz:", err);
          });
        }, 5000);
      });

    } catch (error) {
      console.error("Error en el comando de voz:", error);
      await sendReply("❌ Hubo un error al procesar el texto.", { quoted: webMessage });
    }
  },
};