const mysql = require('mysql2/promise');

async function checkSeedData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'technical_assignment_pos_system',
  });

  try {
    const [products] = await connection.query('SELECT id, name, categoryId, price, active, image FROM product ORDER BY id');
    const [users] = await connection.query('SELECT id, email, name, role FROM user');
    const [categories] = await connection.query('SELECT id, name, image, active FROM category ORDER BY id');
    
    console.log('\n📊 DATABASE SEED STATUS\n');
    console.log(`✓ Users count: ${users.length}`);
    console.log(`✓ Products count: ${products.length}`);
    console.log(`✓ Categories count: ${categories.length}\n`);
    
    if (products.length > 0) {
      console.log('🍽️  SEEDED PRODUCTS:\n');
      products.forEach((p, i) => {
        console.log(`${i+1}. ${p.name}`);
        console.log(`   Category ID: ${p.categoryId || 'None'}`);
        console.log(`   Price: $${p.price}`);
        console.log(`   Active: ${p.active ? 'Yes' : 'No'}`);
        console.log(`   Image: ${p.image || 'No image'}`);
        console.log('');
      });
    }
    
    if (users.length > 0) {
      console.log('👤 SEEDED USERS:\n');
      users.forEach((u, i) => {
        console.log(`${i+1}. ${u.email} - ${u.name} (${u.role})`);
      });
      console.log('');
    }
    
    if (categories.length > 0) {
      console.log('📁 SEEDED CATEGORIES:\n');
      categories.forEach((c, i) => {
        console.log(`${i+1}. ${c.name}`);
        console.log(`   Active: ${c.active ? 'Yes' : 'No'}`);
        console.log(`   Image: ${c.image || 'No image'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

checkSeedData();
