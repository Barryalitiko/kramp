const { PREFIX, TEMP_DIR } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const puppeteer = require("puppeteer");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const { PassThrough } = require("stream");
const { exec } = require("child_process");

module.exports = {
  name: "progressbar",
  description: "Genera un sticker animado con una barra de progreso.",
  commands: ["progressbar"],
  usage: `${PREFIX}progressbar`,
  handle: async ({ socket, args, sendWaitReact, sendSuccessReact, sendErrorReply, sendStickerFromFile, remoteJid }) => {
    console.log("Iniciando comando progressbar...");
    await sendWaitReact();

    const tempGifPath = path.resolve(TEMP_DIR, "temp_progressbar.gif");
    const outputWebpPath = path.resolve(TEMP_DIR, "output_progressbar.webp");

    try {
      console.log("Iniciando Puppeteer...");
      const browser = await puppeteer.launch({ headless: "new" });
      const page = await browser.newPage();

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

      console.log("Convirtiendo frames a GIF...");
      const frameStream = new PassThrough();
      (async () => {
        for (const frame of frames) {
          frameStream.write(frame);
        }
        frameStream.end();
      })();

      // Crear un GIF temporal
      await new Promise((resolve, reject) => {
        const gifStream = fs.createWriteStream(tempGifPath);
        ffmpeg(frameStream)
          .inputFormat('image2pipe')
          .outputOptions('-vf', 'fps=10,scale=512:-1:flags=lanczos')
          .format('gif')
          .pipe(gifStream)
          .on('finish', resolve)
          .on('error', reject);
      });

      console.log("Convirtiendo GIF a WebP animado...");
      await new Promise((resolve, reject) => {
        exec(
          `ffmpeg -i ${tempGifPath} -y -vcodec libwebp -fs 0.99M -filter_complex "[0:v] scale=512:512:force_original_aspect_ratio=decrease,fps=12,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on[p];[b][p]paletteuse" ${outputWebpPath}`,
          (error) => {
            if (error) {
              console.error(error);
              return reject(error);
            }
            resolve();
          }
        );
      });

      console.log("Enviando sticker animado...");
      await sendSuccessReact();
      await sendStickerFromFile(outputWebpPath);

      fs.unlinkSync(tempGifPath);
      fs.unlinkSync(outputWebpPath);

    } catch (error) {
      console.error("Error en progressbar:", error);
      await sendErrorReply("Hubo un error al crear el sticker de la barra de progreso.");
      try {
        if (fs.existsSync(tempGifPath)) fs.unlinkSync(tempGifPath);
        if (fs.existsSync(outputWebpPath)) fs.unlinkSync(outputWebpPath);
      } catch (e) {}
    }
  },
};