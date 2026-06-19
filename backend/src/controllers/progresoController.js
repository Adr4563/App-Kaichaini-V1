const Modulo = require('../models/Modulo');
const Ejercicio = require('../models/Ejercicio');
const Respuesta = require('../models/Respuesta');
const XP = require('../models/XP');
const Clase = require('../models/Clase');

class ProgresoController {

  // Modulo.obtenerProgresoEstudiante()
  static async obtenerProgresoEstudiante(req, res) {
    try {
      const { idModulo } = req.params;
      const { idUsuario } = req.query;

      if (!idUsuario) {
        return res.status(400).json({ success: false, message: 'idUsuario es requerido' });
      }

      const modulo = await Modulo.obtenerPorId(idModulo);
      if (!modulo) {
        return res.status(404).json({ success: false, message: 'Modulo no encontrado' });
      }

      const totalEjercicios = await Ejercicio.contarEjerciciosPorModulo(idModulo);
      const correctas = await Respuesta.contarEjerciciosCorrectasPorModulo(idUsuario, idModulo);
      const porcentaje = totalEjercicios > 0 ? (correctas / totalEjercicios) * 100 : 0;

      res.status(200).json({
        success: true,
        data: {
          modulo: modulo,
          progreso: {
            totalEjercicios: totalEjercicios,
            ejerciciosCompletados: correctas,
            porcentajeAciertos: Math.round(porcentaje * 100) / 100,
            completado: porcentaje >= 80,
          },
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getProgresoClase(req, res) {
    try {
      const { idClase } = req.params;
      const { idUsuario } = req.query;

      if (!idUsuario) {
        return res.status(400).json({ success: false, message: 'idUsuario es requerido' });
      }

      const clase = await Clase.obtenerPorId(idClase);
      if (!clase) {
        return res.status(404).json({ success: false, message: 'Clase no encontrada' });
      }

      const modulos = await Modulo.obtenerPorClase(idClase);
      const xpEnClase = await XP.obtenerXPPorCurso(idUsuario, idClase);

      const progresoModulos = [];
      for (let i = 0; i < modulos.length; i++) {
        const m = modulos[i];
        const total = await Ejercicio.contarEjerciciosPorModulo(m.id);
        const correctas = await Respuesta.contarEjerciciosCorrectasPorModulo(idUsuario, m.id);
        const porcentaje = total > 0 ? (correctas / total) * 100 : 0;

        progresoModulos.push({
          id: m.id,
          nombre: m.nombre,
          orden: m.orden,
          bimestre: m.bimestre,
          estado: m.estado,
          totalEjercicios: total,
          ejerciciosCompletados: correctas,
          porcentajeAciertos: Math.round(porcentaje * 100) / 100,
          completado: porcentaje >= 80,
        });
      }

      let modulosCompletados = 0;
      for (let i = 0; i < progresoModulos.length; i++) {
        if (progresoModulos[i].completado) {
          modulosCompletados++;
        }
      }

      const porcentajeClase = modulos.length > 0 ? (modulosCompletados / modulos.length) * 100 : 0;

      res.status(200).json({
        success: true,
        data: {
          clase: clase,
          xpEnClase: xpEnClase,
          progresoGeneral: {
            totalModulos: modulos.length,
            modulosCompletados: modulosCompletados,
            porcentajeClase: Math.round(porcentajeClase * 100) / 100,
          },
          modulos: progresoModulos,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = ProgresoController;
