# 📚 Documentación Completa de APIs - App Kaichaini

## 🌐 URL Base y Estructura

### Para Frontend - Cómo Llamar a los Endpoints

**URL Base:** `http://localhost:3000/api/v1`

**Estructura completa de una ruta:**
```
http://localhost:3000/api/v1<ENDPOINT>
```

**Ejemplos:**
- Registro: `POST http://localhost:3000/api/v1/auth/register`
- Login: `POST http://localhost:3000/api/v1/auth/login`
- Mis clases: `GET http://localhost:3000/api/v1/clases/mis-clases`
- Responder: `POST http://localhost:3000/api/v1/respuestas`

### Configuración en Frontend

Para React Native con Expo o cualquier cliente HTTP:

```javascript
// Crear cliente HTTP reutilizable
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Ejemplo con fetch
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Si es un endpoint protegido:
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    correo: 'juan@example.com',
    contrasena: 'Password123'
  })
});

const data = await response.json();
```

### En Producción

Cambiar la URL base según el servidor:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';
```

---

## 🔐 Autenticación

Todos los endpoints protegidos requieren un header `Authorization: Bearer <TOKEN>` obtenido del login.

**Formato del Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1. POST `/auth/register` - Registrar Usuario
**Descripción:** Registra un nuevo estudiante o docente en el sistema.

**Body:**
```json
{
  "rol": "Estudiante",  // o "Docente"
  "nombre": "Juan Pérez",
  "correo": "juan@example.com",
  "contrasena": "Password123",  // Min 8 chars, 1 uppercase, 1 number
  "avatar": "https://...",       // URL de avatar
  "colorTema": "light",          // "light" o "dark" (solo estudiante)
  "colegio": "Colegio Nacional", // Campo requerido para estudiante
  "codigoValidacion": "DOC-123"  // Requerido para docente
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "id": "uuid",
    "nombre": "Juan Pérez",
    "correo": "juan@example.com",
    "rol": "Estudiante",
    "avatar": "https://...",
    "colorTema": "light",
    "colegio": "Colegio Nacional",
    "idLiga": "uuid-liga-amauta",
    "fechaRegistro": "2026-05-17T..."
  }
}
```

**H.U. Referenciadas:** 001 (validación de contraseña, colegio)

---

### 2. POST `/auth/login` - Iniciar Sesión
**Descripción:** Autentica un usuario y retorna un JWT para acceso a rutas protegidas.

**Body:**
```json
{
  "correo": "juan@example.com",
  "contrasena": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "uuid",
      "nombre": "Juan Pérez",
      "correo": "juan@example.com",
      "rol": "Estudiante",
      "avatar": "https://...",
      "fechaRegistro": "2026-05-17T..."
    }
  }
}
```

**Comportamientos especiales:**
- Cuenta bloqueada por 15 minutos después de 5 intentos fallidos
- Los errores son genéricos: "Credenciales inválidas" (no revela si el email existe)

**H.U. Referenciadas:** 001 (bloqueo de cuenta), 007 (login)

---

### 3. GET `/auth/me` - Obtener Perfil Actual
**Descripción:** Retorna la información del usuario actualmente autenticado.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nombre": "Juan Pérez",
    "correo": "juan@example.com",
    "rol": "Estudiante",
    "avatar": "https://...",
    "colorTema": "light",
    "colegio": "Colegio Nacional",
    "idLiga": "uuid",
    "fechaRegistro": "2026-05-17T..."
  }
}
```

---

### 4. POST `/auth/logout` - Cerrar Sesión
**Descripción:** Invalida el JWT del usuario actual.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:**
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

---

### 5. PUT `/auth/perfil` - Actualizar Perfil
**Descripción:** Actualiza información del perfil del usuario actual.

**Headers:** `Authorization: Bearer <TOKEN>`

**Body:**
```json
{
  "nombre": "Juan P. Nuevo",
  "avatar": "https://nuevo-avatar.com/...",
  "colorTema": "dark"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": { /* usuario actualizado */ }
}
```

---

### 6. POST `/auth/cambiar-contrasena` - Cambiar Contraseña
**Descripción:** Cambia la contraseña del usuario actual.

**Headers:** `Authorization: Bearer <TOKEN>`

**Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456",
  "confirmPassword": "NewPassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

---

