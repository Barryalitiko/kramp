
const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");

const AUTH_DIR = path.resolve(__dirname, "../../assets/auth");

module.exports = {
  name: "subkram-clear",
  description: "Elimina una sesión de subbot o todas",
  commands: ["clear"],
  usage: `${PREFIX}subkram-clear <numero|all>`,

  handle: async ({ sendReply, sendWaitReact, sendErrorReply, sendSuccessReact, args }) => {
    const target = args[0];

    if (!target) return await sendErrorReply("⚠️ Debes indicar un número de subbot o `all`.");

    try {
      await sendWaitReact();

      if (!fs.existsSync(AUTH_DIR)) {
        return await sendErrorReply("⚠️ No hay subbots registrados.");
      }

      if (target === "all") {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        fs.mkdirSync(AUTH_DIR, { recursive: true });
        await sendReply("✅ Todas las sesiones de subbots han sido eliminadas.");
        return await sendSuccessReact();
      }

      const sessionPath = path.join(AUTH_DIR, target);

      if (!fs.existsSync(sessionPath)) {
        return await sendErrorReply("⚠️ No se encontró la sesión especificada.");
      }

      fs.rmSync(sessionPath, { recursive: true, force: true });
      await sendReply(`✅ La sesión del subbot *${target}* ha sido eliminada.`);
      await sendSuccessReact();

    } catch (err) {
      console.error("❌ Error eliminando sesión:", err);
      await sendErrorReply("Hubo un error al intentar eliminar la sesión.");
    }
  },
};
