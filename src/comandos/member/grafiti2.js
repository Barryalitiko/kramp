const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const { createCanvas, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");

// Registrar la fuente Spring Break
const fontPath = path.resolve(__dirname, "../../../assets/fonts/Spring_Break.ttf");
registerFont(fontPath, { family: "Spring Break" });

module.exports = {
  name: "spring",
  description: "Convierte un texto en una imagen con estilo primaveral",
  commands: ["spring"],
  usage: `${PREFIX}spring (texto)`,

  handle: async ({
    args,
    sendImageFromFile,
    sendReply,
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
      const canvas = createCanvas(1000, 300);
      const ctx = canvas.getContext("2d");

      // Fondo transparente por defecto, así que no pintamos el fondo

      ctx.font = "80px 'Spring Break'";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const x = canvas.width / 2;
      const y = canvas.height / 2;

      // Sombra suave
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;

      // Borde negro
      ctx.lineWidth = 8;
      ctx.strokeStyle = "black";
      ctx.strokeText(texto, x, y);

      // Gradiente tipo sunset
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "#ff6a00"); // naranja
      gradient.addColorStop(0.5, "#ff0084"); // fucsia
      gradient.addColorStop(1, "#6a00ff"); // violeta

      ctx.fillStyle = gradient;
      ctx.fillText(texto, x, y);

      const outputPath = path.join(__dirname, "temp_spring.png");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", async () => {
        await sendSuccessReact();
        await sendImageFromFile(outputPath, "¡Aquí tienes tu texto con estilo Spring!");
        fs.unlinkSync(outputPath);
      });
    } catch (error) {
      console.error("Error al generar el texto:", error);
      await sendErrorReply("Ocurrió un error al crear la imagen.");
    }
  },
};
