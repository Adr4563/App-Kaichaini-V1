const Material = require('../models/Material');
const pool = require('../config/database');
const { v4: uuidv4, validate: esUUID } = require('uuid');

class MaterialController {

  static async listarPorClaseYModulo(req, res) {
    try {
      const { idClase, idModulo } = req.query;

      if (!idClase && !idModulo) {
        return res.status(400).json({ success: false, message: 'ID de clase o modulo es requerido' });
      }

      if (idClase && !esUUID(idClase)) {
        return res.status(400).json({ success: false, message: 'El id de clase no tiene un formato valido' });
      }

      if (idModulo && !esUUID(idModulo)) {
        return res.status(400).json({ success: false, message: 'El id de modulo no tiene un formato valido' });
      }

      let material;
      if (idClase) {
        material = await Material.obtenerPorClase(idClase);
      } else {
        material = await Material.obtenerPorModulo(idModulo);
      }

      res.status(200).json({ success: true, data: material });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async buscar(req, res) {
    try {
      const { q, idClase } = req.query;

      if (!q || !idClase) {
        return res.status(400).json({ success: false, message: 'Busqueda y clase son requeridos' });
      }

      const resultados = await Material.buscar(q, idClase);

      res.status(200).json({ success: true, data: resultados });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async crear(req, res) {
    try {
      const { idClase, idModulo, nombre, tipo, url } = req.body;

      if (!idClase || !nombre || !tipo || !url) {
        return res.status(400).json({ success: false, message: 'idClase, nombre, tipo y url son requeridos' });
      }

      const resultado = await pool.query(
        'INSERT INTO MATERIAL (id, "idClase", "idModulo", nombre, tipo, url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [uuidv4(), idClase, idModulo || null, nombre, tipo, url]
      );

      res.status(201).json({ success: true, message: 'Material creado', data: resultado.rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async eliminar(req, res) {
    try {
      const { id } = req.params;

      if (!esUUID(id)) {
        return res.status(400).json({ success: false, message: 'El id de material no tiene un formato valido' });
      }

      const resultado = await pool.query('DELETE FROM MATERIAL WHERE id = $1 RETURNING *', [id]);

      if (resultado.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Material no encontrado' });
      }

      res.status(200).json({ success: true, message: 'Material eliminado' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = MaterialController;
