// Pruebas de INTEGRACIÓN (BD real, RDS compartido del equipo) — mismo estilo que adrian.test.js
// HU417 - Visualización de material  → MaterialController.listarPorClaseYModulo
// HU407 - Eliminación de material    → MaterialController.eliminar
//
// Ejecutar con: npm test (una vez) o npm run test:watch (modo watch)
//
// Reglas de este test (igual que adrian.test.js):
//   - No mockea nada: usa la base de datos real.
//   - No borra datos reales del equipo. Para probar el borrado exitoso de HU407
//     se inserta una fila de material de prueba propia (marcada __TEST__) y se
//     borra ESA fila. Un afterAll limpia cualquier sobrante de prueba.
//
// Clases de equivalencia cubiertas (ver Tabla 10.3.x del documento):
//   HU417: CV1, CV2, CVN1 (obligatorio), CVN2 (formato → 400)
//   HU407: CV1, CVN1 (inexistente), CVN2 (formato → 400)
//
// La validación de formato UUID (CVN2 → 400) corrige los defectos DEF-01 y DEF-02.

const MaterialController = require('../src/controllers/materialController');
const pool = require('../src/config/database');
const { v4: uuidv4 } = require('uuid');

// Datos reales conocidos de la BD (clase "Matemática 4° Grado" y uno de sus módulos)
const ID_CLASE_CON_MATERIAL  = '878cb06c-cc5b-43f7-b4d3-614059edd164';
const ID_MODULO_CON_MATERIAL = '5bc23cff-1563-4877-8a35-584ba424bd59';
const UUID_INEXISTENTE       = '00000000-0000-0000-0000-000000000000';
const ID_MAL_FORMADO         = 'esto-no-es-uuid';
const NOMBRE_TEST            = '__TEST__ material gabriel';

function crearRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

// Inserta una fila de material de prueba propia y devuelve su id.
async function insertarMaterialPrueba() {
  const id = uuidv4();
  await pool.query(
    'INSERT INTO material (id, idclase, idmodulo, nombre, archivourl, tipo) VALUES ($1, $2, $3, $4, $5, $6)',
    [id, ID_CLASE_CON_MATERIAL, ID_MODULO_CON_MATERIAL, NOMBRE_TEST, 'https://test.kaichaini/material.pdf', 'pdf'],
  );
  return id;
}

// Red de seguridad: elimina cualquier fila de prueba que haya quedado (nunca datos reales).
afterAll(async () => {
  await pool.query('DELETE FROM material WHERE nombre = $1', [NOMBRE_TEST]);
});

describe('HU417 - MaterialController.listarPorClaseYModulo (integración con BD real)', () => {

  test('[CV1] idClase válido con material debería retornar 200 y la lista de materiales', async () => {
    const req = { query: { idClase: ID_CLASE_CON_MATERIAL } };
    const res = crearRes();

    await MaterialController.listarPorClaseYModulo(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    const item = body.data[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('nombre');
    expect(item).toHaveProperty('tipo');
    expect(item).toHaveProperty('archivoUrl');
  });

  test('[CV2] idModulo válido (sin idClase) debería retornar 200 y una lista', async () => {
    const req = { query: { idModulo: ID_MODULO_CON_MATERIAL } };
    const res = crearRes();

    await MaterialController.listarPorClaseYModulo(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('[CVN1-obligatorio] sin idClase ni idModulo debería rechazar con 400', async () => {
    const req = { query: {} };
    const res = crearRes();

    await MaterialController.listarPorClaseYModulo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'ID de clase o modulo es requerido' });
  });

  test('[CVN2-formato] idClase con formato no-UUID debería rechazar con 400 (corrige DEF-01)', async () => {
    const req = { query: { idClase: ID_MAL_FORMADO } };
    const res = crearRes();

    await MaterialController.listarPorClaseYModulo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
  });

  test('[CVN3-formato] idModulo con formato no-UUID debería rechazar con 400', async () => {
    const req = { query: { idModulo: ID_MAL_FORMADO } };
    const res = crearRes();

    await MaterialController.listarPorClaseYModulo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
  });
});

describe('HU407 - MaterialController.eliminar (integración con BD real)', () => {

  test('[CV1] id existente debería eliminar el material y retornar 200', async () => {
    const id = await insertarMaterialPrueba();
    const req = { params: { id } };
    const res = crearRes();

    await MaterialController.eliminar(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Material eliminado' });

    // Verificar que la fila realmente ya no existe en la BD
    const { rows } = await pool.query('SELECT id FROM material WHERE id = $1', [id]);
    expect(rows.length).toBe(0);
  });

  test('[CVN1-inexistente] uuid válido inexistente debería retornar 404', async () => {
    const req = { params: { id: UUID_INEXISTENTE } };
    const res = crearRes();

    await MaterialController.eliminar(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Material no encontrado' });
  });

  test('[CVN2-formato] id con formato no-UUID debería rechazar con 400 (corrige DEF-02)', async () => {
    const req = { params: { id: ID_MAL_FORMADO } };
    const res = crearRes();

    await MaterialController.eliminar(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
  });
});
