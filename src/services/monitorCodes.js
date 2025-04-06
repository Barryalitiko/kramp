const fs = require('fs');
const path = require('path');
const { sendReply } = require('./whatsappUtils');  // Asegúrate de tener la función para enviar el mensaje

// Ruta donde los subbots guardan los códigos (actualiza esta ruta más tarde)
const pendingCodesDir = path.resolve(__dirname, 'subbots', 'pending_codes');

// Monitoreamos la carpeta cada 5 segundos para ver si hay archivos nuevos
setInterval(() => {
  fs.readdir(pendingCodesDir, (err, files) => {
    if (err) {
      console.error("Error al leer la carpeta de códigos:", err);
      return;
    }

    // Procesamos cada archivo encontrado
    files.forEach(file => {
      const filePath = path.join(pendingCodesDir, file);

      // Leemos el contenido del archivo (código de emparejamiento)
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error("Error al leer el archivo:", err);
          return;
        }

        // Extraemos el código de emparejamiento
        const codeMatch = data.match(/Código de emparejamiento: (.*)/);
        if (codeMatch) {
          const code = codeMatch[1];

          // Enviar el código por WhatsApp (supongamos que tienes el número del usuario)
          const userPhone = '1234567890';  // Cambia esto por el número real del usuario que solicitó
          sendReply(userPhone, `Tu código de emparejamiento es: ${code}`);

          // Eliminamos el archivo después de enviarlo
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Error al eliminar el archivo:", err);
            } else {
              console.log(`Archivo ${file} procesado y eliminado.`);
            }
          });
        }
      });
    });
  });
}, 5000);  // Monitoreo cada 5 segundos
