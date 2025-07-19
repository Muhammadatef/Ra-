const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all trucks
router.get('/', async (req, res) => {
  try {
    const { company_id, status } = req.query;
    
    let query = `
      SELECT t.*, 
             c.name as company_name,
             c.business_type,
             l.name as location_name,
             l.city as location_city,
             l.state as location_state
      FROM trucks t
      JOIN companies c ON t.company_id = c.id
      LEFT JOIN locations l ON t.location_id = l.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (company_id) {
      paramCount++;
      query += ` AND t.company_id = $${paramCount}`;
      params.push(company_id);
    }

    if (status) {
      paramCount++;
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY t.truck_number`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching trucks:', error);
    res.status(500).json({ error: 'Failed to fetch trucks' });
  }
});

// Get truck by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT t.*, 
             c.name as company_name,
             c.business_type,
             l.name as location_name,
             l.city as location_city,
             l.state as location_state
      FROM trucks t
      JOIN companies c ON t.company_id = c.id
      LEFT JOIN locations l ON t.location_id = l.id
      WHERE t.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Truck not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching truck:', error);
    res.status(500).json({ error: 'Failed to fetch truck' });
  }
});

// Create new truck
router.post('/', async (req, res) => {
  try {
    const {
      company_id, location_id, truck_number, license_plate,
      model, year, capacity, status = 'active', last_maintenance, next_maintenance
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO trucks (
        company_id, location_id, truck_number, license_plate,
        model, year, capacity, status, last_maintenance, next_maintenance
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [company_id, location_id, truck_number, license_plate,
        model, year, capacity, status, last_maintenance, next_maintenance]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating truck:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Truck number or license plate already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create truck' });
    }
  }
});

// Update truck
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      location_id, model, year, capacity, status,
      last_maintenance, next_maintenance
    } = req.body;
    
    const result = await pool.query(`
      UPDATE trucks 
      SET location_id = $1, model = $2, year = $3, capacity = $4,
          status = $5, last_maintenance = $6, next_maintenance = $7,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [location_id, model, year, capacity, status,
        last_maintenance, next_maintenance, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Truck not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating truck:', error);
    res.status(500).json({ error: 'Failed to update truck' });
  }
});

// Delete truck
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM trucks WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Truck not found' });
    }
    
    res.json({ message: 'Truck deleted successfully' });
  } catch (error) {
    console.error('Error deleting truck:', error);
    res.status(500).json({ error: 'Failed to delete truck' });
  }
});

module.exports = router;