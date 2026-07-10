const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const User = require('./User');

class Docente extends User {
  static async registrar({ nombre, correo, contrasena, avatar = null }) {
    const id = uuidv4();
    const { rows } = await pool.query(
      `INSERT INTO USUARIO (id, nombre, correo, contrasena, rol, avatar)
       VALUES ($1, $2, $3, $4, 'Docente', $5)
       RETURNING id, nombre, correo, rol, avatar, fecharegistro`,
      [id, nombre, correo, contrasena, avatar]
    );
    return rows[0];
  }
}

module.exports = Docente;
