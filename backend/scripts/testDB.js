const pool = require('../config/database');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected successfully');
    console.log('⏰ Current time:', result.rows[0].current_time);
    
    // Test if our tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`📋 Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`   • ${row.table_name}`);
    });
    
    // Test user count
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Total users: ${userCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('💡 Make sure PostgreSQL is running and database exists');
  } finally {
    await pool.end();
  }
}

testDatabase();