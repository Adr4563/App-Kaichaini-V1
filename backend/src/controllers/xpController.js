const XP = require('../models/XP');

class XPController {

  // XP.calcularTotal()
  static async calcularTotal(req, res) {
    try {
      const { idUsuario } = req.query;

      if (!idUsuario) {
        return res.status(400).json({ success: false, message: 'idUsuario es requerido' });
      }

      const xp = await XP.calcularTotal(idUsuario);

      let xpTotal = 0;
      if (xp) {
        xpTotal = xp.puntosTotal;
      }

      res.status(200).json({ success: true, data: { idUsuario: idUsuario, xpTotal: xpTotal } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // XP.obtenerXPPorCurso()
  static async obtenerXPPorCurso(req, res) {
    try {
      const { idClase } = req.params;
      const { idUsuario } = req.query;

      if (!idUsuario) {
        return res.status(400).json({ success: false, message: 'idUsuario es requerido' });
      }

      const xpEnClase = await XP.obtenerXPPorCurso(idUsuario, idClase);

      res.status(200).json({ success: true, data: { idUsuario: idUsuario, idClase: idClase, xpEnClase: xpEnClase } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = XPController;
