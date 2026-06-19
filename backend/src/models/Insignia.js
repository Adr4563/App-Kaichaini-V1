const pool = require('../config/database');

class Insignia {
  static async listar() {
    const { rows } = await pool.query('SELECT * FROM INSIGNIA');
    return rows;
  }

  static async listarPorEstudiante(idEstudiante) {
    const { rows } = await pool.query(
      `SELECT i.*, ei.fechadesbloqueo AS "fechaDesbloqueo"
       FROM insignia i
       JOIN estudiante_insignia ei ON i.id = ei.idinsignia
       WHERE ei.idestudiante = $1
       ORDER BY ei.fechadesbloqueo DESC`,
      [idEstudiante]
    );
    return rows;
  }

  static async tieneInsignia(idEstudiante, idInsignia) {
    const { rows } = await pool.query(
      'SELECT idestudiante FROM estudiante_insignia WHERE idestudiante = $1 AND idinsignia = $2',
      [idEstudiante, idInsignia]
    );
    return rows.length > 0;
  }

  static async desbloquear(idEstudiante, idInsignia) {
    const { rows } = await pool.query(
      'INSERT INTO estudiante_insignia (idestudiante, idinsignia) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [idEstudiante, idInsignia]
    );
    return rows.length > 0;
  }
}

module.exports = Insignia;
