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

      // Crear la ruta al directorio temp en el subbot
      const subbotTempDirPath = path.resolve('C:/Users/tioba/subkram/src/comandos/temp');
      
      // Crear el directorio si no existe
      if (!fs.existsSync(subbotTempDirPath)) {
        fs.mkdirSync(subbotTempDirPath, { recursive: true });
      }

      // Guardar el número en el archivo temporal dentro de la ruta del subbot
      const subbotTempFilePath = path.resolve(subbotTempDirPath, 'number.txt');
      fs.writeFileSync(subbotTempFilePath, number, 'utf8');

      console.log("Número guardado en el archivo temporal.");

      // Ahora ejecutamos el subbot de la manera habitual
      sendSuccessReact();

    } catch (error) {
      console.error("Error al intentar guardar el número en el archivo:", error);
      await sendErrorReply("Hubo un error al intentar guardar el número para el subbot.");
    }
  },
};
