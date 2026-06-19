const Clase = require('../models/Clase');
const Modulo = require('../models/Modulo');
const Ejercicio = require('../models/Ejercicio');
const Respuesta = require('../models/Respuesta');
const XP = require('../models/XP');

class MapaController {

  // Mapa por clase y bimestre
  static async getMapaClaseByBimestre(req, res) {
    try {
      const { idClase, bimestre } = req.params;
      const { idUsuario } = req.query;

      if (!idUsuario) {
        return res.status(400).json({ success: false, message: 'idUsuario es requerido' });
      }

      const clase = await Clase.obtenerPorId(idClase);
      if (!clase) {
        return res.status(404).json({ success: false, message: 'Clase no encontrada' });
      }

      const modulos = await Modulo.listarPorClaseYBimestre(idClase, parseInt(bimestre));
      const xpEnClase = await XP.obtenerXPPorCurso(idUsuario, idClase);

      const modulosConProgreso = [];
      for (let i = 0; i < modulos.length; i++) {
        const m = modulos[i];
        const totalEjercicios = await Ejercicio.contarEjerciciosPorModulo(m.id);
        const correctas = await Respuesta.contarEjerciciosCorrectasPorModulo(idUsuario, m.id);
        const porcentaje = totalEjercicios > 0 ? (correctas / totalEjercicios) * 100 : 0;

        modulosConProgreso.push({
          id: m.id,
          nombre: m.nombre,
          orden: m.orden,
          bimestre: m.bimestre,
          estado: m.estado,
          totalEjercicios: totalEjercicios,
          ejerciciosCompletados: correctas,
          porcentajeAciertos: Math.round(porcentaje * 100) / 100,
          completado: porcentaje >= 80,
        });
      }

      res.status(200).json({
        success: true,
        data: {
          clase: clase,
          bimestre: parseInt(bimestre),
          xpEnClase: xpEnClase,
          modulos: modulosConProgreso,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Mapa completo de todas las clases del estudiante
  static async getMapaCompleto(req, res) {
    try {
      const { idUsuario } = req.query;

      if (!idUsuario) {
        return res.status(400).json({ success: false, message: 'idUsuario es requerido' });
      }

      const clases = await Clase.obtenerPorEstudiante(idUsuario);
      const mapaCompleto = [];

      for (let i = 0; i < clases.length; i++) {
        const clase = clases[i];
        const modulos = await Modulo.obtenerPorClase(clase.id);
        const xpEnClase = await XP.obtenerXPPorCurso(idUsuario, clase.id);

        const modulosConProgreso = [];
        for (let j = 0; j < modulos.length; j++) {
          const m = modulos[j];
          const total = await Ejercicio.contarEjerciciosPorModulo(m.id);
          const correctas = await Respuesta.contarEjerciciosCorrectasPorModulo(idUsuario, m.id);
          const porcentaje = total > 0 ? (correctas / total) * 100 : 0;

          modulosConProgreso.push({
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

        mapaCompleto.push({
          id: clase.id,
          nombre: clase.nombre,
          curso: clase.curso,
          xpEnClase: xpEnClase,
          modulos: modulosConProgreso,
        });
      }

      res.status(200).json({ success: true, data: mapaCompleto });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = MapaController;
