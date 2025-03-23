const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const { exec } = require("child_process"); // Para ejecutar ffmpeg

const filePath = path.resolve(__dirname, "../../usuarios.json");
const tempPath = path.resolve(__dirname, "../../temp");

module.exports = {
  name: "personaje",
  description: "Muestra el rostro del usuario con los objetos comprados.",
  commands: ["personaje"],
  usage: `${PREFIX}personaje`,
  handle: async ({ socket, remoteJid }) => {
    try {
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf8");
      }

      let usuarios = JSON.parse(fs.readFileSync(filePath, "utf8"));

      if (!usuarios[remoteJid]) {
        usuarios[remoteJid] = { objetos: [] };
        fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2), "utf8");
      }

      // Rutas de imágenes base
      const rostroPath = path.resolve(__dirname, "../../../assets/images/cara.png");

      // Crear la imagen base del personaje
      const rostro = await loadImage(rostroPath);
      const canvas = createCanvas(rostro.width, rostro.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(rostro, 0, 0, rostro.width, rostro.height);

      if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath, { recursive: true });
      }

      // Guardar imagen base en PNG
      const pngPath = path.resolve(tempPath, `personaje_${remoteJid}.png`);
      fs.writeFileSync(pngPath, canvas.toBuffer("image/png"));

      // Rutas del sticker animado y resultado final
      const gifPath = path.resolve(__dirname, "../../../assets/images/tortuga.gif");
      const webpPath = path.resolve(tempPath, `personaje_${remoteJid}.webp");

      // Comando ffmpeg para superponer el GIF animado sobre la imagen base
      const ffmpegCommand = `ffmpeg -i "${pngPath}" -i "${gifPath}" -filter_complex "[1:v]scale=25:48[gif];[0:v][gif]overlay=153:162" -y "${webpPath}"`;

      exec(ffmpegCommand, async (error, stdout, stderr) => {
        if (error) {
          console.error("❌ Error al generar el sticker animado:", error);
          return await socket.sendMessage(remoteJid, {
            text: `☠ Ocurrió un error al generar tu sticker.\n📄 *Detalles*: ${error.message}`,
          });
        }

        if (!fs.existsSync(webpPath)) {
          return await socket.sendMessage(remoteJid, {
            text: "❌ Error: No se generó correctamente el sticker animado.",
          });
        }

        // Enviar el sticker animado
        await socket.sendMessage(remoteJid, {
          sticker: fs.readFileSync(webpPath),
          mimetype: "image/webp",
        });

        console.log(`✅ [DEBUG] ${remoteJid} ha recibido su sticker animado.`);
      });
    } catch (error) {
      console.error("❌ Error al generar sticker:", error);
      await socket.sendMessage(remoteJid, {
        text: `☠ Ocurrió un error al generar tu sticker.\n📄 *Detalles*: ${error.message}`,
      });
    }
  },
};
