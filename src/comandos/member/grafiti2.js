const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

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
      const svgPath = path.join(__dirname, "temp_spring.svg");
      const outputPath = path.join(__dirname, "temp_spring.png");

      const fontPath = path.resolve(__dirname, "../../../assets/fonts/Spring_Break.ttf");
      const fontFamily = "Spring Break";

      const svgContent = `
        <svg width="1000" height="300" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style type="text/css">
              @font-face {
                font-family: '${fontFamily}';
                src: url('file://${fontPath}');
              }
              .text {
                font-family: '${fontFamily}';
                font-size: 80px;
                fill: url(#gradient);
                stroke: black;
                stroke-width: 8px;
                paint-order: stroke fill;
              }
            </style>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ff6a00" />
              <stop offset="50%" stop-color="#ff0084" />
              <stop offset="100%" stop-color="#6a00ff" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="transparent"/>
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" class="text">${texto}</text>
        </svg>
      `;

      fs.writeFileSync(svgPath, svgContent);

      const command = `ffmpeg -y -i "${svgPath}" -vf "scale=1000:300" "${outputPath}"`;

      exec(command, async (err) => {
        fs.unlinkSync(svgPath);
        if (err) {
          console.error("Error al ejecutar ffmpeg:", err);
          return await sendErrorReply("Error al generar la imagen con ffmpeg.");
        }

        await sendSuccessReact();
        await sendImageFromFile(outputPath, "¡Aquí tienes tu texto con estilo Spring!");
        fs.unlinkSync(outputPath);
      });
    } catch (error) {
      console.error("Error general:", error);
      await sendErrorReply("Ocurrió un error al crear la imagen.");
    }
  },
};
