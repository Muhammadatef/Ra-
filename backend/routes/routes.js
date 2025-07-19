const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all routes
router.get('/', async (req, res) => {
  try {
    const { truck_id, status, date_from, date_to } = req.query;
    
    let query = `
      SELECT r.*, 
             t.truck_number,
             t.license_plate,
             c.name as company_name,
             e.first_name || ' ' || e.last_name as driver_name
      FROM routes r
      JOIN trucks t ON r.truck_id = t.id
      JOIN companies c ON t.company_id = c.id
      LEFT JOIN employees e ON r.employee_id = e.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (truck_id) {
      paramCount++;
      query += ` AND r.truck_id = $${paramCount}`;
      params.push(truck_id);
    }

    if (status) {
      paramCount++;
      query += ` AND r.status = $${paramCount}`;
      params.push(status);
    }

    if (date_from) {
      paramCount++;
      query += ` AND r.route_date >= $${paramCount}`;
      params.push(date_from);
    }

    if (date_to) {
      paramCount++;
      query += ` AND r.route_date <= $${paramCount}`;
      params.push(date_to);
    }

    query += ` ORDER BY r.route_date DESC, r.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

// Get route by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT r.*, 
             t.truck_number,
             t.license_plate,
             c.name as company_name,
             e.first_name || ' ' || e.last_name as driver_name
      FROM routes r
      JOIN trucks t ON r.truck_id = t.id
      JOIN companies c ON t.company_id = c.id
      LEFT JOIN employees e ON r.employee_id = e.id
      WHERE r.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

// Create new route
router.post('/', async (req, res) => {
  try {
    const {
      truck_id, employee_id, route_name, start_location,
      end_location, estimated_duration, route_date, status = 'planned'
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO routes (
        truck_id, employee_id, route_name, start_location,
        end_location, estimated_duration, route_date, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [truck_id, employee_id, route_name, start_location,
        end_location, estimated_duration, route_date, status]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({ error: 'Failed to create route' });
  }
});

// Update route
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      employee_id, route_name, start_location, end_location,
      estimated_duration, route_date, status
    } = req.body;
    
    const result = await pool.query(`
      UPDATE routes 
      SET employee_id = $1, route_name = $2, start_location = $3,
          end_location = $4, estimated_duration = $5, route_date = $6,
          status = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [employee_id, route_name, start_location, end_location,
        estimated_duration, route_date, status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({ error: 'Failed to update route' });
  }
});

// Delete route
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM routes WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({ error: 'Failed to delete route' });
  }
});

module.exports = router;