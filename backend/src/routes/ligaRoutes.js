const { Router } = require('express');
const LigaController = require('../controllers/ligaController');

const router = Router();

router.get('/ligas', LigaController.listarTodasConUmbrales);
router.get('/ligas/ranking', LigaController.obtenerRanking);
router.get('/ligas/:id', LigaController.obtenerPorId);

module.exports = router;
