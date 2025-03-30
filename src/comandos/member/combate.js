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

    // Rutas de archivos
    const razasPath = path.resolve(process.cwd(), "assets/razas.json");
    const jugadoresPath = path.resolve(process.cwd(), "assets/jugadores.json");

    // Cargar razas
    let razas = JSON.parse(fs.readFileSync(razasPath, "utf8"));
    
    // Cargar jugadores
    let jugadores = fs.existsSync(jugadoresPath) ? JSON.parse(fs.readFileSync(jugadoresPath, "utf8")) : {};

    // Función para obtener la raza del usuario y asignarla si no la tiene
    const obtenerRaza = (usuario) => {
      if (!jugadores[usuario]) {
        let razaAleatoria = Object.keys(razas)[Math.floor(Math.random() * Object.keys(razas).length)];
        jugadores[usuario] = { raza: razaAleatoria, HP: razas[razaAleatoria].HP, MP: 0, AM: 0 };
      }
      return jugadores[usuario].raza;
    };

    // Asignar razas
    let raza1 = obtenerRaza(usuario1);
    let raza2 = obtenerRaza(usuario2);

    // Cargar estado de los jugadores
    let stats = {
      [usuario1]: jugadores[usuario1],
      [usuario2]: jugadores[usuario2]
    };

    // Función para generar las barras de estado
    let barras = (value, symbol, emptySymbol, max = 10) => {
      let filled = Math.max(0, Math.min(max, Math.round((value / 100) * max)));
      return symbol.repeat(filled) + emptySymbol.repeat(max - filled);
    };

    // Mensaje inicial
    let sentMessage = await sendReply(`⚔️ *¡Batalla iniciada!* ⚔️
👤 @${usuario1.split("@")[0]} (${raza1}) vs 👤 @${usuario2.split("@")[0]} (${raza2})

💥 HP:
${barras(stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP}%)
${barras(stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP}%)

⚡ MP:
${barras(stats[usuario1].MP, "●", "○")} (${stats[usuario1].MP}%)
${barras(stats[usuario2].MP, "●", "○")} (${stats[usuario2].MP}%)

✨ Ataque Mágico:
${barras(stats[usuario1].AM, "★", "☆")} (${stats[usuario1].AM}%)
${barras(stats[usuario2].AM, "★", "☆")} (${stats[usuario2].AM}%)

⏳ *Batalla en curso...*`, { mentions: [usuario1, usuario2] }
    );

    // Ciclo de combate
    while (stats[usuario1].HP > 0 && stats[usuario2].HP > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      let atacante = Math.random() < 0.5 ? usuario1 : usuario2;
      let defensor = atacante === usuario1 ? usuario2 : usuario1;

      let dano = Math.floor(Math.random() * 20) + 10;
      stats[defensor].HP = Math.max(0, stats[defensor].HP - dano);

      // Incrementar MP y AM según la carga de la raza
      stats[atacante].MP = (stats[atacante].MP + razas[stats[atacante].raza].MP_carga) % 101;
      stats[atacante].AM = (stats[atacante].AM + razas[stats[atacante].raza].AM_carga) % 101;

      // Guardar estado actualizado
      fs.writeFileSync(jugadoresPath, JSON.stringify(jugadores, null, 2));

      await socket.sendMessage(remoteJid, {
        edit: sentMessage.key,
        text: `⚔️ *¡Batalla en curso!* ⚔️
👤 @${usuario1.split("@")[0]} (${raza1}) vs 👤 @${usuario2.split("@")[0]} (${raza2})

💥 HP:
${barras(stats[usuario1].HP, "■", "▢")} (${stats[usuario1].HP}%)
${barras(stats[usuario2].HP, "■", "▢")} (${stats[usuario2].HP}%)

⚡ MP:
${barras(stats[usuario1].MP, "●", "○")} (${stats[usuario1].MP}%)
${barras(stats[usuario2].MP, "●", "○")} (${stats[usuario2].MP}%)

✨ Ataque Mágico:
${barras(stats[usuario1].AM, "★", "☆")} (${stats[usuario1].AM}%)
${barras(stats[usuario2].AM, "★", "☆")} (${stats[usuario2].AM}%)

⚔️ @${atacante.split("@")[0]} atacó a @${defensor.split("@")[0]} e hizo *${dano} de daño!*`,
        mentions: [usuario1, usuario2]
      });
    }

    // Determinar el ganador
    let ganador = stats[usuario1].HP > 0 ? usuario1 : usuario2;

    // Restaurar HP solo al ganador
    stats[ganador].HP = razas[stats[ganador].raza].HP;

    // Guardar estado final
    fs.writeFileSync(jugadoresPath, JSON.stringify(jugadores, null, 2));

    await socket.sendMessage(remoteJid, {
      edit: sentMessage.key,
      text: `⚔️ *¡Batalla finalizada!* ⚔️
🏆 *GANADOR:* @${ganador.split("@")[0]} con ${stats[ganador].HP}% de vida restaurada!`,
      mentions: [usuario1, usuario2]
    });
  },
};
