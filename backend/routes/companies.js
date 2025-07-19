const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all companies
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, 
             COUNT(DISTINCT e.id) as employee_count,
             COUNT(DISTINCT t.id) as truck_count,
             COUNT(DISTINCT l.id) as location_count
      FROM companies c
      LEFT JOIN employees e ON c.id = e.company_id AND e.status = 'active'
      LEFT JOIN trucks t ON c.id = t.company_id AND t.status = 'active'
      LEFT JOIN locations l ON c.id = l.company_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT c.*, 
             COUNT(DISTINCT e.id) as employee_count,
             COUNT(DISTINCT t.id) as truck_count,
             COUNT(DISTINCT l.id) as location_count
      FROM companies c
      LEFT JOIN employees e ON c.id = e.company_id AND e.status = 'active'
      LEFT JOIN trucks t ON c.id = t.company_id AND t.status = 'active'
      LEFT JOIN locations l ON c.id = l.company_id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// Create new company
router.post('/', async (req, res) => {
  try {
    const { name, business_type, state, contact_email, contact_phone } = req.body;
    
    const result = await pool.query(`
      INSERT INTO companies (name, business_type, state, contact_email, contact_phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, business_type, state, contact_email, contact_phone]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// Update company
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, business_type, state, contact_email, contact_phone } = req.body;
    
    const result = await pool.query(`
      UPDATE companies 
      SET name = $1, business_type = $2, state = $3, 
          contact_email = $4, contact_phone = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [name, business_type, state, contact_email, contact_phone, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// Delete company
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM companies WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

module.exports = router;