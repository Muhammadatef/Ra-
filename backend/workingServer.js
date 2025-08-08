#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

console.log('🚀 Starting Working Ra Backend Server...');

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ra_platform',
  user: process.env.DB_USER || 'ra_user',
  password: process.env.DB_PASSWORD || 'ra_password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const app = express();
const PORT = 3001; // Backend runs on port 3001

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Database connected successfully');
  }
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Very permissive CORS for development
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
}));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('📋 Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT,
    message: 'Working Ra Backend Server is running!' 
  });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Login attempt received:', req.body);
  
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    console.log(`🔍 Looking for user: ${username}`);
    
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
    console.log(`👤 Found user: ${user.username} - ${user.company_name}`);

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log(`🔑 Password verification: ${isValidPassword ? '✅ VALID' : '❌ INVALID'}`);
    
    if (!isValidPassword) {
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

    console.log('✅ Login successful! Sending response');
    res.json(loginResponse);

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed - server error', details: error.message });
  }
});

// Get profile (for token verification)
app.get('/api/auth/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const JWT_SECRET = 'ra_platform_jwt_secret_key_2024';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const userResult = await pool.query(`
      SELECT u.*, c.name as company_name, c.business_type 
      FROM users u 
      JOIN companies c ON u.company_id = c.id 
      WHERE u.id = $1 AND u.is_active = true
    `, [decoded.userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = userResult.rows[0];
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        companyId: user.company_id,
        companyName: user.company_name,
        businessType: user.business_type,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❓ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🎉 ===== WORKING RA BACKEND SERVER =====');
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log('\n📝 Test with:');
  console.log(`curl -X POST http://localhost:${PORT}/api/auth/login \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"username":"admin1","password":"admin123"}'`);
  console.log('\n✅ Server ready for login attempts!');
  console.log('==========================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Server shutting down...');
  server.close(() => {
    pool.end(() => {
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down...');
  server.close(() => {
    pool.end(() => {
      process.exit(0);
    });
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});