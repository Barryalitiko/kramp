const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const { createCanvas, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");

const fontPath = path.resolve(__dirname, "../../../assets/fonts/Break_Age.ttf");
registerFont(fontPath, { family: "Break Age" });

module.exports = {
  name: "grafiti",
  description: "Convierte un texto en una imagen con estilo grafiti",
  commands: ["grafiti"],
  usage: `${PREFIX}grafiti (texto)`,

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
      throw new WarningError("Debes escribir un texto para convertirlo en grafiti.");
    }

    await sendWaitReact();

    try {
      const canvas = createCanvas(900, 300);
      const ctx = canvas.getContext("2d");

      // No dibujamos ningún fondo, será transparente

      const fontSize = 80;
      ctx.font = `${fontSize}px 'Break Age'`;
      const textWidth = ctx.measureText(texto).width;
      const x = (canvas.width - textWidth) / 2;
      const y = 180;

      // Sombra ligera para realce
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Borde negro
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#000000";
      ctx.strokeText(texto, x, y);

      // Gradiente
      const gradient = ctx.createLinearGradient(x, y - fontSize, x + textWidth, y);
      gradient.addColorStop(0, "#ff3cac");
      gradient.addColorStop(1, "#784ba0");
      ctx.fillStyle = gradient;
      ctx.fillText(texto, x, y);

      const outputPath = path.join(__dirname, "temp_grafiti.png");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", async () => {
        await sendSuccessReact();
        await sendImageFromFile(outputPath, "Aquí tienes tu texto en grafiti (fondo transparente)!");
        fs.unlinkSync(outputPath);
      });
    } catch (error) {
      console.error("Error al generar el grafiti:", error);
      await sendErrorReply("Ocurrió un error al crear la imagen de grafiti.");
    }
  },
};
