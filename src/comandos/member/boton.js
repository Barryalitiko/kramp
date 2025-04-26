const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");

module.exports = {
  name: "botones",
  description: "Envía un mensaje con botones.",
  commands: ["botones"],
  usage: `${PREFIX}botones`,
  handle: async ({ msg, sendReply, sendButtons }) => {
    try {
      const botones = [
        {
          text: "Botón 1",
          id: "boton1",
        },
        {
          text: "Botón 2",
          id: "boton2",
        },
        {
          text: "Botón 3",
          id: "boton3",
        },
      ];

      const mensaje = "Este es un mensaje con botones.";
      await sendButtons(mensaje, botones);

      // Manejo de botones
      if (msg.buttonsResponse) {
        const botonId = msg.buttonsResponse.selectedButtonId;
        console.log(`Botón presionado: ${botonId}`);

        switch (botonId) {
          case "boton1":
            await sendReply("Botón 1 presionado.");
            break;
          case "boton2":
            await sendReply("Botón 2 presionado.");
            break;
          case "boton3":
            await sendReply("Botón 3 presionado.");
            break;
          default:
            await sendReply("Botón desconocido.");
        }
      }
    } catch (error) {
      console.error("Error al enviar mensaje con botones:", error);
    }
  },
};