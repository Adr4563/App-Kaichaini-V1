const { Router } = require('express');
const ClaseController = require('../controllers/claseController');

const router = Router();

router.post('/clases/validar-codigo', ClaseController.buscarPorCodigo);
router.post('/clases/unirse', ClaseController.unirse);
router.post('/clases/abandonar', ClaseController.abandonar);
router.get('/clases/listar', ClaseController.listarPorDocente);
router.get('/clases/mis-clases', ClaseController.listarPorDocente);
router.get('/clases/:id/estudiantes', ClaseController.contarEstudiantes);
router.get('/clases/:id', ClaseController.obtenerPorId);
router.post('/clases', ClaseController.registrarConModulos);
router.put('/clases/:id', ClaseController.actualizar);
router.delete('/clases/:id', ClaseController.eliminar);

module.exports = router;
