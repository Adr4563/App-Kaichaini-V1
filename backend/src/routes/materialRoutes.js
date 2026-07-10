const { Router } = require('express');
const MaterialController = require('../controllers/materialController');

const router = Router();

router.get('/material', MaterialController.listarPorClaseYModulo);
router.get('/material/buscar', MaterialController.buscar);
router.post('/material', MaterialController.crear);
router.delete('/material/:id', MaterialController.eliminar);

module.exports = router;
