const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user (company admin signup)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, companyName, businessType, state } = req.body;

    // Validation
    if (!username || !email || !password || !firstName || !lastName || !companyName || !businessType || !state) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Create company first
      const companyResult = await pool.query(`
        INSERT INTO companies (name, business_type, state, contact_email)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [companyName, businessType, state, email]);

      const companyId = companyResult.rows[0].id;

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const userResult = await pool.query(`
        INSERT INTO users (company_id, username, email, password_hash, first_name, last_name, role)
        VALUES ($1, $2, $3, $4, $5, $6, 'admin')
        RETURNING id, username, email, first_name, last_name, role, company_id
      `, [companyId, username, email, passwordHash, firstName, lastName]);

      await pool.query('COMMIT');

      const user = userResult.rows[0];
      const token = generateToken(user);

      res.status(201).json({
        message: 'User and company created successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          companyId: user.company_id
        },
        token
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Get user with company info
    const userResult = await pool.query(`
      SELECT u.*, c.name as company_name, c.business_type
      FROM users u 
      JOIN companies c ON u.company_id = c.id 
      WHERE (u.username = $1 OR u.email = $1) AND u.is_active = true
    `, [username]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        companyId: user.company_id,
        companyName: user.company_name,
        businessType: user.business_type
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        role: req.user.role,
        companyId: req.user.company_id,
        companyName: req.user.company_name,
        businessType: req.user.business_type,
        lastLogin: req.user.last_login
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Verify current password
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ error: 'Password update failed' });
  }
});

// Logout (mainly for frontend to clear token)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;