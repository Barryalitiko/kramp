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
    console.log("Iniciando comando progressbar...");
    await sendWaitReact();

    const htmlFilePath = path.join(__dirname, "temp_progressbar.html");
    const screenshotPath = path.join(__dirname, "temp_progressbar.png");
    const gifOutputPath = path.join(__dirname, "temp_progressbar.gif");

    try {
      // Crear HTML
      console.log("Creando archivo HTML...");
      const htmlContent = `
        <html>
          <head>
            <style>
              body {
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background: #222;
              }
              .progress-bar {
                border: 2px solid red;
                border-radius: 14px;
                width: 80%;
                height: 40px;
                background-color: #ccc;
                position: relative;
              }
              .progress-bar > div {
                color: white;
                background: red;
                height: 100%;
                width: 0%;
                border-radius: 10px;
                animation: progress-bar 5s linear forwards;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
                font-size: 18px;
              }
              @keyframes progress-bar {
                0% { width: 0%; }
                100% { width: 100%; }
              }
            </style>
          </head>
          <body>
            <div class="progress-bar">
              <div>Loading...</div>
            </div>
          </body>
        </html>
      `;
      fs.writeFileSync(htmlFilePath, htmlContent);

      // Lanzar navegador y abrir HTML
      console.log("Iniciando Puppeteer...");
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(`file://${htmlFilePath}`);
      await page.setViewport({ width: 800, height: 600 });

      // Grabar capturas durante 5 segundos
      console.log("Capturando imágenes...");
      const frames = [];
      for (let i = 0; i <= 50; i++) {
        await page.evaluate((progress) => {
          const div = document.querySelector('.progress-bar > div');
          div.style.width = `${progress}%`;
          div.innerText = `${Math.floor(progress)}%`;
        }, i * 2);

        const screenshotBuffer = await page.screenshot();
        const framePath = path.join(__dirname, `frame_${i}.png`);
        fs.writeFileSync(framePath, screenshotBuffer);
        frames.push(framePath);
        await new Promise((res) => setTimeout(res, 100)); // 100ms entre frames
      }

      // Cerrar navegador
      console.log("Cerrando navegador...");
      await browser.close();

      // Generar el GIF
      console.log("Creando GIF...");
      await new Promise((resolve, reject) => {
        const command = ffmpeg();
        frames.forEach(frame => {
          command.input(frame);
        });
        command
          .on('end', resolve)
          .on('error', reject)
          .outputOptions('-vf', 'fps=10,scale=800:-1:flags=lanczos')
          .output(gifOutputPath)
          .run();
      });

      console.log("Enviando GIF...");
      await sendSuccessReact();
      await sendVideoFromFile(remoteJid, {
        video: fs.readFileSync(gifOutputPath),
        caption: `Aquí tienes tu barra de progreso animada.`,
        gifPlayback: true,
      });

    } catch (error) {
      console.error("Error al generar el GIF de la barra de progreso:", error);
      await sendErrorReply("Hubo un error al crear el GIF de la barra de progreso.");
    } finally {
      // Limpiar archivos temporales
      console.log("Limpiando archivos temporales...");
      try {
        if (fs.existsSync(htmlFilePath)) fs.unlinkSync(htmlFilePath);
        if (fs.existsSync(gifOutputPath)) fs.unlinkSync(gifOutputPath);
        const frameFiles = fs.readdirSync(__dirname).filter(file => file.startsWith('frame_') && file.endsWith('.png'));
        for (const file of frameFiles) {
          fs.unlinkSync(path.join(__dirname, file));
        }
      } catch (err) {
        console.error("Error al limpiar archivos:", err);
      }
    }
  },
};