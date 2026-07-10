# Kaichaini — Guía de instalación y prueba (Sprint 1)

## Requisitos previos

| Herramienta | Versión recomendada | Descarga |
|---|---|---|
| Node.js | 18 o superior | https://nodejs.org |
| Expo Go (app móvil) | Última versión | App Store / Google Play |
| Git | Cualquier versión reciente | https://git-scm.com |

> **Nota:** No es necesario instalar PostgreSQL. La base de datos ya está desplegada en AWS RDS y el proyecto se conecta automáticamente.

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/Adr4563/App-Kaichaini.git
cd App-Kaichaini
```

---

## 2. Configurar e iniciar el Backend

### 2.1 Instalar dependencias

```bash
cd backend
npm install
```

### 2.2 Crear el archivo de configuración `.env`

> El archivo `.env` no se incluye en el repositorio por seguridad (está en `.gitignore`). Debes crearlo manualmente.

Dentro de la carpeta `backend/`, crea un archivo llamado `.env` con el siguiente contenido:

```env
DB_HOST=database-1.c5kk2ms085u3.us-east-2.rds.amazonaws.com
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=12345678
DB_PORT=5432
PORT=3000
JWT_SECRET=kaichaini_secret_2024
```

### 2.3 Iniciar el servidor

```bash
npm start
```

El servidor quedará corriendo en `http://localhost:3000`.

**Salida esperada:**
```
✓ Base de datos conectada exitosamente
Servidor ejecutándose en puerto 3000
```

---

## 3. Configurar e iniciar el Frontend

### 3.1 Instalar dependencias

```bash
cd ../frontend
npm install
```

### 3.2 Iniciar la app

```bash
npx expo start
```

Se abrirá un QR en la terminal. Escanéalo con la app **Expo Go** desde tu celular (debe estar en la misma red Wi-Fi que la computadora).

> La IP del backend se detecta automáticamente. No es necesario cambiar ningún archivo.

---

## 4. Credenciales de prueba

### Cuenta Estudiante
| Campo | Valor |
|---|---|
| Correo | `estudiante@demo.com` |
| Contraseña | `Kaichaini1` |

### Cuenta Docente
| Campo | Valor |
|---|---|
| Correo | `docente@kaichaini.com` |
| Contraseña | `Docente123` |

---

## 5. Códigos de clase (para registrar una cuenta nueva)

Si desea probar el flujo completo de registro desde cero, use uno de estos códigos:

| Código | Clase |
|---|---|
| `DEMO01` | Clase Demo |
| `COMU42` | Comunicación |
| `MAT4G1` | Matemática |

> Los códigos tienen exactamente 6 caracteres y deben ingresarse en mayúsculas.

---

## 6. Flujo de prueba sugerido

1. Abrir la app → ingresar con `estudiante@demo.com` / `Kaichaini1`
2. Explorar el **Mapa de aprendizaje** → seleccionar un módulo disponible
3. Responder los **ejercicios** (selección múltiple / clic en número)
4. Ver los **resultados** y el XP ganado al completar el módulo
5. Revisar **Mi perfil** → liga actual, barra de XP, insignias
6. Revisar **Mi liga** → tabla de ligas y progreso
7. Revisar **Mi progreso** → historial de ejercicios respondidos
8. Revisar **Mi colección** → insignias obtenidas y bloqueadas

---

## 7. Estructura del proyecto

```
App-Kaichaini/
├── backend/          # API REST — Express 5 + Node.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   └── .env          # ← Crear manualmente (ver paso 2.2)
│
└── frontend/         # App móvil — React Native + Expo SDK 54
    └── src/
        ├── screens/
        │   ├── auth/
        │   └── student/
        ├── services/
        │   └── api.js    ← IP detectada automáticamente
        └── context/
```

---

## Problemas comunes

| Problema | Solución |
|---|---|
| `Error conectando a la base de datos` | Verificar que el archivo `.env` fue creado correctamente en la carpeta `backend/` |
| `Network request failed` en la app | Verificar que el backend esté corriendo y que el celular esté en la misma red Wi-Fi |
| El QR de Expo no conecta | Asegurarse que el celular y la computadora están en la misma red Wi-Fi |
| `Cannot find module` al iniciar backend | Ejecutar `npm install` dentro de la carpeta `backend/` |
| La app carga pero no muestra datos | Confirmar que el backend imprime "✓ Base de datos conectada exitosamente" |
