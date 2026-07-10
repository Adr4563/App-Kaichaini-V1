const { Router } = require('express');
const EjercicioController = require('../controllers/ejercicioController');

const router = Router();

router.get('/ejercicios', EjercicioController.obtenerListaEjerciciosPorModulo);
router.get('/ejercicios/:id', EjercicioController.obtenerPorId);
router.post('/ejercicios/clic-numero', EjercicioController.crearClicNumero);
router.post('/ejercicios/seleccion-multiple', EjercicioController.crearSeleccionMultiple);
router.put('/ejercicios/:id', EjercicioController.actualizar);
router.delete('/ejercicios/:id', EjercicioController.eliminar);

module.exports = router;
