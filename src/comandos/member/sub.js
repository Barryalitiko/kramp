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

      // Guardar el número en un archivo temporal
      const tempFilePath = path.resolve(__dirname, '..', 'temp', 'number.txt');
      fs.writeFileSync(tempFilePath, number, 'utf8');

      // Ejecuta el subbot y ejecuta 'npm start' automáticamente en el subbot
      const subbotProcess = spawn('npm', ['start'], {
        cwd: path.resolve('C:/Users/tioba/subkram') // Cambiar la ruta a la carpeta del subbot
      });

      subbotProcess.stdout.on('data', (data) => {
        console.log(`Subbot Output: ${data}`);
      });

      subbotProcess.stderr.on('data', (data) => {
        console.error(`Subbot Error: ${data}`);
      });

      subbotProcess.on('close', (code) => {
        if (code === 0) {
          console.log("Subbot emparejamiento completado.");
          sendSuccessReact();
        } else {
          sendErrorReply("Error al conectar con el subbot.");
        }
      });

    } catch (error) {
      console.error("Error al intentar iniciar el subbot:", error);
      await sendErrorReply("Hubo un error al intentar ejecutar el subbot.");
    }
  },
};
