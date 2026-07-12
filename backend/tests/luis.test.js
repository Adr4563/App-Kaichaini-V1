const RespuestaController = require('../src/controllers/respuestaController');
const Insignia = require('../src/models/Insignia');

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
