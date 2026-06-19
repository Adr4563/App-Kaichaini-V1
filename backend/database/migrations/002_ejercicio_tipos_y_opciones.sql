-- Migration 002: Tipos de ejercicio actualizados + columna opciones
-- Date: 2026-05-24
-- Tablas afectadas: ejercicio, respuesta

-- ── 1. Agregar columna opciones a ejercicio ───────────────────────────────────
ALTER TABLE ejercicio
  ADD COLUMN IF NOT EXISTS opciones TEXT DEFAULT '[]';

-- ── 2. Renombrar clic_imagen → clic_numero ────────────────────────────────────
UPDATE ejercicio
  SET tipo = 'clic_numero'
  WHERE tipo = 'clic_imagen';

-- ── 3. Eliminar respuestas huérfanas PRIMERO (FK constraint) ──────────────────
--    Si existen ejercicios con tipos no soportados, sus respuestas se borran antes
DELETE FROM respuesta
  WHERE idejercicio IN (
    SELECT id FROM ejercicio
    WHERE tipo NOT IN ('seleccion_multiple', 'clic_numero')
  );

-- ── 4. Ahora sí eliminar ejercicios con tipos no soportados ───────────────────
DELETE FROM ejercicio
  WHERE tipo NOT IN ('seleccion_multiple', 'clic_numero');

-- Notes:
--   - Tipos válidos finales: seleccion_multiple | clic_numero
--   - seleccion_multiple : el estudiante elige la respuesta entre varias opciones de texto
--   - clic_numero        : el estudiante toca el número correcto entre varios números mostrados
--   - opciones           : array JSON como texto, ej: '["4","6","8","10"]'
--   - El DELETE de respuesta va ANTES del DELETE de ejercicio para evitar error de FK
