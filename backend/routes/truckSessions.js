const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { addCompanyFilter } = require('../middleware/companyFilter');

const router = express.Router();

// Apply authentication and company filtering to all routes
router.use(authenticateToken);
router.use(addCompanyFilter);

// Start truck session (employee login to truck)
router.post('/start', async (req, res) => {
  try {
    const { truckId, employeeId, notes } = req.body;

    if (!truckId || !employeeId) {
      return res.status(400).json({ error: 'Truck ID and Employee ID are required' });
    }

    // Verify truck and employee belong to user's company
    const verifyResult = await pool.query(`
      SELECT t.id as truck_id, e.id as employee_id, t.truck_number, 
             e.first_name, e.last_name
      FROM trucks t
      CROSS JOIN employees e
      WHERE t.id = $1 AND e.id = $2 
        AND t.company_id = $3 AND e.company_id = $3
        AND t.status = 'active' AND e.status = 'active'
    `, [truckId, employeeId, req.user.company_id]);

    if (verifyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Truck or employee not found or not active' });
    }

    // Check if employee already has an active session
    const activeSessionResult = await pool.query(`
      SELECT ts.id FROM truck_sessions ts
      JOIN trucks t ON ts.truck_id = t.id
      WHERE ts.employee_id = $1 AND ts.session_status = 'active'
        AND t.company_id = $2
    `, [employeeId, req.user.company_id]);

    if (activeSessionResult.rows.length > 0) {
      return res.status(400).json({ error: 'Employee already has an active truck session' });
    }

    // Create new session
    const sessionResult = await pool.query(`
      INSERT INTO truck_sessions (truck_id, employee_id, user_id, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [truckId, employeeId, req.user.id, notes]);

    const session = sessionResult.rows[0];
    const truckInfo = verifyResult.rows[0];

    res.status(201).json({
      message: 'Truck session started successfully',
      session: {
        ...session,
        truck_number: truckInfo.truck_number,
        employee_name: `${truckInfo.first_name} ${truckInfo.last_name}`
      }
    });

  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ error: 'Failed to start truck session' });
  }
});

// End truck session (employee logout from truck)
router.put('/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { notes } = req.body;

    // Verify session belongs to user's company and is active
    const sessionResult = await pool.query(`
      SELECT ts.*, t.truck_number, e.first_name, e.last_name
      FROM truck_sessions ts
      JOIN trucks t ON ts.truck_id = t.id
      JOIN employees e ON ts.employee_id = e.id
      WHERE ts.id = $1 AND t.company_id = $2 AND ts.session_status = 'active'
    `, [sessionId, req.user.company_id]);

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Active session not found' });
    }

    // Update session
    const updateResult = await pool.query(`
      UPDATE truck_sessions 
      SET logout_time = CURRENT_TIMESTAMP, 
          session_status = 'completed',
          notes = COALESCE($2, notes)
      WHERE id = $1
      RETURNING *
    `, [sessionId, notes]);

    const session = updateResult.rows[0];
    const sessionInfo = sessionResult.rows[0];

    res.json({
      message: 'Truck session ended successfully',
      session: {
        ...session,
        truck_number: sessionInfo.truck_number,
        employee_name: `${sessionInfo.first_name} ${sessionInfo.last_name}`
      }
    });

  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ error: 'Failed to end truck session' });
  }
});

// Get active sessions for company
router.get('/active', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ts.*, t.truck_number, t.license_plate,
             e.first_name, e.last_name, e.employee_id,
             u.username as started_by,
             EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ts.login_time))/3600 as hours_active
      FROM truck_sessions ts
      JOIN trucks t ON ts.truck_id = t.id
      JOIN employees e ON ts.employee_id = e.id
      LEFT JOIN users u ON ts.user_id = u.id
      WHERE t.company_id = $1 AND ts.session_status = 'active'
      ORDER BY ts.login_time DESC
    `, [req.user.company_id]);

    res.json({
      activeSessions: result.rows.map(session => ({
        ...session,
        employee_name: `${session.first_name} ${session.last_name}`,
        hours_active: parseFloat(session.hours_active).toFixed(2)
      }))
    });

  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch active sessions' });
  }
});

