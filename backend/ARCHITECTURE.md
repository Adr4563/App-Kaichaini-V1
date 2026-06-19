# 🏗️ Arquitectura SOLID - Documentación Técnica

## Visión General

Este backend implementa una arquitectura en capas basada en principios SOLID con inyección de dependencias. El objetivo es crear código mantenible, testeable y escalable.

---

## 📐 Capas de la Arquitectura

```
┌─────────────────────────────────────┐
│  HTTP REQUEST (Express)             │
├─────────────────────────────────────┤
│  ROUTES (UserRoutes)                │ ← Mapea URLs a controladores
├─────────────────────────────────────┤
│  CONTROLLERS (UserController)       │ ← Maneja req/res HTTP
├─────────────────────────────────────┤
│  SERVICES (UserService)             │ ← Lógica de negocio
├─────────────────────────────────────┤
│  REPOSITORIES (UserRepository)      │ ← Acceso a datos
├─────────────────────────────────────┤
│  DATABASE (MySQL)                   │ ← Persistencia
└─────────────────────────────────────┘
```

### 1. **Capa de Rutas (Routes)**

**Archivo:** `src/routes/userRoutes.js`

**Responsabilidad:** Mapear URLs HTTP a métodos de controlador

```javascript
class UserRoutes {
  constructor(userController) {
    this.router = express.Router();
    this.setupRoutes();
  }
  
  setupRoutes() {
    this.router.post('/users', (req, res, next) => 
      this.userController.create(req, res, next)
    );
  }
}
```

**Principio:** Single Responsibility
- Solo define qué URL corresponde a qué método
- No contiene lógica de negocio
- No accede a la base de datos

---

### 2. **Capa de Controladores (Controllers)**

**Archivo:** `src/controllers/userController.js`

**Responsabilidad:** Manejar solicitudes y respuestas HTTP

```javascript
class UserController {
  constructor(userService) {
    this.userService = userService;
  }
  
  async create(req, res, next) {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json({
        success: true,
        data: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }
}
```

**Responsabilidades:**
- ✓ Recibir datos del cliente (req.body, req.params)
- ✓ Validación básica de request
- ✓ Llamar al servicio
- ✓ Formatear respuesta HTTP
- ✗ Lógica de negocio
- ✗ Acceso a base de datos

**Principio:** Single Responsibility + Dependency Inversion
- Solo maneja HTTP, no sabe de BD
- Recibe servicios, no los crea

---

### 3. **Capa de Servicios (Services)**

**Archivo:** `src/services/userService.js`

**Responsabilidad:** Contener la lógica de negocio

```javascript
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  
  async createUser(userData) {
    const user = new User(userData);
    
    // Validación de negocio
    if (!user.isValid()) {
      throw new Error('Datos inválidos');
    }
    
    // Verificar reglas de negocio
    const existing = await this.userRepository.findByEmail(user.email);
    if (existing) {
      throw new Error('Email ya existe');
    }
    
    // Delegar persistencia al repositorio
    return await this.userRepository.create(user);
  }
}
```

**Responsabilidades:**
- ✓ Lógica de negocio
- ✓ Validaciones de reglas
- ✓ Orquestar repositorios
- ✗ Detalles HTTP
- ✗ Construcción de queries SQL

**Principio:** Dependency Inversion
- Recibe repositorio inyectado
- Depende de abstracción, no de implementación

---

### 4. **Capa de Repositorios (Repositories)**

**Archivo:** `src/repositories/userRepository.js`

**Responsabilidad:** Acceso a datos (patrón Repository)

```javascript
class UserRepository {
  constructor(database) {
    this.database = database;
  }
  
  async findByEmail(email) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.execute(query, [email]);
    return rows.length ? new User(rows[0]) : null;
  }
}
```

**Responsabilidades:**
- ✓ Construir y ejecutar queries SQL
- ✓ Mapear resultados a modelos
- ✓ Manejo de conexiones
- ✗ Lógica de negocio
- ✗ Respuestas HTTP

**Ventajas del patrón Repository:**
```javascript
// Con Repository: Fácil cambiar de BD
const repository = new UserRepository(db);      // MySQL
// const repository = new UserMongoRepository(db); // MongoDB

const service = new UserService(repository);
// El servicio no se entera del cambio
```

---

### 5. **Capa de Modelos (Models)**

**Archivo:** `src/models/User.js`

**Responsabilidad:** Definir estructura y comportamiento de datos

