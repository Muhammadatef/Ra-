const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function fixPassword() {
  try {
    console.log('🔧 Fixing password hashes for all users...');
    
    // Get all users
    const users = await pool.query('SELECT id, username FROM users');
    
    for (const user of users.rows) {
      const newHash = await bcrypt.hash('password123', 12);
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]);
      console.log(`✅ Updated password hash for ${user.username}`);
    }
    
    // Test the hash
    const testUser = await pool.query('SELECT username, password_hash FROM users WHERE username = $1', ['arctic_admin']);
    if (testUser.rows.length > 0) {
      const isValid = await bcrypt.compare('password123', testUser.rows[0].password_hash);
      console.log(`🔐 Password verification for arctic_admin: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }
    
    console.log('✅ All passwords fixed! Try logging in with any username and password123');
    
  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
  } finally {
    await pool.end();
  }
}

fixPassword();