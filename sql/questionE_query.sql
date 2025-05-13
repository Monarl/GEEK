-- SQL Query for Question E (RESTful API for E-commerce Platform)

-- 1. Query to fetch all categories
SELECT 
    category_id, name, parent_category_id
FROM 
    categories
ORDER BY 
    name;

-- 2. Query to fetch products by category
SELECT 
    p.product_id, p.name, p.description, p.base_price, 
    p.discount_percent, p.brand, p.model, p.category_id
FROM 
    products p
WHERE 
    p.category_id = ? -- Placeholder for category_id
LIMIT ? OFFSET ?; -- For pagination

-- Count total products in a category (for pagination)
SELECT 
    COUNT(*) as total 
FROM 
    products 
WHERE 
    category_id = ?;

-- 3. Query for full-text search with filters
-- Note: This assumes we've created a FULLTEXT index on relevant columns
-- Add FULLTEXT index if it doesn't exist
ALTER TABLE products 
ADD FULLTEXT IF NOT EXISTS idx_product_search (name, description, brand, model);

-- Search query
SELECT 
    p.product_id, p.name, p.description, p.base_price, 
    p.discount_percent, p.brand, p.model, p.category_id
FROM 
    products p
WHERE 
    MATCH(p.name, p.description, p.brand, p.model) AGAINST (? IN BOOLEAN MODE)
    -- Optional filters
    AND (? IS NULL OR p.category_id = ?)
    AND (? IS NULL OR p.base_price >= ?)
    AND (? IS NULL OR p.base_price <= ?)
    AND (? IS NULL OR p.brand = ?)
LIMIT ? OFFSET ?;

-- Count total search results (for pagination)
SELECT 
    COUNT(*) as total 
FROM 
    products p
WHERE 
    MATCH(p.name, p.description, p.brand, p.model) AGAINST (? IN BOOLEAN MODE)
    -- Optional filters
    AND (? IS NULL OR p.category_id = ?)
    AND (? IS NULL OR p.base_price >= ?)
    AND (? IS NULL OR p.base_price <= ?)
    AND (? IS NULL OR p.brand = ?);

-- 4. Queries for order creation and payment processing
-- These are similar to the queries in questionB_query.sql but adapted for API use

-- Begin transaction
START TRANSACTION;

-- Create order
INSERT INTO orders (
    user_id, address_id, order_date, status,
    subtotal, shipping_fee, discount_amount, total_amount, payment_method_id
) VALUES (
    ?, ?, NOW(), 'confirmed',
    ?, ?, ?, ?, ?
);

-- Get the order ID
SET @order_id = LAST_INSERT_ID();

-- Insert order items
INSERT INTO order_items (
    order_id, product_id, size, color, quantity, price_at_time
) VALUES (
    @order_id, ?, ?, ?, ?, ?
);

-- Update inventory
UPDATE product_inventory 
SET quantity = quantity - ?
WHERE product_id = ? AND size = ? AND color = ?;

-- Commit transaction
COMMIT;
