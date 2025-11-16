const express = require('express');
const router = express.Router();
const {
  createLar,
  getLares,
  getLarById,
  getLarByEmail,
  updateLar,
  toggleActiveLar,
  deleteLar,
  checkEmail, // ✅ NOVO
  authenticateHost // ✅ NOVO
} = require('../controllers/laresController');
const upload = require('../config/multer');

// ✅ NOVAS ROTAS DE AUTENTICAÇÃO
router.get('/check-email/:email', checkEmail); // Verificar se email existe
router.post('/authenticate', authenticateHost); // Validar senha

router.post('/', upload.single('image'), createLar);
router.get('/', getLares);
router.get('/:id', getLarById);
router.get('/email/:email', getLarByEmail);
router.put('/:id', upload.single('image'), updateLar);
router.patch('/:id/toggle-active', toggleActiveLar);
router.delete('/:id', deleteLar);

module.exports = router;
