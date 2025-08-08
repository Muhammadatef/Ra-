const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { addCompanyFilter } = require('../middleware/companyFilter');

// Apply authentication to all routes
router.use(authenticateToken);

// Get user's company info (returns only the company they belong to)
router.get('/', addCompanyFilter, async (req, res) => {
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
      WHERE c.id = $1
      GROUP BY c.id
    `, [req.user.company_id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// Get company by ID (only if it's user's company)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure user can only access their own company
    if (id !== req.user.company_id) {
      return res.status(403).json({ error: 'Access denied to this company' });
    }
    
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

// Update company (only admins can update their own company)
router.put('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, business_type, state, contact_email, contact_phone } = req.body;
    
    // Ensure user can only update their own company
    if (id !== req.user.company_id) {
      return res.status(403).json({ error: 'Access denied to this company' });
    }
    
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

module.exports = router;