# Devotionals Feature — App Integration Guide

## 1. Overview
The Devotionals module provides daily spiritual content, including scriptures, reflections, and prayers.
It supports daily reading cycles, tracking user read status, and full administrative management.

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

### 3.1 Devotional
```json
{
  "id": "60d5ecb8b392d7001f3e3a41",
  "title": "Finding Peace in the Storm",
  "assignedDateString": "2025-05-04",
  "posted": true,
  "scriptureRef": "Mark 4:39",
  "scriptureQuote": "And he arose, and rebuked the wind, and said unto the sea, Peace, be still...",
  "reflection": "A reflection on finding peace...",
  "prayer": "Lord, help us to trust you...",
  "isDraft": false,
  "publishedAt": "2025-05-03T10:00:00.000Z",
  "createdAt": "2025-05-01T10:00:00.000Z",
  "updatedAt": "2025-05-01T10:00:00.000Z"
}
```

### 3.2 Devotional Read Status
```json
{
  "id": "60d5ecb8b392d7001f3e3a42",
  "devotionalId": "60d5ecb8b392d7001f3e3a41",
  "userId": "user_id_123",
  "readAt": "2025-05-04T12:00:00.000Z"
}
```

---

## 4. Public API Endpoints (App Developer)

*Note: The following endpoints support optional authentication. Some endpoints (like marking as read) might require `userId` from either an auth token or from the request payload.*

### 4.1 GET /api/v1/devotionals
Retrieve a paginated list of published devotionals.

**Query Parameters:**
| Name | Type | Required | Description |
|---|---|---|---|
| page | number | No | Page number for pagination (default: 1). |
| limit | number | No | Number of items per page (default: 20). |

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Devotionals retrieved successfully",
  "data": {
    "data": [
      {
        "id": "60d5ecb8b392d7001f3e3a41",
        "title": "Finding Peace in the Storm",
        "assignedDateString": "2025-05-04",
        "isDraft": false,
        "isRead": true
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "total_pages": 3
    }
  }
}
```

### 4.2 GET /api/v1/devotionals/today
Retrieve the devotional assigned for today (based on `assignedDateString`).

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Today's devotional retrieved successfully",
  "data": {
    "id": "60d5ecb8b392d7001f3e3a41",
    "title": "Finding Peace in the Storm",
    "scriptureRef": "Mark 4:39",
    "scriptureQuote": "...",
    "reflection": "...",
    "prayer": "...",
    "isRead": false
  }
}
```

### 4.3 GET /api/v1/devotionals/read-status
Retrieve the read status for a specific user.

**Query Parameters:**
| Name | Type | Required | Description |
|---|---|---|---|
| userId | string | Yes | The ID of the user. |

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Read status retrieved successfully",
  "data": [
    {
      "id": "60d5ecb8b392d7001f3e3a42",
      "devotionalId": "60d5ecb8b392d7001f3e3a41",
      "userId": "user_id_123",
      "readAt": "2025-05-04T12:00:00.000Z"
    }
  ]
}
```

### 4.4 GET /api/v1/devotionals/:id
Get full detail of a single devotional by ID.

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Devotional retrieved successfully",
  "data": {
    "id": "60d5ecb8b392d7001f3e3a41",
    "title": "Finding Peace in the Storm",
    "scriptureRef": "Mark 4:39",
    "scriptureQuote": "...",
    "reflection": "...",
    "prayer": "...",
    "isRead": false
  }
}
```

### 4.5 POST /api/v1/devotionals/:id/read
Toggles the read status of a devotional for the authenticated user. If already read, it marks it unread. If unread, it marks it as read.

**Headers:**
- `Authorization`: Bearer <user_token>

**Request Body:**
```json
{}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Marked as read successfully",
  "data": {
    "isRead": true,
    "readAt": "2025-05-04T12:00:00.000Z"
  }
}
```

### 4.6 GET /api/v1/devotionals/profile-summary
Retrieve the reading streak, total reads, and last read date for the authenticated user.

**Headers:**
- `Authorization`: Bearer <user_token>

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile devotional summary retrieved successfully",
  "data": {
    "total_devotionals_read": 14,
    "devotionals_streak_days": 3,
    "weekly_progress": 3,
    "last_read_date": "2025-05-04T12:00:00.000Z"
  }
}
```

---

## 5. Admin API Endpoints

*Note: The following endpoints require Authentication with an `ADMIN` or `SUPER_ADMIN` role.*

### 5.1 POST /api/v1/devotionals
Create a new devotional.

### 5.2 GET /api/v1/devotionals/admin/stats
Retrieve statistics for devotionals (e.g., total count, reads count).

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Stats retrieved successfully",
  "data": {
    "totalDevotionals": 100,
    "publishedCount": 80,
    "draftsCount": 20,
    "totalReads": 500
  }
}
```

### 5.3 PATCH /api/v1/devotionals/:id
Update an existing devotional.

### 5.4 DELETE /api/v1/devotionals/:id
Delete a devotional.

---

## 6. App Developer Checklist

**Devotionals Screen Integration:**
- [ ] Fetch the daily devotional using `GET /api/v1/devotionals/today`.
- [ ] Provide a list of recent devotionals using `GET /api/v1/devotionals`.
- [ ] Handle read tracking by calling `POST /api/v1/devotionals/:id/read` when a user reads a devotional.
- [ ] Query read statuses for the authenticated user using `GET /api/v1/devotionals/read-status?userId=<USER_ID>` to show progress or badges.
