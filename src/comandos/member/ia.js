const { PREFIX } = require("../../krampus");
const axios = require("axios");

module.exports = {
  name: "ia",
  description: "Habla con una IA local usando llama-api",
  commands: ["ia", "ask", "chat"],
  usage: `${PREFIX}ia <mensaje>`,

  handle: async ({
    sendReply,
    args,
    sendWaitReact,
    sendSuccessReact,
    webMessage,
  }) => {
    try {
      const userMessage = args.join(" ");
      if (!userMessage) {
        await sendReply("❌ Escribe algo para preguntarle a la IA.");
        return;
      }

      await sendWaitReact("🤖");

      // Estructura del mensaje esperada por llama-api
      const payload = {
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: userMessage },
        ],
        model: "open_llama_3b_v2_gguf"
      };

      const response = await axios.post("http://192.168.1.160:8000/chat", payload);
      const replyText = response.data?.content;

      if (!replyText) {
        await sendReply("❌ La IA no respondió. Intenta de nuevo.");
        return;
      }

      await sendSuccessReact("✅");
      await sendReply(`💬 *Respuesta IA:*\n${replyText}`);
    } catch (err) {
      console.error("❌ Error al consultar la IA:", err.message);
      await sendReply("❌ Ocurrió un error al hablar con la IA.");
    }
  },
};
