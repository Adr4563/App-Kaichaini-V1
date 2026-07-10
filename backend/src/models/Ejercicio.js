const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Ejercicio {
  static async obtenerPorId(id) {
    const { rows } = await pool.query(
      'SELECT id, idmodulo AS "idModulo", tipo, enunciado, respuestacorrecta AS "respuestaCorrecta", opciones FROM ejercicio WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  static async obtenerListaEjerciciosPorModulo(idModulo) {
    const { rows } = await pool.query(
      'SELECT id, idmodulo AS "idModulo", tipo, enunciado, respuestacorrecta AS "respuestaCorrecta", opciones FROM ejercicio WHERE idmodulo = $1 ORDER BY id ASC',
      [idModulo]
    );
    return rows;
  }

  static async contarEjerciciosPorModulo(idModulo) {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS count FROM ejercicio
       WHERE idmodulo = $1
         AND opciones IS NOT NULL AND opciones != '[]'
         AND tipo IN ('seleccion_multiple', 'clic_numero')`,
      [idModulo]
    );
    return parseInt(rows[0].count) || 0;
  }

  static async crear({ idModulo, tipo, enunciado, respuestaCorrecta, opciones = '[]' }) {
    const { rows } = await pool.query(
      `INSERT INTO ejercicio (id, idmodulo, tipo, enunciado, respuestacorrecta, opciones)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, idmodulo AS "idModulo", tipo, enunciado, respuestacorrecta AS "respuestaCorrecta", opciones`,
      [uuidv4(), idModulo, tipo || 'seleccion_multiple', enunciado, respuestaCorrecta, opciones]
    );
    return rows[0];
  }

  static async actualizar(id, data) {
    const fields = [];
    const values = [];
    let i = 1;
    if (data.tipo              !== undefined) { fields.push(`tipo = $${i++}`);               values.push(data.tipo);              }
    if (data.enunciado         !== undefined) { fields.push(`enunciado = $${i++}`);          values.push(data.enunciado);         }
    if (data.respuestaCorrecta !== undefined) { fields.push(`respuestacorrecta = $${i++}`);  values.push(data.respuestaCorrecta); }
    if (data.opciones          !== undefined) { fields.push(`opciones = $${i++}`);           values.push(data.opciones);          }
    if (fields.length === 0) return null;
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE ejercicio SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, idmodulo AS "idModulo", tipo, enunciado, respuestacorrecta AS "respuestaCorrecta", opciones`,
      values
    );
    return rows[0] || null;
  }

  static async eliminar(id) {
    const { rows } = await pool.query('DELETE FROM EJERCICIO WHERE id = $1 RETURNING id', [id]);
    return rows.length > 0;
  }
}

module.exports = Ejercicio;
