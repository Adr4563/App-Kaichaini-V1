-- Aquí va el script SQL para crear la base de datos, tablas, insertar datos, etc.
-- Si quieren pueden agregar un archivo por cada sección (crear tablas, insertar
-- datos, etc.) y luego ejecutar cada uno de ellos. Para tener más orden :b

-- 1. Crear extensiones necesarias (para generación de UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Eliminar tablas si existen (en orden inverso de dependencia)
DROP TABLE IF EXISTS ESTUDIANTE_INSIGNIA CASCADE;
DROP TABLE IF EXISTS INSIGNIA CASCADE;
DROP TABLE IF EXISTS MATERIAL CASCADE;
DROP TABLE IF EXISTS RESPUESTA CASCADE;
DROP TABLE IF EXISTS EJERCICIO CASCADE;
DROP TABLE IF EXISTS MODULO CASCADE;
DROP TABLE IF EXISTS SILABO CASCADE;
DROP TABLE IF EXISTS ESTUDIANTE_CLASE CASCADE;
DROP TABLE IF EXISTS CLASE CASCADE;
DROP TABLE IF EXISTS XP CASCADE;
DROP TABLE IF EXISTS USUARIO CASCADE;
DROP TABLE IF EXISTS LIGA CASCADE;

-- 3. Creación de Tablas

-- Nota sobre nomenclatura:
-- Columnas con camelCase que los repositorios usan con comillas (quoted identifiers)
-- se definen entre comillas para preservar capitalización en PostgreSQL.
-- Columnas que los repositorios referencian en minúsculas (via alias AS) se definen
-- sin comillas (PostgreSQL las almacena en minúsculas).

CREATE TABLE LIGA (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    "umbralMinimo" INTEGER NOT NULL,
    "umbralMaximo" INTEGER NOT NULL
);

CREATE TABLE USUARIO (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    "tokenJWT" VARCHAR(500),
    rol VARCHAR(50) NOT NULL, -- Ej: 'Estudiante', 'Docente'
    colegio VARCHAR(150),
    "resetPasswordToken" VARCHAR(500),
    "resetPasswordExpires" TIMESTAMP,
    fecharegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "idLiga" UUID,
    CONSTRAINT fk_usuario_liga FOREIGN KEY ("idLiga") REFERENCES LIGA(id) ON DELETE SET NULL
);

CREATE TABLE XP (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "idEstudiante" UUID UNIQUE NOT NULL,
    "puntosTotal" INTEGER DEFAULT 0,
    CONSTRAINT fk_xp_usuario FOREIGN KEY ("idEstudiante") REFERENCES USUARIO(id) ON DELETE CASCADE
);

CREATE TABLE CLASE (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(150) NOT NULL,
    "codigoUnico" VARCHAR(50) UNIQUE NOT NULL,
    curso VARCHAR(150) NOT NULL,
    "idDocente" UUID NOT NULL,
    CONSTRAINT fk_clase_docente FOREIGN KEY ("idDocente") REFERENCES USUARIO(id) ON DELETE CASCADE,
    CONSTRAINT chk_clase_curso CHECK (curso IN ('Matemática', 'Comunicación'))
);

CREATE TABLE ESTUDIANTE_CLASE (
    "idEstudiante" UUID NOT NULL,
    "idClase" UUID NOT NULL,
    "fechaIngreso" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("idEstudiante", "idClase"),
    CONSTRAINT fk_estudiante_clase_estudiante FOREIGN KEY ("idEstudiante") REFERENCES USUARIO(id) ON DELETE CASCADE,
    CONSTRAINT fk_estudiante_clase_clase FOREIGN KEY ("idClase") REFERENCES CLASE(id) ON DELETE CASCADE
);

CREATE TABLE SILABO (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idclase UUID UNIQUE NOT NULL,
    archivourl VARCHAR(255) NOT NULL,
    contenido TEXT,
    fechasubida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_silabo_clase FOREIGN KEY (idclase) REFERENCES CLASE(id) ON DELETE CASCADE
);

CREATE TABLE MODULO (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idclase UUID NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    orden INTEGER NOT NULL,
    bimestre INTEGER NOT NULL,
    estado VARCHAR(50) NOT NULL,
    CONSTRAINT fk_modulo_clase FOREIGN KEY (idclase) REFERENCES CLASE(id) ON DELETE CASCADE,
    CONSTRAINT chk_modulo_bimestre CHECK (bimestre BETWEEN 1 AND 4)
);

CREATE TABLE EJERCICIO (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idmodulo UUID NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    enunciado TEXT NOT NULL,
    respuestacorrecta TEXT NOT NULL,
    opciones TEXT,
    CONSTRAINT fk_ejercicio_modulo FOREIGN KEY (idmodulo) REFERENCES MODULO(id) ON DELETE CASCADE,
    CONSTRAINT chk_ejercicio_tipo CHECK (tipo IN ('clic_numero', 'seleccion_multiple'))
);

CREATE TABLE RESPUESTA (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idestudiante UUID NOT NULL,
    idejercicio UUID NOT NULL,
    respuesta TEXT NOT NULL,
    escorrecta BOOLEAN NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_respuesta_estudiante FOREIGN KEY (idestudiante) REFERENCES USUARIO(id) ON DELETE CASCADE,
    CONSTRAINT fk_respuesta_ejercicio FOREIGN KEY (idejercicio) REFERENCES EJERCICIO(id) ON DELETE CASCADE
);

CREATE TABLE MATERIAL (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idclase UUID NOT NULL,
    idmodulo UUID NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    archivourl VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    CONSTRAINT fk_material_clase FOREIGN KEY (idclase) REFERENCES CLASE(id) ON DELETE CASCADE,
    CONSTRAINT fk_material_modulo FOREIGN KEY (idmodulo) REFERENCES MODULO(id) ON DELETE CASCADE
);

CREATE TABLE INSIGNIA (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    criterio VARCHAR(255) NOT NULL,
    imagenurl VARCHAR(255)
);

CREATE TABLE ESTUDIANTE_INSIGNIA (
    idestudiante UUID NOT NULL,
    idinsignia UUID NOT NULL,
    fechadesbloqueo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (idestudiante, idinsignia),
    CONSTRAINT fk_estudiante_insignia_estudiante FOREIGN KEY (idestudiante) REFERENCES USUARIO(id) ON DELETE CASCADE,
    CONSTRAINT fk_estudiante_insignia_insignia FOREIGN KEY (idinsignia) REFERENCES INSIGNIA(id) ON DELETE CASCADE
);

-- 4. Creación de Índices Recomendados para Optimización de Consultas
CREATE INDEX idx_respuesta_estudiante_ejercicio ON RESPUESTA(idestudiante, idejercicio);
CREATE INDEX idx_ejercicio_modulo ON EJERCICIO(idmodulo);
CREATE INDEX idx_modulo_clase ON MODULO(idclase);
