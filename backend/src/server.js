const express = require('express');
const cors = require('cors');
const Liga = require('./models/Liga');

const authRoutes      = require('./routes/authRoutes');
const claseRoutes     = require('./routes/claseRoutes');
const moduloRoutes    = require('./routes/moduloRoutes');
const ejercicioRoutes = require('./routes/ejercicioRoutes');
const respuestaRoutes = require('./routes/respuestaRoutes');
const progresoRoutes  = require('./routes/progresoRoutes');
const mapaRoutes      = require('./routes/mapaRoutes');
const ligaRoutes      = require('./routes/ligaRoutes');
const xpRoutes        = require('./routes/xpRoutes');
const insigniaRoutes  = require('./routes/insigniaRoutes');
const materialRoutes  = require('./routes/materialRoutes');
const silaboRoutes    = require('./routes/silaboRoutes');
const perfilRoutes    = require('./routes/perfilRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const API = '/api/v1';

app.use(API, authRoutes);
app.use(API, claseRoutes);
app.use(API, moduloRoutes);
app.use(API, ejercicioRoutes);
app.use(API, respuestaRoutes);
app.use(API, progresoRoutes);
app.use(API, mapaRoutes);
app.use(API, ligaRoutes);
app.use(API, xpRoutes);
app.use(API, insigniaRoutes);
app.use(API, materialRoutes);
app.use(API, silaboRoutes);
app.use(API, perfilRoutes);

app.get(`${API}/health`, (req, res) => {
  res.status(200).json({ success: true, message: 'Servidor funcionando correctamente' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ success: false, message: err.message || 'Error interno del servidor' });
});

const PORT = 3000;

async function start() {
  await Liga.inicializar();
  app.listen(PORT, () => {
    console.log('Servidor en puerto ' + PORT);
    console.log('Health: http://localhost:' + PORT + API + '/health');
  });
}

start().catch((err) => {
  console.error('Error al iniciar:', err.message);
  process.exit(1);
});
