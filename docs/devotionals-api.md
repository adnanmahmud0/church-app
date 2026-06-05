# Devotionals API Documentation (Mobile App)

The Devotionals module delivers daily Bible-based devotionals to church members. Each devotional includes a scripture reference, reflection, and prayer. Users can mark devotionals as read.

## Base URL
All endpoints are relative to the main API base URL:
`https://church-app-ooku.onrender.com/api/v1/devotionals`
*(Note: Replace with your actual domain)*

## Authentication
- **Read endpoints:** Public (or optionally use Bearer token if user is logged in).
- **Mark as read:** Requires `userId` (can be passed in body if unauthenticated, or uses auth token if logged in).
- **Admin endpoints:** Require `Authorization: Bearer <token>` with `ADMIN` or `SUPER_ADMIN` role.

---

## 1. Get All Devotionals (Paginated)
Retrieves a list of published devotionals.

**Request**
`GET /`
**Query Parameters:**
- `page` (optional, default 1)
- `limit` (optional, default 20)

**Response (200 OK)**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Devotionals retrieved successfully",
  "data": {
    "devotionals": [
      {
        "id": "64b0f9c4f1a2...",
        "title": "Still Waters",
        "dayLabel": "MONDAY",
        "date": "May 5, 2025",
        "dateISO": "2025-05-05",
        "scriptureRef": "Psalm 23:2",
        "scriptureQuote": "He makes me lie down in green pastures...",
        "reflection": "In the noise and rush...",
        "reflectionPreview": "In the noise and rush...",
        "prayer": "Lord, lead me...",
        "isDraft": false,
        "publishedAt": "2025-05-05T06:00:00Z"
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

---

## 2. Get Today's Devotional
Fetches the devotional for the current UTC day.
> **Note:** Use `GET /today` to always fetch the current day's devotional on app launch.

**Request**
`GET /today`

**Response (200 OK)**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Today's devotional retrieved successfully",
  "data": {
    "id": "64b0f9c4f1a2...",
    "title": "Still Waters",
    "dayLabel": "MONDAY",
    "date": "May 5, 2025",
    "dateISO": "2025-05-05",
    "scriptureRef": "Psalm 23:2",
    "scriptureQuote": "He makes me lie down in green pastures. He leads me beside still waters.",
    "reflection": "In the noise and rush of daily life, God's invitation is to rest...",
    "prayer": "Lord, in the midst of everything demanding my attention today, lead me to still waters...",
    "isDraft": false
  }
}
```

---

## 3. Get Devotional by ID
Retrieves the full details of a specific devotional.

**Request**
`GET /:id`

**Response (200 OK)**
*(Same JSON shape as above)*

---

## 4. Mark Devotional as Read
Marks a devotional as read for the given user.
> **Important `isRead` Note:** Requires `userId` in body or an active auth token to track correctly.

**Request**
`POST /:id/read`

**Body (JSON):**
```json
{
  "userId": "user-uuid-123" // Optional if Bearer token is provided
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Marked as read successfully",
  "data": {
    "isRead": true,
    "readAt": "2025-05-05T08:30:00Z"
  }
}
```

---

## 5. Get User's Read Status
Returns a list of all devotional IDs the user has read. Useful for syncing local state.

**Request**
`GET /read-status?userId=user-uuid-123`

**Response (200 OK)**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Read status retrieved successfully",
  "data": {
    "readIds": [
      "64b0f9c4f1a2...",
      "64b0f9c4f1b3..."
    ]
  }
}
```

---

## Error Format
If an error occurs (e.g., devotional not found), the API returns standard errors:

```json
{
  "success": false,
  "message": "No devotional found for today",
  "errorMessages": [
    {
      "path": "",
      "message": "No devotional found for today"
    }
  ]
}
```