### 7. POST `/auth/forgot-password` - Recuperar Contraseña
**Descripción:** Inicia proceso de recuperación de contraseña. Retorna un token para reset.

**Body:**
```json
{
  "correo": "juan@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Se ha enviado un enlace de recuperación a tu correo",
  "data": {
    "token": "uuid-token-reset"
  }
}
```

**H.U. Referenciadas:** 008 (recuperación de contraseña)

---

### 8. POST `/auth/reset-password` - Restablecer Contraseña
**Descripción:** Restablece la contraseña usando el token de recuperación.

**Body:**
```json
{
  "token": "uuid-token-reset",
  "newPassword": "NewPassword456",
  "confirmPassword": "NewPassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente"
}
```

**H.U. Referenciadas:** 008

---

## 📚 Clases

### 9. POST `/clases/validar-codigo` - Validar Código de Clase
**Descripción:** Valida que un código de clase existe (sin requerir autenticación).

**Body:**
```json
{
  "codigo": "MAT-101-2026"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Código válido",
  "data": {
    "id": "uuid-clase",
    "nombre": "Matemáticas 101",
    "codigoUnico": "MAT-101-2026",
    "curso": "Primero",
    "idDocente": "uuid-docente",
    "fechaCreacion": "2026-05-01T..."
  }
}
```

**H.U. Referenciadas:** 001 (validar código), 011 (unirse a clase)

---

### 10. POST `/clases/unirse` - Unirse a una Clase
**Descripción:** Inscribe al estudiante en una clase usando su código único.

**Headers:** `Authorization: Bearer <TOKEN>` (Estudiante)

**Body:**
```json
{
  "codigoUnico": "MAT-101-2026"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Te has unido a la clase exitosamente"
}
```

**Validaciones:**
- Estudiante no debe estar ya inscrito en la clase
- El código debe existir

**H.U. Referenciadas:** 011 (unirse a clase)

---

### 11. GET `/clases/mis-clases` - Obtener Mis Clases
**Descripción:** Lista todas las clases en que está inscrito el estudiante.

**Headers:** `Authorization: Bearer <TOKEN>` (Estudiante)

**Query Parameters:** ninguno

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-clase",
      "nombre": "Matemáticas 101",
      "codigoUnico": "MAT-101-2026",
      "curso": "Primero",
      "idDocente": "uuid",
      "fechaCreacion": "2026-05-01T...",
      "fechaIngreso": "2026-05-17T..."
    }
  ]
}
```

**H.U. Referenciadas:** 117 (ver mis clases)

---

### 12. GET `/clases/:id` - Obtener Detalles de Clase
**Descripción:** Obtiene la información detallada de una clase específica.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:**
```json
{
  "success": true,
  "data": { /* detalles de clase */ }
}
```

---

### 13. GET `/clases/:id/estudiantes` - Obtener Estudiantes de una Clase
**Descripción:** Lista todos los estudiantes inscritos en una clase.

**Headers:** `Authorization: Bearer <TOKEN>` (Docente)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "idEstudiante": "uuid",
      "idClase": "uuid",
      "fechaIngreso": "2026-05-17T..."
    }
  ]
}
```

---

### 14. POST `/clases` - Crear Nueva Clase
**Descripción:** Crea una nueva clase (solo docentes).

**Headers:** `Authorization: Bearer <TOKEN>` (Docente)

**Body:**
```json
{
  "nombre": "Matemáticas 101",
  "codigoUnico": "MAT-101-2026",
  "curso": "Primero"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Clase creada exitosamente",
  "data": { /* clase creada */ }
}
```

---

### 15. PUT `/clases/:id` - Actualizar Clase
**Descripción:** Actualiza información de una clase (solo docente propietario).

**Headers:** `Authorization: Bearer <TOKEN>` (Docente)

**Body:** mismo que POST

---

### 16. DELETE `/clases/:id` - Eliminar Clase
**Descripción:** Elimina una clase y todos sus estudiantes asociados.

**Headers:** `Authorization: Bearer <TOKEN>` (Docente)

---

### 17. POST `/clases/abandonar` - Abandonar una Clase
**Descripción:** Permite que un estudiante se retire de una clase.

**Headers:** `Authorization: Bearer <TOKEN>` (Estudiante)

**Body:**
```json
{
  "idClase": "uuid-clase"
}
```

---

## 🎓 Módulos (Unidades de Aprendizaje)

