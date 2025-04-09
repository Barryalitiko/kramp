const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "subkram",
  description: "Genera el código de emparejamiento del subbot",
  commands: ["subkram"],
  usage: `${PREFIX}subkram <numero>`,
  handle: async ({
    sendReply,
    sendWaitReact,
    sendErrorReply,
    sendSuccessReact,
    args,
  }) => {
    const number = args[0]; // El número del subbot

    if (!number) {
      return await sendErrorReply("Debes proporcionar un número de subbot.");
    }

    try {
      await sendWaitReact();
      console.log(`Recibiendo número para el subbot: ${number}`);

      // Ruta al subbot
      const subbotTempDirPath = path.resolve("C:/Users/tioba/subkram/src/comandos/temp");
      const subbotTempFilePath = path.resolve(subbotTempDirPath, "number.txt");
      const pairingCodePath = path.resolve(subbotTempDirPath, "pairing_code.txt");

      // Crear directorio si no existe
      if (!fs.existsSync(subbotTempDirPath)) {
        fs.mkdirSync(subbotTempDirPath, { recursive: true });
      }

      // Si ya existe un pairing code, se responde y no se genera uno nuevo
      if (fs.existsSync(pairingCodePath)) {
        const pairingCode = fs.readFileSync(pairingCodePath, "utf8").trim();
        await sendReply(`✅ Ya tienes un código de emparejamiento generado:\n\n*${pairingCode}*`);
        
        // Limpiar pairing code después de enviarlo
        fs.writeFileSync(pairingCodePath, "", "utf8");
        return await sendSuccessReact();
      }

      // Guardar el número en number.txt
      fs.writeFileSync(subbotTempFilePath, number, "utf8");
      console.log("Número guardado en el archivo temporal.");

      // Esperar a que aparezca el código de emparejamiento
      for (let i = 0; i < 30; i++) { // Máximo 30 segundos
        if (fs.existsSync(pairingCodePath)) break;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Leer y enviar el código si existe
      if (fs.existsSync(pairingCodePath)) {
        const pairingCode = fs.readFileSync(pairingCodePath, "utf8").trim();
        await sendReply(`✅ Tu código de emparejamiento es:\n\n*${pairingCode}*`);
        
        // 🔥 Limpiar pairing code después de enviarlo
        fs.writeFileSync(pairingCodePath, "", "utf8");

        await sendSuccessReact();
      } else {
        await sendErrorReply("No se pudo obtener el código de emparejamiento a tiempo.");
      }
    } catch (error) {
      console.error("Error en subkram:", error);
      await sendErrorReply("Hubo un error al intentar generar el código de emparejamiento.");
    }
  },
};
