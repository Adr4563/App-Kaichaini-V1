const ClaseController = require('../src/controllers/claseController');
const Clase = require('../src/models/Clase');

function crearRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('ClaseController.listarPorDocente', () => {
  afterEach(() => vi.restoreAllMocks());

  test('lista las clases del docente y responde HTTP 200', async () => {
    const clases = [
      { id: 'clase-1', nombre: 'Matematica', codigoUnico: 'ABC12345', curso: '5A', numEstudiantes: 20 },
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

  test('AS IS: un rol desconocido es tratado como estudiante', async () => {
    const clases = [{ id: 'clase-1', nombre: 'Historia' }];
    const listarPorDocente = vi.spyOn(Clase, 'listarPorDocente');
    const obtenerPorEstudiante = vi.spyOn(Clase, 'obtenerPorEstudiante').mockResolvedValue(clases);
    const req = { query: { idUsuario: 'usuario-1', rol: 'Administrador' } };
    const res = crearRes();

    await ClaseController.listarPorDocente(req, res);

    expect(listarPorDocente).not.toHaveBeenCalled();
    expect(obtenerPorEstudiante).toHaveBeenCalledWith('usuario-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: clases });
  });
});
