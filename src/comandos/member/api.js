const { PREFIX } = require("../../krampus");

module.exports = {
  name: "prueba-api",
  description: "Realizar una prueba de la API de LLaMA",
  commands: ["prueba-api", "test-api"],
  usage: `${PREFIX}prueba-api`,
  handle: async ({ sendReply, args }) => {
    try {
      const url = "http://0.0.0.0:8000/api/prueba";
      const datos = { mensaje: "Hola, API de LLaMA!" };
      const respuesta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      const resultado = await respuesta.json();
      await sendReply(`La API respondió: ${resultado.mensaje}`);
    } catch (error) {
      console.error("Error al probar la API:", error);
      await sendReply("❌ Hubo un error al probar la API.");
    }
  },
};