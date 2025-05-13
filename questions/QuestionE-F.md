# Question E-F: RESTful API for E-commerce Platform

## Problem Statement

Design and implement RESTful API specifications and implementation for the following e-commerce operations:

1. Fetch a list of all product categories available in the e-commerce platform.
2. Fetch a list of products that belong to a specific category.
3. Allow users to search (full-text search) for products using various filters and search terms.
4. Create a new order and process payment.
5. Send order confirmation email to user (processed asynchronously with order creation flow).

## Solution Approach

1. Use appropriate HTTP methods (GET, POST, PUT, DELETE)
2. Design meaningful and hierarchical endpoint URLs
3. Use proper status codes and response formats
4. Implement query parameters for filtering and pagination
5. Handle errors gracefully

## API Specifications

### 1. Get All Categories

```
GET /api/categories
```

**Request Example:**
```
GET http://localhost:3000/api/categories
```

### 2. Get Products by Category

```
GET /api/categories/:categoryId/products
```

**Request Examples:**
```
GET http://localhost:3000/api/categories/5/products
GET http://localhost:3000/api/categories/5/products?limit=20&page=2
```

**Parameters:**
- `categoryId`: ID of the category to fetch products for
- `limit` (optional): Number of products to return (default: 10)
- `page` (optional): Page number for pagination (default: 1)


### 3. Search Products

```
GET /api/products/search
```

**Request Examples:**
```
GET http://localhost:3000/api/products/search?query=sneakers
GET http://localhost:3000/api/products/search?query=running&category=5&minPrice=50&maxPrice=150&brand=Nike&limit=20&page=1
```

**Parameters:**
- `query`: Search term
- `category` (optional): Filter by category ID
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `brand` (optional): Filter by brand
- `limit` (optional): Number of products to return (default: 10)
- `page` (optional): Page number for pagination (default: 1)


### 4. Create Order and Process Payment

```
POST /api/orders
```

**Request Example:**
```
POST http://localhost:3000/api/orders
Content-Type: application/json

{
  "user_id": 1,
  "address_id": 2,
  "payment_method_id": 1,
  "items": [
    {
      "product_id": 1,
      "size": "36",
      "color": "yellow",
      "quantity": 1
    },
    {
      "product_id": 3,
      "size": "42",
      "color": "black",
      "quantity": 2
    }
  ]
}
```

### 5. Order Confirmation Email (Asynchronous)

This process is triggered automatically after order creation. It doesn't have a direct API endpoint as it works asynchronously through a queue system.

## Implementation

The implementation in `questionE.js` sets up an Express server that implements these API endpoints. The server connects to the MySQL database and handles the various e-commerce operations as specified above.

The order confirmation email is implemented using a simple queue simulation to demonstrate the asynchronous processing.

## API Testing

You can test the APIs by running the `questionE.js` script and using tools like cURL, Postman, or simply by opening the URLs in a web browser for GET requests.

## SQL Query

For the complete SQL implementation supporting this API, see [questionE_query.sql](../sql/questionE_query.sql).
