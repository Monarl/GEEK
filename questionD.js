// Question D - Customer Churn Rate
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

async function executeQuestionD() {
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
    
    console.log('\n===== EXECUTING QUESTION D SQL QUERY =====\n');
    
    // Read the SQL file content
    const sqlScript = await readFile('./sql/questionD_query.sql', 'utf8');
    
    // Execute the SQL script
    const [resultSets] = await connection.query(sqlScript);
    
    console.log('SQL query executed successfully');
    
    // When using multipleStatements, the results come as an array of result sets
    // The last result set contains the actual data we want
    const results = Array.isArray(resultSets) && resultSets.length > 0 ? resultSets : [resultSets];
    const churnData = results[results.length - 1];
    
    console.log('\n===== CUSTOMER CHURN RATE ANALYSIS =====\n');
    
    if (!churnData || Object.keys(churnData).length === 0) {
      console.log('No data available for churn rate calculation.');
    } else {
      console.log(`Analysis Period Information:`);
      if (churnData.previous_period_start && churnData.previous_period_end) {
        console.log(`- Previous Period: ${formatDate(churnData.previous_period_start)} to ${formatDate(churnData.previous_period_end)}`);
      } else {
        console.log(`- Previous Period: Not enough data to determine`);
      }
      
      if (churnData.recent_period_start && churnData.recent_period_end) {
        console.log(`- Recent Period: ${formatDate(churnData.recent_period_start)} to ${formatDate(churnData.recent_period_end)}`);
      } else {
        console.log(`- Recent Period: Not enough data to determine`);
      }
      
      console.log(`\nChurn Rate Analysis:`);
      console.log(`- Total Customers (Previous Period): ${churnData.total_previous_customers || 0}`);
      console.log(`- Churned Customers: ${churnData.churned_customers || 0}`);
      console.log(`- Churn Rate: ${churnData.churn_rate_percentage || 0}%`);
      
      if (churnData.churn_rate_percentage > 0) {
        console.log(`\nInterpretation: ${churnData.churn_rate_percentage}% of customers who made purchases 6-12 months ago did not return in the last 6 months.`);
      } else {
        console.log(`\nInterpretation: All previous customers have made at least one purchase in the last 6 months.`);
      }
    }
    
    await connection.end();
    
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// Helper function to format dates nicely
function formatDate(dateString) {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleDateString();
}

// Run the main function
executeQuestionD();