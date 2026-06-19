const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Liga {
  static async listarTodasConUmbrales() {
    const { rows } = await pool.query('SELECT * FROM LIGA ORDER BY "umbralMinimo" ASC');
    return rows;
  }

  static async obtenerPorId(id) {
    const { rows } = await pool.query('SELECT * FROM LIGA WHERE id = $1', [id]);
    return rows[0] || null;
  }

  static async obtenerLigaPorPuntos(puntos) {
    const { rows } = await pool.query(
      'SELECT * FROM LIGA WHERE "umbralMinimo" <= $1 AND "umbralMaximo" >= $1 LIMIT 1',
      [puntos]
    );
    return rows[0] || null;
  }

  static async obtenerRanking() {
    const { rows } = await pool.query(
      `SELECT u.id, u.nombre, u.avatar, xp."puntosTotal", l.nombre AS liga
       FROM USUARIO u
       JOIN XP xp ON xp."idEstudiante" = u.id
       LEFT JOIN LIGA l ON l.id = u."idLiga"
       WHERE u.rol = 'Estudiante'
       ORDER BY xp."puntosTotal" DESC
       LIMIT 50`
    );
    return rows;
  }

  static async inicializar() {
    const ligas = [
      { nombre: 'Amauta', umbralMinimo: 0,    umbralMaximo: 499     },
      { nombre: 'Panaca', umbralMinimo: 500,   umbralMaximo: 999     },
      { nombre: 'Auqui',  umbralMinimo: 1000,  umbralMaximo: 1999    },
      { nombre: 'Inca',   umbralMinimo: 2000,  umbralMaximo: 9999999 },
    ];
    for (const liga of ligas) {
      const { rows } = await pool.query('SELECT id FROM LIGA WHERE nombre = $1', [liga.nombre]);
      if (rows.length === 0) {
        await pool.query(
          'INSERT INTO LIGA (id, nombre, "umbralMinimo", "umbralMaximo") VALUES ($1, $2, $3, $4)',
          [uuidv4(), liga.nombre, liga.umbralMinimo, liga.umbralMaximo]
        );
      }
    }
  }
}

module.exports = Liga;
