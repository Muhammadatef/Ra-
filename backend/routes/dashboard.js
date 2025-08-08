const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { addCompanyFilter } = require('../middleware/companyFilter');

// Apply authentication to all routes
router.use(authenticateToken);
router.use(addCompanyFilter);

// Get dashboard overview (filtered by user's company)
router.get('/overview', async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    const companyId = req.user.company_id;
    
    // Build base query conditions for sales date filtering
    let salesDateFilter = '';
    const params = [companyId]; // Always filter by user's company
    let paramCount = 1;

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

    // Get overview stats (for user's company only)
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
      WHERE c.id = $1
    `;

    const overviewResult = await pool.query(overviewQuery, [companyId]);

    // Get sales stats for user's company
    const salesQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(s.total_amount), 0) as total_revenue,
        COALESCE(SUM(s.tips_amount), 0) as total_tips,
        COALESCE(SUM(s.cash_amount), 0) as total_cash,
        COALESCE(SUM(s.card_amount), 0) as total_card,
        COALESCE(AVG(s.total_amount), 0) as avg_transaction_value,
        COUNT(DISTINCT s.truck_id) as trucks_with_sales
      FROM sales s
      JOIN trucks t ON s.truck_id = t.id
      WHERE t.company_id = $1 ${salesDateFilter}
    `;

    const salesResult = await pool.query(salesQuery, params);

    // Get business type breakdown for user's company
    const businessTypeQuery = `
      SELECT 
        c.business_type,
        COUNT(DISTINCT c.id) as company_count,
        COUNT(DISTINCT e.id) as employee_count,
        COUNT(DISTINCT t.id) as truck_count,
        COALESCE(SUM(s.total_amount), 0) as total_revenue,
        COALESCE(SUM(s.tips_amount), 0) as total_tips
      FROM companies c
      LEFT JOIN employees e ON c.id = e.company_id AND e.status = 'active'
      LEFT JOIN trucks t ON c.id = t.company_id AND t.status = 'active'
      LEFT JOIN sales s ON t.id = s.truck_id ${salesDateFilter}
      WHERE c.id = $1
      GROUP BY c.business_type
      ORDER BY c.business_type
    `;

    const businessTypeResult = await pool.query(businessTypeQuery, params);

    // Get recent sales for user's company
    const recentSalesQuery = `
      SELECT 
        s.id,
        s.sale_date,
        s.sale_time,
        s.total_amount,
        s.tips_amount,
        s.cash_amount,
        s.card_amount,
        s.payment_method,
        t.truck_number,
        c.name as company_name,
        c.business_type,
        e.first_name || ' ' || e.last_name as employee_name
      FROM sales s
      JOIN trucks t ON s.truck_id = t.id
      JOIN companies c ON t.company_id = c.id
      LEFT JOIN employees e ON s.employee_id = e.id
      WHERE c.id = $1 ${salesDateFilter}
      ORDER BY s.sale_date DESC, s.sale_time DESC
      LIMIT 10
    `;

    const recentSalesResult = await pool.query(recentSalesQuery, params);

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

// Get sales analytics (filtered by user's company)
router.get('/sales-analytics', async (req, res) => {
  try {
    const { date_from, date_to, group_by = 'day' } = req.query;
    const companyId = req.user.company_id;
    
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
        SUM(s.tips_amount) as total_tips,
        SUM(s.cash_amount) as total_cash,
        SUM(s.card_amount) as total_card,
        AVG(s.total_amount) as avg_transaction,
        COUNT(DISTINCT s.truck_id) as unique_trucks,
        c.business_type
      FROM sales s
      JOIN trucks t ON s.truck_id = t.id
      JOIN companies c ON t.company_id = c.id
      WHERE c.id = $1
    `;

    const params = [companyId];
    let paramCount = 1;

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

    query += `
      GROUP BY ${dateFormat}, c.business_type
      ORDER BY period DESC
      LIMIT 30
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({ error: 'Failed to fetch sales analytics' });
  }
});

// Get truck performance (filtered by user's company)
router.get('/truck-performance', async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    const companyId = req.user.company_id;

    let dateFilter = '';
    const params = [companyId];
    let paramCount = 1;

    if (date_from) {
      paramCount++;
      dateFilter += ` AND s.sale_date >= $${paramCount}`;
      params.push(date_from);
    }

    if (date_to) {
      paramCount++;
      dateFilter += ` AND s.sale_date <= $${paramCount}`;
      params.push(date_to);
    }

    const query = `
      SELECT 
        t.truck_number,
        t.id,
        t.status,
        COUNT(s.id) as total_sales,
        COALESCE(SUM(s.total_amount), 0) as total_revenue,
        COALESCE(SUM(s.tips_amount), 0) as total_tips,
        COALESCE(AVG(s.total_amount), 0) as avg_sale_amount,
        COUNT(DISTINCT s.sale_date) as active_days,
        c.name as company_name,
        c.business_type,
        COUNT(CASE WHEN ts.session_status = 'active' THEN 1 END) as active_sessions,
        COUNT(CASE WHEN ts.session_status = 'completed' THEN 1 END) as completed_sessions
      FROM trucks t
      JOIN companies c ON t.company_id = c.id
      LEFT JOIN sales s ON t.id = s.truck_id ${dateFilter}
      LEFT JOIN truck_sessions ts ON t.id = ts.truck_id
      WHERE c.id = $1
      GROUP BY t.id, t.truck_number, t.status, c.name, c.business_type
      ORDER BY total_revenue DESC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching truck performance:', error);
    res.status(500).json({ error: 'Failed to fetch truck performance' });
  }
});

// Get low stock items (filtered by user's company)
router.get('/low-stock', async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const query = `
      SELECT 
        i.id,
        i.item_name,
        i.category,
        i.quantity,
        i.reorder_level,
        i.unit_price,
        i.last_restocked,
        t.truck_number,
        c.name as company_name,
        c.business_type,
        (i.quantity * i.unit_price) as total_value
      FROM inventory i
      JOIN trucks t ON i.truck_id = t.id
      JOIN companies c ON t.company_id = c.id
      WHERE c.id = $1 AND i.quantity <= i.reorder_level
      ORDER BY 
        CASE WHEN i.quantity = 0 THEN 0 ELSE 1 END,
        (i.quantity::float / i.reorder_level) ASC,
        i.item_name
    `;

    const result = await pool.query(query, [companyId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
});

// Get employee performance (filtered by user's company)
router.get('/employee-performance', async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    const companyId = req.user.company_id;

    let dateFilter = '';
    const params = [companyId];
    let paramCount = 1;

    if (date_from) {
      paramCount++;
      dateFilter += ` AND s.sale_date >= $${paramCount}`;
      params.push(date_from);
    }

    if (date_to) {
      paramCount++;
      dateFilter += ` AND s.sale_date <= $${paramCount}`;
      params.push(date_to);
    }

    const query = `
      SELECT 
        e.id,
        e.first_name || ' ' || e.last_name as employee_name,
        e.position,
        COUNT(s.id) as total_sales,
        COALESCE(SUM(s.total_amount), 0) as total_revenue,
        COALESCE(SUM(s.tips_amount), 0) as total_tips,
        COALESCE(AVG(s.total_amount), 0) as avg_sale_amount,
        COUNT(DISTINCT s.sale_date) as active_days,
        COUNT(DISTINCT ts.id) as truck_sessions,
        AVG(CASE 
          WHEN ts.logout_time IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (ts.logout_time - ts.login_time))/3600
        END) as avg_session_hours
      FROM employees e
      LEFT JOIN sales s ON e.id = s.employee_id ${dateFilter}
      LEFT JOIN truck_sessions ts ON e.id = ts.employee_id
      WHERE e.company_id = $1 AND e.status = 'active'
      GROUP BY e.id, e.first_name, e.last_name, e.position
      ORDER BY total_revenue DESC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employee performance:', error);
    res.status(500).json({ error: 'Failed to fetch employee performance' });
  }
});

module.exports = router;