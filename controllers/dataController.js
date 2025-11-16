import pool from '../config/db.js';

export const saveExtractedData = async (req, res) => {
  try {
    const { url, data, category, notes } = req.body;
    const userId = req.user.id;

    if (!url || !data) {
      return res.status(400).json({ 
        success: false, 
        message: 'URL y datos son requeridos' 
      });
    }

    // Contar productos en el JSON
    let totalProducts = 0;
    if (Array.isArray(data)) {
      totalProducts = data.length;
    } else if (typeof data === 'object' && data.products) {
      totalProducts = Array.isArray(data.products) ? data.products.length : 0;
    }

    const [insertResult] = await pool.execute(
      `INSERT INTO extracted_data (url, data, user_id, category, total_products, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [url, JSON.stringify(data), userId, category || 'sillas', totalProducts, notes]
    );

    const [rows] = await pool.execute(
      `SELECT ed.*, u.username 
       FROM extracted_data ed 
       LEFT JOIN users u ON ed.user_id = u.id 
       WHERE ed.id = ?`,
      [insertResult.insertId]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Datos guardados exitosamente',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error guardando datos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al guardar datos extraídos' 
    });
  }
};

export const getAllExtractedData = async (req, res) => {
  try {
    const { category, limit = 50, offset = 0 } = req.query;

    let base = `
      SELECT ed.*, u.username 
      FROM extracted_data ed
      LEFT JOIN users u ON ed.user_id = u.id`;
    const params = [];
    if (category) {
      base += ' WHERE ed.category = ?';
      params.push(category);
    }
    base += ' ORDER BY ed.extracted_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.execute(base, params);

    res.json({ 
      success: true, 
      count: rows.length,
      data: rows 
    });
  } catch (error) {
    console.error('Error obteniendo datos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener datos extraídos' 
    });
  }
};

export const getExtractedDataById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT ed.*, u.username 
       FROM extracted_data ed
       LEFT JOIN users u ON ed.user_id = u.id
       WHERE ed.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Datos no encontrados' 
      });
    }

    res.json({ 
      success: true, 
      data: rows[0] 
    });
  } catch (error) {
    console.error('Error obteniendo datos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener datos' 
    });
  }
};

export const deleteExtractedData = async (req, res) => {
  try {
    const { id } = req.params;

    const [delResult] = await pool.execute(
      'DELETE FROM extracted_data WHERE id = ?',
      [id]
    );

    if (delResult.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Datos no encontrados' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Datos eliminados exitosamente' 
    });
  } catch (error) {
    console.error('Error eliminando datos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar datos' 
    });
  }
};
