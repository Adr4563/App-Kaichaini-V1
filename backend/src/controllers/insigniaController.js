const Insignia = require('../models/Insignia');

class InsigniaController {

  // Insignia.listar()
  static async listar(req, res) {
    try {
      const insignias = await Insignia.listar();

      res.status(200).json({ success: true, data: insignias });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // EstudianteInsignia.listarPorEstudiante()
  static async listarPorEstudiante(req, res) {
    try {
      const { idUsuario } = req.query;

      if (!idUsuario) {
        return res.status(400).json({ success: false, message: 'idUsuario es requerido' });
      }

      const insignias = await Insignia.listarPorEstudiante(idUsuario);

      res.status(200).json({ success: true, data: insignias });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = InsigniaController;
