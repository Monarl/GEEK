// Question E - RESTful API for E-commerce Platform
const express = require('express');
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

// Simple email queue simulation
class EmailQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }
  
  addToQueue(email) {
    this.queue.push(email);
    console.log(`[EMAIL QUEUE] Added to queue: Order confirmation for ${email.to}`);
    
    if (!this.processing) {
      this.processQueue();
    }
  }
  
  async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }
    
    this.processing = true;
    const email = this.queue.shift();
    
    // Simulate sending email
    console.log(`[EMAIL QUEUE] Processing: Sending order confirmation to ${email.to}`);
    await sleep(2000); // Simulate network delay
    console.log(`[EMAIL QUEUE] Success: Order #${email.orderId} confirmation sent to ${email.to}`);
    
    // Process next email in queue
    setTimeout(() => this.processQueue(), 1000);
  }
}

// Create email queue instance
const emailQueue = new EmailQueue();

async function startServer() {
  console.log('Connecting to MySQL database...');
  
  // Wait for MySQL to be ready
  const mysqlReady = await waitForMySQL(dbConfig);
  if (!mysqlReady) {
    process.exit(1);
  }
  
  try {
    // Connect to the database
    const pool = mysql.createPool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Create Express application
    const app = express();
    app.use(express.json());
    
    // 1. GET /api/categories - Get all categories
    app.get('/api/categories', async (req, res) => {
      try {
        const [categories] = await pool.query('SELECT category_id, name, parent_category_id FROM categories ORDER BY name');
        
        res.json({
          success: true,
          data: categories
        });
      } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch categories'
        });
      }
    });
    
    // 2. GET /api/categories/:categoryId/products - Get products by category
    app.get('/api/categories/:categoryId/products', async (req, res) => {
      try {
        const categoryId = parseInt(req.params.categoryId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        // Fetch products
        const [products] = await pool.query(
          'SELECT product_id, name, description, base_price, discount_percent, brand, model, category_id ' +
          'FROM products WHERE category_id = ? LIMIT ? OFFSET ?',
          [categoryId, limit, offset]
        );
        
        // Get total count for pagination
        const [countResult] = await pool.query(
          'SELECT COUNT(*) as total FROM products WHERE category_id = ?',
          [categoryId]
        );
        
        const total = countResult[0].total;
        const pages = Math.ceil(total / limit);
        
        res.json({
          success: true,
          data: {
            products,
            pagination: {
              total,
              page,
              limit,
              pages
            }
          }
        });
      } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch products'
        });
      }
    });
    
    // 3. GET /api/products/search - Search products
    app.get('/api/products/search', async (req, res) => {
      try {
        const { 
          query, 
          category,
          minPrice, 
          maxPrice, 
          brand,
          page = 1,
          limit = 10
        } = req.query;
        
        if (!query) {
          return res.status(400).json({
            success: false,
            error: 'Search query is required'
          });
        }
        
        const offset = (page - 1) * limit;
        
        // Build the query dynamically with optional filters
        const searchQuery = `
          SELECT 
            p.product_id, p.name, p.description, p.base_price, 
            p.discount_percent, p.brand, p.model, p.category_id
          FROM 
            products p
          WHERE 
            (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ? OR p.model LIKE ?)
            ${category ? 'AND p.category_id = ?' : ''}
            ${minPrice ? 'AND p.base_price >= ?' : ''}
            ${maxPrice ? 'AND p.base_price <= ?' : ''}
            ${brand ? 'AND p.brand = ?' : ''}
          LIMIT ? OFFSET ?
        `;
        
        // Build the count query with the same filters
        const countQuery = `
          SELECT 
            COUNT(*) as total
          FROM 
            products p
          WHERE 
            (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ? OR p.model LIKE ?)
            ${category ? 'AND p.category_id = ?' : ''}
            ${minPrice ? 'AND p.base_price >= ?' : ''}
            ${maxPrice ? 'AND p.base_price <= ?' : ''}
            ${brand ? 'AND p.brand = ?' : ''}
        `;
        
        // Build the parameters array
        const searchPattern = `%${query}%`;
        let params = [searchPattern, searchPattern, searchPattern, searchPattern];
        let countParams = [searchPattern, searchPattern, searchPattern, searchPattern];
        
        if (category) {
          params.push(parseInt(category));
          countParams.push(parseInt(category));
        }
        
        if (minPrice) {
          params.push(parseFloat(minPrice));
          countParams.push(parseFloat(minPrice));
        }
        
        if (maxPrice) {
          params.push(parseFloat(maxPrice));
          countParams.push(parseFloat(maxPrice));
        }
        
        if (brand) {
          params.push(brand);
          countParams.push(brand);
        }
        
        // Add pagination parameters
        params.push(parseInt(limit), offset);
        
        // Execute search query
        const [products] = await pool.query(searchQuery, params);
        
        // Execute count query
        const [countResult] = await pool.query(countQuery, countParams);
        
        const total = countResult[0].total;
        const pages = Math.ceil(total / limit);
        
        res.json({
          success: true,
          data: {
            products,
            pagination: {
              total,
              page: parseInt(page),
              limit: parseInt(limit),
              pages
            }
          }
        });
      } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to search products'
        });
      }
    });
    
    // 4. POST /api/orders - Create order and process payment
    app.post('/api/orders', async (req, res) => {
      const connection = await pool.getConnection();
      
      try {
        await connection.beginTransaction();
        
        const { user_id, address_id, payment_method_id, items } = req.body;
        
        if (!user_id || !address_id || !payment_method_id || !items || !items.length) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields'
          });
        }
        
        // Calculate order totals
        let subtotal = 0;
        const shippingFee = 30000; // Fixed shipping fee
        let discountAmount = 0;
        
        // Process each item
        for (const item of items) {
          // Get product price
          const [productResult] = await connection.query(
            'SELECT base_price, discount_percent FROM products WHERE product_id = ?',
            [item.product_id]
          );
          
          if (!productResult.length) {
            throw new Error(`Product with ID ${item.product_id} not found`);
          }
          
          const product = productResult[0];
          const itemPrice = product.base_price * (1 - (product.discount_percent / 100));
          subtotal += itemPrice * item.quantity;
          
          // Check inventory
          const [inventoryResult] = await connection.query(
            'SELECT inventory_id, quantity FROM product_inventory ' +
            'WHERE product_id = ? AND size = ? AND color = ?',
            [item.product_id, item.size, item.color]
          );
          
          if (!inventoryResult.length || inventoryResult[0].quantity < item.quantity) {
            throw new Error(`Insufficient inventory for product ${item.product_id}`);
          }
        }
        
        // Calculate total amount
        const totalAmount = subtotal + shippingFee - discountAmount;
        
        // Create the order
        const [orderResult] = await connection.query(
          'INSERT INTO orders (user_id, address_id, order_date, status, ' +
          'subtotal, shipping_fee, discount_amount, total_amount, payment_method_id) ' +
          'VALUES (?, ?, NOW(), "confirmed", ?, ?, ?, ?, ?)',
          [user_id, address_id, subtotal, shippingFee, discountAmount, totalAmount, payment_method_id]
        );
        
        const orderId = orderResult.insertId;
        
        // Add order items and update inventory
        for (const item of items) {
          // Get product price for this item
          const [productResult] = await connection.query(
            'SELECT base_price, discount_percent FROM products WHERE product_id = ?',
            [item.product_id]
          );
          
          const product = productResult[0];
          const itemPrice = product.base_price * (1 - (product.discount_percent / 100));
          
          // Add order item
          await connection.query(
            'INSERT INTO order_items (order_id, product_id, size, color, quantity, price_at_time) ' +
            'VALUES (?, ?, ?, ?, ?, ?)',
            [orderId, item.product_id, item.size, item.color, item.quantity, itemPrice]
          );
          
          // Update inventory
          await connection.query(
            'UPDATE product_inventory SET quantity = quantity - ? ' +
            'WHERE product_id = ? AND size = ? AND color = ?',
            [item.quantity, item.product_id, item.size, item.color]
          );
        }
        
        await connection.commit();
        
        // Get user email for confirmation
        const [userResult] = await pool.query(
          'SELECT email FROM users WHERE user_id = ?',
          [user_id]
        );
        
        if (userResult.length) {
          // Add email to async queue
          emailQueue.addToQueue({
            to: userResult[0].email,
            subject: `Order Confirmation #${orderId}`,
            body: `Thank you for your order #${orderId}. Total: ${totalAmount}`,
            orderId
          });
        }
        
        res.status(201).json({
          success: true,
          data: {
            order_id: orderId,
            status: "confirmed",
            total_amount: totalAmount,
            payment_status: "completed"
          },
          message: "Order created successfully and confirmation email queued"
        });
        
      } catch (error) {
        await connection.rollback();
        
        console.error('Error creating order:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to create order'
        });
      } finally {
        connection.release();
      }
    });
    
    // Start the server
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(`\n===== QUESTION E API SERVER =====`);
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log('\n===== API ENDPOINTS =====');
      console.log('GET  /api/categories                    - Get all categories');
      console.log('GET  /api/categories/:categoryId/products - Get products by category');
      console.log('GET  /api/products/search?query=...     - Search products');
      console.log('POST /api/orders                        - Create new order');
      
      console.log('\n===== TESTING EXAMPLES =====');
      console.log('1. Fetch all categories:');
      console.log('   curl http://localhost:3000/api/categories');
      
      console.log('\n2. Get products in category 1:');
      console.log('   curl http://localhost:3000/api/categories/5/products');
      
      console.log('\n3. Search for "sneakers":');
      console.log('   curl "http://localhost:3000/api/products/search?query=sneakers"');
      
      console.log('\n4. Create a new order:');
      console.log('   curl -X POST http://localhost:3000/api/orders \\');
      console.log('     -H "Content-Type: application/json" \\');
      console.log('     -d \'{"user_id":1,"address_id":1,"payment_method_id":1,"items":[{"product_id":1,"size":"39","color":"red","quantity":1}]}\'');
      console.log('   # For PowerShell:');
      console.log('   curl -Uri "http://localhost:3000/api/orders" `');
      console.log('        -Method POST `');
      console.log('        -ContentType "application/json" `');
      console.log('        -Body \'{"user_id":1,"address_id":1,"payment_method_id":1,"items":[{"product_id":1,"size":"39","color":"red","quantity":1}]}\'');

      console.log('\nPress Ctrl+C to stop the server');
    });
    
    // Capture exit signals
    process.on('SIGINT', () => {
      console.log('\nShutting down server...');
      server.close(() => {
        console.log('Server stopped');
        pool.end();
        process.exit(0);
      });
    });
    
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// Start the server
startServer();
