// modulosService.js
// H.U. 318 - Servicio para obtener modulos de una clase

import api from './api';

// TODO: Reemplazar mock por llamada real a la API cuando el backend esté listo.
// Endpoint esperado: GET /modulos/:idClase
const MOCK_MODULOS = [
  { id: 1,  nombre: 'Números naturales',          bimestre: 'I',   orden: 1 },
  { id: 2,  nombre: 'Adición y sustracción',       bimestre: 'I',   orden: 2 },
  { id: 3,  nombre: 'Multiplicación',              bimestre: 'I',   orden: 3 },
  { id: 4,  nombre: 'División',                    bimestre: 'II',  orden: 1 },
  { id: 5,  nombre: 'Fracciones',                  bimestre: 'II',  orden: 2 },
  { id: 6,  nombre: 'Decimales',                   bimestre: 'II',  orden: 3 },
  { id: 7,  nombre: 'Geometría básica',            bimestre: 'III', orden: 1 },
  { id: 8,  nombre: 'Perímetro y área',            bimestre: 'III', orden: 2 },
  { id: 9,  nombre: 'Estadística',                 bimestre: 'IV',  orden: 1 },
  { id: 10, nombre: 'Probabilidad',                bimestre: 'IV',  orden: 2 },
  { id: 11, nombre: 'Resolución de problemas',     bimestre: 'IV',  orden: 3 },
];

const USE_MOCK = true;

export async function getModulosByClase(claseId) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 800));
    return MOCK_MODULOS;
  }

  // TODO: Descomentar cuando el backend esté disponible
  // const { data } = await api.get(`/modulos/${claseId}`);
  // return data.data;
}
