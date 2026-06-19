const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class User {
  static async obtenerPorId(id) {
    const { rows } = await pool.query('SELECT * FROM USUARIO WHERE id = $1', [id]);
    return rows[0] || null;
  }

  static async obtenerPorCorreo(correo) {
    const { rows } = await pool.query('SELECT * FROM USUARIO WHERE correo = $1', [correo]);
    return rows[0] || null;
  }

  static async actualizar(id, data) {
    const fields = [];
    const values = [];
    let i = 1;
    const columnas = {
      nombre:     'nombre',
      correo:     'correo',
      contrasena: 'contrasena',
      avatar:     'avatar',
      colegio:    'colegio',
      idLiga:     '"idLiga"',
    };
    for (const [key, col] of Object.entries(columnas)) {
      if (data[key] !== undefined) {
        fields.push(`${col} = $${i++}`);
        values.push(data[key]);
      }
    }
    if (fields.length === 0) return null;
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE USUARIO SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, nombre, correo, rol, avatar, colegio, "idLiga"`,
      values
    );
    return rows[0] || null;
  }

  static async inicializarXP(idEstudiante) {
    await pool.query(
      `INSERT INTO XP (id, "idEstudiante", "puntosTotal") VALUES ($1, $2, 0) ON CONFLICT DO NOTHING`,
      [uuidv4(), idEstudiante]
    );
  }

  static async guardarTokenRecuperacion(id, token, expira) {
    await pool.query(
      `UPDATE USUARIO SET "resetPasswordToken" = $1, "resetPasswordExpires" = $2 WHERE id = $3`,
      [token, expira, id]
    );
  }

  static async obtenerPorTokenRecuperacion(token) {
    const { rows } = await pool.query(
      'SELECT * FROM USUARIO WHERE "resetPasswordToken" = $1',
      [token]
    );
    return rows[0] || null;
  }

  static async restablecerContrasena(id, nuevaContrasena) {
    await pool.query(
      `UPDATE USUARIO SET contrasena = $1, "resetPasswordToken" = NULL, "resetPasswordExpires" = NULL WHERE id = $2`,
      [nuevaContrasena, id]
    );
  }
}

module.exports = User;
