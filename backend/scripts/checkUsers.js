const pool = require('../config/database');

async function checkUsers() {
  try {
    console.log('🔍 Checking user accounts in database...');
    
    const result = await pool.query(`
      SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.role, 
             c.name as company_name, c.business_type
      FROM users u
      JOIN companies c ON u.company_id = c.id
      ORDER BY u.username
    `);

    console.log(`\n📊 Found ${result.rows.length} users:`);
    result.rows.forEach(user => {
      console.log(`   👤 ${user.username} (${user.first_name} ${user.last_name})`);
      console.log(`      📧 ${user.email}`);
      console.log(`      🏢 ${user.company_name} (${user.business_type})`);
      console.log(`      🔐 Role: ${user.role}\n`);
    });

    // Check companies
    const companiesResult = await pool.query('SELECT * FROM companies ORDER BY name');
    console.log(`🏢 Companies (${companiesResult.rows.length}):`);
    companiesResult.rows.forEach(company => {
      console.log(`   • ${company.name} (${company.business_type}) - ${company.state}`);
    });

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await pool.end();
  }
}

checkUsers();