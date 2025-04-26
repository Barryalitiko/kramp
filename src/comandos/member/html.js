const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const puppeteer = require("puppeteer");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const { PassThrough } = require("stream");

const tempGifPath = path.resolve(process.cwd(), "temp_progressbar.gif");

module.exports = {
  name: "progressbar",
  description: "Genera un GIF con una barra de progreso animada.",
  commands: ["progressbar"],
  usage: `${PREFIX}progressbar`,
  handle: async ({ socket, args, sendWaitReact, sendSuccessReact, sendErrorReply, remoteJid }) => {
    console.log("Iniciando comando progressbar...");
    await sendWaitReact();

    try {
      console.log("Iniciando Puppeteer...");
      const browser = await puppeteer.launch({ headless: "new" });
      const page = await browser.newPage();

      // Cargar HTML directamente en memoria, no en disco
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
      await page.setContent(htmlContent);
      await page.setViewport({ width: 800, height: 600 });

      console.log("Capturando frames...");
      const frames = [];
      for (let i = 0; i <= 50; i++) {
        await page.evaluate((progress) => {
          const div = document.querySelector('.progress-bar > div');
          div.style.width = `${progress}%`;
          div.innerText = `${Math.floor(progress)}%`;
        }, i * 2);

        const buffer = await page.screenshot({ type: 'png' });
        frames.push(buffer);
        await new Promise((res) => setTimeout(res, 30)); // 30ms entre frames
      }

      console.log("Cerrando navegador...");
      await browser.close();

      console.log("Convirtiendo frames a GIF en memoria...");
      const frameStream = new PassThrough();
      (async () => {
        for (const frame of frames) {
          frameStream.write(frame);
        }
        frameStream.end();
      })();

      // Convertir a GIF y guardarlo temporalmente
      await new Promise((resolve, reject) => {
        const gifStream = fs.createWriteStream(tempGifPath);
        ffmpeg(frameStream)
          .inputFormat('image2pipe')
          .outputOptions('-vf', 'fps=10,scale=800:-1:flags=lanczos')
          .format('gif')
          .pipe(gifStream, { end: true });
        
        gifStream.on('finish', resolve);
        gifStream.on('error', reject);
      });

      console.log("Enviando GIF...");
      await sendSuccessReact();
      await socket.sendMessage(remoteJid, {
        video: fs.readFileSync(tempGifPath),
        caption: "Aquí tienes tu barra de progreso animada.",
        gifPlayback: true
      });

      // Eliminar archivo temporal después de enviarlo
      fs.unlinkSync(tempGifPath);

    } catch (error) {
      console.error("Error al generar el GIF de la barra de progreso:", error);
      await sendErrorReply("Hubo un error al crear el GIF de la barra de progreso.");
    }
  },
};