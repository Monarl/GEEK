const mysql = require('mysql2/promise');
const util = require('util');
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

// Get information about all tables in the database
async function getTablesInfo(connection) {
  const [tables] = await connection.query('SHOW TABLES');
  const tablesInfo = {};
  
  for (const tableObj of tables) {
    const tableName = Object.values(tableObj)[0];
    const [columns] = await connection.query(`DESCRIBE ${tableName}`);
    tablesInfo[tableName] = columns;
  }
  
  return tablesInfo;
}

// Get foreign key relationships
async function getForeignKeys(connection) {
  const [foreignKeys] = await connection.query(`
    SELECT 
      TABLE_NAME, 
      COLUMN_NAME, 
      REFERENCED_TABLE_NAME, 
      REFERENCED_COLUMN_NAME
    FROM
      INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE
      REFERENCED_TABLE_SCHEMA = DATABASE()
      AND REFERENCED_TABLE_NAME IS NOT NULL
    ORDER BY
      TABLE_NAME, COLUMN_NAME
  `);
  
  return foreignKeys;
}

// Print the database schema in a readable format
function printDatabaseSchema(tablesInfo, foreignKeys) {
  console.log('\n===== DATABASE SCHEMA =====\n');
  
  for (const [table, columns] of Object.entries(tablesInfo)) {
    console.log(`Table: ${table}`);
    console.log('-'.repeat(80));
    console.log(`${'Column'.padEnd(20)} ${'Type'.padEnd(25)} ${'Nullable'.padEnd(10)} ${'Key'.padEnd(10)} ${'Default'.padEnd(15)}`);
    console.log('-'.repeat(80));
    
    for (const col of columns) {
      const field = col.Field;
      const typeInfo = col.Type;
      const nullable = col.Null === 'YES' ? 'NULL' : 'NOT NULL';
      const key = col.Key || '';
      const defaultValue = col.Default !== null ? String(col.Default) : 'NULL';
      
      console.log(`${field.padEnd(20)} ${typeInfo.padEnd(25)} ${nullable.padEnd(10)} ${key.padEnd(10)} ${defaultValue.padEnd(15)}`);
    }
    console.log('\n');
  }
  
  console.log('\n===== FOREIGN KEY RELATIONSHIPS =====\n');
  console.log(`${'Table'.padEnd(20)} ${'Column'.padEnd(20)} ${'Referenced Table'.padEnd(20)} ${'Referenced Column'.padEnd(20)}`);
  console.log('-'.repeat(80));
  
  for (const fk of foreignKeys) {
    console.log(`${fk.TABLE_NAME.padEnd(20)} ${fk.COLUMN_NAME.padEnd(20)} ${fk.REFERENCED_TABLE_NAME.padEnd(20)} ${fk.REFERENCED_COLUMN_NAME.padEnd(20)}`);
  }
}

// Main function
async function main() {
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
      database: dbConfig.database
    });
    
    // Get tables and relationships
    const tablesInfo = await getTablesInfo(connection);
    const foreignKeys = await getForeignKeys(connection);
    
    // Print schema
    printDatabaseSchema(tablesInfo, foreignKeys);
    
        // No sample data display here - moved to questionB.js
    
    await connection.end();
    
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// Run the main function
main();
