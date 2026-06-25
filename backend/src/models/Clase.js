const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Clase {

  static async obtenerPorId(id) {
    const { rows } = await pool.query(
      'SELECT id, nombre, "codigoUnico", curso, "idDocente" FROM CLASE WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  static async buscarPorCodigo(codigo) {
    const { rows } = await pool.query(
      'SELECT id, nombre, "codigoUnico", curso, "idDocente" FROM CLASE WHERE "codigoUnico" = $1',
      [codigo]
    );
    return rows[0] || null;
  }

  // H.U. 317 - Visualizacion de clases del docente
  static async listarPorDocente(idDocente) {
    const { rows } = await pool.query(
      `SELECT c.id, c.nombre, c."codigoUnico", c.curso, c."idDocente",
              COUNT(ec."idEstudiante") AS "numEstudiantes"
       FROM CLASE c
       LEFT JOIN ESTUDIANTE_CLASE ec ON ec."idClase" = c.id
       WHERE c."idDocente" = $1
       GROUP BY c.id
       ORDER BY c.nombre ASC`,
      [idDocente]
    );
    return rows;
  }

  static async obtenerPorEstudiante(idEstudiante) {
    const { rows } = await pool.query(
      `SELECT c.id, c.nombre, c."codigoUnico", c.curso, c."idDocente", ec."fechaIngreso"
       FROM CLASE c
       JOIN ESTUDIANTE_CLASE ec ON ec."idClase" = c.id
       WHERE ec."idEstudiante" = $1
       ORDER BY ec."fechaIngreso" DESC`,
      [idEstudiante]
    );
    return rows;
  }

  static async registrarConModulos({ nombre, codigoUnico, curso, idDocente }) {
    const id = uuidv4();
    const { rows } = await pool.query(
      'INSERT INTO CLASE (id, nombre, "codigoUnico", curso, "idDocente") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, nombre, codigoUnico, curso, idDocente]
    );
    return rows[0];
  }

  static async actualizar(id, data) {
    const fields = [];
    const values = [];
    let i = 1;
    if (data.nombre      !== undefined) { fields.push(`nombre = $${i++}`);         values.push(data.nombre);      }
    if (data.codigoUnico !== undefined) { fields.push(`"codigoUnico" = $${i++}`);  values.push(data.codigoUnico); }
    if (data.curso       !== undefined) { fields.push(`curso = $${i++}`);          values.push(data.curso);       }
    if (fields.length === 0) return null;
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE CLASE SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return rows[0] || null;
  }

  static async eliminar(id) {
    const { rows } = await pool.query('DELETE FROM CLASE WHERE id = $1 RETURNING id', [id]);
    return rows.length > 0;
  }
}

module.exports = Clase;
