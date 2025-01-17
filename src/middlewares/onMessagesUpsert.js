const { dynamicCommand } = require("../utils/dynamicCommand");
const { loadCommonFunctions } = require("../utils/loadCommonFunctions");
const { autoReactions } = require("../utils/autoReactions");

const spamTracker = {}; // Objeto para seguir los mensajes de los usuarios

exports.onMessagesUpsert = async ({ socket, messages }) => {
  // Verificamos si hay mensajes
  if (!messages.length) {
    return;
  }

  for (const webMessage of messages) {
    // Cargamos funciones comunes necesarias para procesar el mensaje
    const commonFunctions = loadCommonFunctions({ socket, webMessage });

    // Si no se obtienen funciones comunes, pasamos al siguiente mensaje
    if (!commonFunctions) {
      continue;
    }

    // Procesamos el comando dinámico usando las funciones comunes
    await dynamicCommand(commonFunctions);

    // Extraemos el texto del mensaje
    const messageText = webMessage.message?.conversation;
    const userJid = webMessage.key.participant || webMessage.key.remoteJid; // Detecta el usuario que envía el mensaje

    if (messageText) {
      // Verificamos las palabras clave para las reacciones automáticas
      for (const [keyword, emoji] of Object.entries(autoReactions)) {
        if (messageText.toLowerCase().includes(keyword)) {
          // Reaccionamos con el emoji correspondiente
          await socket.sendMessage(webMessage.key.remoteJid, {
            react: {
              text: emoji,
              key: webMessage.key,
            },
          });
          break;
        }
      }

      // Verificamos si el mensaje es repetido
      if (!spamTracker[userJid]) {
        spamTracker[userJid] = { count: 0, lastMessage: messageText };
      }

      // Si el mensaje es igual al anterior, incrementamos el contador
      if (spamTracker[userJid].lastMessage === messageText) {
        spamTracker[userJid].count++;

        // Si el usuario ha enviado el mismo mensaje 6 veces, le advertimos
        if (spamTracker[userJid].count === 6) {
          await socket.sendMessage(webMessage.key.remoteJid, {
            text: `🚨 ¡${userJid} ha enviado el mismo mensaje varias veces! Ten cuidado, serás baneado si repites este comportamiento. 🚨`,
          });
        }

        // Si envía el mismo mensaje 3 veces más (total 9), el bot lo saca del grupo
        if (spamTracker[userJid].count === 9) {
          await socket.groupRemove(webMessage.key.remoteJid, [userJid]);
          await socket.sendMessage(webMessage.key.remoteJid, {
            text: `🚫 ¡${userJid} ha sido baneado por spam! 🚫`,
          });
        }
      } else {
        // Si el mensaje es diferente, restablecemos el contador
        spamTracker[userJid] = { count: 1, lastMessage: messageText };
      }
    }
  }
};