const { Router } = require('express');
const RespuestaController = require('../controllers/respuestaController');

const router = Router();

router.post('/respuestas', RespuestaController.registrar);
router.get('/respuestas', RespuestaController.obtenerHistorialPorEstudiante);
router.get('/respuestas/evaluacion/:idModulo', RespuestaController.generarRetroalimentacionAgregada);

module.exports = router;