```javascript
class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.email = data.email || '';
  }
  
  isValid() {
    return this.name && this.email;
  }
  
  toJSON() {
    const { password, ...user } = this;
    return user; // No exponer password
  }
}
```

**Características:**
- Encapsulación de datos
- Métodos de validación
- Métodos de serialización

---

## 🔄 Flujo de una Solicitud

### Ejemplo: Crear usuario

```
1. Cliente hace POST /api/v1/users
   ↓
2. Express rutea a UserRoutes.create()
   ↓
3. UserRoutes delega a UserController.create()
   ↓
4. UserController recibe req
   ├─ Extrae datos: req.body
   ├─ Llama: userService.createUser()
   │
5. UserService
   ├─ Crea User: new User(userData)
   ├─ Valida: user.isValid()
   ├─ Verifica reglas: repository.findByEmail()
   ├─ Persiste: repository.create()
   │
6. UserRepository
   ├─ Construye SQL: INSERT INTO users...
   ├─ Ejecuta: pool.execute()
   ├─ Mapea resultado: new User(dbRow)
   └─ Retorna User al servicio
   │
7. Cadena de retorno
   Service → Controller → Response JSON
```

---

## 🔐 Principios SOLID en Acción

### Principio 1: S - Single Responsibility

**❌ MAL:**
```javascript
class User {
  save() { 
    // SQL aquí - responsabilidad de BD
    const query = 'INSERT INTO users...';
  }
  
  validateEmail() { }
  
  sendWelcomeEmail() { 
    // Responsabilidad de email
  }
}
```

**✓ BIEN:**
```javascript
// Modelo solo modela
class User {
  isValid() { }
}

// Repositorio persiste
class UserRepository {
  async create(user) { }
}

// Servicio de email envía
class EmailService {
  async sendWelcome(user) { }
}
```

---

### Principio 2: O - Open/Closed

**Abierto para extensión, cerrado para modificación**

```javascript
// ✓ BIEN: Agregar nueva entidad sin cambiar código existente

// 1. Crear nuevo modelo
class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
  }
}

// 2. Crear repositorio
class ProductRepository {
  constructor(database) { }
  async create(product) { }
}

// 3. Crear servicio
class ProductService {
  constructor(productRepository) { }
  async createProduct(data) { }
}

// 4. Crear controlador
class ProductController {
  constructor(productService) { }
  async create(req, res) { }
}

// 5. Registrar rutas
const productRoutes = new ProductRoutes(productController);
appConfig.registerRoutes([
  userRoutes.getRouter(),
  productRoutes.getRouter() // Nuevo, sin modificar lo existente
]);
```

**UserService y UserController permanecen sin cambios.**

---

### Principio 3: L - Liskov Substitution

**Las subclases pueden reemplazar sus clases base**

```javascript
// Interfaz común (implícita en JavaScript)
class Repository {
  async create(entity) { }
  async findById(id) { }
  async update(id, data) { }
}

// Implementación MySQL
class UserRepository extends Repository {
  async create(user) {
    const query = 'INSERT INTO users...';
    // Implementación específica
  }
}

// Implementación MongoDB (intercambiable)
class UserMongoRepository extends Repository {
  async create(user) {
    const result = await this.db.collection('users').insertOne(user);
    // Otra implementación
  }
}

// El servicio funciona con ambas
class UserService {
  constructor(userRepository) {
    // Puede ser UserRepository o UserMongoRepository
    // El comportamiento es el mismo desde la perspectiva del servicio
    this.userRepository = userRepository;
  }
}

// Uso
const mysqlRepo = new UserRepository(mysqlDb);
const mongoRepo = new UserMongoRepository(mongoDb);

const service1 = new UserService(mysqlRepo);  // Funciona
const service2 = new UserService(mongoRepo);  // Funciona igual
```

---

### Principio 4: I - Interface Segregation

**Interfaces específicas, no genéricas**

**❌ MAL:**
```javascript
// Interfaz genérica y gorda
class DatabaseOperations {
  async create() { }
  async read() { }
  async update() { }
  async delete() { }
  async backup() { }      // No todos la usan
  async replicate() { }   // No todos la usan
  async migrate() { }     // No todos la usan
}
```

**✓ BIEN:**
```javascript
// Interfaces específicas
class UserRepository {
  async create(user) { }
  async findById(id) { }
  async update(id, data) { }
  async delete(id) { }
}

class DatabaseAdmin {
  async backup() { }
  async replicate() { }
  async migrate() { }
}
```

