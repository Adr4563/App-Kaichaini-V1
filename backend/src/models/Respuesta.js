const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Respuesta {
  static async registrar({ idEstudiante, idEjercicio, respuesta, esCorrecta }) {
    const { rows } = await pool.query(
      `INSERT INTO respuesta (id, idestudiante, idejercicio, respuesta, escorrecta)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, idestudiante AS "idEstudiante", idejercicio AS "idEjercicio", respuesta, escorrecta AS "esCorrecta", fecha`,
      [uuidv4(), idEstudiante, idEjercicio, respuesta, esCorrecta]
    );
    return rows[0];
  }

  static async obtenerHistorialPorEstudiante(idEstudiante) {
    const { rows } = await pool.query(
      `SELECT r.id, r.idestudiante AS "idEstudiante", r.idejercicio AS "idEjercicio",
              r.respuesta, r.escorrecta AS "esCorrecta", r.fecha, e.enunciado, e.tipo
       FROM respuesta r
       JOIN ejercicio e ON e.id = r.idejercicio
       WHERE r.idestudiante = $1
       ORDER BY r.fecha DESC`,
      [idEstudiante]
    );
    return rows;
  }

  static async obtenerPorEstudianteYModulo(idEstudiante, idModulo) {
    const { rows } = await pool.query(
      `SELECT r.id, r.idestudiante AS "idEstudiante", r.idejercicio AS "idEjercicio",
              r.respuesta, r.escorrecta AS "esCorrecta", r.fecha
       FROM respuesta r
       JOIN ejercicio e ON e.id = r.idejercicio
       WHERE r.idestudiante = $1 AND e.idmodulo = $2
       ORDER BY r.fecha ASC`,
      [idEstudiante, idModulo]
    );
    return rows;
  }

  static async yaRespondioCorrectamente(idEstudiante, idEjercicio) {
    const { rows } = await pool.query(
      'SELECT COUNT(*) AS count FROM respuesta WHERE idestudiante = $1 AND idejercicio = $2 AND escorrecta = true',
      [idEstudiante, idEjercicio]
    );
    return parseInt(rows[0].count) > 0;
  }

  static async contarEjerciciosCorrectasPorModulo(idEstudiante, idModulo) {
    const { rows } = await pool.query(
      `SELECT COUNT(DISTINCT r.idejercicio) AS count
       FROM respuesta r
       JOIN ejercicio e ON e.id = r.idejercicio
       WHERE r.idestudiante = $1 AND e.idmodulo = $2 AND r.escorrecta = true`,
      [idEstudiante, idModulo]
    );
    return parseInt(rows[0].count) || 0;
  }

  static async contarTotalCorrectas(idEstudiante) {
    const { rows } = await pool.query(
      'SELECT COUNT(*) AS count FROM respuesta WHERE idestudiante = $1 AND escorrecta = true',
      [idEstudiante]
    );
    return parseInt(rows[0].count) || 0;
  }
}

module.exports = Respuesta;
