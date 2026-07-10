const Ejercicio = require('../models/Ejercicio');

class EjercicioController {

  static async obtenerListaEjerciciosPorModulo(req, res) {
    try {
      const { idModulo } = req.query;

      if (!idModulo) {
        return res.status(400).json({ success: false, message: 'ID de modulo es requerido' });
      }

      const ejercicios = await Ejercicio.obtenerListaEjerciciosPorModulo(idModulo);

      for (let i = 0; i < ejercicios.length; i++) {
        delete ejercicios[i].respuestaCorrecta;
      }

      res.status(200).json({ success: true, data: ejercicios });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const ejercicio = await Ejercicio.obtenerPorId(id);

      if (!ejercicio) {
        return res.status(404).json({ success: false, message: 'Ejercicio no encontrado' });
      }

      delete ejercicio.respuestaCorrecta;

      res.status(200).json({ success: true, data: ejercicio });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async crearClicNumero(req, res) {
    try {
      const { idModulo, enunciado, respuestaCorrecta, opciones } = req.body;

      const ejercicio = await Ejercicio.crear({
        idModulo,
        tipo: 'clic_numero',
        enunciado,
        respuestaCorrecta,
        opciones,
      });

      res.status(201).json({ success: true, message: 'Ejercicio clic_numero creado', data: ejercicio });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async crearSeleccionMultiple(req, res) {
    try {
      const { idModulo, enunciado, respuestaCorrecta, opciones } = req.body;

      const ejercicio = await Ejercicio.crear({
        idModulo,
        tipo: 'seleccion_multiple',
        enunciado,
        respuestaCorrecta,
        opciones,
      });

      res.status(201).json({ success: true, message: 'Ejercicio seleccion_multiple creado', data: ejercicio });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { tipo, enunciado, respuestaCorrecta, opciones } = req.body;

      const actualizado = await Ejercicio.actualizar(id, { tipo, enunciado, respuestaCorrecta, opciones });

      if (!actualizado) {
        return res.status(404).json({ success: false, message: 'Ejercicio no encontrado' });
      }

      res.status(200).json({ success: true, message: 'Ejercicio actualizado', data: actualizado });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async eliminar(req, res) {
    try {
      const { id } = req.params;

      const eliminado = await Ejercicio.eliminar(id);

      if (!eliminado) {
        return res.status(404).json({ success: false, message: 'Ejercicio no encontrado' });
      }

      res.status(200).json({ success: true, message: 'Ejercicio eliminado' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = EjercicioController;
