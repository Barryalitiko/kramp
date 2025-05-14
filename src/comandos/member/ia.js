const { PREFIX } = require("../../krampus");
const axios = require("axios");

module.exports = {
  name: "cosogi",
  description: "Habla con una IA local usando Cosogi",
  commands: ["cosogi", "ia2", "localia"],
  usage: `${PREFIX}cosogi <mensaje>`,
  handle: async ({
    sendReply,
    args,
    sendWaitReact,
    webMessage
  }) => {
    const question = args.join(" ");
    if (!question) {
      return await sendReply("❌ Debes escribir algo para preguntarle a la IA.");
    }

    await sendWaitReact("💬");

    try {
      const response = await axios.post("http://192.168.1.160:8000/v1/chat/completions", {
        model: "llama-3.2-3b-q4_0",
        messages: [
          { role: "system", content: "Eres un asistente útil y conversador, responde de forma clara y precisa." },
          { role: "user", content: question }
        ]
      });

      const reply = response.data.choices?.[0]?.message?.content;

      if (!reply) {
        return await sendReply("❌ La IA no devolvió ninguna respuesta.");
      }

      await sendReply(`🤖 ${reply.trim()}`);
    } catch (err) {
      console.error("Error al consultar Cosogi:", err.message);
      await sendReply("❌ Error al contactar con la IA local.");
    }
  }
};
