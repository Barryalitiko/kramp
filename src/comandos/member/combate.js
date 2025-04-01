const { PREFIX } = require("../../krampus");
const path = require("path");
const fs = require("fs");

module.exports = {
  name: "combate",
  description: "Inicia una pelea automática entre dos jugadores",
  commands: ["pelea"],
  usage: `${PREFIX}pelea [@usuario]`,
  handle: async ({ sendReply, socket, remoteJid, webMessage }) => {
    let usuario1 = webMessage.key.participant;
    let mencionados = webMessage.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let usuario2 = mencionados.length > 0 ? mencionados[0] : null;

    if (!usuario2) return sendReply("⚠️ Debes mencionar a alguien para pelear.");
    if (usuario1 === usuario2) return sendReply("⚠️ No puedes pelear contra ti mismo.");

    // Cargar razas desde el archivo JSON
    const razasPath = path.resolve(process.cwd(), "assets/razas.json");
    const jugadoresPath = path.resolve(process.cwd(), "assets/jugadores.json");
    let razas = JSON.parse(fs.readFileSync(razasPath, "utf8"));
    let jugadores = fs.existsSync(jugadoresPath) ? JSON.parse(fs.readFileSync(jugadoresPath, "utf8")) : {};

    // Función para obtener la raza de un usuario
    const obtenerRaza = (usuario) => {
      if (!jugadores[usuario]) {
        let razaAleatoria = Object.keys(razas)[Math.floor(Math.random() * Object.keys(razas).length)];
        jugadores[usuario] = { raza: razaAleatoria, HP: razas[razaAleatoria].HP, MP: 0, AM: 0 };
        fs.writeFileSync(jugadoresPath, JSON.stringify(jugadores, null, 2)); // Guardar la raza asignada al usuario
        return razaAleatoria;
      }
      return jugadores[usuario].raza;
    };

    // Obtener las razas de los jugadores
    let raza1 = obtenerRaza(usuario1);
    let raza2 = obtenerRaza(usuario2);

    let stats = {
      [usuario1]: jugadores[usuario1],
      [usuario2]: jugadores[usuario2]
    };

    // Función para mostrar barras de MP y AM
    let barras = (value, symbol, emptySymbol, max = 10) => {
      let filled = Math.max(0, Math.min(max, Math.round((value / 100) * max)));
      return symbol.repeat(filled) + emptySymbol.repeat(max - filled);
    };

    let sentMessage = await sendReply(`⚔️ *¡Batalla iniciada!* ⚔️

👤 @${usuario1.split("@")[0]} (${raza1})
❤️ HP: ${stats[usuario1].HP}  
⚡ MP: ${barras(stats[usuario1].MP, "●", "○")}
✨ AM: ${barras(stats[usuario1].AM, "★", "☆")}

VS

👤 @${usuario2.split("@")[0]} (${raza2})
❤️ HP: ${stats[usuario2].HP}  
⚡ MP: ${barras(stats[usuario2].MP, "●", "○")}
✨ AM: ${barras(stats[usuario2].AM, "★", "☆")}

⏳ *Batalla en curso...*`, { mentions: [usuario1, usuario2] });

    // Ciclo de la batalla
    const combateInterval = setInterval(async () => {
      if (stats[usuario1].HP <= 0 || stats[usuario2].HP <= 0) {
        clearInterval(combateInterval);
        let ganador = stats[usuario1].HP > 0 ? usuario1 : usuario2;
        fs.writeFileSync(jugadoresPath, JSON.stringify(jugadores, null, 2));
        await socket.sendMessage(remoteJid, {
          edit: sentMessage.key,
          text: `⚔️ *¡Batalla finalizada!* ⚔️
🏆 *GANADOR:* @${ganador.split("@")[0]} con ${stats[ganador].HP} HP restante!`,
          mentions: [usuario1, usuario2]
        });
        return;
      }

      let atacante = Math.random() < 0.5 ? usuario1 : usuario2;
      let defensor = atacante === usuario1 ? usuario2 : usuario1;

      let dano = Math.floor(Math.random() * 20) + 10;
      stats[defensor].HP = Math.max(0, stats[defensor].HP - dano);

      // Incrementar MP y AM según la carga de la raza
      stats[atacante].MP = Math.min(100, stats[atacante].MP + razas[stats[atacante].raza]?.MP_carga || 0);
      stats[atacante].AM = Math.min(100, stats[atacante].AM + razas[stats[atacante].raza]?.AM_carga || 0);

      // Actualizar mensaje de batalla
      await socket.sendMessage(remoteJid, {
        edit: sentMessage.key,
        text: `⚔️ *¡Batalla en curso!* ⚔️

👤 @${usuario1.split("@")[0]} (${raza1})
❤️ HP: ${stats[usuario1].HP}  
⚡ MP: ${barras(stats[usuario1].MP, "●", "○")}
✨ AM: ${barras(stats[usuario1].AM, "★", "☆")}

VS

👤 @${usuario2.split("@")[0]} (${raza2})
❤️ HP: ${stats[usuario2].HP}  
⚡ MP: ${barras(stats[usuario2].MP, "●", "○")}
✨ AM: ${barras(stats[usuario2].AM, "★", "☆")}

⚔️ @${atacante.split("@")[0]} atacó a @${defensor.split("@")[0]} e hizo *${dano} de daño!*`,
        mentions: [usuario1, usuario2]
      });
    }, 3000);
  },
};
