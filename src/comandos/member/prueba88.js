const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");

module.exports = {
  name: "prueba",
  description: "Envía un mensaje con cada uno de los elementos mencionados anteriormente.",
  commands: ["4343"],
  usage: `${PREFIX}prueba`,
  handle: async ({ args, sendReply, sendImage, sendVideo, remoteJid }) => {
    try {
      console.log("Iniciando comando prueba...");
      await sendReply("Iniciando comando prueba...");

      // Envía un mensaje con texto
      await sendReply("¡Hola! Soy un bot.");
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Envía un mensaje con enlace
      await sendReply("Puedo enviar mensajes con enlaces: https:                    
      await new Promise(resolve => setTimeout(resolve, 10000));

                                      
      await sendReply(`
        Puedo enviar mensajes con código:
        \`\`\`javascript
        console.log('¡Hola, mundo!');
        \`\`\`
      `);
      await new Promise(resolve => setTimeout(resolve, 10000));

                                     
      await sendImage("//www.ejemplo.com");
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Envía un mensaje con código
      await sendReply(`
        Puedo enviar mensajes con código:
        \`\`\`javascript
        console.log('¡Hola, mundo!');
        \`\`\`
      `);
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Envía un mensaje con imagen
      await sendImage("https://www.ejemplo.com/imagen.jpg", "Imagen de ejemplo", remoteJid);
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Envía un mensaje con tabla
      await sendReply(`
        Puedo enviar mensajes con tablas:
        | Columna 1 | Columna 2 |
        |-----------|-----------|
        | Valor 1   | Valor 2   |
        | Valor 3   | Valor 4   |
      `);
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Envía un mensaje con lista
      await sendReply(`
        Puedo enviar mensajes con listas:
        - Elemento 1
        - Elemento 2
        - Elemento 3
      `);
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Envía un mensaje con estilo
      await sendReply(`
        **¡Hola!**
        _Soy un bot._
        Puedo enviar mensajes con estilos.
      `);
      await new Promise(resolve => setTimeout(resolve, 10000));

      console.log("Comando prueba completado.");
      await sendReply("Comando prueba completado.");
    } catch (error) {
      console.error("Error al enviar mensajes:", error);
      await sendReply("Error al enviar mensajes.");
    }
  },
};