### 18. GET `/modulos?idClase=<id>&bimestre=<num>` - Obtener Módulos
**Descripción:** Lista módulos de una clase en un bimestre específico con su estado.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "Números Reales",
      "orden": 1,
      "bimestre": 1,
      "estado": "disponible"  // o "bloqueado", "completado"
    }
  ]
}
```

**H.U. Referenciadas:** 117 (ver módulos de clase)

---

### 19. GET `/modulos/:id` - Obtener Detalles de Módulo
**Headers:** `Authorization: Bearer <TOKEN>`

---

### 20. POST `/modulos/:idClase` - Crear Módulo
**Headers:** `Authorization: Bearer <TOKEN>` (Docente)

**Body:**
```json
{
  "nombre": "Números Reales",
  "orden": 1,
  "bimestre": 1
}
```

---

### 21. PUT `/modulos/:id` - Actualizar Módulo
**Headers:** `Authorization: Bearer <TOKEN>` (Docente)

---

### 22. DELETE `/modulos/:id` - Eliminar Módulo
**Headers:** `Authorization: Bearer <TOKEN>` (Docente)

---

## 📝 Ejercicios

### 23. GET `/ejercicios?idModulo=<id>` - Obtener Ejercicios del Módulo
**Descripción:** Lista ejercicios de un módulo sin mostrar respuestas correctas.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "idModulo": "uuid",
      "tipo": "seleccion_multiple",
      "enunciado": "¿Cuál es la raíz cuadrada de 16?",
      "respondido": false,
      "esCorrecta": null
    }
  ]
}
```

---

### 24. GET `/ejercicios/:id` - Obtener Ejercicio
**Descripción:** Obtiene un ejercicio sin mostrar la respuesta correcta.

**Headers:** `Authorization: Bearer <TOKEN>`

---

### 25. POST `/ejercicios` - Crear Ejercicio
**Headers:** `Authorization: Bearer <TOKEN>` (Docente)

**Body:**
```json
{
  "idModulo": "uuid",
  "tipo": "seleccion_multiple",
  "enunciado": "¿Cuál es 2+2?",
  "respuestaCorrecta": "4"
}
```

---

### 26. PUT `/ejercicios/:id` - Actualizar Ejercicio
**Headers:** `Authorization: Bearer <TOKEN>` (Docente)

---

### 27. DELETE `/ejercicios/:id` - Eliminar Ejercicio
**Headers:** `Authorization: Bearer <TOKEN>` (Docente)

---

## ✅ Respuestas (Core de Gamificación)

### 28. POST `/respuestas` - Responder Ejercicio ⭐ CRITICAL
**Descripción:** Procesa la respuesta de un estudiante a un ejercicio. Este es el endpoint más importante del sistema.

**Headers:** `Authorization: Bearer <TOKEN>` (Estudiante)

**Body:**
```json
{
  "idEjercicio": "uuid",
  "respuesta": "4"
}
```

**Response si es correcto:**
```json
{
  "success": true,
  "message": "Respuesta correcta!",
  "data": {
    "esCorrecta": true,
    "xpGanado": 10,
    "xpTotal": 125,
    "liga": {
      "id": "uuid",
      "nombre": "Panaca",
      "umbralMinimo": 500,
      "umbralMaximo": 999
    },
    "progresoModulo": {
      "idModulo": "uuid",
      "totalEjercicios": 5,
      "correctas": 4,
      "porcentajeAciertos": 80
    },
    "insigniasDesbloqueadas": [
      {
        "id": "uuid",
        "nombre": "Primer Ejercicio Correcto"
      }
    ],
    "retroalimentacion": "Buen desempeño, pero revisa los temas con errores"
  }
}
```

**Lógica interna:**
1. Compara respuesta (case-insensitive, trim)
2. Si correcta:
   - Otorga XP según tipo (10, 10, 15, 15)
   - Actualiza liga (H.U. 120)
   - Calcula progreso del módulo
   - Si 100% completado: desbloquea siguiente
   - Si ≥80% aciertos: otorga bono XP (50)
   - Verifica y desbloquea insignias
3. Retorna retroalimentación personalizada

**H.U. Referenciadas:** 309 (responder), 311-312 (tipos ejercicio), 115 (XP), 120 (ligas), 122 (desbloquear siguiente), 207 (retroalimentación), 109 (insignias)

---

