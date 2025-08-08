const axios = require('axios');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function testLogin() {
  try {
    console.log('🔍 Testing login functionality...');
    
    // First, let's check if the password hash is correct
    const userResult = await pool.query(`
      SELECT username, password_hash, first_name, last_name, email 
      FROM users 
      WHERE username = 'arctic_admin'
    `);
    
    if (userResult.rows.length === 0) {
      console.log('❌ User arctic_admin not found');
      return;
    }
    
    const user = userResult.rows[0];
    console.log(`✅ Found user: ${user.username} (${user.first_name} ${user.last_name})`);
    console.log(`📧 Email: ${user.email}`);
    
    // Test password hash
    const testPassword = 'password123';
    const isValidPassword = await bcrypt.compare(testPassword, user.password_hash);
    console.log(`🔐 Password test: ${isValidPassword ? '✅ VALID' : '❌ INVALID'}`);
    
    if (!isValidPassword) {
      console.log('❌ Password hash mismatch - this is the issue!');
      
      // Let's create a new hash and update it
      const newHash = await bcrypt.hash(testPassword, 12);
      await pool.query('UPDATE users SET password_hash = $1 WHERE username = $2', [newHash, 'arctic_admin']);
      console.log('✅ Updated password hash for arctic_admin');
    }
    
    // Test API login
    console.log('\n🌐 Testing API login endpoint...');
    try {
      const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
        username: 'arctic_admin',
        password: 'password123'
      });
      
      console.log('✅ Login API successful!');
      console.log('Token:', loginResponse.data.token.substring(0, 20) + '...');
      console.log('User:', loginResponse.data.user.username, '-', loginResponse.data.user.companyName);
      
    } catch (apiError) {
      console.log('❌ API Login failed:');
      console.log('Status:', apiError.response?.status);
      console.log('Error:', apiError.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testLogin();