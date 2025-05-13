# Question D: Customer Churn Rate Calculation

## Problem Statement

Write a query to calculate the churn rate of customers. The churn rate is defined as the percentage of customers who did not make a purchase in the last 6 months but had made a purchase in the 6 months prior to that.

## Solution Approach

To calculate the customer churn rate, we need to:

1. Define two time periods:
   - Recent period: Last 6 months (from current date)
   - Previous period: The 6 months before the recent period (6-12 months ago)

2. Identify three groups of customers:
   - Customers who made purchases in the previous period
   - Customers who made purchases in the recent period
   - Churned customers: Those who purchased in the previous period but did not purchase in the recent period

3. Calculate the churn rate using the formula:
   ```
   Churn Rate = (Churned Customers / Total Customers in Previous Period) × 100%
   ```
## Implementation
The implementation in `questionD.js` executes this SQL query and displays the churn rate as a percentage. The query uses subqueries to identify the relevant customer groups and calculates the churn rate based on the defined formula.

## SQL Query

For the complete SQL implementation, see [questionD_query.sql](../sql/questionD_query.sql).
