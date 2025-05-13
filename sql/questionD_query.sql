-- Query to calculate the churn rate of customers
-- Churn rate: percentage of customers who did not make a purchase in the last 6 months
-- but had made a purchase in the 6 months prior to that

WITH 
-- Customers who purchased in the previous 6 months period (6-12 months ago)
previous_customers AS (
    SELECT DISTINCT user_id
    FROM orders
    WHERE order_date BETWEEN 
        DATE_SUB(CURDATE(), INTERVAL 12 MONTH) AND 
        DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
),

-- Customers who purchased in the recent 6 months period
recent_customers AS (
    SELECT DISTINCT user_id
    FROM orders
    WHERE order_date BETWEEN 
        DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND 
        CURDATE()
),

-- Churned customers are in previous but not in recent
churned_customers AS (
    SELECT user_id
    FROM previous_customers
    WHERE user_id NOT IN (SELECT user_id FROM recent_customers)
)

-- Calculate the metrics and include date ranges directly in the results
SELECT 
    (SELECT COUNT(*) FROM previous_customers) AS total_previous_customers,
    (SELECT COUNT(*) FROM churned_customers) AS churned_customers,
    CASE 
        WHEN (SELECT COUNT(*) FROM previous_customers) = 0 THEN 0
        ELSE ROUND((SELECT COUNT(*) FROM churned_customers) / (SELECT COUNT(*) FROM previous_customers) * 100, 2)
    END AS churn_rate_percentage,
    DATE_SUB(CURDATE(), INTERVAL 12 MONTH) AS previous_period_start,
    DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AS previous_period_end,
    DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AS recent_period_start,
    CURDATE() AS recent_period_end;