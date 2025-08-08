const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'ra_platform_jwt_secret_key_2024';

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify user still exists and is active
    const userResult = await pool.query(`
      SELECT u.*, c.name as company_name, c.business_type 
      FROM users u 
      JOIN companies c ON u.company_id = c.id 
      WHERE u.id = $1 AND u.is_active = true
    `, [decoded.userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication service error' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      companyId: user.company_id,
      role: user.role,
      username: user.username 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = {
  authenticateToken,
  requireRole,
  generateToken,
  JWT_SECRET
};