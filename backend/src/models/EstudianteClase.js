const pool = require('../config/database');

class EstudianteClase {
  static async unirse(idEstudiante, idClase) {
    const { rows } = await pool.query(
      'INSERT INTO ESTUDIANTE_CLASE ("idEstudiante", "idClase") VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [idEstudiante, idClase]
    );
    return rows[0] || null;
  }

  static async verificarInscripcion(idEstudiante, idClase) {
    const { rows } = await pool.query(
      'SELECT * FROM ESTUDIANTE_CLASE WHERE "idEstudiante" = $1 AND "idClase" = $2',
      [idEstudiante, idClase]
    );
    return rows[0] || null;
  }

  static async obtenerPorEstudiante(idEstudiante) {
    const { rows } = await pool.query(
      'SELECT * FROM ESTUDIANTE_CLASE WHERE "idEstudiante" = $1 ORDER BY "fechaIngreso" DESC',
      [idEstudiante]
    );
    return rows;
  }

  static async contarEstudiantes(idClase) {
    const { rows } = await pool.query(
      `SELECT u.id, u.nombre, u.correo, u.avatar, u.colegio, ec."fechaIngreso"
       FROM ESTUDIANTE_CLASE ec
       JOIN USUARIO u ON u.id = ec."idEstudiante"
       WHERE ec."idClase" = $1
       ORDER BY ec."fechaIngreso" ASC`,
      [idClase]
    );
    return rows;
  }

  static async eliminar(idEstudiante, idClase) {
    const { rows } = await pool.query(
      'DELETE FROM ESTUDIANTE_CLASE WHERE "idEstudiante" = $1 AND "idClase" = $2 RETURNING "idEstudiante"',
      [idEstudiante, idClase]
    );
    return rows.length > 0;
  }
}

module.exports = EstudianteClase;
