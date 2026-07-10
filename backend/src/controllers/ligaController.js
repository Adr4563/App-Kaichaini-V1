const Liga = require('../models/Liga');

class LigaController {

  static async listarTodasConUmbrales(req, res) {
    try {
      const ligas = await Liga.listarTodasConUmbrales();

      res.status(200).json({ success: true, data: ligas });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async obtenerRanking(req, res) {
    try {
      const ranking = await Liga.obtenerRanking();

      res.status(200).json({ success: true, data: ranking });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const liga = await Liga.obtenerPorId(id);

      if (!liga) {
        return res.status(404).json({ success: false, message: 'Liga no encontrada' });
      }

      res.status(200).json({ success: true, data: liga });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = LigaController;
