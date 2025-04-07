const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "subkram",
  description: "Genera el código de emparejamiento del subbot",
  commands: ["subkram"],
  usage: `${PREFIX}subkram <numero>`,
  handle: async ({
    webMessage,
    args,
    sendWaitReact,
    sendErrorReply,
    sendSuccessReact,
  }) => {
    const number = args[0]; // El número del subbot

    if (!number) {
      return await sendErrorReply("Debes proporcionar un número de subbot.");
    }

    try {
      await sendWaitReact();
      console.log(`Recibiendo número para el subbot: ${number}`);

      // Crear la ruta al directorio temp
      const tempDirPath = path.resolve(__dirname, '..', 'temp');
      
      // Crear el directorio si no existe
      if (!fs.existsSync(tempDirPath)) {
        fs.mkdirSync(tempDirPath, { recursive: true });
      }

      // Guardar el número en el archivo temporal
      const tempFilePath = path.resolve(tempDirPath, 'number.txt');
      fs.writeFileSync(tempFilePath, number, 'utf8');

      console.log("Número guardado en el archivo 'number.txt' en el directorio 'temp'.");

      sendSuccessReact();

    } catch (error) {
      console.error("Error al intentar guardar el número:", error);
      await sendErrorReply("Hubo un error al intentar guardar el número.");
    }
  },
};
