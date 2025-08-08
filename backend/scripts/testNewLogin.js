const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

async function testNewLogin() {
  try {
    console.log('🔐 Testing new login credentials...\n');
    
    const testCredentials = [
      { username: 'admin1', password: 'admin123' },
      { username: 'admin2', password: 'admin123' },
      { username: 'admin3', password: 'admin123' },
      { username: 'admin4', password: 'admin123' }
    ];
    
    for (const creds of testCredentials) {
      console.log(`Testing: ${creds.username} / ${creds.password}`);
      
      // Simulate the exact login API logic
      const userResult = await pool.query(`
        SELECT u.*, c.name as company_name, c.business_type
        FROM users u 
        JOIN companies c ON u.company_id = c.id 
        WHERE (u.username = $1 OR u.email = $1) AND u.is_active = true
      `, [creds.username]);

      if (userResult.rows.length === 0) {
        console.log('❌ User not found');
        continue;
      }

      const user = userResult.rows[0];
      
      // Verify password
      const isValidPassword = await bcrypt.compare(creds.password, user.password_hash);
      
      if (isValidPassword) {
        console.log(`✅ ${creds.username} → ${user.company_name} (${user.business_type})`);
      } else {
        console.log(`❌ ${creds.username} → Invalid password`);
      }
    }
    
    console.log('\n🎯 Ready to test! Try logging in with:');
    console.log('   Username: admin1');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Login test failed:', error);
  } finally {
    await pool.end();
  }
}

testNewLogin();