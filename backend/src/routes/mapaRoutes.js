const { Router } = require('express');
const MapaController = require('../controllers/mapaController');

const router = Router();

router.get('/mapa', MapaController.getMapaCompleto);
router.get('/mapa/clase/:idClase/bimestre/:bimestre', MapaController.getMapaClaseByBimestre);

module.exports = router;
