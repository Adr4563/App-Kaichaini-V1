# 🚀 Guía de Configuración Inicial

## ⚡ Quick Start (5 minutos)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales de BD
```

### 3. Crear base de datos
```bash
# Abrir cliente MySQL
mysql -u root -p

# Ejecutar schema
source database/schema.sql
```

### 4. Iniciar servidor
```bash
npm run dev
```

**Resultado esperado:**
```
✓ Base de datos conectada exitosamente
🚀 Servidor ejecutándose en puerto 3000
📍 URL: http://localhost:3000
📚 Health Check: http://localhost:3000/health
```

---

## 📋 Requisitos Previos

- **Node.js** v16+ ([descargar](https://nodejs.org/))
- **MySQL** v5.7+ ([descargar](https://dev.mysql.com/downloads/mysql/))
- **npm** o **yarn**
- **Postman** o **curl** para testing de API (opcional)

---

## 🔧 Configuración Detallada

### Variables de Entorno (.env)

```ini
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=kaichaini_db
DB_PORT=3306

# Servidor
PORT=3000
NODE_ENV=development

# API
API_PREFIX=/api/v1
```

### Conexión a MySQL

**Windows:**
```bash
# Abrir MySQL Command Line Client
mysql -u root -p
# Ingresar password

# Crear BD y tablas
mysql> source C:/ruta/a/database/schema.sql
```

**macOS/Linux:**
```bash
# Instalar MySQL (si no está instalado)
brew install mysql

# Iniciar servicio
brew services start mysql

# Conectarse
mysql -u root -p

# Ejecutar schema
mysql> source /ruta/a/database/schema.sql
```

---

## 📁 Estructura de Carpetas

```
backend/
├── src/
│   ├── config/
│   │   ├── app.js              # Configuración Express
│   │   └── database.js         # Conexión MySQL
│   │
│   ├── controllers/
│   │   └── userController.js   # Manejo HTTP
│   │
│   ├── services/
│   │   └── userService.js      # Lógica negocio
│   │
│   ├── repositories/
│   │   └── userRepository.js   # Acceso datos
│   │
│   ├── models/
│   │   └── User.js             # Definición datos
│   │
│   ├── middleware/
│   │   ├── errorHandler.js     # Manejo errores
│   │   └── validateRequest.js  # Validaciones
│   │
│   ├── routes/
│   │   └── userRoutes.js       # Rutas HTTP
│   │
│   ├── utils/
│   │   └── validators.js       # Utilidades
│   │
│   └── server.js               # Entrada principal
│
├── tests/
│   └── userService.test.js     # Tests
│
├── database/
│   └── schema.sql              # SQL inicial
│
├── .env.example                # Variables ejemplo
├── .gitignore                  # Archivos ignorar
├── .eslintrc.json              # Linter config
├── jest.config.js              # Tests config
├── package.json                # Dependencias
├── README.md                   # Documentación
├── SETUP.md                    # Este archivo
├── ARCHITECTURE.md             # Detalles técnicos
└── API_EXAMPLES.md             # Ejemplos API
```

---

## 🧪 Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests con cobertura
npm test -- --coverage

# Tests en modo watch
npm test -- --watch

# Test específico
npm test -- userService.test.js
```

---

## 📡 Verificar que Funciona

### 1. Health Check
```bash
curl http://localhost:3000/health
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Servidor funcionando correctamente"
}
```

### 2. Crear Usuario
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123"
  }'
```

### 3. Obtener Usuarios
```bash
curl http://localhost:3000/api/v1/users
```

---

## 🐛 Troubleshooting

### "Cannot find module 'mysql2'"
```bash
npm install
```

### "Error: connect ECONNREFUSED"
- Verificar que MySQL está corriendo
- Windows: Services > MySQL80 (iniciar si está detenido)
- macOS: `brew services start mysql`

### "Error: ER_ACCESS_DENIED_FOR_USER"
- Verificar credenciales en .env
- Asegúrate que el usuario MySQL existe
- Resetear password MySQL si es necesario

### "Error: ER_NO_DB_ERROR"
- Ejecutar schema.sql para crear BD
- Verificar que DB_NAME en .env existe

### Puerto 3000 en uso
Cambiar en .env:
```ini
PORT=3001
```

---

## 🚦 Modo Desarrollo vs Producción

### Desarrollo
```bash
npm run dev
# Usa nodemon - reinicia automáticamente
# Todos los logs habilitados
```

### Producción
```bash
npm start
# Sin nodemon
# Considera usar PM2:
npm install -g pm2
pm2 start src/server.js --name "kaichaini"
```

---

## 🔒 Seguridad Básica

### Antes de hacer deploy:

1. **Variables sensibles en .env**
   - Nunca commitear .env
   - Usar valores fuertes para passwords
   - Regenerar después de compartir

2. **SQL Injection Prevention**
   - Ya implementado: queries con `?` placeholders
   - El pool de mysql2 hace escape automático

3. **Headers de Seguridad**
   - Helmet.js habilitado
   - CORS configurado

4. **Validación de Input**
   - Implementada en middleware
   - Revisa validateRequest.js

---

## 📚 Próximos Pasos

### 1. Agregar nueva entidad (Product)
Ver ARCHITECTURE.md → "Cómo Agregar Nuevas Entidades"

### 2. Autenticación
```bash
npm install jsonwebtoken bcryptjs
# Luego: Crear AuthService, AuthMiddleware
```

### 3. Paginación
Agregar `limit` y `offset` en UserRepository

### 4. Caché
```bash
npm install redis
# Cachear resultados frecuentes
```

### 5. Logging avanzado
```bash
npm install winston
# Logs estructurados a archivo
```

---

## 🎯 Checklist de Deploy

- [ ] Variables .env configuradas en servidor
- [ ] Base de datos créada en servidor
- [ ] npm install ejecutado
- [ ] Tests pasando: `npm test`
- [ ] Health check funcionando: `/health`
- [ ] API endpoints probados
- [ ] Logs monitoreados
- [ ] Backups de BD configurados
- [ ] PM2 o similar en producción
- [ ] HTTPS habilitado (importante!)

---

## 💬 Preguntas Frecuentes

**P: ¿Cómo agrego un nuevo endpoint?**
R: Sigue el flujo: Model → Repository → Service → Controller → Route

**P: ¿Puedo cambiar de MySQL a MongoDB?**
R: Sí, solo reemplaza UserRepository. Los servicios no cambian (principio L).

**P: ¿Dónde pongo mis validaciones?**
R: En la clase Service (lógica de negocio) o en middleware ValidateRequest (HTTP).

**P: ¿Cómo testeo sin base de datos?**
R: Usa MockRepository en tests. Ver tests/userService.test.js

**P: ¿Qué es inyección de dependencias?**
R: Pasar dependencias al constructor en lugar de crearlas adentro. Ver ARCHITECTURE.md

---

## 📞 Soporte

Para reportar bugs o hacer preguntas:
1. Revisa [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Revisa [API_EXAMPLES.md](./API_EXAMPLES.md)
3. Revisa [README.md](./README.md)
4. Crea un issue en el repositorio

---

**Última actualización:** 2026-05-15

¡Feliz coding! 🎉
