const axios = require("axios");

module.exports = {
  name: "pregunta",
  description: "Haz una pregunta a la IA local",
  commands: ["pregunta", "ia", "ask"],
  usage: `${PREFIX}pregunta <texto>`,
  handle: async ({
    sendReply,
    args,
    sendWaitReact,
    webMessage
  }) => {
    const question = args.join(" ");
    if (!question) {
      return await sendReply("❌ Debes escribir una pregunta.");
    }

    await sendWaitReact("🤖");

    try {
      const response = await axios.post("http://192.168.1.160:8000/v1/chat/completions", {
        model: "open_llama_3b_v2_gguf",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: question }
        ]
      });

      const reply = response.data.choices?.[0]?.message?.content;

      if (!reply) {
        return await sendReply("❌ La IA no devolvió ninguna respuesta.");
      }

      await sendReply(`🤖 ${reply}`);
    } catch (err) {
      console.error("Error al consultar la IA:", err.message);
      await sendReply("❌ Error al contactar con la IA local.");
    }
  }
};
