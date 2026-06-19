# Kaichaini Backend

Backend API de alta calidad construido con Node.js y Express, siguiendo los principios SOLID y arquitectura en capas.

## 🏗️ Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   ├── app.js              # Configuración de Express
│   │   └── database.js         # Configuración de conexión a BD
│   ├── controllers/
│   │   └── userController.js   # Manejo de solicitudes HTTP
│   ├── services/
│   │   └── userService.js      # Lógica de negocio
│   ├── repositories/
│   │   └── userRepository.js   # Acceso a datos
│   ├── models/
│   │   └── User.js             # Definición del modelo
│   ├── middleware/
│   │   └── errorHandler.js     # Manejo de errores
│   ├── routes/
│   │   └── userRoutes.js       # Definición de rutas
│   └── server.js               # Punto de entrada principal
├── .env.example                # Configuración de ejemplo
├── package.json                # Dependencias del proyecto
└── README.md                   # Este archivo
```

## 📋 Principios SOLID Aplicados

### 1. **S - Single Responsibility Principle (SRP)**
Cada clase tiene una única responsabilidad:
- **UserRepository**: Solo acceso a datos
- **UserService**: Solo lógica de negocio
- **UserController**: Solo manejo HTTP
- **UserRoutes**: Solo definición de rutas

```javascript
// ✓ CORRECTO: Cada clase tiene una responsabilidad
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository; // Delega acceso a datos
  }
  
  async createUser(userData) {
    // Solo valida y aplica reglas de negocio
    if (!userData.email) throw new Error('Email requerido');
  }
}
```

### 2. **O - Open/Closed Principle (OCP)**
Abierto para extensión, cerrado para modificación:
- Agregar nuevas entidades (Producto, Pedido, etc.) sin modificar código existente
- Usar herencia o composición para extender funcionalidad

```javascript
// ✓ CORRECTO: Puedes crear ProductService sin modificar UserService
class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }
}
```

### 3. **L - Liskov Substitution Principle (LSP)**
Las subclases pueden reemplazar a sus clases base:
- Los repositorios pueden ser intercambiados (MySQL, MongoDB, etc.)
- Los servicios pueden usar cualquier repositorio compatible

```javascript
// ✓ CORRECTO: UserRepository puede reemplazarse por MongoUserRepository
const userRepository = new UserRepository(db);  // MySQL
// const userRepository = new MongoUserRepository(mongoDb); // MongoDB (compatible)
const userService = new UserService(userRepository);
```

### 4. **I - Interface Segregation Principle (ISP)**
Interfaces específicas, no genéricas:
- Cada controlador solo implementa los métodos que necesita
- Los servicios exponen solo métodos relevantes

```javascript
// ✓ CORRECTO: UserController implementa solo operaciones de usuario
class UserController {
  constructor(userService) {
    this.userService = userService;
  }
  
  async create(req, res) { }
  async getById(req, res) { }
  async update(req, res) { }
  async delete(req, res) { }
}
```

### 5. **D - Dependency Inversion Principle (DIP)**
Depender de abstracciones, no de implementaciones concretas:
- Los servicios no crean repositorios, los reciben (inyección de dependencias)
- Los controladores no crean servicios, los reciben

```javascript
// ✓ CORRECTO: Inyección de dependencias
const userRepository = new UserRepository(db);
const userService = new UserService(userRepository); // Recibe, no crea
const userController = new UserController(userService);

// ✗ INCORRECTO: Dependencia directa
class UserService {
  constructor() {
    this.userRepository = new UserRepository(); // Acoplado
  }
}
```

## 🔄 Flujo de Ejecución

```
1. HTTP Request
   ↓
2. UserController (req/res)
   ↓
3. UserService (lógica de negocio)
   ↓
4. UserRepository (acceso a datos)
   ↓
5. Base de Datos
```

## 🚀 Instalación y Configuración

### Requisitos
- Node.js v16+
- MySQL 5.7+

### Pasos

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd App-Kaichaini/backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus valores
```

4. **Crear la base de datos**
```sql
CREATE DATABASE kaichaini_db;
USE kaichaini_db;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

5. **Iniciar el servidor**
```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 📡 Endpoints API

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/health` | Verificar salud del servidor |
| POST | `/api/v1/users` | Crear usuario |
| GET | `/api/v1/users` | Obtener todos los usuarios |
| GET | `/api/v1/users/:id` | Obtener usuario por ID |
| PUT | `/api/v1/users/:id` | Actualizar usuario |
| DELETE | `/api/v1/users/:id` | Eliminar usuario |

### Ejemplo: Crear Usuario
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "securePassword123"
  }'
```

### Ejemplo: Obtener Todos los Usuarios
```bash
curl http://localhost:3000/api/v1/users
```

## 🧪 Testing

Ejecutar tests:
```bash
npm test
```

## 🔒 Seguridad

- ✓ Helmet.js para seguridad de headers HTTP
- ✓ CORS configurado
- ✓ Validación de datos de entrada
- ✓ Manejo centralizado de errores
- ✓ Variables sensibles en .env

## 📚 Cómo Agregar Nuevas Entidades

Sigue este patrón para agregar nuevas entidades (Productos, Pedidos, etc.):

### 1. Crear el Modelo
```javascript
// src/models/Product.js
class Product {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.price = data.price || 0;
  }
}
```

### 2. Crear el Repositorio
```javascript
// src/repositories/productRepository.js
class ProductRepository {
  constructor(database) {
    this.database = database;
  }
  
  async create(product) {
    // Lógica de acceso a datos
  }
}
```

### 3. Crear el Servicio
```javascript
// src/services/productService.js
class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }
  
  async createProduct(data) {
    // Lógica de negocio
  }
}
```

### 4. Crear el Controlador
```javascript
// src/controllers/productController.js
class ProductController {
  constructor(productService) {
    this.productService = productService;
  }
  
  async create(req, res, next) {
    // Manejo de HTTP
  }
}
```

### 5. Crear las Rutas
```javascript
// src/routes/productRoutes.js
class ProductRoutes {
  constructor(productController) {
    this.productController = productController;
  }
  
  setupRoutes() {
    this.router.post('/products', ...);
  }
}
```

### 6. Registrar en server.js
```javascript
const productRepository = new ProductRepository(db);
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);
const productRoutes = new ProductRoutes(productController);

appConfig.registerRoutes([
  userRoutes.getRouter(),
  productRoutes.getRouter() // Agregar nueva ruta
]);
```

## 🎯 Ventajas de esta Arquitectura

✓ **Escalabilidad**: Fácil agregar nuevas funcionalidades  
✓ **Testabilidad**: Cada capa puede ser testeada independientemente  
✓ **Mantenibilidad**: Código claro y bien organizado  
✓ **Reusabilidad**: Servicios pueden ser usados por múltiples controladores  
✓ **Flexibilidad**: Cambiar de BD o tecnología sin afectar el negocio  
✓ **Desacoplamiento**: Las capas son independientes  

## 📝 Convenciones de Código

- **Nombres**: camelCase para variables y funciones, PascalCase para clases
- **Archivos**: Nombres descriptivos, extensión .js
- **Comentarios**: Solo cuando el WHY no es obvio
- **Errores**: Mensajes claros y descriptivos

## 📄 Licencia

ISC

## 👨‍💻 Autor

Kaichaini Development Team

---

**Nota**: Este backend sigue las mejores prácticas de Node.js y está listo para crecer junto con tu aplicación.