// Get session history with filters
router.get('/history', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      truckId, 
      employeeId, 
      dateFrom, 
      dateTo 
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['t.company_id = $1'];
    let queryParams = [req.user.company_id];
    let paramCount = 1;

    if (truckId) {
      paramCount++;
      whereConditions.push(`t.id = $${paramCount}`);
      queryParams.push(truckId);
    }

    if (employeeId) {
      paramCount++;
      whereConditions.push(`e.id = $${paramCount}`);
      queryParams.push(employeeId);
    }

    if (dateFrom) {
      paramCount++;
      whereConditions.push(`ts.login_time >= $${paramCount}`);
      queryParams.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      whereConditions.push(`ts.login_time <= $${paramCount}`);
      queryParams.push(dateTo);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM truck_sessions ts
      JOIN trucks t ON ts.truck_id = t.id
      JOIN employees e ON ts.employee_id = e.id
      WHERE ${whereClause}
    `, queryParams);

    // Get sessions
    const sessionsResult = await pool.query(`
      SELECT ts.*, t.truck_number, t.license_plate,
             e.first_name, e.last_name, e.employee_id,
             u.username as started_by,
             CASE 
               WHEN ts.logout_time IS NOT NULL 
               THEN EXTRACT(EPOCH FROM (ts.logout_time - ts.login_time))/3600
               ELSE EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ts.login_time))/3600
             END as session_hours
      FROM truck_sessions ts
      JOIN trucks t ON ts.truck_id = t.id
      JOIN employees e ON ts.employee_id = e.id
      LEFT JOIN users u ON ts.user_id = u.id
      WHERE ${whereClause}
      ORDER BY ts.login_time DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...queryParams, limit, offset]);

    const total = parseInt(countResult.rows[0].total);

    res.json({
      sessions: sessionsResult.rows.map(session => ({
        ...session,
        employee_name: `${session.first_name} ${session.last_name}`,
        session_hours: parseFloat(session.session_hours).toFixed(2)
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalSessions: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get session history error:', error);
    res.status(500).json({ error: 'Failed to fetch session history' });
  }
});

// Get session analytics
router.get('/analytics', async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    let dateCondition = '';
    let queryParams = [req.user.company_id];
    
    if (dateFrom && dateTo) {
      dateCondition = 'AND ts.login_time BETWEEN $2 AND $3';
      queryParams.push(dateFrom, dateTo);
    }

    const analyticsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN ts.session_status = 'active' THEN 1 END) as active_sessions,
        COUNT(CASE WHEN ts.session_status = 'completed' THEN 1 END) as completed_sessions,
        AVG(CASE 
          WHEN ts.logout_time IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (ts.logout_time - ts.login_time))/3600
        END) as avg_session_hours,
        COUNT(DISTINCT ts.truck_id) as trucks_used,
        COUNT(DISTINCT ts.employee_id) as employees_active
      FROM truck_sessions ts
      JOIN trucks t ON ts.truck_id = t.id
      WHERE t.company_id = $1 ${dateCondition}
    `, queryParams);

    const truckUsageResult = await pool.query(`
      SELECT t.truck_number, t.id,
             COUNT(ts.id) as session_count,
             AVG(CASE 
               WHEN ts.logout_time IS NOT NULL 
               THEN EXTRACT(EPOCH FROM (ts.logout_time - ts.login_time))/3600
             END) as avg_hours_per_session
      FROM trucks t
      LEFT JOIN truck_sessions ts ON t.id = ts.truck_id ${dateCondition.replace('ts.login_time', 'ts.login_time')}
      WHERE t.company_id = $1
      GROUP BY t.id, t.truck_number
      ORDER BY session_count DESC
    `, queryParams);

    res.json({
      analytics: analyticsResult.rows[0],
      truckUsage: truckUsageResult.rows
    });

  } catch (error) {
    console.error('Get session analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch session analytics' });
  }
});

module.exports = router;