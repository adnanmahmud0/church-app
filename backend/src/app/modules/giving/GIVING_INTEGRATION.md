# Giving Feature — App Integration Guide

## 1. Overview
The Giving module handles financial contributions, managing funds, recording transactions, and managing church bank details.
It supports both public-facing app operations (for regular users) and administrative operations (for managing funds and tracking overall giving).

---

## 2. Base URL & Environment Setup
The backend API base URL is defined by the `NEXT_PUBLIC_API_URL` environment variable.

Example `.env` entry:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

The app should configure its HTTP client (e.g., Axios or fetch) to use this base URL.

---

## 3. Data Models

### 3.1 Giving Fund
```json
{
  "id": "60d5ecb8b392d7001f3e3a41",
  "name": "General Tithe",
  "description": "General church operations and tithes.",
  "icon": "dollar-sign",
  "color": "#3B82F6",
  "isActive": true,
  "sortOrder": 1,
  "createdAt": "2025-05-04T10:00:00.000Z",
  "updatedAt": "2025-05-04T10:00:00.000Z"
}
```

### 3.2 Giving Transaction
```json
{
  "id": "60d5ecb8b392d7001f3e3a42",
  "userId": "user_id_123",
  "fundId": "60d5ecb8b392d7001f3e3a41",
  "amount": 100.50,
  "currency": "GBP",
  "status": "completed",
  "reference": "TX-987654321",
  "createdAt": "2025-05-04T10:00:00.000Z"
}
```

### 3.3 Bank Details
```json
{
  "id": "60d5ecb8b392d7001f3e3a43",
  "accountName": "Church Name Inc.",
  "sortCode": "12-34-56",
  "accountNumber": "12345678",
  "note": "Please ensure you include your unique reference when making a transfer."
}
```

---

## 4. Public API Endpoints (App Developer)

### 4.1 GET /api/v1/giving/funds
Retrieve a list of available funds for giving.
*Note: Regular users will only receive `isActive: true` funds. Admins will receive all funds.*

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Funds retrieved successfully",
  "data": [
    {
      "id": "60d5ecb8b392d7001f3e3a41",
      "name": "General Tithe",
      "description": "General church operations and tithes.",
      "icon": "dollar-sign",
      "color": "#3B82F6",
      "isActive": true,
      "sortOrder": 1
    }
  ]
}
```

### 4.2 GET /api/v1/giving/bank-details
Retrieve the church's bank details for direct transfer.

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Bank details retrieved successfully",
  "data": {
    "accountName": "Church Name Inc.",
    "sortCode": "12-34-56",
    "accountNumber": "12345678",
    "note": "Please ensure you include your unique reference."
  }
}
```

### 4.3 POST /api/v1/giving/record
Record a successful transaction. Should be called after the payment processor confirms success, or to log a manual bank transfer.

**Request Body:**
```json
{
  "fundId": "60d5ecb8b392d7001f3e3a41",
  "amount": 100.00,
  "currency": "GBP",
  "status": "completed",
  "reference": "TXN-12345"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Transaction recorded successfully",
  "data": {
    "id": "60d5ecb8b392d7001f3e3a42",
    "userId": "user_id_123",
    "fundId": "60d5ecb8b392d7001f3e3a41",
    "amount": 100.00,
    "currency": "GBP",
    "status": "completed",
    "reference": "TXN-12345"
  }
}
```

### 4.4 GET /api/v1/giving/history
Retrieve a user's giving history. (Requires Authentication)

**Query Parameters:**
| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| year | string | No | Filter history by a specific year (e.g., "2024"). |

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Giving history retrieved successfully",
  "data": {
    "totalThisYear": 1500.00,
    "currency": "GBP",
    "transactions": [
      {
        "id": "60d5ecb8b392d7001f3e3a42",
        "fund": "Tithe",
        "amount": 100.00,
        "currency": "GBP",
        "status": "completed",
        "date": "May 4, 2025"
      }
    ]
  }
}
```

### 4.5 GET /api/v1/giving/total-this-year
Retrieve the total amount the authenticated user has given in the current calendar year. (Requires Authentication)

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Total giving this year retrieved successfully",
  "data": {
    "totalThisYear": 1500.00
  }
}
```

---

## 5. Admin API Endpoints

*Note: The following endpoints require Authentication with an `ADMIN` or `SUPER_ADMIN` role.*

### 5.1 GET /api/v1/giving/summary
Retrieve a high-level summary of all giving.

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Giving summary retrieved successfully",
  "data": {
    "totalGiven": 15400.50,
    "totalTransactions": 142,
    "fundsBreakdown": [ ... ]
  }
}
```

### 5.2 POST /api/v1/giving/funds
Create a new giving fund.

### 5.3 PATCH /api/v1/giving/funds/:id
Update an existing giving fund.

### 5.4 DELETE /api/v1/giving/funds/:id
Delete a giving fund.

### 5.5 PATCH /api/v1/giving/bank-details
Update the church's bank details.

---

## 6. App Developer Checklist

**Giving Screen Integration:**
- [ ] Fetch and display active funds using `GET /api/v1/giving/funds`.
- [ ] Fetch bank transfer details using `GET /api/v1/giving/bank-details` if bank transfer option is selected.
- [ ] Record successful donations/transactions by calling `POST /api/v1/giving/record`.

**Giving History / Profile Integration:**
- [ ] Fetch the user's historical donations using `GET /api/v1/giving/history?userId=<USER_ID>`.
- [ ] Provide an option to filter history by year by adding the `&year=<YYYY>` query parameter.
