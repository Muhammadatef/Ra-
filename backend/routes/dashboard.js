const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get dashboard overview
router.get('/overview', async (req, res) => {
  try {
    const { company_id, date_from, date_to } = req.query;
    
    // Build base query conditions
    let companyFilter = '';
    let salesDateFilter = '';
    const params = [];
    let paramCount = 0;

    if (company_id) {
      paramCount++;
      companyFilter = `WHERE c.id = $${paramCount}`;
      params.push(company_id);
    }

    if (date_from || date_to) {
      let dateConditions = [];
      if (date_from) {
        paramCount++;
        dateConditions.push(`s.sale_date >= $${paramCount}`);
        params.push(date_from);
      }
      if (date_to) {
        paramCount++;
        dateConditions.push(`s.sale_date <= $${paramCount}`);
        params.push(date_to);
      }
      salesDateFilter = `AND ${dateConditions.join(' AND ')}`;
    }

    // Get overview stats
    const overviewQuery = `
      SELECT 
        COUNT(DISTINCT c.id) as total_companies,
        COUNT(DISTINCT e.id) as total_employees,
        COUNT(DISTINCT t.id) as total_trucks,
        COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.id END) as active_employees,
        COUNT(DISTINCT CASE WHEN t.status = 'active' THEN t.id END) as active_trucks
      FROM companies c
      LEFT JOIN employees e ON c.id = e.company_id
      LEFT JOIN trucks t ON c.id = t.company_id
      ${companyFilter}
    `;

    const overviewResult = await pool.query(overviewQuery, company_id ? [company_id] : []);

    // Get sales stats
    const salesQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(s.total_amount), 0) as total_revenue,
        COALESCE(AVG(s.total_amount), 0) as avg_transaction_value,
        COUNT(DISTINCT s.truck_id) as trucks_with_sales
      FROM sales s
      JOIN trucks t ON s.truck_id = t.id
      JOIN companies c ON t.company_id = c.id
      WHERE 1=1 ${salesDateFilter}
      ${company_id ? `AND c.id = $${params.length > 2 ? 3 : 1}` : ''}
    `;

    const salesParams = company_id ? 
      (date_from || date_to ? [...params] : [company_id]) : 
      (date_from || date_to ? params.slice(0, -1) : []);

    const salesResult = await pool.query(salesQuery, salesParams);

    // Get business type breakdown
    const businessTypeQuery = `
      SELECT 
        c.business_type,
        COUNT(DISTINCT c.id) as company_count,
        COUNT(DISTINCT e.id) as employee_count,
        COUNT(DISTINCT t.id) as truck_count,
        COALESCE(SUM(s.total_amount), 0) as total_revenue
      FROM companies c
      LEFT JOIN employees e ON c.id = e.company_id AND e.status = 'active'
      LEFT JOIN trucks t ON c.id = t.company_id AND t.status = 'active'
      LEFT JOIN sales s ON t.id = s.truck_id ${salesDateFilter}
      ${companyFilter}
      GROUP BY c.business_type
      ORDER BY c.business_type
    `;

    const businessTypeResult = await pool.query(businessTypeQuery, params);

    // Get recent sales
    const recentSalesQuery = `
      SELECT 
        s.id,
        s.sale_date,
        s.sale_time,
        s.total_amount,
        s.payment_method,
        t.truck_number,
        c.name as company_name,
        c.business_type,
        e.first_name || ' ' || e.last_name as employee_name
      FROM sales s
      JOIN trucks t ON s.truck_id = t.id
      JOIN companies c ON t.company_id = c.id
      LEFT JOIN employees e ON s.employee_id = e.id
      WHERE 1=1 ${salesDateFilter}
      ${company_id ? `AND c.id = $${params.length}` : ''}
      ORDER BY s.sale_date DESC, s.sale_time DESC
      LIMIT 10
    `;

    const recentSalesResult = await pool.query(recentSalesQuery, salesParams);

    res.json({
      overview: overviewResult.rows[0],
      sales: salesResult.rows[0],
      businessTypes: businessTypeResult.rows,
      recentSales: recentSalesResult.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard overview' });
  }
});

// Get sales analytics
router.get('/sales-analytics', async (req, res) => {
  try {
    const { company_id, date_from, date_to, group_by = 'day' } = req.query;
    
    let dateFormat;
    switch (group_by) {
      case 'hour':
        dateFormat = "TO_CHAR(s.sale_date, 'YYYY-MM-DD') || ' ' || TO_CHAR(s.sale_time, 'HH24:00')";
        break;
      case 'week':
        dateFormat = "TO_CHAR(DATE_TRUNC('week', s.sale_date), 'YYYY-MM-DD')";
        break;
      case 'month':
        dateFormat = "TO_CHAR(DATE_TRUNC('month', s.sale_date), 'YYYY-MM')";
        break;
      default: // day
        dateFormat = "TO_CHAR(s.sale_date, 'YYYY-MM-DD')";
    }

    let query = `
      SELECT 
        ${dateFormat} as period,
        COUNT(*) as transaction_count,
        SUM(s.total_amount) as total_revenue,
        AVG(s.total_amount) as avg_transaction,
        COUNT(DISTINCT s.truck_id) as unique_trucks,
        c.business_type
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

    query += ` GROUP BY ${dateFormat}, c.business_type ORDER BY period DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({ error: 'Failed to fetch sales analytics' });
  }
});

// Get truck performance
router.get('/truck-performance', async (req, res) => {
  try {
    const { company_id, date_from, date_to } = req.query;
    
    let query = `
      SELECT 
        t.id,
        t.truck_number,
        t.license_plate,
        c.name as company_name,
        c.business_type,
        l.name as location_name,
        COUNT(s.id) as total_sales,
        COALESCE(SUM(s.total_amount), 0) as total_revenue,
        COALESCE(AVG(s.total_amount), 0) as avg_sale_amount,
        COUNT(DISTINCT s.sale_date) as active_days
      FROM trucks t
      JOIN companies c ON t.company_id = c.id
      LEFT JOIN locations l ON t.location_id = l.id
      LEFT JOIN sales s ON t.id = s.truck_id
    `;

    const params = [];
    let paramCount = 0;
    const conditions = ['t.status = \'active\''];

    if (company_id) {
      paramCount++;
      conditions.push(`c.id = $${paramCount}`);
      params.push(company_id);
    }

    if (date_from) {
      paramCount++;
      conditions.push(`(s.sale_date IS NULL OR s.sale_date >= $${paramCount})`);
      params.push(date_from);
    }

    if (date_to) {
      paramCount++;
      conditions.push(`(s.sale_date IS NULL OR s.sale_date <= $${paramCount})`);
      params.push(date_to);
    }

    query += ` WHERE ${conditions.join(' AND ')}`;
    query += ` GROUP BY t.id, t.truck_number, t.license_plate, c.name, c.business_type, l.name`;
    query += ` ORDER BY total_revenue DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching truck performance:', error);
    res.status(500).json({ error: 'Failed to fetch truck performance' });
  }
});

// Get low stock alerts
router.get('/low-stock', async (req, res) => {
  try {
    const { company_id } = req.query;
    
    let query = `
      SELECT 
        i.id,
        i.item_name,
        i.category,
        i.quantity,
        i.reorder_level,
        i.unit_price,
        t.truck_number,
        c.name as company_name,
        c.business_type,
        (i.reorder_level - i.quantity) as shortage
      FROM inventory i
      JOIN trucks t ON i.truck_id = t.id
      JOIN companies c ON t.company_id = c.id
      WHERE i.quantity <= i.reorder_level
    `;

    const params = [];

    if (company_id) {
      query += ` AND c.id = $1`;
      params.push(company_id);
    }

    query += ` ORDER BY (i.reorder_level - i.quantity) DESC, i.item_name`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    res.status(500).json({ error: 'Failed to fetch low stock alerts' });
  }
});

module.exports = router;