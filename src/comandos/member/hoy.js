const { PREFIX } = require("../../krampus");
const axios = require("axios");
const cheerio = require("cheerio");
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

      // URL de la página de actores de IAFD
      const url = "https://www.iafd.com/actors.asp";

      // Realizar el scraping de la página
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      // Obtener los enlaces de los perfiles de actrices
      const actressLinks = [];
      $("a.actor_link").each((i, element) => {
        const link = $(element).attr("href");
        if (link) {
          actressLinks.push(link);
        }
      });

      // Elegir una actriz al azar
      const randomIndex = random.int(0, actressLinks.length - 1);
      const randomActressLink = actressLinks[randomIndex];

      // Construir la URL completa del perfil de la actriz
      const actressUrl = `https://www.iafd.com/${randomActressLink}`;

      // Obtener detalles del perfil de la actriz
      const actressPage = await axios.get(actressUrl);
      const $$ = cheerio.load(actressPage.data);

      // Obtener el nombre de la actriz y la lista de películas
      const actressName = $$("h1.actor_name").text().trim();
      const moviesList = [];
      $$("div.filmography a").each((i, element) => {
        const movie = $$(element).text().trim();
        if (movie) {
          moviesList.push(movie);
        }
      });

      if (moviesList.length === 0) {
        await sendReply("❌ No se encontró información sobre las películas de esta actriz.", { quoted: webMessage });
        return;
      }

      const movieRecommendation = moviesList.length > 0 ? moviesList[0] : "No disponible";

      // Crear mensaje de recomendación
      const message = `🌟 Hoy te recomendamos a: *${actressName}* 🎬
      
      📽️ Primera película recomendada: *${movieRecommendation}*`;

      // Enviar el mensaje con la recomendación
      await sendReply(message, { quoted: webMessage });

    } catch (error) {
      console.error("Error al obtener la recomendación:", error);
      await sendReply("❌ Hubo un error al obtener la recomendación.", { quoted: webMessage });
    }
  },
};