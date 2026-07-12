// Pruebas de integración - Jimena
// Funciones cubiertas:
//   - SilaboController.visualizar        (H.U. 406)
//   - AuthController.personalizarPerfil
// Ejecutar con: npm test (una vez) o npm run test:watch (modo watch)
//
// Este test NO mockea nada: usa la base de datos real (RDS compartido del equipo).
//
// Reglas de este test:
//   - No borra nada de la BD. Los datos de prueba se crean una sola vez
//     (se busca antes de crear) y se reutilizan en corridas futuras.
//   - Usa correos claramente marcados como dato de prueba para no chocar
//     con cuentas reales: *@kaichaini.test
//   - Los casos [CVx] / [CNVx] corresponden a la tabla de clases de
//     equivalencia (partición en clases de equivalencia / caja negra)
//     definida para cada función antes de escribir estas pruebas.

const SilaboController = require('../src/controllers/silaboController');
const AuthController = require('../src/controllers/authController');
const Silabo = require('../src/models/Silabo');
const Clase = require('../src/models/Clase');
const Docente = require('../src/models/Docente');
const Estudiante = require('../src/models/Estudiante');
const User = require('../src/models/User');

const CORREO_DOCENTE_PRUEBA = 'test.docente@kaichaini.test';
const CONTRASENA_DOCENTE_PRUEBA = 'Test1234';

const CORREO_ESTUDIANTE_PERFIL_PRUEBA = 'test.perfil.jimena@kaichaini.test';
const CONTRASENA_ESTUDIANTE_PERFIL_PRUEBA = 'Test1234';

const NOMBRE_CLASE_PRUEBA = 'Clase Prueba Silabo Jimena';
const ID_INEXISTENTE = '00000000-0000-0000-0000-000000000099';

function crearRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

let clasePrueba;
let estudiantePerfilPrueba;

// ============================================================
// SilaboController.visualizar (H.U. 406)
// Clases de equivalencia:
//   CV1  = idClase corresponde a una clase que ya tiene silabo
//   CNV1 = idClase con formato valido pero sin silabo asociado
//   CNV2 = idClase con formato invalido (no es un uuid)
// ============================================================
describe('SilaboController.visualizar (H.U. 406, integración con BD real)', () => {
  beforeAll(async () => {
    let docentePrueba = await User.obtenerPorCorreo(CORREO_DOCENTE_PRUEBA);
    if (!docentePrueba) {
      docentePrueba = await Docente.registrar({
        nombre: 'Docente de Prueba',
        correo: CORREO_DOCENTE_PRUEBA,
        contrasena: CONTRASENA_DOCENTE_PRUEBA,
      });
    }

    const clasesDelDocente = await Clase.listarPorDocente(docentePrueba.id);
    clasePrueba = clasesDelDocente.find((c) => c.nombre === NOMBRE_CLASE_PRUEBA);
    if (!clasePrueba) {
      clasePrueba = await Clase.registrarConModulos({
        nombre: NOMBRE_CLASE_PRUEBA,
        codigoUnico: 'JIMTEST1',
        curso: 'Prueba',
        idDocente: docentePrueba.id,
      });
    }

    // Idempotente: crea el silabo si no existe, o lo actualiza si ya existe.
    await Silabo.actualizarContenido(clasePrueba.id, { contenido: 'Contenido de prueba para H.U. 406' });
  });

  test('[CV1] debería devolver 200 con el silabo cuando la clase ya tiene uno', async () => {
    const req = { params: { idClase: clasePrueba.id } };
    const res = crearRes();

    await SilaboController.visualizar(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const respuesta = res.json.mock.calls[0][0];
    expect(respuesta.success).toBe(true);
    expect(respuesta.data.idClase).toBe(clasePrueba.id);
  });

  test('[CNV1] debería devolver 404 cuando el idClase es valido pero no tiene silabo', async () => {
    const req = { params: { idClase: ID_INEXISTENTE } };
    const res = crearRes();

    await SilaboController.visualizar(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Silabo no encontrado para esta clase' });
  });

  test('[CNV2] debería devolver 500 cuando el idClase no es un uuid valido', async () => {
    const req = { params: { idClase: 'no-es-un-uuid' } };
    const res = crearRes();

    await SilaboController.visualizar(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ============================================================
// AuthController.personalizarPerfil
// Clases de equivalencia:
//   CV1  = idUsuario presente y corresponde a un usuario existente
//   CNV1 = idUsuario ausente
//   CNV2 = idUsuario con formato valido pero sin usuario asociado
// ============================================================
describe('AuthController.personalizarPerfil (integración con BD real)', () => {
  beforeAll(async () => {
    estudiantePerfilPrueba = await User.obtenerPorCorreo(CORREO_ESTUDIANTE_PERFIL_PRUEBA);
    if (!estudiantePerfilPrueba) {
      estudiantePerfilPrueba = await Estudiante.registrar({
        nombre: 'Estudiante Perfil Prueba',
        correo: CORREO_ESTUDIANTE_PERFIL_PRUEBA,
        contrasena: CONTRASENA_ESTUDIANTE_PERFIL_PRUEBA,
      });
    }
  });

  test('[CV1] debería actualizar el perfil correctamente con un idUsuario existente', async () => {
    const req = { body: { idUsuario: estudiantePerfilPrueba.id, nombre: 'Estudiante Perfil Actualizado' } };
    const res = crearRes();

    await AuthController.personalizarPerfil(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const respuesta = res.json.mock.calls[0][0];
    expect(respuesta.success).toBe(true);
    expect(respuesta.data.nombre).toBe('Estudiante Perfil Actualizado');
  });

  test('[CNV1] debería rechazar con 400 si falta idUsuario', async () => {
    const req = { body: { nombre: 'Sin id' } };
    const res = crearRes();

    await AuthController.personalizarPerfil(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'idUsuario requerido' });
  });

  test('[CNV2] debería devolver 404 si el idUsuario no corresponde a ningun usuario', async () => {
    const req = { body: { idUsuario: ID_INEXISTENTE, nombre: 'Nadie' } };
    const res = crearRes();

    await AuthController.personalizarPerfil(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Usuario no encontrado' });
  });
});
