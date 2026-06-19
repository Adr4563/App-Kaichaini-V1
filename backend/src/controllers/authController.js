const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Estudiante = require('../models/Estudiante');
const Docente = require('../models/Docente');
const Liga = require('../models/Liga');

const RESET_TOKEN_VIGENCIA_MS = 60 * 60 * 1000; // 1 hora

class AuthController {

  static async registrar(req, res) {
    try {
      const { nombre, correo, contrasena, rol, avatar, colegio } = req.body;

      if (!nombre || !correo || !contrasena || !rol) {
        return res.status(400).json({ success: false, message: 'nombre, correo, contrasena y rol son requeridos' });
      }

      if (rol !== 'Estudiante' && rol !== 'Docente') {
        return res.status(400).json({ success: false, message: 'Rol debe ser Estudiante o Docente' });
      }

      const usuarioExistente = await User.obtenerPorCorreo(correo);
      if (usuarioExistente) {
        return res.status(409).json({ success: false, message: 'El correo ya esta en uso' });
      }

      let usuario;

      if (rol === 'Estudiante') {
        const ligaInicial = await Liga.obtenerLigaPorPuntos(0);
        let idLiga = null;
        if (ligaInicial) {
          idLiga = ligaInicial.id;
        }
        usuario = await Estudiante.registrar({ nombre, correo, contrasena, avatar, colegio, idLiga });
        await User.inicializarXP(usuario.id);
      } else {
        usuario = await Docente.registrar({ nombre, correo, contrasena, avatar });
      }

      delete usuario.contrasena;

      res.status(201).json({ success: true, message: 'Usuario registrado exitosamente', data: usuario });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async iniciarSesion(req, res) {
    try {
      const { correo, contrasena } = req.body;

      if (!correo || !contrasena) {
        return res.status(400).json({ success: false, message: 'Correo y contrasena son requeridos' });
      }

      const usuario = await User.obtenerPorCorreo(correo);

      if (!usuario) {
        return res.status(401).json({ success: false, message: 'Credenciales invalidas' });
      }

      if (usuario.contrasena !== contrasena) {
        return res.status(401).json({ success: false, message: 'Credenciales invalidas' });
      }

      delete usuario.contrasena;

      res.status(200).json({ success: true, message: 'Login exitoso', data: { usuario: usuario } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async iniciarSesionDocente(req, res) {
    try {
      const { correo, contrasena } = req.body;

      if (!correo || !contrasena) {
        return res.status(400).json({ success: false, message: 'Correo y contrasena son requeridos' });
      }

      const usuario = await User.obtenerPorCorreo(correo);

      if (!usuario || usuario.contrasena !== contrasena || usuario.rol !== 'Docente') {
        return res.status(401).json({ success: false, message: 'Credenciales invalidas' });
      }

      delete usuario.contrasena;

      res.status(200).json({ success: true, message: 'Login exitoso', data: { usuario: usuario } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async personalizarPerfil(req, res) {
    try {
      const { idUsuario, nombre, avatar } = req.body;

      if (!idUsuario) {
        return res.status(400).json({ success: false, message: 'idUsuario requerido' });
      }

      const actualizado = await Estudiante.personalizarPerfil(idUsuario, { nombre, avatar });

      if (!actualizado) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      res.status(200).json({ success: true, message: 'Perfil actualizado', data: actualizado });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async cambiarContrasena(req, res) {
    try {
      const { idUsuario, currentPassword, newPassword } = req.body;

      if (!idUsuario || !currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'idUsuario, currentPassword y newPassword son requeridos' });
      }

      const usuario = await User.obtenerPorId(idUsuario);

      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      if (usuario.contrasena !== currentPassword) {
        return res.status(400).json({ success: false, message: 'Contrasena actual incorrecta' });
      }

      await User.actualizar(idUsuario, { contrasena: newPassword });

      res.status(200).json({ success: true, message: 'Contrasena actualizada exitosamente' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async olvideContrasena(req, res) {
    try {
      const { correo } = req.body;

      if (!correo) {
        return res.status(400).json({ success: false, message: 'correo es requerido' });
      }

      const usuario = await User.obtenerPorCorreo(correo);

      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      const token = uuidv4();
      const expira = new Date(Date.now() + RESET_TOKEN_VIGENCIA_MS);

      await User.guardarTokenRecuperacion(usuario.id, token, expira);

      res.status(200).json({
        success: true,
        message: 'Se ha enviado un enlace de recuperacion a tu correo',
        data: { token },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async restablecerContrasena(req, res) {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (!token || !newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'token, newPassword y confirmPassword son requeridos' });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Las contrasenas no coinciden' });
      }

      const usuario = await User.obtenerPorTokenRecuperacion(token);

      if (!usuario || new Date(usuario.resetPasswordExpires) < new Date()) {
        return res.status(400).json({ success: false, message: 'Token invalido o expirado' });
      }

      await User.restablecerContrasena(usuario.id, newPassword);

      res.status(200).json({ success: true, message: 'Contrasena restablecida exitosamente' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async cerrarSesion(req, res) {
    res.status(200).json({ success: true, message: 'Logout exitoso' });
  }
}

module.exports = AuthController;