### 29. GET `/respuestas?idModulo=<id>` - Obtener Historial
**Descripción:** Lista todas las respuestas del usuario, opcionalmente filtradas por módulo.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "idEstudiante": "uuid",
      "idEjercicio": "uuid",
      "respuesta": "4",
      "esCorrecta": true,
      "fechaRespuesta": "2026-05-17T...",
      "ejercicio": {
        "id": "uuid",
        "enunciado": "¿Cuál es 2+2?",
        "tipo": "seleccion_multiple"
      }
    }
  ]
}
```

**H.U. Referenciadas:** 203 (historial)

---

### 30. GET `/respuestas/evaluacion/:idModulo` - Evaluación del Módulo
**Descripción:** Obtiene la evaluación al completar un módulo.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:**
```json
{
  "success": true,
  "data": {
    "modulo": { /* detalles del módulo */ },
    "evaluacion": {
      "totalRespuestas": 5,
      "respuestasCorrectas": 4,
      "respuestasIncorrectas": 1,
      "porcentajeAciertos": 80,
      "retroalimentacion": "Buen desempeño, pero revisa los temas con errores"
    },
    "xpEnClase": 150
  }
}
```

**H.U. Referenciadas:** 314 (evaluación al completar)

---

## 🏆 Ligas (Rangos de Experiencia)

### 31. GET `/ligas` - Obtener Todas las Ligas
**Descripción:** Lista todas las ligas disponibles en el sistema.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "nombre": "Amauta", "umbralMinimo": 0, "umbralMaximo": 499 },
    { "id": "uuid", "nombre": "Panaca", "umbralMinimo": 500, "umbralMaximo": 999 },
    { "id": "uuid", "nombre": "Auqui", "umbralMinimo": 1000, "umbralMaximo": 1999 },
    { "id": "uuid", "nombre": "Inca", "umbralMinimo": 2000, "umbralMaximo": Infinity }
  ]
}
```

**Ligas definidas (H.U. 120):**
- **Amauta**: 0-499 XP
- **Panaca**: 500-999 XP
- **Auqui**: 1000-1999 XP
- **Inca**: 2000+ XP

**H.U. Referenciadas:** 120 (ligas)

---

### 32. GET `/ligas/ranking` - Obtener Ranking
**Descripción:** Obtiene un ranking de estudiantes por liga.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "liga": { /* detalles liga */ },
      "estudiantes": [ /* list */ ]
    }
  ]
}
```

---

## ⭐ Experiencia (XP)

### 33. GET `/xp` - Obtener Mi XP Total
**Descripción:** Retorna el XP total acumulado del usuario autenticado.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:**
```json
{
  "success": true,
  "data": {
    "xpTotal": 1250,
    "idEstudiante": "uuid"
  }
}
```

**H.U. Referenciadas:** 302 (ver XP)

---

### 34. GET `/xp/clase/:idClase` - Obtener XP en una Clase
**Descripción:** Retorna el XP acumulado en una clase específica.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:**
```json
{
  "success": true,
  "data": {
    "xpTotal": 325,
    "idEstudiante": "uuid",
    "idClase": "uuid"
  }
}
```

**Cálculo:** Suma dinámicamente XP de todas las respuestas correctas en esa clase.

**H.U. Referenciadas:** 302 (XP por clase)

---

## 🎖️ Insignias (Logros)

### 35. GET `/insignias` - Obtener Todas las Insignias
**Descripción:** Lista todas las insignias disponibles en el sistema.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "nombre": "Primer Ejercicio Correcto" },
    { "id": "uuid", "nombre": "Primer Módulo Completado" },
    { "id": "uuid", "nombre": "Cien Ejercicios" },
    { "id": "uuid", "nombre": "Nota Perfecta" }
  ]
}
```

**H.U. Referenciadas:** 109 (insignias)

---

### 36. GET `/insignias/mis-insignias` - Mis Insignias
**Descripción:** Lista insignias desbloqueadas por el usuario autenticado.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:** similar a endpoint anterior, solo con insignias del usuario.

**H.U. Referenciadas:** 118 (mis insignias)

---

## 📊 Progreso

### 37. GET `/progreso/modulo/:idModulo` - Progreso en Módulo
**Descripción:** Obtiene el progreso detallado en un módulo específico.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:**
```json
{
  "success": true,
  "data": {
    "idModulo": "uuid",
    "nombre": "Números Reales",
    "totalEjercicios": 5,
    "ejerciciosCompletados": 4,
    "porcentajeAciertos": 80,
    "estado": "disponible"
  }
}
```

