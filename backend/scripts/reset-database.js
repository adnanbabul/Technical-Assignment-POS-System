const mysql = require('mysql2/promise');

async function resetDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'technical_assignment_pos_system',
  });

  try {
    console.log('🔄 Resetting database...');
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const tables = ['sale_item', 'sale', 'product', 'customer', 'user', 'category'];
    
    for (const table of tables) {
      try {
        await connection.query(`TRUNCATE TABLE ${table}`);
        console.log(`✓ Cleared ${table} table`);
      } catch (err) {
        console.log(`⚠ Skipped ${table} table (doesn't exist)`);
      }
    }
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('\n✅ Database reset successfully! All existing tables are now empty.');
    console.log('📝 Restart the backend server to auto-seed the data.');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

resetDatabase();
