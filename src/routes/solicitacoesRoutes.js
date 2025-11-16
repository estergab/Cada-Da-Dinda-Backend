const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const {
  createSolicitacao,
  getSolicitacoes,
  getSolicitacoesByEmail,
  getSolicitacoesByLar,
  getSolicitacaoById,
  updateSolicitacao,
  deleteSolicitacao,
  aceitarSolicitacao,
  negarSolicitacao,
  checkTutorEmail,
  authenticateTutor
} = require('../controllers/solicitacoesController');

// ✅ NOVAS ROTAS DE AUTENTICAÇÃO (SEM VALIDAÇÃO)
router.get('/check-tutor-email/:email', checkTutorEmail);
router.post('/authenticate-tutor', authenticateTutor);

// ✅ CRIAR SOLICITAÇÃO - SEM VALIDAÇÃO porque usa FormData
router.post('/', upload.single('petImage'), createSolicitacao);

// Rotas de consulta
router.get('/', getSolicitacoes);
router.get('/email/:email', getSolicitacoesByEmail);
router.get('/lar/:homeId', getSolicitacoesByLar);
router.get('/:id', getSolicitacaoById);

// Rotas de atualização
router.put('/:id', updateSolicitacao);
router.delete('/:id', deleteSolicitacao);

// Rotas de aprovação/rejeição
router.patch('/:id/aceitar', aceitarSolicitacao);
router.patch('/:id/negar', negarSolicitacao);

module.exports = router;
