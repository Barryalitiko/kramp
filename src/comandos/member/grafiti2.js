const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const { createCanvas, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// Registrar la fuente Spring Break
const fontPath = path.resolve(__dirname, "../../../assets/fonts/Spring_Break.ttf");
registerFont(fontPath, { family: "Spring Break" });

module.exports = {
  name: "spring",
  description: "Convierte un texto en una animación con estilo primaveral",
  commands: ["spring"],
  usage: `${PREFIX}spring (texto)`,

  handle: async ({
    args,
    sendVideoFromFile,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    const texto = args.join(" ");
    if (!texto) {
      throw new WarningError("Debes escribir un texto para convertirlo.");
    }

    await sendWaitReact();

    try {
      // Crear imagen con canvas
      const canvas = createCanvas(1000, 300);
      const ctx = canvas.getContext("2d");

      ctx.font = "80px 'Spring Break'";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const x = canvas.width / 2;
      const y = canvas.height / 2;

      // Sombra
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;

      // Borde negro
      ctx.lineWidth = 8;
      ctx.strokeStyle = "black";
      ctx.strokeText(texto, x, y);

      // Gradiente sunset
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "#ff6a00");
      gradient.addColorStop(0.5, "#ff0084");
      gradient.addColorStop(1, "#6a00ff");
      ctx.fillStyle = gradient;
      ctx.fillText(texto, x, y);

      // Guardar como PNG temporal
      const tempImage = path.join(__dirname, "temp_spring.png");
      const out = fs.createWriteStream(tempImage);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", () => {
        const overlayVideo = path.resolve(__dirname, "../../../assets/animations/spring_particles.mp4");
        const outputVideo = path.join(__dirname, "spring_output.mp4");

        // Comando ffmpeg para combinar la imagen con el overlay animado
        const ffmpegCommand = `ffmpeg -y -loop 1 -i "${tempImage}" -i "${overlayVideo}" -filter_complex "[1:v]scale=1000:300[ov];[0:v][ov]overlay=format=auto" -t 5 -pix_fmt yuv420p -shortest "${outputVideo}"`;

        exec(ffmpegCommand, async (error, stdout, stderr) => {
          fs.unlinkSync(tempImage); // eliminar imagen temporal

          if (error) {
            console.error("Error con ffmpeg:", error);
            return await sendErrorReply("Hubo un error al generar el video.");
          }

          await sendSuccessReact();
          await sendVideoFromFile(outputVideo, "¡Aquí tienes tu texto animado con estilo Spring!");
          fs.unlinkSync(outputVideo); // borrar video después de enviarlo
        });
      });
    } catch (error) {
      console.error("Error general:", error);
      await sendErrorReply("Ocurrió un error al crear la animación.");
    }
  },
};
