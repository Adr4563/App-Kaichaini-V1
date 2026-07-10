const { Router } = require('express');
const ModuloController = require('../controllers/moduloController');

const router = Router();

router.get('/modulos', ModuloController.listarPorClase);
router.get('/modulos/listar', ModuloController.listarPorClaseYBimestre);
router.get('/modulos/:id', ModuloController.obtenerPorId);
router.post('/modulos/:idClase', ModuloController.crear);
router.put('/modulos/:id', ModuloController.actualizar);
router.delete('/modulos/:id', ModuloController.eliminar);

module.exports = router;
