const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

async function testLoginAPI() {
  try {
    console.log('🔐 Testing login API logic...');
    
    const username = 'arctic_admin';
    const password = 'password123';
    
    console.log(`1. Looking for user: ${username}`);
    
    // Get user with company info (same as auth.js)
    const userResult = await pool.query(`
      SELECT u.*, c.name as company_name, c.business_type
      FROM users u 
      JOIN companies c ON u.company_id = c.id 
      WHERE (u.username = $1 OR u.email = $1) AND u.is_active = true
    `, [username]);

    if (userResult.rows.length === 0) {
      console.log('❌ User not found or inactive');
      return;
    }

    console.log('✅ User found');
    const user = userResult.rows[0];
    
    console.log(`2. Verifying password for: ${user.first_name} ${user.last_name}`);
    console.log(`   Company: ${user.company_name}`);
    
    // Verify password (same as auth.js)
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log(`   Password valid: ${isValidPassword ? '✅ YES' : '❌ NO'}`);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password - login would fail');
      return;
    }
    
    console.log('3. Generating JWT token...');
    const JWT_SECRET = process.env.JWT_SECRET || 'ra_platform_jwt_secret_key_2024';
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
    
    console.log('✅ Token generated successfully');
    console.log('Token preview:', token.substring(0, 50) + '...');
    
    console.log('\n4. Login response would be:');
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
    
    console.log(JSON.stringify(loginResponse, null, 2));
    console.log('\n✅ LOGIN API LOGIC IS WORKING CORRECTLY');
    console.log('The issue must be with the Express server or frontend connection');
    
  } catch (error) {
    console.error('❌ Login API test failed:', error);
  } finally {
    await pool.end();
  }
}

testLoginAPI();