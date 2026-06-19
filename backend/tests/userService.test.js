// Ejemplo de test unitario para UserService
// Ejecutar con: npm test

const UserService = require('../src/services/userService');
const User = require('../src/models/User');

// Mock del repositorio para testing
class MockUserRepository {
  constructor() {
    this.users = [];
    this.nextId = 1;
  }

  async create(user) {
    user.id = this.nextId++;
    this.users.push(user);
    return user;
  }

  async findById(id) {
    return this.users.find(u => u.id == id) || null;
  }

  async findByEmail(email) {
    return this.users.find(u => u.email === email) || null;
  }

  async findAll() {
    return this.users;
  }

  async update(id, userData) {
    const user = await this.findById(id);
    if (user) {
      Object.assign(user, userData);
      return true;
    }
    return false;
  }

  async delete(id) {
    const index = this.users.findIndex(u => u.id == id);
    if (index > -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }
}

// Tests
describe('UserService', () => {
  let userService;
  let mockRepository;

  beforeEach(() => {
    mockRepository = new MockUserRepository();
    userService = new UserService(mockRepository);
  });

  test('debería crear un usuario válido', async () => {
    const userData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'password123',
    };

    const user = await userService.createUser(userData);

    expect(user.id).toBeDefined();
    expect(user.name).toBe('Juan Pérez');
    expect(user.email).toBe('juan@example.com');
  });

  test('debería lanzar error si el email ya existe', async () => {
    const userData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'password123',
    };

    await userService.createUser(userData);

    await expect(userService.createUser(userData)).rejects.toThrow(
      'El correo ya está registrado'
    );
  });

  test('debería obtener usuario por ID', async () => {
    const userData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'password123',
    };

    const createdUser = await userService.createUser(userData);
    const foundUser = await userService.getUserById(createdUser.id);

    expect(foundUser.id).toBe(createdUser.id);
    expect(foundUser.name).toBe('Juan Pérez');
  });

  test('debería lanzar error si el usuario no existe', async () => {
    await expect(userService.getUserById(999)).rejects.toThrow(
      'Usuario no encontrado'
    );
  });

  test('debería actualizar un usuario', async () => {
    const userData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'password123',
    };

    const user = await userService.createUser(userData);
    const updatedUser = await userService.updateUser(user.id, {
      name: 'Juan Carlos Pérez',
      email: 'juancarlos@example.com',
    });

    expect(updatedUser.name).toBe('Juan Carlos Pérez');
    expect(updatedUser.email).toBe('juancarlos@example.com');
  });

  test('debería eliminar un usuario', async () => {
    const userData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'password123',
    };

    const user = await userService.createUser(userData);
    const deleted = await userService.deleteUser(user.id);

    expect(deleted).toBe(true);

    await expect(userService.getUserById(user.id)).rejects.toThrow(
      'Usuario no encontrado'
    );
  });

  test('debería obtener todos los usuarios', async () => {
    const userData1 = {
      name: 'Usuario 1',
      email: 'user1@example.com',
      password: 'password123',
    };

    const userData2 = {
      name: 'Usuario 2',
      email: 'user2@example.com',
      password: 'password123',
    };

    await userService.createUser(userData1);
    await userService.createUser(userData2);

    const users = await userService.getAllUsers();

    expect(users.length).toBe(2);
  });
});
