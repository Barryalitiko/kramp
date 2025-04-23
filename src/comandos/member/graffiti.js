const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const { createCanvas, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");

// Registrar la fuente con su nombre interno correcto
registerFont(path.resolve(__dirname, "../../../assets/fonts/graffiti.ttf"), {
  family: "Wholecar PERSONAL USE ONLY",
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

      // Texto en estilo grafiti
      ctx.fillStyle = "#000000";
      ctx.font = "70px 'Wholecar PERSONAL USE ONLY'";
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
