const AuthController = require('../src/controllers/authController');

// ============================================================
// Leyenda de clases de equivalencia (Tabla 1, seccion 10.3.1 del
// Capitulo10_Pruebas_de_Software_General.txt)
//
// H.U. 013 - Login Docente (AuthController.iniciarSesionDocente)
//   CV1   correo de un Docente registrado
//   CV2   contrasena con longitud >= 8 caracteres
//   CV3   contrasena contiene al menos 1 mayuscula
//   CV4   contrasena contiene al menos 1 numero
//   CV5   contrasena coincide con la almacenada para ese correo
//   CVN1  correo vacio
//   CVN2  correo no registrado
//   CVN3  correo de un usuario registrado con rol distinto de Docente
//   CVN4  contrasena con longitud < 8 caracteres
//   CVN5  contrasena sin mayusculas
//   CVN6  contrasena sin numeros
//   CVN7  contrasena que no coincide con la almacenada
//   CVN8  contrasena vacia
//
// H.U. 007 - Login Estudiante (AuthController.iniciarSesion)
//   CV6   correo registrado en la BD (cualquier rol, este metodo no filtra por rol)
//   CV7   contrasena con longitud >= 8 caracteres
//   CV8   contrasena contiene al menos 1 mayuscula
//   CV9   contrasena contiene al menos 1 numero
//   CV10  contrasena coincide con la almacenada para ese correo
//   CVN9  correo vacio
//   CVN10 correo no registrado (incluye correos con formato invalido, ya
//         que el controller no valida formato: se comportan igual)
//   CVN11 correo numerico
//   CVN12 contrasena con longitud < 8 caracteres
//   CVN13 contrasena sin mayusculas
//   CVN14 contrasena sin numeros
//   CVN15 contrasena que no coincide con la almacenada
//   CVN16 contrasena vacia
// ============================================================

function crearRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

// ============================================================
// H.U. 013 - Inicio de sesion del Docente
// ============================================================
describe('AuthController.iniciarSesionDocente (H.U. 013, integración con BD real)', () => {
  test('[CV1+CV2+CV3+CV4+CV5] debería iniciar sesión correctamente con credenciales válidas de docente', async () => {
    const req = { body: { correo: 'matematica@kaichaini.com', contrasena: 'Docente123' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const respuesta = res.json.mock.calls[0][0];
    expect(respuesta.success).toBe(true);
    expect(respuesta.data.usuario.correo).toBe('matematica@kaichaini.com');
    expect(respuesta.data.usuario.contrasena).toBeUndefined();
  });

  test('[CVN1] correo vacio debería rechazar con error de validacion', async () => {
    const req = { body: { contrasena: 'Docente123' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('[CVN8] contrasena vacia debería rechazar con error de validacion', async () => {
    const req = { body: { correo: 'matematica@kaichaini.com' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('[CVN2] correo no registrado debería rechazar con Credenciales invalidas', async () => {
    const req = { body: { correo: 'nadie@kaichaini.test', contrasena: 'Docente123' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Credenciales invalidas' });
  });

  test('[CVN3] correo de un Estudiante (rol distinto) debería rechazar', async () => {
    const req = { body: { correo: 'estudiante@demo.com', contrasena: 'Kaichaini1' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('[CVN4] contrasena con longitud < 8 debería rechazar', async () => {
    const req = { body: { correo: 'matematica@kaichaini.com', contrasena: 'ab' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('[CVN5] contrasena sin mayusculas debería rechazar', async () => {
    const req = { body: { correo: 'matematica@kaichaini.com', contrasena: 'docente123' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('[CVN6] contrasena sin numeros debería rechazar', async () => {
    const req = { body: { correo: 'matematica@kaichaini.com', contrasena: 'DocenteABC' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('[CVN7] contrasena que no coincide con la almacenada debería rechazar', async () => {
    const req = { body: { correo: 'matematica@kaichaini.com', contrasena: 'Docente999' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  // HALLAZGO (DEF-01): el mismo problema de formato de correo detectado
  // en iniciarSesion() tambien existe en iniciarSesionDocente().
  // CORRECCION: CORREO_REGEX en authController.js aplica a ambos
  // metodos, por lo que aqui tambien se rechaza con HTTP 400.
  test('correo sin "@" debería rechazar con error de validacion', async () => {
    const req = { body: { correo: 'nodomaintest.com', contrasena: 'Docente123' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('correo sin nombre debería rechazar con error de validacion', async () => {
    const req = { body: { correo: '@kaichaini.test', contrasena: 'Docente123' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('correo sin dominio debería rechazar con error de validacion', async () => {
    const req = { body: { correo: 'matematica@', contrasena: 'Docente123' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ============================================================
// H.U. 007 - Inicio de sesion del Estudiante
// ============================================================
describe('AuthController.iniciarSesion (H.U. 007, integración con BD real)', () => {
  test('[CV6+CV7+CV8+CV9+CV10] debería iniciar sesión correctamente con credenciales válidas de estudiante', async () => {
    const req = { body: { correo: 'estudiante@demo.com', contrasena: 'Kaichaini1' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const respuesta = res.json.mock.calls[0][0];
    expect(respuesta.success).toBe(true);
    expect(respuesta.data.usuario.correo).toBe('estudiante@demo.com');
    expect(respuesta.data.usuario.contrasena).toBeUndefined();
  });

  test('[CVN9+CVN16] correo y contrasena vacios deberían rechazar con error de validacion', async () => {
    const req = { body: { correo: '', contrasena: '' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('[CVN16] contrasena vacia debería rechazar con error de validacion', async () => {
    const req = { body: { correo: 'estudiante@demo.com' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('[CVN10] correo no registrado debería rechazar con Credenciales invalidas', async () => {
    const req = { body: { correo: 'nadie@kaichaini.test', contrasena: 'Kaichaini1' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Credenciales invalidas' });
  });

  test('[CVN11] correo numerico debería rechazar con error de validacion', async () => {
    const req = { body: { correo: 12345, contrasena: 'Kaichaini1' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // HALLAZGO (DEF-01): ningun metodo de login validaba el formato del
  // correo antes de consultar la BD; un correo mal formado retornaba
  // HTTP 401 (igual que un correo no registrado) en vez de HTTP 400.
  // CORRECCION: se agrego CORREO_REGEX en authController.js, que
  // rechaza el correo con HTTP 400 antes de consultar la BD.
  test('[CVN10-formato] correo sin "@" debería rechazar con error de validacion', async () => {
    const req = { body: { correo: 'nodomaintest.com', contrasena: 'Kaichaini1' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('[CVN10-formato] correo sin nombre debería rechazar con error de validacion', async () => {
    const req = { body: { correo: '@kaichaini.test', contrasena: 'Kaichaini1' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('[CVN10-formato] correo sin dominio debería rechazar con error de validacion', async () => {
    const req = { body: { correo: 'estudiante@', contrasena: 'Kaichaini1' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('[CVN12] contrasena con longitud < 8 debería rechazar', async () => {
    const req = { body: { correo: 'estudiante@demo.com', contrasena: 'ab' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('[CVN13] contrasena sin mayusculas debería rechazar', async () => {
    const req = { body: { correo: 'estudiante@demo.com', contrasena: 'kaichaini1' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('[CVN14] contrasena sin numeros debería rechazar', async () => {
    const req = { body: { correo: 'estudiante@demo.com', contrasena: 'KaichainiX' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('[CVN15] contrasena que no coincide con la almacenada debería rechazar', async () => {
    const req = { body: { correo: 'estudiante@demo.com', contrasena: 'Kaichaini9' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
