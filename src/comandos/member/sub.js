const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const fs = require("fs");
const path = require("path");

// RUTA ABSOLUTA COMPARTIDA
const TEMP_DIR = path.resolve("/c/Users/tioba/subkram/temp");

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
    const number = args[0];
    if (!number) return await sendErrorReply("Debes proporcionar un número de subbot.");

    try {
      await sendWaitReact();
      console.log(`📨 Recibiendo número para el subbot: ${number}`);

      const numberPath = path.join(TEMP_DIR, "number.txt");
      const pairingCodePath = path.join(TEMP_DIR, "pairing_code.txt");

      // Validamos que la carpeta temp del subbot exista
      if (!fs.existsSync(TEMP_DIR)) {
        return await sendErrorReply("⚠️ La carpeta temporal del subbot no existe.");
      }

      // Si ya hay un código generado, lo enviamos
      if (fs.existsSync(pairingCodePath)) {
        const pairingCode = fs.readFileSync(pairingCodePath, "utf8").trim();
        if (pairingCode) {
          await sendReply(`✅ Ya tienes un código de emparejamiento generado:\n\n*${pairingCode}*`);
          fs.writeFileSync(pairingCodePath, "", "utf8");
          fs.rmSync(TEMP_DIR, { recursive: true, force: true });
          return await sendSuccessReact();
        }
      }

      // Guardamos el número para que lo lea el subbot
      fs.writeFileSync(numberPath, number, "utf8");
      console.log("💾 Número guardado en el archivo temporal del subbot.");

      // Esperamos a que el subbot genere pairing_code.txt
      for (let i = 0; i < 30; i++) {
        if (fs.existsSync(pairingCodePath)) {
          const pairingCode = fs.readFileSync(pairingCodePath, "utf8").trim();
          if (pairingCode) {
            await sendReply(`✅ Tu código de emparejamiento es:\n\n*${pairingCode}*`);
            fs.writeFileSync(pairingCodePath, "", "utf8");
            fs.rmSync(TEMP_DIR, { recursive: true, force: true });
            return await sendSuccessReact();
          }
        }
        await new Promise((r) => setTimeout(r, 1000));
      }

      await sendErrorReply("⏰ No se pudo obtener el código de emparejamiento a tiempo.");
    } catch (error) {
      console.error("❌ Error en subkram:", error);
      await sendErrorReply("Hubo un error al intentar generar el código de emparejamiento.");
    }
  },
};
