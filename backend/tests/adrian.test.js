const AuthController = require('../src/controllers/authController');
const Docente = require('../src/models/Docente');
const Estudiante = require('../src/models/Estudiante');
const User = require('../src/models/User');

const CORREO_DOCENTE_PRUEBA = 'test.docente@kaichaini.test';
const CONTRASENA_DOCENTE_PRUEBA = 'Test1234';

const CORREO_ESTUDIANTE_PRUEBA = 'test.estudiante@kaichaini.test';
const CONTRASENA_ESTUDIANTE_PRUEBA = 'Test1234';

function crearRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

// ============================================================
// H.U. 013 - Inicio de sesion del Docente
// Clases de equivalencia (correo / contrasena):
//   CV1  = correo registrado con rol Docente
//   CV2  = contrasena coincide con la almacenada
//   CNV1 = correo vacio
//   CNV2 = correo no registrado en la BD
//   CNV3 = correo registrado pero con rol distinto de Docente
//   CNV4 = contrasena vacia
//   CNV5 = contrasena no vacia pero no coincide
// ============================================================
describe('AuthController.iniciarSesionDocente (H.U. 013, integración con BD real)', () => {
  beforeAll(async () => {
    const docenteExistente = await User.obtenerPorCorreo(CORREO_DOCENTE_PRUEBA);
    if (!docenteExistente) {
      await Docente.registrar({
        nombre: 'Docente de Prueba',
        correo: CORREO_DOCENTE_PRUEBA,
        contrasena: CONTRASENA_DOCENTE_PRUEBA,
      });
    }

    const estudianteExistente = await User.obtenerPorCorreo(CORREO_ESTUDIANTE_PRUEBA);
    if (!estudianteExistente) {
      await Estudiante.registrar({
        nombre: 'Estudiante de Prueba',
        correo: CORREO_ESTUDIANTE_PRUEBA,
        contrasena: CONTRASENA_ESTUDIANTE_PRUEBA,
      });
    }
  });

  test('[CV1+CV2] debería iniciar sesión correctamente con credenciales válidas de docente', async () => {
    const req = { body: { correo: CORREO_DOCENTE_PRUEBA, contrasena: CONTRASENA_DOCENTE_PRUEBA } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const respuesta = res.json.mock.calls[0][0];
    expect(respuesta.success).toBe(true);
    expect(respuesta.data.usuario.correo).toBe(CORREO_DOCENTE_PRUEBA);
    expect(respuesta.data.usuario.contrasena).toBeUndefined();
  });

  test('[CNV1] debería rechazar si faltan correo o contrasena', async () => {
    const req = { body: { correo: CORREO_DOCENTE_PRUEBA } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('[CNV2] debería rechazar si el usuario no existe', async () => {
    const req = { body: { correo: 'nadie@kaichaini.test', contrasena: 'clave123' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Credenciales invalidas' });
  });

  test('[CNV5] debería rechazar si la contrasena es incorrecta', async () => {
    const req = { body: { correo: CORREO_DOCENTE_PRUEBA, contrasena: 'contrasena-equivocada' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('[CNV3] debería rechazar si el usuario no tiene rol Docente', async () => {
    const req = { body: { correo: CORREO_ESTUDIANTE_PRUEBA, contrasena: CONTRASENA_ESTUDIANTE_PRUEBA } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('[CNV2-formato] debería rechazar si el correo no tiene "@"', async () => {
    const req = { body: { correo: 'nodomaintest.com', contrasena: CONTRASENA_DOCENTE_PRUEBA } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('[CNV2-formato] debería rechazar si el correo no tiene nombre (empieza con "@")', async () => {
    const req = { body: { correo: '@kaichaini.test', contrasena: CONTRASENA_DOCENTE_PRUEBA } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('[CNV2-formato] debería rechazar si el correo no tiene dominio (termina en "@")', async () => {
    const req = { body: { correo: 'test.docente@', contrasena: CONTRASENA_DOCENTE_PRUEBA } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// ============================================================
// H.U. 007 - Inicio de sesion del Estudiante
// Metodo generico AuthController.iniciarSesion() (POST /auth/login).
// No existe un metodo "iniciarSesionEstudiante" dedicado; este metodo
// tampoco filtra por rol, a diferencia de iniciarSesionDocente().
// Clases de equivalencia (correo / contrasena):
//   CV1  = correo registrado y contrasena coincide (cualquier rol)
//   CV2  = contrasena coincide con la almacenada
//   CNV1 = correo vacio
//   CNV2 = correo no registrado en la BD
//   CNV3 = contrasena vacia
//   CNV4 = contrasena no vacia pero no coincide
// ============================================================
describe('AuthController.iniciarSesion (H.U. 007, integración con BD real)', () => {
  beforeAll(async () => {
    const estudianteExistente = await User.obtenerPorCorreo(CORREO_ESTUDIANTE_PRUEBA);
    if (!estudianteExistente) {
      await Estudiante.registrar({
        nombre: 'Estudiante de Prueba',
        correo: CORREO_ESTUDIANTE_PRUEBA,
        contrasena: CONTRASENA_ESTUDIANTE_PRUEBA,
      });
    }
  });

  test('[CV1+CV2] debería iniciar sesión correctamente con credenciales válidas de estudiante', async () => {
    const req = { body: { correo: CORREO_ESTUDIANTE_PRUEBA, contrasena: CONTRASENA_ESTUDIANTE_PRUEBA } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const respuesta = res.json.mock.calls[0][0];
    expect(respuesta.success).toBe(true);
    expect(respuesta.data.usuario.correo).toBe(CORREO_ESTUDIANTE_PRUEBA);
    expect(respuesta.data.usuario.contrasena).toBeUndefined();
  });

  test('[CNV1] debería rechazar si faltan correo o contrasena', async () => {
    const req = { body: { correo: '', contrasena: '' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('[CNV2] debería rechazar si el correo no existe', async () => {
    const req = { body: { correo: 'nadie@kaichaini.test', contrasena: 'clave123' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Credenciales invalidas' });
  });

  test('[CNV3] debería rechazar si el correo es numérico', async () => {
    const req = { body: { correo: 12345, contrasena: CONTRASENA_ESTUDIANTE_PRUEBA } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('[CNV2-formato] debería rechazar si el correo no tiene "@"', async () => {
    const req = { body: { correo: 'nodomaintest.com', contrasena: CONTRASENA_ESTUDIANTE_PRUEBA } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('[CNV2-formato] debería rechazar si el correo no tiene nombre (empieza con "@")', async () => {
    const req = { body: { correo: '@kaichaini.test', contrasena: CONTRASENA_ESTUDIANTE_PRUEBA } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('[CNV2-formato] debería rechazar si el correo no tiene dominio (termina en "@")', async () => {
    const req = { body: { correo: 'test.estudiante@', contrasena: CONTRASENA_ESTUDIANTE_PRUEBA } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('[CNV5] debería rechazar si la contrasena es incorrecta', async () => {
    const req = { body: { correo: CORREO_ESTUDIANTE_PRUEBA, contrasena: 'contrasena-equivocada' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('[CNV6] debería rechazar si la contrasena tiene menos de 3 caracteres', async () => {
    const req = { body: { correo: CORREO_ESTUDIANTE_PRUEBA, contrasena: 'ab' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  // HALLAZGO: iniciarSesion() no valida rol, por lo que un Docente
  // tambien puede autenticarse por el endpoint generico de estudiante.
  // Este test documenta el comportamiento ACTUAL (no el deseado); debe
  // actualizarse a 401 cuando se agregue el filtro de rol Estudiante.
  test('[HALLAZGO] permite login de un Docente por el endpoint genérico (sin filtro de rol)', async () => {
    const req = { body: { correo: CORREO_DOCENTE_PRUEBA, contrasena: CONTRASENA_DOCENTE_PRUEBA } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
