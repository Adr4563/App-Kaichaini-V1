const User = require('../models/User');
const XP = require('../models/XP');
const Liga = require('../models/Liga');
const Insignia = require('../models/Insignia');
const Clase = require('../models/Clase');

class PerfilController {

  static async verPerfil(req, res) {
    try {
      const { idUsuario } = req.query;

      if (!idUsuario) {
        return res.status(400).json({ success: false, message: 'idUsuario es requerido' });
      }

      const usuario = await User.obtenerPorId(idUsuario);

      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      const xp = await XP.calcularTotal(idUsuario);
      let xpTotal = 0;
      if (xp) {
        xpTotal = xp.puntosTotal;
      }

      let liga = null;
      if (usuario.idLiga) {
        liga = await Liga.obtenerPorId(usuario.idLiga);
      }

      const insignias = await Insignia.listarPorEstudiante(idUsuario);
      const clases = await Clase.obtenerPorEstudiante(idUsuario);

      delete usuario.contrasena;
      delete usuario.resetPasswordToken;
      delete usuario.resetPasswordExpires;

      res.status(200).json({
        success: true,
        data: {
          usuario: usuario,
          xpTotal: xpTotal,
          liga: liga,
          insignias: insignias,
          clases: clases,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = PerfilController;
