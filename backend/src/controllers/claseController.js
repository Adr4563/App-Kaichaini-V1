const Clase = require('../models/Clase');
const EstudianteClase = require('../models/EstudianteClase');
const { v4: uuidv4 } = require('uuid');

class ClaseController {

  static async registrarConModulos(req, res) {
    try {
      const { nombre, curso, idDocente } = req.body;

      if (!idDocente) {
        return res.status(400).json({ success: false, message: 'idDocente es requerido' });
      }

      const codigoUnico = uuidv4().substring(0, 8).toUpperCase();

      const clase = await Clase.registrarConModulos({ nombre, codigoUnico, curso, idDocente });

      res.status(201).json({ success: true, message: 'Clase creada exitosamente', data: clase });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async buscarPorCodigo(req, res) {
    try {
      const { codigo } = req.body;

      if (!codigo) {
        return res.status(400).json({ success: false, message: 'Codigo de clase es requerido' });
      }

      const clase = await Clase.buscarPorCodigo(codigo);

      if (!clase) {
        return res.status(404).json({ success: false, message: 'Codigo de clase invalido' });
      }

      res.status(200).json({ success: true, message: 'Codigo valido', data: clase });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async unirse(req, res) {
    try {
      const { codigoUnico, idEstudiante } = req.body;

      if (!codigoUnico || !idEstudiante) {
        return res.status(400).json({ success: false, message: 'codigoUnico e idEstudiante son requeridos' });
      }

      const clase = await Clase.buscarPorCodigo(codigoUnico);

      if (!clase) {
        return res.status(404).json({ success: false, message: 'Codigo incorrecto o no valido' });
      }

      const yaInscrito = await EstudianteClase.verificarInscripcion(idEstudiante, clase.id);

      if (yaInscrito) {
        return res.status(409).json({ success: false, message: 'Ya estas inscrito en esta clase' });
      }

      await EstudianteClase.unirse(idEstudiante, clase.id);

      res.status(200).json({ success: true, message: 'Te has unido a la clase exitosamente' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // H.U. 317 - Visualizacion de clases del docente
  static async listarPorDocente(req, res) {
    try {
      const { idUsuario, rol } = req.query;

      if (!idUsuario || !rol) {
        return res.status(400).json({ success: false, message: 'idUsuario y rol son requeridos' });
      }

      let clases;
      if (rol === 'Docente') {
        clases = await Clase.listarPorDocente(idUsuario);
      } else if (rol === 'Estudiante') {
        clases = await Clase.obtenerPorEstudiante(idUsuario);
      } else {
        return res.status(400).json({ success: false, message: 'Rol no valido' });
      }

      res.status(200).json({ success: true, data: clases });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const clase = await Clase.obtenerPorId(id);

      if (!clase) {
        return res.status(404).json({ success: false, message: 'Clase no encontrada' });
      }

      res.status(200).json({ success: true, data: clase });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async contarEstudiantes(req, res) {
    try {
      const { id } = req.params;

      const estudiantes = await EstudianteClase.contarEstudiantes(id);

      res.status(200).json({ success: true, data: estudiantes });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { nombre, codigoUnico, curso } = req.body;

      const actualizada = await Clase.actualizar(id, { nombre, codigoUnico, curso });

      if (!actualizada) {
        return res.status(404).json({ success: false, message: 'Clase no encontrada' });
      }

      res.status(200).json({ success: true, message: 'Clase actualizada exitosamente', data: actualizada });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async eliminar(req, res) {
    try {
      const { id } = req.params;

      const eliminada = await Clase.eliminar(id);

      if (!eliminada) {
        return res.status(404).json({ success: false, message: 'Clase no encontrada' });
      }

      res.status(200).json({ success: true, message: 'Clase eliminada exitosamente' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async abandonar(req, res) {
    try {
      const { idClase, idEstudiante } = req.body;

      if (!idClase || !idEstudiante) {
        return res.status(400).json({ success: false, message: 'idClase e idEstudiante son requeridos' });
      }

      const eliminado = await EstudianteClase.eliminar(idEstudiante, idClase);

      if (!eliminado) {
        return res.status(404).json({ success: false, message: 'No estas inscrito en esta clase' });
      }

      res.status(200).json({ success: true, message: 'Has abandonado la clase exitosamente' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = ClaseController;
