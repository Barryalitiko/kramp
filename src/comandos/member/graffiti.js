const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const { createCanvas, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");

// Registrar la fuente con su nombre interno
registerFont(path.resolve(__dirname, "../../../assets/fonts/Break_Age.ttf"), {
  family: "Break Age",
});

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

      // Fondo blanco
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sombra urbana
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;

      // Texto grafiti
      ctx.fillStyle = "#00c3ff"; // Color vibrante
      ctx.font = "70px 'Break Age'";
      ctx.fillText(texto, 50, 180);

      const outputPath = path.join(__dirname, "temp_grafiti.png");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", async () => {
        await sendSuccessReact();
        await sendImageFromFile(outputPath, "Aquí tienes tu texto en grafiti!");
        fs.unlinkSync(outputPath);
      });
    } catch (error) {
      console.error("Error al generar el grafiti:", error);
      await sendErrorReply("Ocurrió un error al crear la imagen de grafiti.");
    }
  },
};
