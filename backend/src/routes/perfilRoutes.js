const { Router } = require('express');
const PerfilController = require('../controllers/perfilController');

const router = Router();

router.get('/perfil', PerfilController.verPerfil);

module.exports = router;
