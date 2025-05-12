const mysql = require('mysql2/promise');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const sleep = util.promisify(setTimeout);

// MySQL connection parameters (matching docker-compose.yml)
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'user',
  password: 'password',
  database: 'ecommerce_db'
};

// Wait for MySQL to be ready to accept connections
async function waitForMySQL(config, maxAttempts = 30, delay = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const connection = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password
      });
      
      await connection.end();
      console.log(`Successfully connected to MySQL on attempt ${attempt}`);
      return true;
    } catch (err) {
      console.log(`Attempt ${attempt}/${maxAttempts}: MySQL not ready yet: ${err.message}`);
      await sleep(delay);
    }
  }
  
  console.log(`Could not connect to MySQL after ${maxAttempts} attempts`);
  return false;
}

async function executeQuestionB() {
  console.log('Connecting to MySQL database...');
  
  // Wait for MySQL to be ready
  const mysqlReady = await waitForMySQL(dbConfig);
  if (!mysqlReady) {
    process.exit(1);
  }
  
  try {
    // Connect to the database
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      multipleStatements: true // Enable multiple statements for SQL script execution
    });
    
    console.log('\n===== EXECUTING QUESTION B SQL QUERY =====\n');
    
    // Read the SQL file content
    const sqlScript = await readFile('./sql/questionB_query.sql', 'utf8');
    
    // Execute the SQL script
    await connection.query(sqlScript);
    
    console.log('SQL query executed successfully');
    
    // Display the inserted data
    console.log('\n===== INSERTED DATA FOR QUESTION B =====\n');
    
    // Show the user data
    const [users] = await connection.query('SELECT * FROM users WHERE email = ?', ['gu@gmail.com']);
    console.log('User:');
    console.table(users);
    
    // Show the address data
    const [addresses] = await connection.query('SELECT * FROM addresses WHERE user_id = ?', [users[0].user_id]);
    console.log('\nAddress:');
    console.table(addresses);
    
    // Show the product data
    const [products] = await connection.query(`SELECT * FROM products WHERE name = 'KAPPA Women''s Sneakers'`);
    console.log('\nProduct:');
    console.table(products);
    
    // Show the order data
    const [orders] = await connection.query('SELECT * FROM orders WHERE user_id = ?', [users[0].user_id]);
    console.log('\nOrder:');
    console.table(orders);
    
    // Show the order items data
    const [orderItems] = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [orders[0].order_id]);
    console.log('\nOrder Item:');
    console.table(orderItems);
    
    // Show updated inventory
    const [inventory] = await connection.query(`
      SELECT pi.*, p.name as product_name 
      FROM product_inventory pi 
      JOIN products p ON pi.product_id = p.product_id 
      WHERE p.name = 'KAPPA Women''s Sneakers' AND pi.color = 'yellow' AND pi.size = '36'
    `);
    console.log('\nUpdated Inventory:');
    console.table(inventory);
    
    await connection.end();
    
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// Run the main function
executeQuestionB();
