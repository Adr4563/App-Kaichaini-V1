// Ejemplo de test de INTEGRACIÓN - Login de docente (AuthController.iniciarSesionDocente)
// Ejecutar con: npm test (una vez) o npm run test:watch (modo watch)
//
// Este test NO mockea nada: usa la base de datos real (RDS compartido del equipo).
//
// Reglas de este test:
//   - No borra nada de la BD. Los usuarios de prueba se crean una sola vez
//     (se busca por correo antes de crear) y se reutilizan en corridas futuras.
//   - Usa correos claramente marcados como dato de prueba para no chocar
//     con cuentas reales: *@kaichaini.test

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

describe('AuthController.iniciarSesionDocente (integración con BD real)', () => {
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

  test('debería iniciar sesión correctamente con credenciales válidas de docente', async () => {
    const req = { body: { correo: CORREO_DOCENTE_PRUEBA, contrasena: CONTRASENA_DOCENTE_PRUEBA } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const respuesta = res.json.mock.calls[0][0];
    expect(respuesta.success).toBe(true);
    expect(respuesta.data.usuario.correo).toBe(CORREO_DOCENTE_PRUEBA);
    expect(respuesta.data.usuario.contrasena).toBeUndefined();
  });

  test('debería rechazar si faltan correo o contrasena', async () => {
    const req = { body: { correo: CORREO_DOCENTE_PRUEBA } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('debería rechazar si el usuario no existe', async () => {
    const req = { body: { correo: 'nadie@kaichaini.test', contrasena: 'clave123' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Credenciales invalidas' });
  });

  test('debería rechazar si la contrasena es incorrecta', async () => {
    const req = { body: { correo: CORREO_DOCENTE_PRUEBA, contrasena: 'contrasena-equivocada' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('debería rechazar si el usuario no tiene rol Docente', async () => {
    const req = { body: { correo: CORREO_ESTUDIANTE_PRUEBA, contrasena: CONTRASENA_ESTUDIANTE_PRUEBA } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
