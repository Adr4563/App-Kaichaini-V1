const pool = require('../config/database');

class Silabo {
  static async visualizar(idClase) {
    const { rows } = await pool.query(
      'SELECT id, idclase AS "idClase", archivourl AS "archivoUrl", contenido, fechasubida AS "fechaSubida" FROM silabo WHERE idclase = $1',
      [idClase]
    );
    return rows[0] || null;
  }

  static async actualizarContenido(idClase, { contenido, archivoUrl }) {
    const fields = [];
    const values = [];
    let i = 1;
    if (contenido  !== undefined) { fields.push(`contenido = $${i++}`);  values.push(contenido);  }
    if (archivoUrl !== undefined) { fields.push(`archivourl = $${i++}`); values.push(archivoUrl); }
    if (fields.length === 0) return null;
    values.push(idClase);
    const { rows } = await pool.query(
      `UPDATE silabo SET ${fields.join(', ')} WHERE idclase = $${i} RETURNING id, idclase AS "idClase", archivourl AS "archivoUrl", contenido, fechasubida AS "fechaSubida"`,
      values
    );
    if (rows[0]) return rows[0];

    // La clase todavia no tiene un silabo creado: se crea en la primera edicion del docente.
    const { rows: creado } = await pool.query(
      `INSERT INTO silabo (idclase, archivourl, contenido) VALUES ($1, $2, $3)
       RETURNING id, idclase AS "idClase", archivourl AS "archivoUrl", contenido, fechasubida AS "fechaSubida"`,
      [idClase, archivoUrl || '', contenido || '']
    );
    return creado[0] || null;
  }
}

module.exports = Silabo;
