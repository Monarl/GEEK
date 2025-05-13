# Geek E-Commerce Database Assessment

This repository contains the solution for the e-commerce database assessment questions.

## Project Structure

```
geek/
├── docker-compose.yml      # Docker setup for MySQL
├── schema/                 # SQL schema definition files
│   └── 01_schema.sql       # Tables creation script
├── sql/                    # SQL queries for assessment questions
│   ├── questionB_query.sql # SQL query for Question B
│   └── questionC_query.sql # SQL query for Question C
├── questions/              # Question details and explanations
│   ├── QuestionA.md        # Explanation of database design and normalization
│   ├── QuestionB.md        # Explanation of order insertion query
│   └── QuestionC.md        # Explanation of monthly average order value query
├── package.json            # Node.js project definition
├── questionA.js            # Node.js script to display the database schema
├── questionB.js            # Node.js script to execute Question B order insertion
└── questionC.js            # Node.js script to calculate monthly average order values
```

## Prerequisites

- Docker and Docker Compose
- Node.js (v14 or higher)

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Start the MySQL container:
   ```
   docker-compose up -d
   ```

3. Run the questionA.js script to display the database schema:
   ```
   node questionA.js
   ```

4. Run the questionB.js script to execute the order insertion query:
   ```
   node questionB.js
   ```

5. Run the questionC.js script to calculate average order value by month:
   ```
   node questionC.js
   ```

6. Run the questionD.js script to calculate customer churn rate:
   ```
   node questionD.js
   ```

7. To stop the MySQL container when done:
   ```
   docker-compose down
   ```

## Questions

### Question A: Database Design
For a detailed explanation of the database design and normalization techniques used, please refer to [QuestionA.md](./questions/QuestionA.md).

### Question B: Order Insertion
For the SQL query to insert the given order into the database, please refer to [QuestionB.md](./questions/QuestionB.md).

### Question C: Monthly Average Order Value
For the SQL query to calculate the average order value for each month in the current year, please refer to [QuestionC.md](./questions/QuestionC.md).

### Question D: Customer Churn Rate Calculation
For the SQL query to calculate the customer churn rate, please refer to [QuestionD.md](./questions/QuestionD.md).
```

