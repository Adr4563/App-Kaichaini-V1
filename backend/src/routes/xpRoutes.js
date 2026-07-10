const { Router } = require('express');
const XPController = require('../controllers/xpController');

const router = Router();

router.get('/xp', XPController.calcularTotal);
router.get('/xp/clase/:idClase', XPController.obtenerXPPorCurso);

module.exports = router;
