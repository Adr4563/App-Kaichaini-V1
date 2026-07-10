const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const User = require('./User');

class Estudiante extends User {
  static async registrar({ nombre, correo, contrasena, avatar = null, colegio = null, idLiga = null }) {
    const id = uuidv4();
    const { rows } = await pool.query(
      `INSERT INTO USUARIO (id, nombre, correo, contrasena, rol, avatar, colegio, "idLiga")
       VALUES ($1, $2, $3, $4, 'Estudiante', $5, $6, $7)
       RETURNING id, nombre, correo, rol, avatar, colegio, "idLiga", fecharegistro`,
      [id, nombre, correo, contrasena, avatar, colegio, idLiga]
    );
    return rows[0];
  }

  static async personalizarPerfil(id, { nombre, avatar }) {
    return User.actualizar(id, { nombre, avatar });
  }

  static async verPerfil(id) {
    const { rows } = await pool.query(
      `SELECT u.id, u.nombre, u.correo, u.rol, u.avatar, u.colegio, u."idLiga", u.fecharegistro,
              l.nombre AS "ligaNombre"
       FROM USUARIO u
       LEFT JOIN LIGA l ON l.id = u."idLiga"
       WHERE u.id = $1 AND u.rol = 'Estudiante'`,
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = Estudiante;
