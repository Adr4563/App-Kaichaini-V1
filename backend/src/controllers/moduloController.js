const Modulo = require('../models/Modulo');

class ModuloController {

  static async listarPorClase(req, res) {
    try {
      const { idClase } = req.query;

      if (!idClase) {
        return res.status(400).json({ success: false, message: 'ID de clase es requerido' });
      }

      const modulos = await Modulo.obtenerPorClase(idClase);

      res.status(200).json({ success: true, data: modulos });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async listarPorClaseYBimestre(req, res) {
    try {
      const { idClase, bimestre } = req.query;

      if (!idClase || !bimestre) {
        return res.status(400).json({ success: false, message: 'ID de clase y bimestre son requeridos' });
      }

      const modulos = await Modulo.listarPorClaseYBimestre(idClase, parseInt(bimestre));

      res.status(200).json({ success: true, data: modulos });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const modulo = await Modulo.obtenerPorId(id);

      if (!modulo) {
        return res.status(404).json({ success: false, message: 'Modulo no encontrado' });
      }

      res.status(200).json({ success: true, data: modulo });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async crear(req, res) {
    try {
      const { idClase } = req.params;
      const { nombre, orden, bimestre } = req.body;

      const modulo = await Modulo.crear({ idClase, nombre, orden, bimestre });

      res.status(201).json({ success: true, message: 'Modulo creado exitosamente', data: modulo });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { nombre, estado, orden } = req.body;

      const actualizado = await Modulo.actualizar(id, { nombre, estado, orden });

      if (!actualizado) {
        return res.status(404).json({ success: false, message: 'Modulo no encontrado' });
      }

      res.status(200).json({ success: true, message: 'Modulo actualizado exitosamente', data: actualizado });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async eliminar(req, res) {
    try {
      const { id } = req.params;

      const eliminado = await Modulo.eliminar(id);

      if (!eliminado) {
        return res.status(404).json({ success: false, message: 'Modulo no encontrado' });
      }

      res.status(200).json({ success: true, message: 'Modulo eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = ModuloController;
