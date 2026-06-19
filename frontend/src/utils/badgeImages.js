/**
 * badgeImages.js
 * Mapea insignias a sus PNGs locales.
 *
 * Estrategia de lookup (en orden de prioridad):
 *   1. Por criterio  — siempre viene de la API, nunca es null
 *   2. Por imagenUrl — respaldo si el backend lo devuelve
 */

// ─── PNGs por criterio (campo que SIEMPRE viene de la API) ───────────────────
const BY_CRITERIO = {
  'primer_modulo':  require('../../assets/images/badges/primer_paso.png'),
  'ejercicios_5':   require('../../assets/images/badges/primeros_pasos.png'),
  'ejercicios_10':  require('../../assets/images/badges/en_racha.png'),
  'ejercicios_20':  require('../../assets/images/badges/imparable.png'),
  'ejercicios_30':  require('../../assets/images/badges/maestro.png'),
  '100_ejercicios': require('../../assets/images/badges/centurion.png'),
  'xp_500':         require('../../assets/images/badges/escalador_xp.png'),
};

// ─── PNGs por imagenUrl (campo de DB, puede venir null) ──────────────────────
const BY_URL = {
  'assets/images/badges/primer_paso.png':    require('../../assets/images/badges/primer_paso.png'),
  'assets/images/badges/primeros_pasos.png': require('../../assets/images/badges/primeros_pasos.png'),
  'assets/images/badges/en_racha.png':       require('../../assets/images/badges/en_racha.png'),
  'assets/images/badges/imparable.png':      require('../../assets/images/badges/imparable.png'),
  'assets/images/badges/maestro.png':        require('../../assets/images/badges/maestro.png'),
  'assets/images/badges/centurion.png':      require('../../assets/images/badges/centurion.png'),
  'assets/images/badges/escalador_xp.png':   require('../../assets/images/badges/escalador_xp.png'),
};

/**
 * Devuelve el source PNG para usar en <Image source={...} />.
 * Acepta el objeto insignia completo { criterio, imagenUrl }.
 *
 * @param {{ criterio?: string, imagenUrl?: string } | string | null} insignia
 * @returns {number | null}
 */
export function getBadgePng(insignia) {
  if (!insignia) return null;

  // Si se pasa el objeto completo
  if (typeof insignia === 'object') {
    if (insignia.criterio && BY_CRITERIO[insignia.criterio]) {
      return BY_CRITERIO[insignia.criterio];
    }
    if (insignia.imagenUrl && BY_URL[insignia.imagenUrl]) {
      return BY_URL[insignia.imagenUrl];
    }
    return null;
  }

  // Si se pasa solo el string de imagenUrl (compatibilidad hacia atrás)
  return BY_URL[insignia] ?? null;
}
