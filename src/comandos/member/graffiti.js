const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

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
      // Definir la ruta de la fuente
      const fontPath = path.resolve(__dirname, "../../../assets/fonts/Break-Age.ttf");

      const outputPath = path.join(__dirname, "temp_grafiti.png");

      // Usar sharp para crear la imagen
      sharp({
        create: {
          width: 900,
          height: 300,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
      })
        .text(texto, 50, 150, {
          font: '70px "Break Age"', // Asegúrate de que esta fuente esté bien referenciada
          fill: "#ff3cac", // Color del texto
        })
        .toFile(outputPath, (err, info) => {
          if (err) {
            console.error("Error creando la imagen:", err);
            sendErrorReply("Ocurrió un error al crear la imagen de grafiti.");
          } else {
            sendSuccessReact();
            sendImageFromFile(outputPath, "Aquí tienes tu texto en grafiti!");
            fs.unlinkSync(outputPath); // Eliminar la imagen temporal después de enviarla
          }
        });
    } catch (error) {
      console.error("Error al generar el grafiti:", error);
      await sendErrorReply("Ocurrió un error al crear la imagen de grafiti.");
    }
  },
};
