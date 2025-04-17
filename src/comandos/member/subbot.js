const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");

const TEMP_DIR = path.resolve("C:\\Users\\tioba\\subkram\\temp");

module.exports = {
  name: "bots",
  description: "Verifica los bots conectados y permite desconectarlos.",
  commands: ["bots"],
  usage: `${PREFIX}bots [desconectar]`,

  handle: async ({ sendReply, args, sendSuccessReact, sendErrorReply }) => {
    const connectedPath = path.join(TEMP_DIR, "connected.json");

    if (args[0] === "desconectar") {
      if (fs.existsSync(connectedPath)) {
        fs.unlinkSync(connectedPath);
        await sendReply("✅ Bot desconectado correctamente.");
      } else {
        await sendErrorReply("⚠️ No hay ningún bot conectado.");
      }
      return await sendSuccessReact();
    }

    if (fs.existsSync(connectedPath)) {
      const data = JSON.parse(fs.readFileSync(connectedPath, "utf8"));
      await sendReply(`🤖 Bot conectado:\n\n📱 *Número:* ${data.number}`);
    } else {
      await sendReply("❌ No hay ningún bot conectado actualmente.");
    }

    await sendSuccessReact();
  },
};
