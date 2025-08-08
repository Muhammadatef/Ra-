const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function recreateUsers() {
  try {
    console.log('🧹 Deleting all existing users...');
    
    // Delete all users
    await pool.query('DELETE FROM users');
    console.log('✅ All users deleted');
    
    // Get existing companies
    const companiesResult = await pool.query('SELECT id, name, business_type FROM companies ORDER BY name');
    const companies = companiesResult.rows;
    
    if (companies.length === 0) {
      console.log('❌ No companies found. Need to create companies first.');
      return;
    }
    
    console.log(`\n🏢 Found ${companies.length} companies:`);
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name} (${company.business_type})`);
    });
    
    console.log('\n👤 Creating new admin users...');
    
    // Define new user credentials - simple and clean
    const newUsers = [
      {
        company: companies.find(c => c.business_type === 'ice_cream' && c.name.includes('Arctic')),
        username: 'admin1',
        email: 'admin1@company.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'One'
      },
      {
        company: companies.find(c => c.business_type === 'ice_cream' && c.name.includes('Frozen')),
        username: 'admin2',
        email: 'admin2@company.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'Two'
      },
      {
        company: companies.find(c => c.business_type === 'burger' && c.name.includes('Golden')),
        username: 'admin3',
        email: 'admin3@company.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'Three'
      },
      {
        company: companies.find(c => c.business_type === 'burger' && c.name.includes('Pacific')),
        username: 'admin4',
        email: 'admin4@company.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'Four'
      }
    ];
    
    // Create users
    for (const userData of newUsers) {
      if (!userData.company) {
        console.log(`⚠️ Skipping user - company not found`);
        continue;
      }
      
      console.log(`\n📝 Creating user: ${userData.username}`);
      console.log(`   Company: ${userData.company.name}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      
      // Hash password with bcrypt
      const passwordHash = await bcrypt.hash(userData.password, 12);
      
      // Insert user
      const result = await pool.query(`
        INSERT INTO users (
          company_id, username, email, password_hash, 
          first_name, last_name, role, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, username, email
      `, [
        userData.company.id,
        userData.username,
        userData.email,
        passwordHash,
        userData.firstName,
        userData.lastName,
        'admin',
        true
      ]);
      
      console.log(`✅ Created user: ${result.rows[0].username} (ID: ${result.rows[0].id})`);
      
      // Verify password immediately
      const isValid = await bcrypt.compare(userData.password, passwordHash);
      console.log(`   Password verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }
    
    console.log('\n🎉 All users recreated successfully!');
    console.log('\n🔐 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    newUsers.forEach((userData, index) => {
      if (userData.company) {
        console.log(`${index + 1}. Username: ${userData.username}`);
        console.log(`   Password: ${userData.password}`);
        console.log(`   Company: ${userData.company.name}`);
        console.log('');
      }
    });
    
    // Final verification - check all users can be found
    console.log('🔍 Final verification...');
    const verifyResult = await pool.query(`
      SELECT u.username, u.email, c.name as company_name, c.business_type
      FROM users u
      JOIN companies c ON u.company_id = c.id
      WHERE u.is_active = true
      ORDER BY u.username
    `);
    
    console.log(`\n✅ Verified ${verifyResult.rows.length} active users in database:`);
    verifyResult.rows.forEach(user => {
      console.log(`   • ${user.username} → ${user.company_name} (${user.business_type})`);
    });
    
  } catch (error) {
    console.error('❌ Error recreating users:', error);
  } finally {
    await pool.end();
  }
}

recreateUsers();