const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const app = express();
const PORT = process.env.PORT || 3002;

// Basic middleware
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Server is running!'
  });
});

// Simple login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body);
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('❌ Missing username or password');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    console.log(`Looking for user: ${username}`);
    
    // Get user with company info
    const userResult = await pool.query(`
      SELECT u.*, c.name as company_name, c.business_type
      FROM users u 
      JOIN companies c ON u.company_id = c.id 
      WHERE (u.username = $1 OR u.email = $1) AND u.is_active = true
    `, [username]);

    if (userResult.rows.length === 0) {
      console.log('❌ User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    console.log(`✅ Found user: ${user.username} - ${user.company_name}`);

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log(`Password verification: ${isValidPassword ? '✅ VALID' : '❌ INVALID'}`);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const JWT_SECRET = 'ra_platform_jwt_secret_key_2024';
    const token = jwt.sign(
      { 
        userId: user.id, 
        companyId: user.company_id,
        role: user.role,
        username: user.username 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const loginResponse = {
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
    };

    console.log('✅ Login successful, sending response');
    res.json(loginResponse);

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed - server error' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Simple Ra Backend Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`\nTesting with: curl -X POST http://localhost:${PORT}/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin1","password":"admin123"}'`);
  console.log('\nServer ready for login attempts! 🎯');
});

// Handle shutdown
process.on('SIGTERM', () => {
  console.log('Server shutting down...');
  pool.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Server shutting down...');
  pool.end();
  process.exit(0);
});