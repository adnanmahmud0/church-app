# Giving Module API Documentation (Mobile App)

The Giving module lets church members select a fund, choose/enter an amount, and receive bank transfer details to complete their donation.

> **Note:** No payment processing happens in the app — the backend records intent and returns bank details. Actual transfer is done by the user via their bank app.

## Base URL
All endpoints are relative to the main API base URL:
`https://<server-domain>/api/v1/giving`

---

## Authentication Note
The Giving module requires an **authenticated user token** for history fetching, but recording a transaction or fetching funds/bank details does not strictly require auth, allowing guest users to view funds. 
- Send the standard Bearer token in the header when logged in:
  `Authorization: Bearer <your_jwt_token>`

---

## 1. Get All Active Funds
Returns the list of active giving funds to display on the "Select Fund" screen.

**Request**
`GET /funds`

**Example Response (200 OK)**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Funds retrieved successfully",
  "data": [
    {
      "_id": "60d5ec4...",
      "name": "Tithe",
      "description": "Your regular 10% offering",
      "icon": "dollar-sign",
      "color": "#3B82F6",
      "isActive": true,
      "sortOrder": 1
    },
    {
      "_id": "60d5ec5...",
      "name": "Offering",
      "description": "Freewill offering to the Lord",
      "icon": "heart",
      "color": "#EF4444",
      "isActive": true,
      "sortOrder": 2
    }
  ]
}
```

---

## 2. Get Bank Transfer Details
Returns church bank transfer details shown after the "Donate" tap.

**Request**
`GET /bank-details`

**Example Response (200 OK)**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Bank details retrieved successfully",
  "data": {
    "accountName": "PIWC Stoneyburn",
    "sortCode": "80-22-60",
    "accountNumber": "00000000",
    "reference": "PIWC-GIFT",
    "note": "Please use your full name as the payment reference so we can acknowledge your gift."
  }
}
```

---

## 3. Record a Donation Intent
Records a giving transaction intent (called when user taps Donate).

**Request**
`POST /record`

**Body Parameters (JSON)**
- `fundId` (required, string): ID of the fund retrieved from `/funds`.
- `amount` (required, number): Amount to donate.
- `currency` (optional, string): Currency code (default: "GBP").
- `reference` (required, string): Reference string generated or typed by user.
- `userId` (optional, string): ID of the logged-in user.

**Example Request**
```json
{
  "userId": "60d5e2...",
  "fundId": "60d5ec4...",
  "amount": 20,
  "currency": "GBP",
  "reference": "PIWC-GIFT"
}
```

**Example Response (201 Created)**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Transaction recorded successfully",
  "data": {
    "id": "64d5ef9...",
    "status": "completed",
    "createdAt": "2026-04-27T10:00:00Z"
  }
}
```

---

## 4. Get User's Giving History
Returns giving history for a specific user, optionally filtered by year.

**Request**
`GET /history?userId=xxx&year=2026`

**Query Parameters**
- `userId` (required, string): ID of the user.
- `year` (optional, string): Four digit year to filter history (e.g. 2026).

**Example Response (200 OK)**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Giving history retrieved successfully",
  "data": {
    "totalThisYear": 475.00,
    "currency": "GBP",
    "transactions": [
      {
        "id": "64d5ef9...",
        "fund": "Tithe",
        "amount": 250.00,
        "currency": "GBP",
        "status": "completed",
        "date": "Apr 27, 2026"
      }
    ]
  }
}
```

---

## 5. Get Summary Stats (Admin Only)
Returns aggregate stats for the admin dashboard.

**Request**
`GET /summary`

*(Requires Admin Token)*

**Example Response (200 OK)**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Giving summary retrieved successfully",
  "data": {
    "totalThisYear": 12450.00,
    "totalThisMonth": 1800.00,
    "totalDonors": 48,
    "byFund": [
      { "fund": "Tithe", "total": 6000.00, "count": 24 }
    ],
    "recentTransactions": [
      {
        "id": "64d5ef9...",
        "donor": "60d5e2...",
        "fund": "Tithe",
        "amount": 250.00,
        "currency": "GBP",
        "status": "completed",
        "date": "Apr 27, 2026"
      }
    ]
  }
}
```
