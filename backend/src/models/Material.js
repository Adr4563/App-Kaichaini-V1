const pool = require('../config/database');

class Material {
  static async obtenerPorClase(idClase) {
    const { rows } = await pool.query(
      'SELECT id, idclase AS "idClase", idmodulo AS "idModulo", nombre, archivourl AS "archivoUrl", tipo FROM material WHERE idclase = $1',
      [idClase]
    );
    return rows;
  }

  static async obtenerPorModulo(idModulo) {
    const { rows } = await pool.query(
      'SELECT id, idclase AS "idClase", idmodulo AS "idModulo", nombre, archivourl AS "archivoUrl", tipo FROM material WHERE idmodulo = $1',
      [idModulo]
    );
    return rows;
  }

  static async buscar(query, idClase) {
    const { rows } = await pool.query(
      `SELECT id, idclase AS "idClase", idmodulo AS "idModulo", nombre, archivourl AS "archivoUrl", tipo
       FROM material
       WHERE idclase = $1 AND nombre ILIKE $2
       ORDER BY CASE WHEN LOWER(nombre) = LOWER($3) THEN 0 ELSE 1 END ASC, nombre ASC`,
      [idClase, `%${query}%`, query]
    );
    return rows;
  }
}

module.exports = Material;
