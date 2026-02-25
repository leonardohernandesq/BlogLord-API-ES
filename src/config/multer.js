const multer = require('multer');

// Usa memória para armazenar os arquivos como buffer (necessário para Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite: 5MB
  fileFilter: (req, file, cb) => {
    // Aceita apenas imagens
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/webp'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos .jpeg, .png ou .webp são permitidos!'), false);
    }
  }
});

module.exports = upload;
