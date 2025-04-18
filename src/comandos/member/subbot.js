const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");

const AUTH_DIR = path.resolve(__dirname, "../../assets/auth");

module.exports = {
  name: "subkram-bots",
  description: "Lista los subbots conectados actualmente",
  commands: ["bots"],
  usage: `${PREFIX}subkram-bots`,

  handle: async ({ sendReply, sendWaitReact, sendErrorReply, sendSuccessReact }) => {
    try {
      await sendWaitReact();

      if (!fs.existsSync(AUTH_DIR)) {
        return await sendErrorReply("⚠️ No hay subbots registrados.");
      }

      const sessions = fs.readdirSync(AUTH_DIR).filter(name => fs.lstatSync(path.join(AUTH_DIR, name)).isDirectory());

      if (sessions.length === 0) {
        return await sendReply("🔍 No hay subbots conectados.");
      }

      const list = sessions.map((name, i) => `*${i+1}.* 📱 ${name}`).join("\n");

      await sendReply(`✅ Subbots conectados:\n\n${list}`);
      await sendSuccessReact();

    } catch (err) {
      console.error("❌ Error listando subbots:", err);
      await sendErrorReply("Error al listar los subbots.");
    }
  },
};
