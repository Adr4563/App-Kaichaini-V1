const { Router } = require('express');
const ProgresoController = require('../controllers/progresoController');

const router = Router();

router.get('/progreso/modulo/:idModulo', ProgresoController.obtenerProgresoEstudiante);
router.get('/progreso/clase/:idClase', ProgresoController.getProgresoClase);

module.exports = router;
