const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const ffmpeg = require("fluent-ffmpeg");

module.exports = {
  name: "progressbar",
  description: "Genera un GIF con una barra de progreso animada.",
  commands: ["progressbar"],
  usage: `${PREFIX}progressbar`,

  handle: async ({ args, sendVideoFromFile, sendWaitReact, sendSuccessReact, sendErrorReply, remoteJid }) => {
    await sendWaitReact();

    try {
      // Crear un archivo HTML con la barra de progreso
      const htmlContent = `
        <html>
          <head>
            <style>
              .progress-bar {
                border: 2px solid red;
                border-radius: 14px;
                width: 100%;
                height: 40px;
                position: relative;
                background-color: #ccc;
              }

              .progress-bar > div {
                color: white;
                background: red;
                overflow: hidden;
                white-space: nowrap;
                padding: 10px 20px;
                border-radius: 10px;
                animation: progress-bar 2s linear infinite;
              }

              @keyframes progress-bar {
                0% { width: 0; }
                100% { width: 100%; }
              }
            </style>
          </head>
          <body>
            <div class="progress-bar">
              <div>Progress...</div>
            </div>
          </body>
        </html>
      `;

      const htmlFilePath = path.join(__dirname, "temp_progressbar.html");
      fs.writeFileSync(htmlFilePath, htmlContent);

      // Usar Puppeteer para abrir el HTML en un navegador sin cabeza y capturar una captura de pantalla
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(`file://${htmlFilePath}`);
      const gifOutputPath = path.join(__dirname, "temp_progressbar.gif");

      // Convertir el HTML en un GIF (captura de pantalla cada segundo)
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(page.screenshot({ fullPage: true, encoding: 'binary' }))
          .inputFormat('image2')
          .output(gifOutputPath)
          .outputOptions('-pix_fmt', 'yuv420p', '-t 5', '-vf "fps=10"')
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      await sendSuccessReact();
      await sendVideoFromFile(remoteJid, {
        video: fs.readFileSync(gifOutputPath),
        caption: `Aquí tienes tu barra de progreso animada.`,
        gifPlayback: true,
      });

      // Limpiar archivos temporales
      fs.unlinkSync(htmlFilePath);
      fs.unlinkSync(gifOutputPath);
      await browser.close();

    } catch (error) {
      console.error("Error al generar el GIF de la barra de progreso:", error);
      await sendErrorReply("Hubo un error al crear el GIF de la barra de progreso.");
    }
  },
};
