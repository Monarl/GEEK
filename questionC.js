// Question C - Average Order Value by Month
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

async function executeQuestionC() {
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
    
    console.log('\n===== EXECUTING QUESTION C SQL QUERY =====\n');
    
    // Read the SQL file content
    const sqlScript = await readFile('./sql/questionC_query.sql', 'utf8');
    
    // Execute the SQL script
    const [results] = await connection.query(sqlScript);
    
    console.log('SQL query executed successfully');
    
    // Display the results
    console.log('\n===== AVERAGE ORDER VALUE BY MONTH =====\n');
    
    if (results.length === 0) {
      console.log('No orders found for the current year.');
    } else {
      console.table(results);
      
      // Display a more readable summary
      console.log('\nSummary:');
      results.forEach(row => {
        console.log(`${row.month_name}: $${row.average_order_value}`);
      });
    }
    
    await connection.end();
    
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// Run the main function
executeQuestionC();
