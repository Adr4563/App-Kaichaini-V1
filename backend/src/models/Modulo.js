const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Modulo {
  static async obtenerPorId(id) {
    const { rows } = await pool.query(
      'SELECT id, idclase AS "idClase", nombre, orden, bimestre, estado FROM modulo WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  static async obtenerPorClase(idClase) {
    const { rows } = await pool.query(
      'SELECT id, idclase AS "idClase", nombre, orden, bimestre, estado FROM modulo WHERE idclase = $1 ORDER BY bimestre ASC, orden ASC',
      [idClase]
    );
    return rows;
  }

  static async listarPorClaseYBimestre(idClase, bimestre) {
    const { rows } = await pool.query(
      'SELECT id, idclase AS "idClase", nombre, orden, bimestre, estado FROM modulo WHERE idclase = $1 AND bimestre = $2 ORDER BY orden ASC',
      [idClase, bimestre]
    );
    return rows;
  }

  static async obtenerSiguiente(idModulo) {
    const actual = await Modulo.obtenerPorId(idModulo);
    if (!actual) return null;
    const { rows } = await pool.query(
      'SELECT id, idclase AS "idClase", nombre, orden, bimestre, estado FROM modulo WHERE idclase = $1 AND bimestre = $2 AND orden = $3 LIMIT 1',
      [actual.idClase, actual.bimestre, actual.orden + 1]
    );
    return rows[0] || null;
  }

  static async crear({ idClase, nombre, orden, bimestre }) {
    const { rows } = await pool.query(
      `INSERT INTO modulo (id, idclase, nombre, orden, bimestre, estado)
       VALUES ($1, $2, $3, $4, $5, 'bloqueado')
       RETURNING id, idclase AS "idClase", nombre, orden, bimestre, estado`,
      [uuidv4(), idClase, nombre, orden, bimestre]
    );
    return rows[0];
  }

  static async actualizar(id, data) {
    const fields = [];
    const values = [];
    let i = 1;
    if (data.nombre !== undefined) { fields.push(`nombre = $${i++}`); values.push(data.nombre); }
    if (data.estado !== undefined) { fields.push(`estado = $${i++}`); values.push(data.estado); }
    if (data.orden  !== undefined) { fields.push(`orden = $${i++}`);  values.push(data.orden);  }
    if (fields.length === 0) return null;
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE MODULO SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, idclase AS "idClase", nombre, orden, bimestre, estado`,
      values
    );
    return rows[0] || null;
  }

  static async desbloquear(id) {
    await pool.query("UPDATE MODULO SET estado = 'disponible' WHERE id = $1", [id]);
  }

  static async eliminar(id) {
    const { rows } = await pool.query('DELETE FROM MODULO WHERE id = $1 RETURNING id', [id]);
    return rows.length > 0;
  }
}

module.exports = Modulo;
