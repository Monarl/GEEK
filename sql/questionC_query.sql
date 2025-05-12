-- Query to calculate the average order value for each month in the current year
SELECT 
    MONTH(order_date) AS month,
    MONTHNAME(order_date) AS month_name,
    ROUND(AVG(total_amount), 2) AS average_order_value
FROM 
    orders
WHERE 
    YEAR(order_date) = YEAR(CURDATE())
GROUP BY 
    MONTH(order_date), 
    MONTHNAME(order_date)
ORDER BY 
    MONTH(order_date);
