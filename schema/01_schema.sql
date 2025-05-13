-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product_inventory;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS payment_methods;

-- Create tables with minimal structure
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_category_id INT NULL,
    FOREIGN KEY (parent_category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    discount_percent INT DEFAULT 0,
    brand VARCHAR(100),
    model VARCHAR(100),
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE product_inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    size VARCHAR(20),
    color VARCHAR(50),
    quantity INT NOT NULL DEFAULT 0,
    store_id INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20)
);

CREATE TABLE addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    commune VARCHAR(100) NOT NULL,
    detail VARCHAR(255) NOT NULL,
    housing_type VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE payment_methods (
    payment_method_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address_id INT NOT NULL,
    order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (address_id) REFERENCES addresses(address_id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(payment_method_id)
);

CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    size VARCHAR(20),
    color VARCHAR(50),
    quantity INT NOT NULL,
    price_at_time DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Insert some example data
-- Categories
INSERT INTO categories (name) VALUES 
('Shoes'), 
('Clothing'), 
('Accessories');

INSERT INTO categories (name, parent_category_id) VALUES 
('Fashion Shoes', 1), 
('Sneakers', 1),
('T-Shirts', 2),
('Watches', 3);

-- Products
INSERT INTO products (name, description, base_price, discount_percent, brand, model, category_id) VALUES
('Puma Running Shoes', 'Lightweight performance running shoes with cushioned sole', 1250000, 10, 'Puma', 'Velocity Nitro', 5),
('Nike Air Max', 'Classic Nike Air cushioning', 2200000, 15, 'Nike', 'Air Max 90', 5),
('Adidas T-Shirt', 'Cotton t-shirt with Adidas logo', 450000, 0, 'Adidas', 'Original Tee', 6),
('Casio Wristwatch', 'Water resistant stainless steel watch', 1500000, 10, 'Casio', 'MQ-24-7B2', 7);

-- Inventory
INSERT INTO product_inventory (product_id, size, color, quantity, store_id) VALUES
(1, '39', 'red', 5, 1),
(1, '40', 'red', 8, 1),
(1, '41', 'black', 3, 1),
(2, '40', 'white', 10, 1),
(2, '41', 'white', 7, 1),
(3, 'M', 'blue', 15, 1),
(3, 'L', 'blue', 12, 1),
(4, 'ONE', 'silver', 6, 1);

-- Payment Methods
INSERT INTO payment_methods (name) VALUES
('Cash on Delivery'),
('Online Payment'),
('Bank Transfer');

-- Users
INSERT INTO users (name, email, phone) VALUES
('John Doe', 'john@example.com', '0901234567'),
('Jane Smith', 'jane@example.com', '0909876543'),
('Robert Brown', 'robert@example.com', '0912345678');

-- Addresses
INSERT INTO addresses (user_id, province, district, commune, detail, housing_type, is_default) VALUES
(1, 'Ho Chi Minh City', 'District 1', 'Ben Nghe', '123 Le Loi Street', 'Apartment', TRUE),
(1, 'Ho Chi Minh City', 'District 7', 'Tan Phong', '456 Nguyen Huu Tho Street', 'House', FALSE),
(2, 'Ha Noi', 'Cau Giay', 'Dich Vong', '789 Xuan Thuy Street', 'Apartment', TRUE),
(3, 'Da Nang', 'Hai Chau', 'Hai Chau 1', '101 Bach Dang Street', 'House', TRUE);

-- Orders (for Questions C and D - some with past dates)
INSERT INTO orders (user_id, address_id, order_date, status, subtotal, shipping_fee, discount_amount, total_amount, payment_method_id) VALUES
-- Recent orders (last 6 months)
(1, 1, DATE_SUB(CURRENT_DATE(), INTERVAL 2 MONTH), 'completed', 1250000, 30000, 125000, 1155000, 1),
(2, 3, DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), 'completed', 1870000, 30000, 187000, 1713000, 2),
(1, 1, DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH), 'completed', 450000, 30000, 0, 480000, 1),

-- Older orders (6-12 months ago)
(1, 1, DATE_SUB(CURRENT_DATE(), INTERVAL 8 MONTH), 'completed', 2200000, 30000, 330000, 1900000, 1),
(2, 3, DATE_SUB(CURRENT_DATE(), INTERVAL 9 MONTH), 'completed', 450000, 30000, 0, 480000, 2),
(3, 4, DATE_SUB(CURRENT_DATE(), INTERVAL 7 MONTH), 'completed', 1500000, 30000, 150000, 1380000, 1),

-- Orders from last year (for year-over-year comparison)
(1, 1, DATE_SUB(CURRENT_DATE(), INTERVAL 14 MONTH), 'completed', 980000, 30000, 0, 1010000, 1),
(2, 3, DATE_SUB(CURRENT_DATE(), INTERVAL 15 MONTH), 'completed', 450000, 30000, 0, 480000, 2);

-- Order Items
INSERT INTO order_items (order_id, product_id, size, color, quantity, price_at_time) VALUES
(1, 1, '39', 'red', 1, 1250000),
(2, 2, '40', 'white', 1, 1870000),
(3, 3, 'M', 'blue', 1, 450000),
(4, 2, '41', 'white', 1, 2200000),
(5, 3, 'L', 'blue', 1, 450000),
(6, 4, 'ONE', 'silver', 1, 1500000),
(7, 1, '40', 'red', 1, 1250000),
(8, 3, 'M', 'blue', 1, 450000);

-- Add FULLTEXT index for search functionality (Question E)
ALTER TABLE products 
ADD FULLTEXT IF NOT EXISTS idx_product_search (name, description, brand, model);