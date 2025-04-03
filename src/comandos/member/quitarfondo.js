const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const { removeBackground } = require("rembg-node"); // Usamos la función removeBackground
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "quitarfondo",
  description: "Elimina el fondo de una imagen",
  commands: ["quitarfondo", "nofondo"],
  usage: `${PREFIX}quitarfondo (responder a imagen)`,
  handle: async ({
    webMessage,
    isReply,
    isImage,
    downloadImage,
    sendImageFromFile,
    sendErrorReply,
    sendWaitReact,
    sendSuccessReact,
  }) => {
    if (!isReply || !isImage) {
      throw new WarningError("Debes responder a una imagen para quitarle el fondo.");
    }

    await sendWaitReact();

    try {
      const imagePath = await downloadImage(webMessage, "temp_image");
      const outputPath = path.join(__dirname, "temp_image_nobg.png");

      await removeBackground({ // Usamos removeBackground directamente
        input: imagePath,
        output: outputPath,
      });

      await sendSuccessReact();
      await sendImageFromFile(outputPath, "Aquí tienes tu imagen sin fondo.");

      fs.unlinkSync(imagePath);
      fs.unlinkSync(outputPath);
    } catch (error) {
      console.error("Error al quitar el fondo:", error);
      await sendErrorReply("Hubo un error al quitar el fondo de la imagen.");
    }
  },
};