**H.U. Referenciadas:** 123 (progreso)

---

### 38. GET `/progreso/clase/:idClase` - Progreso en Clase
**Descripción:** Obtiene el progreso en todos los módulos de una clase.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:**
```json
{
  "success": true,
  "data": {
    "idClase": "uuid",
    "nombreClase": "Matemáticas 101",
    "modulos": [
      {
        "idModulo": "uuid",
        "nombre": "Números Reales",
        "totalEjercicios": 5,
        "ejerciciosCompletados": 4,
        "porcentajeAciertos": 80,
        "estado": "disponible"
      }
    ],
    "totalEjercicios": 20,
    "ejerciciosCompletados": 12,
    "porcentajeAciertos": 60
  }
}
```

**H.U. Referenciadas:** 117, 123 (progreso de clase)

---

## 📖 Perfil Completo

### 39. GET `/perfil` - Obtener Perfil Completo
**Descripción:** Obtiene toda la información consolidada del perfil del estudiante.

**Headers:** `Authorization: Bearer <TOKEN>` (Estudiante)

**Response:**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "uuid",
      "nombre": "Juan Pérez",
      "correo": "juan@example.com",
      "rol": "Estudiante",
      "avatar": "https://...",
      "colorTema": "light",
      "colegio": "Colegio Nacional",
      "fechaRegistro": "2026-05-17T..."
    },
    "estadisticas": {
      "xpTotal": 1250,
      "liga": {
        "id": "uuid",
        "nombre": "Panaca",
        "umbralMinimo": 500,
        "umbralMaximo": 999
      },
      "insignias": [
        { "id": "uuid", "nombre": "Primer Ejercicio Correcto" },
        { "id": "uuid", "nombre": "Primer Módulo Completado" }
      ]
    }
  }
}
```

**H.U. Referenciadas:** 017 (perfil completo)

---

## 🗺️ Mapa de Aprendizaje

### 40. GET `/mapa` - Obtener Mapa Completo
**Descripción:** Obtiene el mapa de aprendizaje completo con todas las clases, módulos y progreso.

**Headers:** `Authorization: Bearer <TOKEN>` (Estudiante)

**Response:**
```json
{
  "success": true,
  "data": {
    "idEstudiante": "uuid",
    "clases": [
      {
        "clase": {
          "id": "uuid",
          "nombre": "Matemáticas 101",
          "codigoUnico": "MAT-101-2026",
          "curso": "Primero"
        },
        "progreso": {
          "idClase": "uuid",
          "nombreClase": "Matemáticas 101",
          "modulos": [ /* progreso de módulos */ ],
          "totalEjercicios": 20,
          "ejerciciosCompletados": 12,
          "porcentajeAciertos": 60
        },
        "xpEnClase": 325,
        "fechaIngreso": "2026-05-17T..."
      }
    ]
  }
}
```

**H.U. Referenciadas:** 117 (mapa de aprendizaje)

---

### 41. GET `/mapa/clase/:idClase/bimestre/:bimestre` - Mapa por Bimestre
**Descripción:** Obtiene el mapa de módulos de una clase en un bimestre específico.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:**
```json
{
  "success": true,
  "data": {
    "clase": { /* detalles clase */ },
    "bimestre": 1,
    "modulos": [
      {
        "modulo": {
          "id": "uuid",
          "nombre": "Números Reales",
          "orden": 1,
          "bimestre": 1,
          "estado": "disponible"
        },
        "progreso": { /* progreso módulo */ }
      }
    ]
  }
}
```

---

## 📚 Material Educativo

### 42. GET `/material?idClase=<id>` - Obtener Material de Clase
**Descripción:** Lista todo el material educativo de una clase.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "Introducción a Números Reales",
      "descripcion": "PDF con conceptos básicos",
      "tipo": "pdf",
      "url": "https://...",
      "idClase": "uuid",
      "idModulo": null
    }
  ]
}
```

**H.U. Referenciadas:** 408 (material educativo)

---

### 43. GET `/material/buscar?q=<término>&idClase=<id>` - Buscar Material
**Descripción:** Busca material por nombre dentro de una clase.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:** igual a endpoint anterior, filtrado por búsqueda.

