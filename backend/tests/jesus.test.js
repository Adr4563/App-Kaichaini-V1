const Modulo = require('../src/models/Modulo');
const ModuloController = require('../src/controllers/moduloController');
const Ejercicio = require('../src/models/Ejercicio');
const EjercicioController = require('../src/controllers/ejercicioController');
const AuthController = require('../src/controllers/authController');
const User = require('../src/models/User');
const Estudiante = require('../src/models/Estudiante');
const Liga = require('../src/models/Liga');

function crearRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

// ============================================================
// H.U. 318 - Visualización de los módulos y contenido académico
// Relación con pantallas: ModulosClaseDocenteScreen / MapaScreen / EjercicioScreen
// ============================================================
describe('H.U. 318 - Visualización de módulos y ejercicios', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('[HU318-01] debería listar los módulos de una clase cuando el idClase es válido', async () => {
    const req = { query: { idClase: 'clase-123' } };
    const res = crearRes();
    const modulosMock = [
      { id: 'mod-1', nombre: 'Matemática', bimestre: 1, orden: 1 },
      { id: 'mod-2', nombre: 'Lectura', bimestre: 1, orden: 2 },
    ];

    vi.spyOn(Modulo, 'obtenerPorClase').mockResolvedValue(modulosMock);

    await ModuloController.listarPorClase(req, res);

    expect(Modulo.obtenerPorClase).toHaveBeenCalledWith('clase-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: modulosMock });
  });

  test('[HU318-02] debería rechazar la consulta si falta el idClase al listar módulos', async () => {
    const req = { query: {} };
    const res = crearRes();

    await ModuloController.listarPorClase(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'ID de clase es requerido' });
  });

  test('[HU318-03] debería listar ejercicios de un módulo sin exponer la respuesta correcta', async () => {
    const req = { query: { idModulo: 'mod-1' } };
    const res = crearRes();
    const ejerciciosMock = [
      { id: 'ej-1', tipo: 'clic_numero', enunciado: '¿Cuánto es 5 + 3?', respuestaCorrecta: 8 },
      { id: 'ej-2', tipo: 'seleccion_multiple', enunciado: '¿Cuál es el sinónimo de feliz?', respuestaCorrecta: 'Alegre' },
    ];

    vi.spyOn(Ejercicio, 'obtenerListaEjerciciosPorModulo').mockResolvedValue(ejerciciosMock);

    await EjercicioController.obtenerListaEjerciciosPorModulo(req, res);

    expect(Ejercicio.obtenerListaEjerciciosPorModulo).toHaveBeenCalledWith('mod-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [
        { id: 'ej-1', tipo: 'clic_numero', enunciado: '¿Cuánto es 5 + 3?' },
        { id: 'ej-2', tipo: 'seleccion_multiple', enunciado: '¿Cuál es el sinónimo de feliz?' },
      ],
    });
  });

  test('[HU318-04] debería rechazar la consulta si falta el idModulo al listar ejercicios', async () => {
    const req = { query: {} };
    const res = crearRes();

    await EjercicioController.obtenerListaEjerciciosPorModulo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'ID de modulo es requerido' });
  });
});

// ============================================================
// H.U. 001 - Registro de usuario (estudiante)
// Relación con pantalla: ClassCodeScreen -> RegisterScreen
// ============================================================
describe('H.U. 001 - Registro de usuario estudiante', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('[HU001-01] debería registrar un estudiante cuando los datos son válidos', async () => {
    const req = {
      body: {
        nombre: 'Ana López',
        correo: 'ana@kaichaini.test',
        contrasena: 'Test1234',
        rol: 'Estudiante',
        colegio: 'Colegio Principal',
      },
    };
    const res = crearRes();
    const usuarioRegistrado = {
      id: 'est-1',
      nombre: 'Ana López',
      correo: 'ana@kaichaini.test',
      rol: 'Estudiante',
      colegio: 'Colegio Principal',
      idLiga: 'liga-1',
      contrasena: 'Test1234',
    };

    vi.spyOn(User, 'obtenerPorCorreo').mockResolvedValue(null);
    vi.spyOn(Liga, 'obtenerLigaPorPuntos').mockResolvedValue({ id: 'liga-1' });
    vi.spyOn(Estudiante, 'registrar').mockResolvedValue(usuarioRegistrado);
    vi.spyOn(User, 'inicializarXP').mockResolvedValue(undefined);

    await AuthController.registrar(req, res);

    expect(User.obtenerPorCorreo).toHaveBeenCalledWith('ana@kaichaini.test');
    expect(Liga.obtenerLigaPorPuntos).toHaveBeenCalledWith(0);
    expect(Estudiante.registrar).toHaveBeenCalledWith({
      nombre: 'Ana López',
      correo: 'ana@kaichaini.test',
      contrasena: 'Test1234',
      avatar: undefined,
      colegio: 'Colegio Principal',
      idLiga: 'liga-1',
    });
    expect(User.inicializarXP).toHaveBeenCalledWith('est-1');
    expect(res.status).toHaveBeenCalledWith(201);

    const respuesta = res.json.mock.calls[0][0];
    expect(respuesta.success).toBe(true);
    expect(respuesta.message).toBe('Usuario registrado exitosamente');
    expect(respuesta.data.usuario).toBeUndefined();
    expect(respuesta.data).toMatchObject({
      id: 'est-1',
      nombre: 'Ana López',
      correo: 'ana@kaichaini.test',
      rol: 'Estudiante',
      colegio: 'Colegio Principal',
      idLiga: 'liga-1',
    });
    expect(respuesta.data.contrasena).toBeUndefined();
  });

  test('[HU001-02] debería rechazar el registro si faltan datos requeridos', async () => {
    const req = { body: { nombre: '', correo: '', contrasena: '', rol: '' } };
    const res = crearRes();

    await AuthController.registrar(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'nombre, correo, contrasena y rol son requeridos',
    });
  });

  test('[HU001-03] debería rechazar el registro si el correo ya está en uso', async () => {
    const req = {
      body: {
        nombre: 'Ana López',
        correo: 'ana@kaichaini.test',
        contrasena: 'Test1234',
        rol: 'Estudiante',
      },
    };
    const res = crearRes();

    vi.spyOn(User, 'obtenerPorCorreo').mockResolvedValue({ id: 'usuario-existente' });

    await AuthController.registrar(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'El correo ya esta en uso' });
  });
});
