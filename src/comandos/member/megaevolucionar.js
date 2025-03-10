const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const userItemsFilePath = path.resolve(process.cwd(), "assets/userItems.json");
const userPokemonsFilePath = path.resolve(process.cwd(), "assets/userPokemons.json");

const megaEvoluciones = {
  "charmander": ["mega_charizard_x", "mega_charizard_y"],
  "squirtle": "mega_blastoise",
  "abra": "mega_alakazam",
  "gastly": "mega_gengar",
  "slowpoke": "mega_slowbro",
  "magikarp": "mega_gyarados",
  "mareep": "mega_ampharos",
  "larvitar": "mega_tyranitar"
};

const gigaEvoluciones = {
  "bulbasaur": "gmax_venusaur",
  "eevee": "gmax_eevee",
  "pikachu": "gmax_pikachu"
};

const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return {};
  }
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

module.exports = {
  name: "megaevolucionar",
  description: "Mega Evoluciona tu Pokémon si tienes el objeto ⚡️.",
  commands: ["megaevolucionar"],
  usage: `${PREFIX}megaevolucionar <pokemon>`,
  handle: async ({ sendReply, args, userJid }) => {
    const pokemon = args[0]?.toLowerCase();
    if (!pokemon) {
      await sendReply(`❌ Debes especificar un Pokémon para megaevolucionar. Ejemplo: *${PREFIX}megaevolucionar charmander*`);
      return;
    }

    let userPokemons = readData(userPokemonsFilePath);
    let userItems = readData(userItemsFilePath);

    // Verificar si el usuario tiene el Pokémon
    if (!userPokemons[userJid] || !userPokemons[userJid].includes(pokemon)) {
      await sendReply(`❌ No tienes a *${pokemon}* en tu colección.`);
      return;
    }

    // Verificar si el usuario tiene el objeto ⚡️
    if (!userItems[userJid] || userItems[userJid].rayos <= 0) {
      await sendReply(`❌ No tienes ⚡️ para megaevolucionar. Consíguelo y vuelve a intentarlo.`);
      return;
    }

    // Verificar si el Pokémon puede megaevolucionar o gigamax
    if (!megaEvoluciones[pokemon] && !gigaEvoluciones[pokemon]) {
      await sendReply(`❌ *${pokemon}* no puede megaevolucionar ni gigamaxizar.`);
      return;
    }

    let evolucion = null;

    // Si es una megaevolución, elegir la megaevolución
    if (megaEvoluciones[pokemon]) {
      evolucion = megaEvoluciones[pokemon];
      if (Array.isArray(evolucion)) {
        evolucion = evolucion[Math.floor(Math.random() * evolucion.length)];
      }
    }

    // Si es una gigamax, asignar la gigamax
    if (gigaEvoluciones[pokemon]) {
      evolucion = gigaEvoluciones[pokemon];
    }

    // Realizar la evolución
    userPokemons[userJid] = userPokemons[userJid].filter(p => p !== pokemon);
    userPokemons[userJid].push(evolucion);

    // Consumir el objeto ⚡️
    userItems[userJid].rayos -= 1;

    // Guardar los cambios
    writeData(userPokemonsFilePath, userPokemons);
    writeData(userItemsFilePath, userItems);

    await sendReply(`⚡ ¡Increíble! *${pokemon}* ha evolucionado a *${evolucion}*! 💥🔥`);
  }
};