# Ejemplos de Uso de la API Kaichaini

Esta página contiene ejemplos de cómo usar los endpoints de la API.

## 🔗 Base URL
```
http://localhost:3000/api/v1
```

## 📌 Health Check

**Verificar que el servidor está en funcionamiento**

```bash
curl -X GET http://localhost:3000/health
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Servidor funcionando correctamente"
}
```

---

## 👥 Usuarios (Users)

### 1. Crear Usuario

**Endpoint:** `POST /users`

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "MySecurePassword123"
  }'
```

**Request Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "MySecurePassword123"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "createdAt": "2026-05-15T10:30:00.000Z",
    "updatedAt": "2026-05-15T10:30:00.000Z"
  }
}
```

**Errores posibles:**
- `400`: Email inválido o contraseña muy corta
- `409`: El correo ya está registrado

---

### 2. Obtener Todos los Usuarios

**Endpoint:** `GET /users`

```bash
curl -X GET http://localhost:3000/api/v1/users
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "createdAt": "2026-05-15T10:30:00.000Z",
      "updatedAt": "2026-05-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "name": "María García",
      "email": "maria@example.com",
      "createdAt": "2026-05-15T11:45:00.000Z",
      "updatedAt": "2026-05-15T11:45:00.000Z"
    }
  ]
}
```

---

### 3. Obtener Usuario por ID

**Endpoint:** `GET /users/:id`

```bash
curl -X GET http://localhost:3000/api/v1/users/1
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "createdAt": "2026-05-15T10:30:00.000Z",
    "updatedAt": "2026-05-15T10:30:00.000Z"
  }
}
```

**Errores posibles:**
- `404`: Usuario no encontrado

---

### 4. Actualizar Usuario

**Endpoint:** `PUT /users/:id`

```bash
curl -X PUT http://localhost:3000/api/v1/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Carlos Pérez",
    "email": "juancarlos@example.com"
  }'
```

**Request Body:**
```json
{
  "name": "Juan Carlos Pérez",
  "email": "juancarlos@example.com"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Usuario actualizado exitosamente",
  "data": {
    "id": 1,
    "name": "Juan Carlos Pérez",
    "email": "juancarlos@example.com",
    "createdAt": "2026-05-15T10:30:00.000Z",
    "updatedAt": "2026-05-15T14:20:00.000Z"
  }
}
```

**Errores posibles:**
- `400`: Datos inválidos
- `404`: Usuario no encontrado

---

### 5. Eliminar Usuario

**Endpoint:** `DELETE /users/:id`

```bash
curl -X DELETE http://localhost:3000/api/v1/users/1
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

**Errores posibles:**
- `404`: Usuario no encontrado

---

## 📋 Validaciones

### Validaciones al crear/actualizar usuario:

| Campo | Validación | Ejemplo |
|-------|-----------|---------|
| name | Mínimo 3 caracteres | "Juan Pérez" |
| email | Formato email válido | "juan@example.com" |
| password | Mínimo 6 caracteres (solo en creación) | "MySecurePassword123" |

### Ejemplo de error de validación:
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jo",
    "email": "invalid-email",
    "password": "123"
  }'
```

**Respuesta (400):**
```json
{
  "success": false,
  "error": {
    "message": "Validación fallida",
    "errors": [
      "El nombre debe tener al menos 3 caracteres",
      "El correo electrónico no es válido",
      "La contraseña debe tener al menos 6 caracteres"
    ]
  }
}
```

---

## 🧪 Testing con Postman

### Importar colección

1. Copiar el JSON de abajo
2. En Postman: `File > Import > Paste Raw Text`
3. Ejecutar requests

### Colección de Postman (JSON)

```json
{
  "info": {
    "name": "Kaichaini API",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/health"
      }
    },
    {
      "name": "Create User",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/v1/users",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"name\": \"Juan Pérez\", \"email\": \"juan@example.com\", \"password\": \"password123\"}"
        }
      }
    },
    {
      "name": "Get All Users",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/v1/users"
      }
    },
    {
      "name": "Get User by ID",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/v1/users/1"
      }
    },
    {
      "name": "Update User",
      "request": {
        "method": "PUT",
        "url": "http://localhost:3000/api/v1/users/1",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"name\": \"Juan Carlos\", \"email\": \"juancarlos@example.com\"}"
        }
      }
    },
    {
      "name": "Delete User",
      "request": {
        "method": "DELETE",
        "url": "http://localhost:3000/api/v1/users/1"
      }
    }
  ]
}
```

---

## 💡 Tips

- **Headers recomendados:** Siempre enviar `Content-Type: application/json` en POST/PUT
- **Errores 500:** Si ves error 500, revisa la consola del servidor
- **CORS:** Si usas desde frontend, asegúrate que está en la misma red o que CORS está configurado
- **Variables de entorno:** Asegúrate de crear `.env` basado en `.env.example`

---

## 🔄 Flujo Típico de Uso

```
1. GET /health              → Verificar servidor
2. POST /users              → Crear usuario
3. GET /users               → Obtener todos
4. GET /users/:id           → Obtener específico
5. PUT /users/:id           → Actualizar
6. DELETE /users/:id        → Eliminar
```
