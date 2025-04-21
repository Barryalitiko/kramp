const { PREFIX } = require("../../krampus");
const puppeteer = require("puppeteer");
const random = require("random");

module.exports = {
  name: "hoy",
  description: "Recomienda una actriz de contenido para adultos al azar",
  commands: ["hoy", "recomendar", "actriz", "sugerir"],
  usage: `${PREFIX}hoy`,
  handle: async ({
    socket,
    remoteJid,
    sendReply,
    sendWaitReact,
    webMessage,
    sendMessage,
  }) => {
    try {
      await sendWaitReact("⏳");

      // Lanzar el navegador
      const browser = await puppeteer.launch({
        headless: true, 
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      });
      const page = await browser.newPage();

      // Ir a la página de actrices
      const url = "https://www.iafd.com/actors.asp";
      await page.goto(url, { waitUntil: "domcontentloaded" });

      // Extraer los enlaces de las actrices
      const actressLinks = await page.$$eval("a.actor_link", links =>
        links.map(link => link.getAttribute("href"))
      );

      if (actressLinks.length === 0) {
        await browser.close();
        await sendReply("❌ No se encontraron actrices disponibles.", { quoted: webMessage });
        return;
      }

      // Elegir una actriz al azar
      const randomIndex = random.int(0, actressLinks.length - 1);
      const randomActressLink = actressLinks[randomIndex];
      const actressUrl = `https://www.iafd.com/${randomActressLink}`;

      // Navegar al perfil de la actriz
      await page.goto(actressUrl, { waitUntil: "domcontentloaded" });

      // Obtener el nombre de la actriz
      const actressName = await page.$eval("h1.actor_name", el => el.innerText.trim());

      // Obtener las películas
      const moviesList = await page.$$eval("div.filmography a", elements =>
        elements.map(el => el.innerText.trim()).filter(txt => txt.length > 0)
      );

      await browser.close();

      if (moviesList.length === 0) {
        await sendReply(`❌ No se encontró información sobre las películas de *${actressName}*.`, { quoted: webMessage });
        return;
      }

      const movieRecommendation = moviesList[0];

      // Crear mensaje de recomendación
      const message = `🌟 Hoy te recomendamos a: *${actressName}* 🎬
      
📽️ Primera película recomendada: *${movieRecommendation}*`;

      await sendReply(message, { quoted: webMessage });

    } catch (error) {
      console.error("Error al obtener la recomendación:", error);
      await sendReply("❌ Hubo un error al obtener la recomendación.", { quoted: webMessage });
    }
  },
};
