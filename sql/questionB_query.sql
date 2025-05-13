-- Begin transaction for atomicity
START TRANSACTION;

-- 1. Insert user "assessment"
INSERT IGNORE INTO users (name, email, phone)
VALUES ('assessment', 'gu@gmail.com', '328355333');

SET @user_id = (SELECT user_id FROM users WHERE email = 'gu@gmail.com' LIMIT 1);

-- 2. Insert address
INSERT IGNORE INTO addresses (user_id, province, district, commune, detail, housing_type, is_default)
VALUES (@user_id, 'Bắc Kạn', 'Ba Bể', 'Phúc Lộc', '73 tân hoà 2', 'nhà riêng', TRUE);

SET @address_id = (SELECT address_id FROM addresses 
                  WHERE user_id = @user_id AND province = 'Bắc Kạn' AND district = 'Ba Bể' LIMIT 1);

-- 3. Get the sneakers category
SET @category_id = (SELECT category_id FROM categories WHERE name = 'Sneakers' LIMIT 1);

-- 4. Insert the KAPPA product
INSERT IGNORE INTO products (name, description, base_price, category_id, brand, model)
VALUES ('KAPPA Women''s Sneakers', 'Women''s sneakers by KAPPA', 980000, @category_id, 'KAPPA', '3218SJW');

SET @product_id = (SELECT product_id FROM products WHERE name = 'KAPPA Women''s Sneakers' LIMIT 1);

-- 5. Insert inventory item for the product
INSERT IGNORE INTO product_inventory (product_id, size, color, quantity, store_id)
VALUES (@product_id, '36', 'yellow', 5, 1);

SET @inventory_id = (SELECT inventory_id FROM product_inventory 
                    WHERE product_id = @product_id AND size = '36' AND color = 'yellow' LIMIT 1);

-- 6. Ensure payment method exists
SELECT @payment_id := payment_method_id FROM payment_methods WHERE name = 'Cash on Delivery' LIMIT 1;

-- If payment method doesn't exist, insert it
INSERT INTO payment_methods (name)
SELECT 'Cash on Delivery'
WHERE @payment_id IS NULL;

-- Get the payment method ID again if it was just inserted
SET @payment_id = COALESCE(@payment_id, LAST_INSERT_ID());

-- 7. Insert order
INSERT INTO orders (
    user_id, 
    address_id, 
    status, 
    subtotal, 
    total_amount, 
    payment_method_id
)
VALUES (
    @user_id, 
    @address_id, 
    'confirmed', 
    980000, 
    980000, 
    @payment_id
);

SET @order_id = LAST_INSERT_ID();

-- 8. Insert order item
INSERT INTO order_items (order_id, product_id, size, color, quantity, price_at_time)
VALUES (@order_id, @product_id, '36', 'yellow', 1, 980000);

-- 9. Update inventory
UPDATE product_inventory 
SET quantity = quantity - 1 
WHERE inventory_id = @inventory_id;

-- 10. Display results
SELECT 'Order Information:' AS '';
SELECT 
    o.order_id, 
    u.name, 
    u.email, 
    o.subtotal, 
    o.total_amount, 
    o.status
FROM 
    orders o
JOIN 
    users u ON o.user_id = u.user_id
WHERE 
    o.order_id = @order_id;

SELECT 'Order Item Details:' AS '';
SELECT 
    p.name AS product, 
    oi.size, 
    oi.color, 
    oi.quantity, 
    oi.price_at_time AS price
FROM 
    order_items oi
JOIN 
    products p ON oi.product_id = p.product_id
WHERE 
    oi.order_id = @order_id;

COMMIT;