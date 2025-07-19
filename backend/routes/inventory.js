const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const { truck_id, category, low_stock } = req.query;
    
    let query = `
      SELECT i.*, 
             t.truck_number,
             t.license_plate,
             c.name as company_name,
             c.business_type
      FROM inventory i
      JOIN trucks t ON i.truck_id = t.id
      JOIN companies c ON t.company_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (truck_id) {
      paramCount++;
      query += ` AND i.truck_id = $${paramCount}`;
      params.push(truck_id);
    }

    if (category) {
      paramCount++;
      query += ` AND i.category = $${paramCount}`;
      params.push(category);
    }

    if (low_stock === 'true') {
      query += ` AND i.quantity <= i.reorder_level`;
    }

    query += ` ORDER BY i.item_name`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Get inventory by truck
router.get('/truck/:truck_id', async (req, res) => {
  try {
    const { truck_id } = req.params;
    
    const result = await pool.query(`
      SELECT i.*, 
             t.truck_number,
             t.license_plate,
             c.name as company_name,
             c.business_type
      FROM inventory i
      JOIN trucks t ON i.truck_id = t.id
      JOIN companies c ON t.company_id = c.id
      WHERE i.truck_id = $1
      ORDER BY i.category, i.item_name
    `, [truck_id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching truck inventory:', error);
    res.status(500).json({ error: 'Failed to fetch truck inventory' });
  }
});

// Create new inventory item
router.post('/', async (req, res) => {
  try {
    const {
      truck_id, item_name, category, quantity, unit_price,
      reorder_level, last_restocked
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO inventory (
        truck_id, item_name, category, quantity, unit_price,
        reorder_level, last_restocked
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [truck_id, item_name, category, quantity, unit_price,
        reorder_level, last_restocked]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

// Update inventory item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      item_name, category, quantity, unit_price,
      reorder_level, last_restocked
    } = req.body;
    
    const result = await pool.query(`
      UPDATE inventory 
      SET item_name = $1, category = $2, quantity = $3, unit_price = $4,
          reorder_level = $5, last_restocked = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [item_name, category, quantity, unit_price,
        reorder_level, last_restocked, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// Update inventory quantity
router.patch('/:id/quantity', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation = 'set' } = req.body; // 'set', 'add', 'subtract'
    
    let query;
    if (operation === 'add') {
      query = 'UPDATE inventory SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
    } else if (operation === 'subtract') {
      query = 'UPDATE inventory SET quantity = GREATEST(0, quantity - $1), updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
    } else {
      query = 'UPDATE inventory SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
    }
    
    const result = await pool.query(query, [quantity, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating inventory quantity:', error);
    res.status(500).json({ error: 'Failed to update inventory quantity' });
  }
});

// Delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

module.exports = router;