const RespuestaController = require('../src/controllers/respuestaController');
const Insignia = require('../src/models/Insignia');
const ClaseController = require('../src/controllers/claseController');
const Clase = require('../src/models/Clase');

function crearRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('RespuestaController.verificarCriterio', () => {
  afterEach(() => vi.restoreAllMocks());

  test('desbloquea primer_modulo cuando el primer modulo fue completado', async () => {
    const insignia = { id: 'insignia-1', criterio: 'primer_modulo' };
    vi.spyOn(Insignia, 'listar').mockResolvedValue([insignia]);
    vi.spyOn(Insignia, 'tieneInsignia').mockResolvedValue(false);
    const desbloquear = vi.spyOn(Insignia, 'desbloquear').mockResolvedValue(true);

    const resultado = await RespuestaController.verificarCriterio('estudiante-1', {
      primerModuloCompletado: true,
    });

    expect(desbloquear).toHaveBeenCalledWith('estudiante-1', 'insignia-1');
    expect(resultado).toEqual([insignia]);
  });

  test('no desbloquea primer_modulo cuando el primer modulo no fue completado', async () => {
    const insignia = { id: 'insignia-1', criterio: 'primer_modulo' };
    vi.spyOn(Insignia, 'listar').mockResolvedValue([insignia]);
    vi.spyOn(Insignia, 'tieneInsignia').mockResolvedValue(false);
    const desbloquear = vi.spyOn(Insignia, 'desbloquear').mockResolvedValue(true);

    const resultado = await RespuestaController.verificarCriterio('estudiante-1', {
      primerModuloCompletado: false,
    });

    expect(desbloquear).not.toHaveBeenCalled();
    expect(resultado).toEqual([]);
  });

  test('no desbloquea nuevamente una insignia que el estudiante ya posee', async () => {
    const insignia = { id: 'insignia-1', criterio: 'primer_modulo' };
    vi.spyOn(Insignia, 'listar').mockResolvedValue([insignia]);
    vi.spyOn(Insignia, 'tieneInsignia').mockResolvedValue(true);
    const desbloquear = vi.spyOn(Insignia, 'desbloquear').mockResolvedValue(true);

    const resultado = await RespuestaController.verificarCriterio('estudiante-1', {
      primerModuloCompletado: true,
    });

    expect(desbloquear).not.toHaveBeenCalled();
    expect(resultado).toEqual([]);
  });

  test('no desbloquea ejercicios_5 con el valor limite inferior de 4', async () => {
    const insignia = { id: 'insignia-5', criterio: 'ejercicios_5' };
    vi.spyOn(Insignia, 'listar').mockResolvedValue([insignia]);
    vi.spyOn(Insignia, 'tieneInsignia').mockResolvedValue(false);
    const desbloquear = vi.spyOn(Insignia, 'desbloquear').mockResolvedValue(true);

    const resultado = await RespuestaController.verificarCriterio('estudiante-1', {
      totalCorrectasGlobal: 4,
    });

    expect(desbloquear).not.toHaveBeenCalled();
    expect(resultado).toEqual([]);
  });

  test('desbloquea ejercicios_5 con el valor limite valido de 5', async () => {
    const insignia = { id: 'insignia-5', criterio: 'ejercicios_5' };
    vi.spyOn(Insignia, 'listar').mockResolvedValue([insignia]);
    vi.spyOn(Insignia, 'tieneInsignia').mockResolvedValue(false);
    const desbloquear = vi.spyOn(Insignia, 'desbloquear').mockResolvedValue(true);

    const resultado = await RespuestaController.verificarCriterio('estudiante-1', {
      totalCorrectasGlobal: 5,
    });

    expect(desbloquear).toHaveBeenCalledWith('estudiante-1', 'insignia-5');
    expect(resultado).toEqual([insignia]);
  });
});

describe('ClaseController.listarPorDocente', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('lista las clases del docente y responde HTTP 200', async () => {
    const clases = [
      {
        id: 'clase-1',
        nombre: 'Quinto A',
        codigoUnico: 'ABC12345',
        curso: 'Matemática',
        numEstudiantes: 20,
      },
    ];
    const listarPorDocente = vi.spyOn(Clase, 'listarPorDocente').mockResolvedValue(clases);
    const obtenerPorEstudiante = vi.spyOn(Clase, 'obtenerPorEstudiante');
    const req = { query: { idUsuario: 'docente-1', rol: 'Docente' } };
    const res = crearRes();

    await ClaseController.listarPorDocente(req, res);

    expect(listarPorDocente).toHaveBeenCalledWith('docente-1');
    expect(obtenerPorEstudiante).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: clases });
  });

  test.each([
    ['idUsuario', { rol: 'Docente' }],
    ['rol', { idUsuario: 'docente-1' }],
  ])('responde HTTP 400 cuando falta %s y no consulta el modelo', async (_campo, query) => {
    const listarPorDocente = vi.spyOn(Clase, 'listarPorDocente');
    const obtenerPorEstudiante = vi.spyOn(Clase, 'obtenerPorEstudiante');
    const res = crearRes();

    await ClaseController.listarPorDocente({ query }, res);

    expect(listarPorDocente).not.toHaveBeenCalled();
    expect(obtenerPorEstudiante).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'idUsuario y rol son requeridos',
    });
  });

  test('responde HTTP 500 cuando Clase.listarPorDocente lanza un error', async () => {
    vi.spyOn(Clase, 'listarPorDocente').mockRejectedValue(new Error('Error al listar clases'));
    vi.spyOn(Clase, 'obtenerPorEstudiante');
    const req = { query: { idUsuario: 'docente-1', rol: 'Docente' } };
    const res = crearRes();

    await ClaseController.listarPorDocente(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Error al listar clases' });
  });

  test('lista las clases del estudiante y responde HTTP 200', async () => {
    const clases = [{ id: 'clase-2', nombre: 'Sexto B' }];
    const listarPorDocente = vi.spyOn(Clase, 'listarPorDocente');
    const obtenerPorEstudiante = vi.spyOn(Clase, 'obtenerPorEstudiante').mockResolvedValue(clases);
    const req = { query: { idUsuario: 'estudiante-1', rol: 'Estudiante' } };
    const res = crearRes();

    await ClaseController.listarPorDocente(req, res);

    expect(obtenerPorEstudiante).toHaveBeenCalledWith('estudiante-1');
    expect(listarPorDocente).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: clases });
  });

  test('responde HTTP 400 cuando el rol no es admitido', async () => {
    const listarPorDocente = vi.spyOn(Clase, 'listarPorDocente');
    const obtenerPorEstudiante = vi.spyOn(Clase, 'obtenerPorEstudiante');
    const req = { query: { idUsuario: 'usuario-1', rol: 'Administrador' } };
    const res = crearRes();

    await ClaseController.listarPorDocente(req, res);

    expect(listarPorDocente).not.toHaveBeenCalled();
    expect(obtenerPorEstudiante).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Rol no valido' });
  });
});
