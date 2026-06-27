# Feedback API Documentation

This document outlines the API endpoints related to the Feedback module. It is intended for App Developers integrating the feedback form into the mobile app.

## Base URL
All requests should be prefixed with your environment's base URL, for example:
- **Local:** `http://localhost:5000/api/v1`
- **Production:** `https://your-production-url.com/api/v1`

---

## 1. Submit User Feedback

Allows an app user to submit feedback, bugs, or feature suggestions. 
If the user is authenticated (meaning a valid Bearer token is passed in the Authorization header), the feedback will be automatically linked to their user account. Otherwise, it will be submitted anonymously.

**Endpoint:** 
`POST /feedback`

**Authentication:** 
- **Optional** 
- To submit as an authenticated user, include the header: `Authorization: Bearer <token>`

### Request Body
The request expects a JSON payload with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | **Yes** | A short summary or subject of the feedback. |
| `description` | `string` | **Yes** | The detailed explanation of the feedback or bug report. |

#### Example Request
```json
{
  "title": "Great App Experience",
  "description": "I really love the new sermon features, but I wish there was a dark mode."
}
```

### Responses

#### 200 OK (Success)
Feedback was successfully created.
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Feedback created successfully",
  "data": {
    "title": "Great App Experience",
    "description": "I really love the new sermon features, but I wish there was a dark mode.",
    "userId": "60d5ecb8b392d234c8a8c2f1", // Only present if authenticated
    "createdAt": "2026-06-27T22:00:00.000Z",
    "updatedAt": "2026-06-27T22:00:00.000Z",
    "id": "64c5d5e5e67b2d001234abcd"
  }
}
```

#### 400 Bad Request (Validation Error)
Missing required fields in the request body.
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation Error",
  "errorMessages": [
    {
      "path": "title",
      "message": "Title is required"
    }
  ]
}
```
