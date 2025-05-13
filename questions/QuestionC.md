# Question C: Monthly Average Order Value

## Problem Statement

Write a query to calculate the average order value (total price of items in an order) for each month in the current year.

## Solution Approach

To solve this problem, we need to:

1. Filter orders from the current year
2. Group them by month
3. Calculate the average total_amount for each month

## Example Results

| month | month_name | average_order_value |
|-------|------------|---------------------|
| 1     | January    | 1243.67             |
| 2     | February   | 1156.23             |
| 3     | March      | 1321.45             |
| ...   | ...        | ...                 |

## Implementation

The implementation in `questionC.js` executes this SQL query and displays the results in a formatted table, showing the average order value for each month in the current year.

If there are no orders in the current year, an appropriate message is displayed.

## SQL Query

For the complete SQL implementation, see [questionC_query.sql](../sql/questionC_query.sql).