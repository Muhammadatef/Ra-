const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all sales
router.get('/', async (req, res) => {
  try {
    const { truck_id, date_from, date_to, limit = 100, offset = 0 } = req.query;
    
    let query = `
      SELECT s.*, 
             t.truck_number,
             t.license_plate,
             c.name as company_name,
             c.business_type,
             e.first_name || ' ' || e.last_name as employee_name,
             r.route_name
      FROM sales s
      JOIN trucks t ON s.truck_id = t.id
      JOIN companies c ON t.company_id = c.id
      LEFT JOIN employees e ON s.employee_id = e.id
      LEFT JOIN routes r ON s.route_id = r.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (truck_id) {
      paramCount++;
      query += ` AND s.truck_id = $${paramCount}`;
      params.push(truck_id);
    }

    if (date_from) {
      paramCount++;
      query += ` AND s.sale_date >= $${paramCount}`;
      params.push(date_from);
    }

    if (date_to) {
      paramCount++;
      query += ` AND s.sale_date <= $${paramCount}`;
      params.push(date_to);
    }

    query += ` ORDER BY s.sale_date DESC, s.sale_time DESC`;
    
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
      FROM sales s
      JOIN trucks t ON s.truck_id = t.id
      WHERE 1=1
    `;
    const countParams = [];
    let countParamCount = 0;

    if (truck_id) {
      countParamCount++;
      countQuery += ` AND s.truck_id = $${countParamCount}`;
      countParams.push(truck_id);
    }

    if (date_from) {
      countParamCount++;
      countQuery += ` AND s.sale_date >= $${countParamCount}`;
      countParams.push(date_from);
    }

    if (date_to) {
      countParamCount++;
      countQuery += ` AND s.sale_date <= $${countParamCount}`;
      countParams.push(date_to);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      sales: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Get sales summary
router.get('/summary', async (req, res) => {
  try {
    const { date_from, date_to, company_id } = req.query;
    
    let query = `
      SELECT 
        DATE(s.sale_date) as date,
        COUNT(*) as transaction_count,
        SUM(s.total_amount) as total_revenue,
        AVG(s.total_amount) as avg_transaction,
        c.business_type,
        c.name as company_name
      FROM sales s
      JOIN trucks t ON s.truck_id = t.id
      JOIN companies c ON t.company_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (company_id) {
      paramCount++;
      query += ` AND c.id = $${paramCount}`;
      params.push(company_id);
    }

    if (date_from) {
      paramCount++;
      query += ` AND s.sale_date >= $${paramCount}`;
      params.push(date_from);
    }

    if (date_to) {
      paramCount++;
      query += ` AND s.sale_date <= $${paramCount}`;
      params.push(date_to);
    }

    query += ` GROUP BY DATE(s.sale_date), c.business_type, c.name, c.id ORDER BY date DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    res.status(500).json({ error: 'Failed to fetch sales summary' });
  }
});

// Create new sale
router.post('/', async (req, res) => {
  try {
    const {
      truck_id, employee_id, route_id, sale_date, sale_time,
      total_amount, payment_method, location_lat, location_lng
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO sales (
        truck_id, employee_id, route_id, sale_date, sale_time,
        total_amount, payment_method, location_lat, location_lng
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [truck_id, employee_id, route_id, sale_date, sale_time,
        total_amount, payment_method, location_lat, location_lng]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ error: 'Failed to create sale' });
  }
});

module.exports = router;