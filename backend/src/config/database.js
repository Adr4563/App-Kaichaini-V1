const { Pool } = require('pg');

const pool = new Pool({
  host:     'database-1.c5kk2ms085u3.us-east-2.rds.amazonaws.com',
  user:     'postgres',
  password: '12345678',
  database: 'postgres',
  port:     5432,
  ssl:      { rejectUnauthorized: false },
});

pool.on('connect', () => console.log('Base de datos conectada'));
pool.on('error', (err) => console.error('Error en pool:', err.message));

module.exports = pool;