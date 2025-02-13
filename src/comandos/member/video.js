const { PREFIX } = require("../../krampus");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

module.exports = {
  name: "perfilConPNG",
  description: "Envía la foto de perfil del usuario con un PNG encima.",
  commands: ["perfilpng", "fotoConPNG"],
  usage: `${PREFIX}perfilpng @usuario`,
  handle: async ({ args, socket, remoteJid, sendReply, isReply, replyJid, senderJid }) => {
    let userJid;
    if (isReply) {
      userJid = replyJid;
    } else if (args.length < 1) {
      await sendReply("Uso incorrecto. Usa el comando así:\n" + `${PREFIX}perfilpng @usuario`);
      return;
    } else {
      userJid = args[0].replace("@", "") + "@s.whatsapp.net";
    }

    try {
      let profilePicUrl;
      try {
        profilePicUrl = await socket.profilePictureUrl(userJid, "image");
      } catch (err) {
        console.error(err);
        await sendReply(`@${args[0] || userJid.split('@')[0]} no tiene foto de perfil.`);
        return;
      }

      if (!profilePicUrl) {
        await sendReply(`@${args[0] || userJid.split('@')[0]} no tiene foto de perfil.`);
        return;
      }

      const tempFolder = path.resolve(__dirname, "../../../assets/temp");
      if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder, { recursive: true });
      }

      const sanitizedJid = userJid.replace(/[^a-zA-Z0-9_-]/g, "_");
      const imageFilePath = path.join(tempFolder, `${sanitizedJid}_profile.jpg`);
      const outputImagePath = path.join(tempFolder, `${sanitizedJid}_profile_with_png.jpg`);
      const pngImagePath = path.resolve(__dirname, "../../../assets/images/celda2.png");

      const response = await axios({ url: profilePicUrl, responseType: "arraybuffer" });
      fs.writeFileSync(imageFilePath, response.data);

      ffmpeg()
        .input(imageFilePath)
        .input(pngImagePath)
        .complexFilter([
          "[1:v]scale=iw:ih[scaled_png]",
          "[0:v][scaled_png]overlay=0:0"
        ])
        .save(outputImagePath)
        .on("end", async () => {
          try {
            await socket.sendMessage(remoteJid, {
              image: { url: outputImagePath },
              caption: `Aquí tienes la foto de perfil de @${userJid.split("@")[0]} con el PNG encima.`,
            });
          } catch (error) {
            console.error(error);
            await sendReply("⚠️ Ocurrió un error inesperado, pero la imagen se envió correctamente.");
          }
        })
        .on("error", (err) => {
          console.error("FFmpeg Error:", err);
          sendReply("Hubo un problema al procesar la imagen.");
        })
        .run();
    } catch (error) {
      console.error(error);
      await sendReply("Hubo un error al procesar el comando.");
    }
  },
};
