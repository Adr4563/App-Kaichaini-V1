const pool = require('../config/database');
const Estudiante = require('./Estudiante');

class Test {
    // Metodo 1        
    static async registrar() {
        const nuevo = await Estudiante.registrar({
            nombre: 'Estudiante Prueba',
            correo: `prueba${Date.now()}@test.com`,
            contrasena: '12345678',
        });
        console.log(nuevo);
    }

    // Metodo 2
    static async verPerfil(id) {
        const perfil = await Estudiante.verPerfil(id);
        console.log(perfil);
    }

    // Metodo 3: no es de la clase estudiante, Propio
    static async listarIds() {
        const { rows } = await pool.query("SELECT id, nombre, correo FROM USUARIO WHERE rol = 'Estudiante'");
        console.log(rows);
    }

}


//============ Ejecutar el metodo que necesites =====================================

if (require.main === module) {
  (async () => {
    try {
      // await ---- Test.registrar / Test.verPerfil / Test.listarIds

      // await Test.listarIds();
      await Test.verPerfil('8ee2b48a-283a-4186-b337-9d46b4979613');




    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      await pool.end();
    }
  })();
}

// Comando de ejecución =>
// node src/models/test.js
