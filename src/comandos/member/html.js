const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const ffmpeg = require("fluent-ffmpeg");
const stream = require("stream");
const { promisify } = require("util");

const pipeline = promisify(stream.pipeline);

module.exports = {
  name: "progressbar",
  description: "Genera un GIF con una barra de progreso animada.",
  commands: ["progressbar"],
  usage: `${PREFIX}progressbar`,
  handle: async ({ args, sendVideoFromFile, sendWaitReact, sendSuccessReact, sendErrorReply, remoteJid }) => {
    console.log("Iniciando comando progressbar...");
    await sendWaitReact();

    const tempDir = path.join(__dirname, "progress_temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const htmlFilePath = path.join(tempDir, "progressbar.html");
    const gifOutputPath = path.join(tempDir, "progressbar.gif");

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
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
                font-size: 18px;
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

      console.log("Iniciando Puppeteer...");
      const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
      const page = await browser.newPage();
      await page.goto(`file://${htmlFilePath}`);
      await page.setViewport({ width: 400, height: 300 }); // **Viewport reducido para que pese menos**

      // Capturar frames
      console.log("Capturando frames en memoria...");
      const frames = [];
      const totalFrames = 20; // **Reducimos para que no sea pesado**

      for (let i = 0; i <= totalFrames; i++) {
        await page.evaluate((progress) => {
          const div = document.querySelector('.progress-bar > div');
          div.style.width = `${progress}%`;
          div.innerText = `${Math.floor(progress)}%`;
        }, i * (100 / totalFrames));

        const buffer = await page.screenshot({ type: 'png' });
        frames.push(buffer);

        await new Promise((res) => setTimeout(res, 50)); // 50ms de espera
      }

      console.log("Cerrando navegador...");
      await browser.close();

      // Crear stream
      console.log("Creando stream para ffmpeg...");
      const inputStream = new stream.PassThrough();

      (async () => {
        for (const frame of frames) {
          inputStream.write(frame);
        }
        inputStream.end();
      })();

      console.log("Generando GIF...");
      await new Promise((resolve, reject) => {
        ffmpeg(inputStream)
          .inputFormat('image2pipe')
          .outputOptions([
            '-vf', 'fps=8,scale=320:-1:flags=lanczos', // fps bajo y resolución más pequeña
            '-y'
          ])
          .output(gifOutputPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      console.log("Esperando para enviar GIF...");
      await new Promise(res => setTimeout(res, 1500)); // Delay para evitar Rate Limit

      console.log("Enviando GIF...");
      await sendSuccessReact();
      await sendVideoFromFile(remoteJid, gifOutputPath, {
        caption: "Aquí tienes tu barra de progreso animada.",
        gifPlayback: true,
      });

    } catch (error) {
      console.error("Error al generar el GIF de la barra de progreso:", error);
      await sendErrorReply("Hubo un error al crear el GIF de la barra de progreso.");
    } finally {
      console.log("Limpiando archivos temporales...");
      try {
        if (fs.existsSync(htmlFilePath)) fs.unlinkSync(htmlFilePath);
        if (fs.existsSync(gifOutputPath)) fs.unlinkSync(gifOutputPath);
        if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
      } catch (err) {
        console.error("Error al limpiar archivos:", err);
      }
    }
  },
};