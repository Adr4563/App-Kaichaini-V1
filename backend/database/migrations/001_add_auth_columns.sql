-- Migration 001: Add authentication columns to USUARIO table
-- Date: 2026-05-17
-- Purpose: Support password reset and additional profile fields

-- Add colegio field (H.U. 001 - Registro de Estudiante)
ALTER TABLE USUARIO ADD COLUMN IF NOT EXISTS colegio VARCHAR(200);

-- Add password reset token fields (H.U. 008 - Recuperar Contraseña)
ALTER TABLE USUARIO ADD COLUMN IF NOT EXISTS resetPasswordToken VARCHAR(255);
ALTER TABLE USUARIO ADD COLUMN IF NOT EXISTS resetPasswordExpires TIMESTAMP;

-- Notes:
-- - resetPasswordToken: UUID token generated during forgot-password flow
-- - resetPasswordExpires: Timestamp when reset token expires (set to NOW + 1 hour)
-- - colegio: School/institution name from student registration (H.U. 001)
