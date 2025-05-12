# Question B: Order Insertion Query

## Problem Statement

User "assessment" with the provided information has purchased the product "KAPPA Women's Sneakers" in yellow, size 36, quantity 1. The task is to write a SQL query to insert this order into the database.

## User Information
| name       | email         | phone      | province | district | commune    | address      | housing type |
|------------|---------------|------------|----------|----------|------------|--------------|--------------|
| assessment | gu@gmail.com  | 328355333  | Bắc Kạn  | Ba Bể    | Phúc Lộc   | 73 tân hoà 2 | nhà riêng    |

## Product Information
| name                  | price  | size | quantity | color  |
|-----------------------|--------|------|----------|--------|
| KAPPA Women's Sneakers| 980000 | 36   | 5        | yellow |

## Solution Approach

To insert this order properly, we need to ensure that all related data is available in the database, which requires a step-by-step approach:

1. Create/retrieve the user record
2. Create/retrieve the address for this user
3. Create/retrieve the product category
4. Create/retrieve the product
5. Create/retrieve inventory for this product
6. Create/retrieve payment method
7. Create the order
8. Add the order item
9. Update inventory to reflect the purchase

The query uses transaction to ensure data consistency and handles the scenario where some data might already exist in the database.
