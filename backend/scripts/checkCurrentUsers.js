const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function checkCurrentUsers() {
  try {
    console.log('🔍 Checking current users in database...');
    
    // Get all users
    const result = await pool.query(`
      SELECT u.id, u.username, u.email, u.password_hash, u.is_active, 
             u.first_name, u.last_name, u.role,
             c.name as company_name, c.business_type
      FROM users u
      JOIN companies c ON u.company_id = c.id
      ORDER BY u.username
    `);

    if (result.rows.length === 0) {
      console.log('❌ No users found in database!');
      return;
    }

    console.log(`\n📊 Found ${result.rows.length} users:`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const user of result.rows) {
      console.log(`👤 Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Company: ${user.company_name} (${user.business_type})`);
      console.log(`   Active: ${user.is_active ? '✅ Yes' : '❌ No'}`);
      console.log(`   Role: ${user.role}`);
      
      // Test password
      const testPasswords = ['admin123', 'password123', 'admin', '123456'];
      let workingPassword = null;
      
      for (const testPass of testPasswords) {
        const isValid = await bcrypt.compare(testPass, user.password_hash);
        if (isValid) {
          workingPassword = testPass;
          break;
        }
      }
      
      if (workingPassword) {
        console.log(`   Password: ✅ ${workingPassword} WORKS`);
      } else {
        console.log(`   Password: ❌ None of the test passwords work`);
        console.log(`   Hash: ${user.password_hash.substring(0, 20)}...`);
      }
      console.log('');
    }
    
    // Check companies
    const companiesResult = await pool.query('SELECT * FROM companies ORDER BY name');
    console.log(`\n🏢 Companies (${companiesResult.rows.length}):`);
    companiesResult.rows.forEach(company => {
      console.log(`   • ${company.name} (${company.business_type}) - ${company.state}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await pool.end();
  }
}

checkCurrentUsers();