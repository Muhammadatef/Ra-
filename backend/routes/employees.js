const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { addCompanyFilter } = require('../middleware/companyFilter');

// Apply authentication and company filtering to all routes
router.use(authenticateToken);
router.use(addCompanyFilter);

// Get all employees with company and location info (filtered by user's company)
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const companyId = req.user.company_id; // Use authenticated user's company
    
    let query = `
      SELECT e.*, 
             c.name as company_name, 
             c.business_type,
             l.name as location_name,
             l.city as location_city,
             l.state as location_state
      FROM employees e
      JOIN companies c ON e.company_id = c.id
      LEFT JOIN locations l ON e.location_id = l.id
      WHERE 1=1
    `;
    const params = [companyId]; // Always filter by user's company
    let paramCount = 1;
    
    // Company filter is always applied
    query += ` AND e.company_id = $${paramCount}`;

    if (status) {
      paramCount++;
      query += ` AND e.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY e.hire_date DESC`;
    
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM employees e
      JOIN companies c ON e.company_id = c.id
      WHERE e.company_id = $1
    `;
    const countParams = [companyId];
    let countParamCount = 1;

    if (status) {
      countParamCount++;
      countQuery += ` AND e.status = $${countParamCount}`;
      countParams.push(status);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      employees: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT e.*, 
             c.name as company_name, 
             c.business_type,
             l.name as location_name,
             l.city as location_city,
             l.state as location_state
      FROM employees e
      JOIN companies c ON e.company_id = c.id
      LEFT JOIN locations l ON e.location_id = l.id
      WHERE e.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Create new employee
router.post('/', async (req, res) => {
  try {
    const {
      company_id, location_id, employee_id, first_name, last_name,
      email, phone, position, hire_date, salary, status = 'active'
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO employees (
        company_id, location_id, employee_id, first_name, last_name,
        email, phone, position, hire_date, salary, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [company_id, location_id, employee_id, first_name, last_name,
        email, phone, position, hire_date, salary, status]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Employee ID or email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create employee' });
    }
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      location_id, first_name, last_name, email, phone,
      position, salary, status
    } = req.body;
    
    const result = await pool.query(`
      UPDATE employees 
      SET location_id = $1, first_name = $2, last_name = $3, email = $4,
          phone = $5, position = $6, salary = $7, status = $8,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [location_id, first_name, last_name, email, phone,
        position, salary, status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

module.exports = router;