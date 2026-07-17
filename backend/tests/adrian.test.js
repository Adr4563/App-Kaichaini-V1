const AuthController = require('../src/controllers/authController');

function crearRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}


// H.U. 013 - Inicio de sesion del Docente

describe('AuthController.iniciarSesionDocente (H.U. 013, integración con BD real)', () => {
  test(' debería iniciar sesión correctamente con credenciales válidas de docente', async () => {
    const req = { body: { correo: 'matematica@kaichaini.com', contrasena: 'Docente123' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const respuesta = res.json.mock.calls[0][0];
    expect(respuesta.success).toBe(true);
    expect(respuesta.data.usuario.correo).toBe('matematica@kaichaini.com');
    expect(respuesta.data.usuario.contrasena).toBeUndefined();
  });

  test(' correo vacio debería rechazar con error de validacion', async () => {
    const req = { body: { contrasena: 'Docente123' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test(' contrasena vacia debería rechazar con error de validacion', async () => {
    const req = { body: { correo: 'matematica@kaichaini.com' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('correo no registrado debería rechazar con Credenciales invalidas', async () => {
    const req = { body: { correo: 'nadie@kaichaini.test', contrasena: 'Docente123' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Credenciales invalidas' });
  });

  test(' correo de un Estudiante (rol distinto) debería rechazar', async () => {
    const req = { body: { correo: 'estudiante@demo.com', contrasena: 'Kaichaini1' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('contrasena con longitud < 8 debería rechazar', async () => {
    const req = { body: { correo: 'matematica@kaichaini.com', contrasena: 'ab' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('contrasena sin mayusculas debería rechazar', async () => {
    const req = { body: { correo: 'matematica@kaichaini.com', contrasena: 'docente123' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('contrasena sin numeros debería rechazar', async () => {
    const req = { body: { correo: 'matematica@kaichaini.com', contrasena: 'DocenteABC' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('contrasena que no coincide con la almacenada debería rechazar', async () => {
    const req = { body: { correo: 'matematica@kaichaini.com', contrasena: 'Docente999' } };
    const res = crearRes();

    await AuthController.iniciarSesionDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

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


// H.U. 007 - Inicio de sesion del Estudiante
describe('AuthController.iniciarSesion (H.U. 007, integración con BD real)', () => {
  test('debería iniciar sesión correctamente con credenciales válidas de estudiante', async () => {
    const req = { body: { correo: 'estudiante@demo.com', contrasena: 'Kaichaini1' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const respuesta = res.json.mock.calls[0][0];
    expect(respuesta.success).toBe(true);
    expect(respuesta.data.usuario.correo).toBe('estudiante@demo.com');
    expect(respuesta.data.usuario.contrasena).toBeUndefined();
  });

  test('correo y contrasena vacios deberían rechazar con error de validacion', async () => {
    const req = { body: { correo: '', contrasena: '' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('contrasena vacia debería rechazar con error de validacion', async () => {
    const req = { body: { correo: 'estudiante@demo.com' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('correo no registrado debería rechazar con Credenciales invalidas', async () => {
    const req = { body: { correo: 'nadie@kaichaini.test', contrasena: 'Kaichaini1' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Credenciales invalidas' });
  });

  test(' correo numerico debería rechazar con error de validacion', async () => {
    const req = { body: { correo: 12345, contrasena: 'Kaichaini1' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test(' correo sin "@" debería rechazar con error de validacion', async () => {
    const req = { body: { correo: 'nodomaintest.com', contrasena: 'Kaichaini1' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('correo sin nombre debería rechazar con error de validacion', async () => {
    const req = { body: { correo: '@kaichaini.test', contrasena: 'Kaichaini1' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('correo sin dominio debería rechazar con error de validacion', async () => {
    const req = { body: { correo: 'estudiante@', contrasena: 'Kaichaini1' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test(' contrasena con longitud < 8 debería rechazar', async () => {
    const req = { body: { correo: 'estudiante@demo.com', contrasena: 'ab' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('contrasena sin mayusculas debería rechazar', async () => {
    const req = { body: { correo: 'estudiante@demo.com', contrasena: 'kaichaini1' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test(' contrasena sin numeros debería rechazar', async () => {
    const req = { body: { correo: 'estudiante@demo.com', contrasena: 'KaichainiX' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test(' contrasena que no coincide con la almacenada debería rechazar', async () => {
    const req = { body: { correo: 'estudiante@demo.com', contrasena: 'Kaichaini9' } };
    const res = crearRes();

    await AuthController.iniciarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
