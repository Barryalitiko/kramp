const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const fs = require("fs");
const axios = require("axios");
const { exec } = require("child_process");

module.exports = {
  name: "anime",
  description: "Convierte una imagen a estilo anime Ghibli",
  commands: ["anime"],
  usage: `${PREFIX}anime (responder a imagen)`,
  handle: async ({
    webMessage,
    isReply,
    isImage,
    isVideo,
    downloadImage,
    downloadMedia,
    sendImageFromFile,
    sendVideoFromFile,
    sendErrorReply,
    sendWaitReact,
    sendSuccessReact,
  }) => {
    if (!isReply || !isImage) {
      throw new WarningError("Debes responder a una imagen.");
    }

    await sendWaitReact();

    try {
      // Verificar si la API de Stable Diffusion está corriendo
      const isApiRunning = await checkApiStatus();
      
      if (!isApiRunning) {
        console.log("La API no está corriendo. Iniciando...");
        // Si la API no está corriendo, la iniciamos
        await startApi();
        // Esperar un momento para asegurarnos de que la API haya iniciado
        await new Promise((resolve) => setTimeout(resolve, 10 * 1000)); // Espera de 10 segundos
      }

      // Descargar la imagen
      const imagePath = await downloadImage(webMessage, "temp_anime_image.png");

      // Convertir la imagen a estilo Ghibli
      const imageData = fs.readFileSync(imagePath, { encoding: 'base64' });

      // Llamada a la API de Stable Diffusion (asumiendo que el servidor está en http://127.0.0.1:7860)
      const response = await axios.post('http://127.0.0.1:7860/sdapi/v1/img2img', {
        init_images: [`data:image/png;base64,${imageData}`],
        prompt: "anime style, studio ghibli character", // Aquí puedes cambiar el prompt si lo deseas
        steps: 30,
        cfg_scale: 8,
        denoising_strength: 0.6
      });

      const result = response.data.images[0];

      // Guardar la imagen convertida
      const outputPath = "temp_anime_converted_image.png";
      fs.writeFileSync(outputPath, result, 'base64');

      await sendSuccessReact();
      await sendImageFromFile(outputPath);

      fs.unlinkSync(imagePath);  // Eliminar la imagen original
      fs.unlinkSync(outputPath); // Eliminar la imagen procesada
    } catch (error) {
      console.error("Error en el comando anime:", error);
      await sendErrorReply("Hubo un error al convertir la imagen.");
    }
  },
};

// Función para verificar si la API está corriendo
async function checkApiStatus() {
  try {
    const response = await axios.get('http://127.0.0.1:7860/sdapi/v1/webui/version');
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// Función para iniciar el servidor de Stable Diffusion
function startApi() {
  return new Promise((resolve, reject) => {
    exec("python launch.py --api", { cwd: "path_to_stable_diffusion_webui_folder" }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al iniciar la API: ${stderr}`);
        reject(error);
      } else {
        console.log(`La API ha iniciado correctamente:\n${stdout}`);
        resolve();
      }
    });
  });
}