---

### Principio 5: D - Dependency Inversion

**Depender de abstracciones, no de implementaciones concretas**

**❌ MAL:**
```javascript
class UserService {
  constructor() {
    // Depende de implementación concreta
    this.userRepository = new UserRepository();
    this.emailService = new GmailService();
  }
}
```

**Problemas:**
- Acoplado a UserRepository específico
- Difícil de testear (no puedes usar mocks)
- Cambiar a otra BD requiere cambiar UserService

**✓ BIEN:**
```javascript
class UserService {
  constructor(userRepository, emailService) {
    // Recibe abstracciones (inyección de dependencias)
    this.userRepository = userRepository;
    this.emailService = emailService;
  }
}

// Puede usar cualquier repositorio
const mysqlRepo = new UserRepository(mysqlDb);
const mongoRepo = new UserMongoRepository(mongoDb);

const gmailService = new GmailService();
const sendgridService = new SendgridService();

const service1 = new UserService(mysqlRepo, gmailService);
const service2 = new UserService(mongoRepo, sendgridService);
```

**Testing es trivial:**
```javascript
class MockUserRepository {
  async create(user) { return user; }
}

const mockRepo = new MockUserRepository();
const service = new UserService(mockRepo, mockEmailService);

// Puedes testar UserService sin BD real
```

---

## 🧪 Testing

### Testing del Servicio (sin BD)

```javascript
describe('UserService', () => {
  let userService;
  let mockRepository;

  beforeEach(() => {
    mockRepository = new MockUserRepository();
    userService = new UserService(mockRepository);
  });

  test('debería crear usuario válido', async () => {
    const user = await userService.createUser({
      name: 'Juan',
      email: 'juan@example.com',
      password: 'password123'
    });
    
    expect(user.id).toBeDefined();
  });

  test('debería rechazar email duplicado', async () => {
    // Agregar un usuario a mock
    mockRepository.users = [{
      id: 1,
      email: 'juan@example.com'
    }];

    // Intentar crear con mismo email
    await expect(
      userService.createUser({
        email: 'juan@example.com'
      })
    ).rejects.toThrow('Email ya existe');
  });
});
```

**Ventajas:**
- ✓ Pruebas rápidas (sin BD)
- ✓ Aisladas (sin dependencias)
- ✓ Predecibles (mock controlable)
- ✓ Baratas (sin recursos reales)

---

## 🔧 Patrón de Inyección de Dependencias

### Composición en server.js

```javascript
// 1. Crear instancias (Contenedor de inyección)
const db = new DatabaseConnection();
await db.connect();

// 2. Inyectar de abajo hacia arriba
const userRepository = new UserRepository(db);        // Inyecta DB
const userService = new UserService(userRepository);  // Inyecta Repository
const userController = new UserController(userService); // Inyecta Service
const userRoutes = new UserRoutes(userController);    // Inyecta Controller

// 3. Registrar en app
appConfig.registerRoutes([userRoutes.getRouter()]);
```

### Flujo de inyección

```
DATABASE CONNECTION
        ↑
   REPOSITORY (recibe DB)
        ↑
   SERVICE (recibe Repository)
        ↑
   CONTROLLER (recibe Service)
        ↑
   ROUTES (recibe Controller)
```

---

## 📝 Reglas de Oro

1. **Una clase = Una responsabilidad**
2. **Inyecta dependencias, no las crees**
3. **Programa contra interfaces, no implementaciones**
4. **Valida en los límites del sistema**
5. **Mantén las capas desacopladas**

---

## 🚀 Próximos Pasos

Para mantener la arquitectura limpia conforme crece el proyecto:

1. **Agregar más entidades:** Sigue el mismo patrón (Producto, Pedido)
2. **Validaciones compartidas:** Crea `src/validators/`
3. **Servicios compartidos:** Crea `src/services/shared/`
4. **Middleware personalizado:** Agrega a `src/middleware/`
5. **Helpers/Utilidades:** Mantén en `src/utils/`

Ejemplo de estructura extendida:
```
src/
├── config/
├── controllers/
├── services/
├── repositories/
├── models/
├── middleware/
├── routes/
├── validators/
├── middleware/
└── utils/
    ├── helpers.js
    ├── validators.js
    └── constants.js
```

---

## 📚 Recursos Recomendados

- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Design Patterns](https://refactoring.guru/design-patterns)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
