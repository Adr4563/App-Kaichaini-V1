const pool = require('../config/database');

class XP {
  static async calcularTotal(idEstudiante) {
    const { rows } = await pool.query('SELECT * FROM XP WHERE "idEstudiante" = $1', [idEstudiante]);
    return rows[0] || null;
  }

  static async otorgar(idEstudiante, puntos) {
    const { rows } = await pool.query(
      'UPDATE XP SET "puntosTotal" = "puntosTotal" + $1 WHERE "idEstudiante" = $2 RETURNING *',
      [puntos, idEstudiante]
    );
    return rows[0] || null;
  }

  static async obtenerXPPorCurso(idEstudiante, idClase) {
    const { rows } = await pool.query(
      `SELECT COALESCE(SUM(
         CASE WHEN tipo = 'seleccion_multiple' THEN 10
              WHEN tipo = 'clic_numero'        THEN 10
              ELSE 0 END
       ), 0) AS "totalXP"
       FROM (
         SELECT DISTINCT ON (r.idejercicio) r.idejercicio, e.tipo
         FROM respuesta r
         JOIN ejercicio e ON e.id = r.idejercicio
         JOIN modulo   m ON m.id = e.idmodulo
         WHERE r.idestudiante = $1 AND m.idclase = $2 AND r.escorrecta = true
         ORDER BY r.idejercicio, r.fecha ASC
       ) primeras_correctas`,
      [idEstudiante, idClase]
    );
    return parseInt(rows[0]?.totalXP) || 0;
  }
}

module.exports = XP;
