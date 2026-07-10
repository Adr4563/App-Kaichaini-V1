const Silabo = require('../models/Silabo');

class SilaboController {

  // Silabo.visualizar()
  static async visualizar(req, res) {
    try {
      const { idClase } = req.params;

      const silabo = await Silabo.visualizar(idClase);

      if (!silabo) {
        return res.status(404).json({ success: false, message: 'Silabo no encontrado para esta clase' });
      }

      res.status(200).json({ success: true, data: silabo });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Silabo.actualizarContenido()
  static async actualizarContenido(req, res) {
    try {
      const { idClase } = req.params;
      const { contenido, archivoUrl } = req.body;

      const actualizado = await Silabo.actualizarContenido(idClase, { contenido, archivoUrl });

      if (!actualizado) {
        return res.status(404).json({ success: false, message: 'Silabo no encontrado' });
      }

      res.status(200).json({ success: true, message: 'Silabo actualizado', data: actualizado });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = SilaboController;
