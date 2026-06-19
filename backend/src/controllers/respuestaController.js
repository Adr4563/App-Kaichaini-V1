const Respuesta = require('../models/Respuesta');
const Ejercicio = require('../models/Ejercicio');
const Modulo = require('../models/Modulo');
const XP = require('../models/XP');
const Liga = require('../models/Liga');
const Insignia = require('../models/Insignia');
const User = require('../models/User');

const XP_POR_EJERCICIO = 10;
const XP_BONO_MODULO = 50;

class RespuestaController {

  // Respuesta.registrar()
  static async registrar(req, res) {
    try {
      const { idEstudiante, idEjercicio, respuesta } = req.body;

      if (!idEstudiante || !idEjercicio || !respuesta) {
        return res.status(400).json({ success: false, message: 'idEstudiante, idEjercicio y respuesta son requeridos' });
      }

      const ejercicio = await Ejercicio.obtenerPorId(idEjercicio);
      if (!ejercicio) {
        return res.status(404).json({ success: false, message: 'Ejercicio no encontrado' });
      }

      const yaCorrectoAntes = await Respuesta.yaRespondioCorrectamente(idEstudiante, idEjercicio);
      const esCorrecta = ejercicio.respuestaCorrecta.trim().toLowerCase() === respuesta.trim().toLowerCase();

      await Respuesta.registrar({ idEstudiante, idEjercicio, respuesta, esCorrecta });

      const totalEjercicios = await Ejercicio.contarEjerciciosPorModulo(ejercicio.idModulo);
      const correctas = await Respuesta.contarEjerciciosCorrectasPorModulo(idEstudiante, ejercicio.idModulo);
      const porcentaje = totalEjercicios > 0 ? (correctas / totalEjercicios) * 100 : 0;

      if (!esCorrecta) {
        return res.status(200).json({
          success: true,
          message: 'Respuesta incorrecta',
          data: {
            esCorrecta: false,
            xpGanado: 0,
            retroalimentacion: RespuestaController.obtenerRetroalimentacion(correctas, totalEjercicios),
          },
        });
      }

      let xpGanado = 0;
      if (!yaCorrectoAntes) {
        xpGanado = XP_POR_EJERCICIO;

        const correctasAntes = correctas - 1;
        const porcentajeAntes = totalEjercicios > 0 ? (correctasAntes / totalEjercicios) * 100 : 0;
        if (porcentajeAntes < 80 && porcentaje >= 80) {
          xpGanado = xpGanado + XP_BONO_MODULO;
        }
      }

      let xpTotal = 0;
      let ligaActualizada = null;

      if (xpGanado > 0) {
        const xpActualizado = await XP.otorgar(idEstudiante, xpGanado);
        if (xpActualizado) {
          xpTotal = xpActualizado.puntosTotal;
        }
        const nuevaLiga = await Liga.obtenerLigaPorPuntos(xpTotal);
        if (nuevaLiga) {
          await User.actualizar(idEstudiante, { idLiga: nuevaLiga.id });
          ligaActualizada = nuevaLiga;
        }
      } else {
        const xpRecord = await XP.calcularTotal(idEstudiante);
        if (xpRecord) {
          xpTotal = xpRecord.puntosTotal;
        }
      }

      if (porcentaje === 100) {
        await Modulo.desbloquear(ejercicio.idModulo);
        const siguiente = await Modulo.obtenerSiguiente(ejercicio.idModulo);
        if (siguiente) {
          await Modulo.desbloquear(siguiente.id);
        }
      }

      const totalCorrectasGlobal = await Respuesta.contarTotalCorrectas(idEstudiante);
      const insigniasDesbloqueadas = await RespuestaController.verificarCriterio(idEstudiante, {
        primerEjercicioCorrecto: true,
        primerModuloCompletado: porcentaje === 100,
        notaPerfecta: porcentaje === 100,
        totalCorrectasGlobal: totalCorrectasGlobal,
        xpTotal: xpTotal,
      });

      res.status(200).json({
        success: true,
        message: 'Respuesta correcta!',
        data: {
          esCorrecta: true,
          xpGanado: xpGanado,
          xpTotal: xpTotal,
          liga: ligaActualizada,
          progresoModulo: {
            idModulo: ejercicio.idModulo,
            totalEjercicios: totalEjercicios,
            correctas: correctas,
            porcentajeAciertos: porcentaje,
          },
          insigniasDesbloqueadas: insigniasDesbloqueadas,
          retroalimentacion: RespuestaController.obtenerRetroalimentacion(correctas, totalEjercicios),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Respuesta.obtenerHistorialPorEstudiante()
  static async obtenerHistorialPorEstudiante(req, res) {
    try {
      const { idUsuario, idModulo } = req.query;

      if (!idUsuario) {
        return res.status(400).json({ success: false, message: 'idUsuario es requerido' });
      }

      let respuestas;
      if (idModulo) {
        respuestas = await Respuesta.obtenerPorEstudianteYModulo(idUsuario, idModulo);
      } else {
        respuestas = await Respuesta.obtenerHistorialPorEstudiante(idUsuario);
      }

      res.status(200).json({ success: true, data: respuestas });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Respuesta.generarRetroalimentacionAgregada()
  static async generarRetroalimentacionAgregada(req, res) {
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

      const respuestas = await Respuesta.obtenerPorEstudianteYModulo(idUsuario, idModulo);

      const ejerciciosMap = new Map();
      for (let i = 0; i < respuestas.length; i++) {
        const r = respuestas[i];
        if (!ejerciciosMap.has(r.idEjercicio)) {
          ejerciciosMap.set(r.idEjercicio, false);
        }
        if (r.esCorrecta) {
          ejerciciosMap.set(r.idEjercicio, true);
        }
      }

      const total = ejerciciosMap.size;
      let correctas = 0;
      ejerciciosMap.forEach(function(valor) {
        if (valor === true) correctas++;
      });

      const porcentaje = total > 0 ? (correctas / total) * 100 : 0;
      const xpEnClase = await XP.obtenerXPPorCurso(idUsuario, modulo.idClase);

      res.status(200).json({
        success: true,
        data: {
          modulo: modulo,
          evaluacion: {
            totalRespuestas: total,
            respuestasCorrectas: correctas,
            respuestasIncorrectas: total - correctas,
            porcentajeAciertos: Math.round(porcentaje * 100) / 100,
            retroalimentacion: RespuestaController.obtenerRetroalimentacion(correctas, total),
          },
          xpEnClase: xpEnClase,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Respuesta.obtenerRetroalimentacion()
  static obtenerRetroalimentacion(correctas, total) {
    const errores = total - correctas;
    if (errores <= 2) {
      return 'Excelente desempeno, solo 1-2 errores';
    }
    if (errores <= 5) {
      return 'Buen desempeno, pero revisa los temas con errores';
    }
    return 'Necesitas mejorar, repasa los conceptos clave';
  }

  // EstudianteInsignia.verificarCriterio()
  static async verificarCriterio(idEstudiante, contexto) {
    const desbloqueadas = [];
    const insignias = await Insignia.listar();

    for (let i = 0; i < insignias.length; i++) {
      const ins = insignias[i];
      const yaTiene = await Insignia.tieneInsignia(idEstudiante, ins.id);

      if (yaTiene) {
        continue;
      }

      let desbloquear = false;
      const criterio = ins.criterio ? ins.criterio.toLowerCase() : '';

      if (criterio === 'primer_modulo') {
        desbloquear = contexto.primerModuloCompletado;
      } else if (criterio === 'ejercicios_5') {
        desbloquear = contexto.totalCorrectasGlobal >= 5;
      } else if (criterio === 'ejercicios_10') {
        desbloquear = contexto.totalCorrectasGlobal >= 10;
      } else if (criterio === 'ejercicios_20') {
        desbloquear = contexto.totalCorrectasGlobal >= 20;
      } else if (criterio === 'ejercicios_30') {
        desbloquear = contexto.totalCorrectasGlobal >= 30;
      } else if (criterio === '100_ejercicios') {
        desbloquear = contexto.totalCorrectasGlobal >= 100;
      } else if (criterio === 'xp_500') {
        desbloquear = contexto.xpTotal >= 500;
      }

      if (desbloquear) {
        await Insignia.desbloquear(idEstudiante, ins.id);
        desbloqueadas.push(ins);
      }
    }

    return desbloqueadas;
  }
}

module.exports = RespuestaController;
