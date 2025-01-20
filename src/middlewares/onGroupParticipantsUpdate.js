const fs = require("fs");
const { onlyNumbers } = require("../utils");
const { getWelcomeMode } = require("../utils/database");
const { warningLog } = require("../utils/logger");

exports.onGroupParticipantsUpdate = async ({
  groupParticipantsUpdate,
  socket,
}) => {
  const remoteJid = groupParticipantsUpdate.id;
  const userJid = groupParticipantsUpdate.participants[0];

  // Obtener el modo de bienvenida
  const welcomeMode = getWelcomeMode(remoteJid);

  // Si el modo de bienvenida es 0, está desactivado
  if (welcomeMode === "0") {
    return;
  }

  // Cuando alguien se une al grupo
  if (groupParticipantsUpdate.action === "add") {
    try {
      let buffer = null;

      // Si el modo es 1 (con foto), obtenemos la imagen de perfil
      if (welcomeMode === "1") {
        try {
          const profilePictureUrl = await socket.profilePictureUrl(userJid, "image");
          const response = await fetch(profilePictureUrl);
          buffer = await response.buffer();
        } catch {
          warningLog(
            "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 No se pudo obtener la foto de perfil, usando imagen predeterminada"
          );
          buffer = null; // Puede manejarse un buffer predeterminado si es necesario
        }
      }

      // Crear el mensaje de bienvenida
      const welcomeMessage = ` ¡𝗕𝗶𝗲𝗻𝘃𝗲𝗻𝗶𝗱@ 𝗮𝗹 𝗴𝗿𝘂𝗽𝗼!
@${onlyNumbers(userJid)}
𝘗𝘳𝘦𝘴𝘦𝘯𝘵𝘢𝘵𝘦 ᶜᵒⁿ 𝐟𝐨𝐭𝐨 y 𝐧𝐨𝐦𝐛𝐫𝐞 


> Bot by Krampus OM
Oᴘᴇʀᴀᴄɪᴏɴ Mᴀʀsʜᴀʟʟ ༴༎𝙾𝙼༎
> https://t.me/krampusiano`;

      // Enviar mensaje según el modo
      if (welcomeMode === "1" && buffer) {
        await socket.sendMessage(remoteJid, {
          image: buffer,
          caption: welcomeMessage,
          mentions: [userJid],
        });
      } else if (welcomeMode === "2") {
        await socket.sendMessage(remoteJid, {
          text: welcomeMessage,
          mentions: [userJid],
        });
      }
    } catch (error) {
      warningLog(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 No se pudo enviar el mensaje de bienvenida",
        error
      );
    }
  }
};