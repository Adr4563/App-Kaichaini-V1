const { Router } = require('express');
const InsigniaController = require('../controllers/insigniaController');

const router = Router();

router.get('/insignias', InsigniaController.listar);
router.get('/insignias/mis-insignias', InsigniaController.listarPorEstudiante);

module.exports = router;
