const { Router } = require('express');
const SilaboController = require('../controllers/silaboController');

const router = Router();

router.get('/silabos/:idClase', SilaboController.visualizar);
router.put('/silabos/:idClase', SilaboController.actualizarContenido);

module.exports = router;
