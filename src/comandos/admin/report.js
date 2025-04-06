const { PREFIX } = require("../../krampus");

module.exports = {
  name: "report",
  description: "Reporta a un número por spam, abuso, ilegal o fraude. También permite modo test.",
  commands: ["report"],
  usage: `${PREFIX}report <número> [spam|abuse|illegal|fraud|test]`,

  handle: async ({ args, sendReply, sendReact, client }) => {
    try {
      const rawNumber = args[0];
      const secondArg = args[1]?.toLowerCase() || "spam";

      const motivosValidos = ["spam", "abuse", "illegal", "fraud"];
      const isTestMode = secondArg === "test";

      if (!rawNumber) {
        await sendReply(`⚠️ Debes escribir un número.\n\nEjemplo:\n${PREFIX}report 123456789 spam\nO modo test:\n${PREFIX}report 123456789 test`);
        return;
      }

      const cleanNumber = rawNumber.replace(/\D/g, "");
      const jid = `${cleanNumber}@s.whatsapp.net`;

      if (isTestMode) {
        console.log(`\n--- 🧪 MODO TEST AUTOMÁTICO PARA ${jid} ---`);

        for (const motivo of motivosValidos) {
          console.log(`\n--- Motivo: ${motivo.toUpperCase()} ---`);
          console.log(`🔒 Bloqueando...`);
          await client.updateBlockStatus(jid, "block");

          console.log(`📣 Reportando por: ${motivo}`);
          await client.reportJid(jid, motivo);

          console.log(`🔓 Desbloqueando...`);
          await client.updateBlockStatus(jid, "unblock");

          console.log(`✅ Motivo ${motivo.toUpperCase()} completado.`);
        }

        await sendReact("✅");
        await sendReply(`✅ Test automático de reportes completado para +${cleanNumber}`);
        return;
      }

      // Modo normal
      if (!motivosValidos.includes(secondArg)) {
        await sendReply(`❌ Motivo inválido.\nUsa uno de estos:\n• spam\n• abuse\n• illegal\n• fraud\nO modo test:\n${PREFIX}report 123456789 test`);
        return;
      }

      console.log(`\n--- Reporte manual ---`);
      console.log(`Número: ${cleanNumber}`);
      console.log(`Motivo: ${secondArg}`);
      console.log(`JID: ${jid}`);

      console.log(`🔒 Bloqueando...`);
      await client.updateBlockStatus(jid, "block");

      console.log(`📣 Reportando por: ${secondArg}`);
      await client.reportJid(jid, secondArg);

      console.log(`🔓 Desbloqueando...`);
      await client.updateBlockStatus(jid, "unblock");

      console.log(`✅ Reporte completado para ${jid} con motivo "${secondArg}"`);

      await sendReact("✅");
      await sendReply(`✅ Usuario +${cleanNumber} ha sido reportado por *${secondArg}*.`);

    } catch (err) {
      console.error("❌ Error en el comando #report:", err);
      await sendReply(`❌ Error: ${err.message || err.toString()}`);
    }
  },
};
