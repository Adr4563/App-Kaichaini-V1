const { Router } = require('express');
const AuthController = require('../controllers/authController');

const router = Router();

router.post('/auth/register', AuthController.registrar);
router.post('/auth/login', AuthController.iniciarSesion);
router.post('/auth/login-docente', AuthController.iniciarSesionDocente);
router.put('/auth/perfil', AuthController.personalizarPerfil);
router.post('/auth/cambiar-contrasena', AuthController.cambiarContrasena);
router.post('/auth/forgot-password', AuthController.olvideContrasena);
router.post('/auth/reset-password', AuthController.restablecerContrasena);
// H.U. 317 - Cierre de sesion del docente
router.post('/auth/logout', AuthController.cerrarSesion);

module.exports = router;