**Algoritmo de búsqueda:** ILIKE (insensible a mayúsculas, búsqueda parcial)

**H.U. Referenciadas:** 408 (buscar material)

---

## 📋 Silabo

### 44. GET `/silabos/:idClase` - Obtener Silabo
**Descripción:** Obtiene el silabo descargable de una clase.

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "idClase": "uuid",
    "contenido": "...",
    "url": "https://..."
  }
}
```

**H.U. Referenciadas:** 401 (silabo)

---

## 🏥 Health Check

### 45. GET `/health` - Health Check
**Descripción:** Verifica que el servidor está activo y funcional.

**Headers:** ninguno requerido

**Response:**
```json
{
  "success": true,
  "message": "Servidor funcionando correctamente"
}
```

---

## 📝 Códigos de Error Comunes

| Código | Significado |
|--------|------------|
| 400 | Datos inválidos o incompletos |
| 401 | Token no proporcionado o inválido |
| 403 | Permiso denegado (rol insuficiente) |
| 404 | Recurso no encontrado |
| 409 | Conflicto (ej: código de clase duplicado) |
| 500 | Error interno del servidor |

---

## 🔑 Resumen de Autenticación

1. **Registrarse:** `POST /auth/register` → obtener usuario
2. **Login:** `POST /auth/login` → obtener JWT token
3. **Usar token:** Agregar header `Authorization: Bearer <TOKEN>` en todas las rutas protegidas
4. **Logout:** `POST /auth/logout` → invalidar token

---

## 📚 Historias de Usuario Implementadas

| H.U. | Título | Endpoints |
|------|--------|-----------|
| 001 | Registrarse | /auth/register |
| 007 | Login | /auth/login |
| 008 | Recuperar contraseña | /auth/forgot-password, /auth/reset-password |
| 011 | Unirse a clase | /clases/validar-codigo, /clases/unirse |
| 017 | Ver perfil | /perfil |
| 109 | Desbloquear insignias | /respuestas (lógica interna) |
| 115 | Otorgar XP | /respuestas (lógica interna) |
| 117 | Ver mapa de aprendizaje | /mapa, /modulos, /clases/mis-clases |
| 118 | Ver mis insignias | /insignias/mis-insignias |
| 120 | Sistema de ligas | /ligas |
| 122 | Desbloquear siguiente módulo | /respuestas (lógica interna) |
| 123 | Ver progreso | /progreso/modulo, /progreso/clase |
| 203 | Historial de respuestas | /respuestas |
| 207 | Retroalimentación | /respuestas (en data) |
| 302 | XP por clase | /xp/clase/:idClase |
| 309 | Responder ejercicio | /respuestas |
| 311 | Ejercicio selección múltiple | /respuestas |
| 312 | Ejercicios variados | /respuestas |
| 314 | Evaluación módulo | /respuestas/evaluacion/:idModulo |
| 401 | Descargar silabo | /silabos/:idClase |
| 408 | Buscar material | /material/buscar |

---

## 🚀 Ejemplo de Flujo Completo

```bash
# 1. Registrar usuario
POST http://localhost:3000/api/v1/auth/register
Body: { rol, nombre, correo, contrasena, colegio }

# 2. Login
POST http://localhost:3000/api/v1/auth/login
Body: { correo, contrasena }
Response: { token, usuario }

# 3. Validar código de clase
POST http://localhost:3000/api/v1/clases/validar-codigo
Body: { codigo: "MAT-101-2026" }
Headers: ninguno (público)

# 4. Unirse a clase
POST http://localhost:3000/api/v1/clases/unirse
Body: { codigoUnico: "MAT-101-2026" }
Headers: Authorization: Bearer <TOKEN>

# 5. Ver mis clases
GET http://localhost:3000/api/v1/clases/mis-clases
Headers: Authorization: Bearer <TOKEN>

# 6. Ver módulos de una clase en bimestre
GET http://localhost:3000/api/v1/modulos?idClase=<uuid>&bimestre=1
Headers: Authorization: Bearer <TOKEN>

# 7. Ver ejercicios de un módulo
GET http://localhost:3000/api/v1/ejercicios?idModulo=<uuid>
Headers: Authorization: Bearer <TOKEN>

