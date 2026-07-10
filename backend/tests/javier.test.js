const Ejercicio = require('../src/models/Ejercicio');
const EjercicioController = require('../src/controllers/ejercicioController');

function crearRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('Validación de creación de ejercicios para HU315 y HU316', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('HU315: permite crear un ejercicio clic en número cuando el payload es válido', async () => {
    const req = {
      body: {
        idModulo: 'mod-1',
        enunciado: '¿Cuánto es 5 + 3?',
        respuestaCorrecta: 8,
        opciones: [8, 7],
      },
    };
    const res = crearRes();
    const ejercicioCreado = { id: 'ej-1', tipo: 'clic_numero' };

    vi.spyOn(Ejercicio, 'crear').mockResolvedValue(ejercicioCreado);

    await EjercicioController.crearClicNumero(req, res);

    expect(Ejercicio.crear).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('HU315: rechaza un ejercicio clic en número si el enunciado está vacío', async () => {
    const req = {
      body: {
        idModulo: 'mod-1',
        enunciado: '   ',
        respuestaCorrecta: 8,
        opciones: [8, 7],
      },
    };
    const res = crearRes();
    const crearSpy = vi.spyOn(Ejercicio, 'crear');

    await EjercicioController.crearClicNumero(req, res);

    expect(crearSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Enunciado inválido' });
  });

  test('HU315: rechaza un ejercicio clic en número si hay menos de dos opciones', async () => {
    const req = {
      body: {
        idModulo: 'mod-1',
        enunciado: '¿Cuánto es 5 + 3?',
        respuestaCorrecta: 8,
        opciones: [8],
      },
    };
    const res = crearRes();
    const crearSpy = vi.spyOn(Ejercicio, 'crear');

    await EjercicioController.crearClicNumero(req, res);

    expect(crearSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Debe haber al menos 2 opciones' });
  });

  test('HU315: rechaza un ejercicio clic en número si la respuesta correcta no está entre las opciones', async () => {
    const req = {
      body: {
        idModulo: 'mod-1',
        enunciado: '¿Cuánto es 5 + 3?',
        respuestaCorrecta: 8,
        opciones: [7, 6],
      },
    };
    const res = crearRes();
    const crearSpy = vi.spyOn(Ejercicio, 'crear');

    await EjercicioController.crearClicNumero(req, res);

    expect(crearSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'La respuesta correcta debe existir entre las opciones' });
  });

  test('HU316: permite crear un ejercicio selección múltiple cuando el payload es válido', async () => {
    const req = {
      body: {
        idModulo: 'mod-2',
        enunciado: '¿Cuál es el sinónimo de "feliz"?',
        respuestaCorrecta: 'Alegre',
        opciones: ['Alegre', 'Triste'],
      },
    };
    const res = crearRes();
    const ejercicioCreado = { id: 'ej-2', tipo: 'seleccion_multiple' };

    vi.spyOn(Ejercicio, 'crear').mockResolvedValue(ejercicioCreado);

    await EjercicioController.crearSeleccionMultiple(req, res);

    expect(Ejercicio.crear).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('HU316: rechaza un ejercicio selección múltiple si una opción está vacía', async () => {
    const req = {
      body: {
        idModulo: 'mod-2',
        enunciado: '¿Cuál es el sinónimo de "feliz"?',
        respuestaCorrecta: 'Alegre',
        opciones: ['Alegre', ''],
      },
    };
    const res = crearRes();
    const crearSpy = vi.spyOn(Ejercicio, 'crear');

    await EjercicioController.crearSeleccionMultiple(req, res);

    expect(crearSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Las opciones no pueden estar vacías' });
  });

  test('HU316: rechaza un ejercicio selección múltiple si el enunciado supera 300 caracteres', async () => {
    const req = {
      body: {
        idModulo: 'mod-2',
        enunciado: 'a'.repeat(301),
        respuestaCorrecta: 'Alegre',
        opciones: ['Alegre', 'Triste'],
      },
    };
    const res = crearRes();
    const crearSpy = vi.spyOn(Ejercicio, 'crear');

    await EjercicioController.crearSeleccionMultiple(req, res);

    expect(crearSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Enunciado inválido' });
  });
});