# 8. Responder un ejercicio (CORE - obtiene XP, liga, insignias)
POST http://localhost:3000/api/v1/respuestas
Body: { idEjercicio: <uuid>, respuesta: "4" }
Headers: Authorization: Bearer <TOKEN>
Response: { esCorrecta, xpGanado, liga, progresoModulo, insignias }

# 9. Ver progreso en módulo
GET http://localhost:3000/api/v1/progreso/modulo/<idModulo>
Headers: Authorization: Bearer <TOKEN>

# 10. Ver perfil completo (usuario + XP + liga + insignias)
GET http://localhost:3000/api/v1/perfil
Headers: Authorization: Bearer <TOKEN>

# 11. Ver mis insignias desbloqueadas
GET http://localhost:3000/api/v1/insignias/mis-insignias
Headers: Authorization: Bearer <TOKEN>

# 12. Ver mapa de aprendizaje completo
GET http://localhost:3000/api/v1/mapa
Headers: Authorization: Bearer <TOKEN>

# 13. Ver progreso en una clase
GET http://localhost:3000/api/v1/progreso/clase/<idClase>
Headers: Authorization: Bearer <TOKEN>

# 14. Ver material de una clase
GET http://localhost:3000/api/v1/material?idClase=<uuid>
Headers: Authorization: Bearer <TOKEN>

# 15. Buscar material
GET http://localhost:3000/api/v1/material/buscar?q=algebra&idClase=<uuid>
Headers: Authorization: Bearer <TOKEN>

# 16. Obtener silabo de clase
GET http://localhost:3000/api/v1/silabos/<idClase>
Headers: Authorization: Bearer <TOKEN>
```

---

## 🎯 Quick Start para Frontend

### 1. Guardar el Token Después del Login
```javascript
const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ correo, contrasena })
});

const { data } = await loginResponse.json();
const token = data.token;

// Guardar en AsyncStorage (React Native)
await AsyncStorage.setItem('authToken', token);
```

### 2. Usar el Token en Endpoints Protegidos
```javascript
const token = await AsyncStorage.getItem('authToken');

const response = await fetch('http://localhost:3000/api/v1/clases/mis-clases', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await response.json();
```

### 3. Crear un Cliente HTTP Reutilizable
```javascript
// apiClient.js
class ApiClient {
  constructor(baseURL = 'http://localhost:3000/api/v1') {
    this.baseURL = baseURL;
    this.token = null;
  }

  async setToken(token) {
    this.token = token;
    await AsyncStorage.setItem('authToken', token);
  }

  async get(endpoint) {
    return this.request(endpoint, 'GET');
  }

  async post(endpoint, body) {
    return this.request(endpoint, 'POST', body);
  }

  async put(endpoint, body) {
    return this.request(endpoint, 'PUT', body);
  }

  async delete(endpoint) {
    return this.request(endpoint, 'DELETE');
  }

  async request(endpoint, method, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const options = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) })
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, options);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || 'Error desconocido');
    }

    return data.data;
  }
}

export default new ApiClient();
```

### 4. Uso en Componentes
```javascript
import apiClient from './apiClient';

// En componente de Login
const handleLogin = async (correo, contrasena) => {
  try {
    const loginData = await apiClient.post('/auth/login', { correo, contrasena });
    await apiClient.setToken(loginData.token);
    // Navegar a home
  } catch (error) {
    console.error(error);
  }
};

// En componente de Clases
const handleUnirseAClase = async (codigoUnico) => {
  try {
    await apiClient.post('/clases/unirse', { codigoUnico });
    // Recargar clases
  } catch (error) {
    console.error(error);
  }
};

// En componente de Ejercicios
const handleResponderEjercicio = async (idEjercicio, respuesta) => {
  try {
    const resultado = await apiClient.post('/respuestas', {
      idEjercicio,
      respuesta
    });
    // resultado contiene: esCorrecta, xpGanado, liga, insignias, etc.
    mostrarResultado(resultado);
  } catch (error) {
    console.error(error);
  }
};
```

---

**Última actualización:** 2026-05-17
**Total de Endpoints:** 45
**Endpoints Protegidos:** 42 (requieren JWT)
**Endpoints Públicos:** 3 (register, login, validar-codigo, health)

**Variables de Entorno Recomendadas:**
```
REACT_APP_API_URL=http://localhost:3000/api/v1
REACT_APP_API_TIMEOUT=30000
```


###### Si alguien lee esto tiene un chocolate gratis