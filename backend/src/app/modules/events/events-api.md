# Events Module API Documentation

The Events module lets church members browse upcoming events, filter by category, view event details, RSVP, and add events to their device calendar. Past events are visible in a history view with attendance counts.

**Base URL**: `https://your-api-domain.com/api/v1/events`

**Authentication:** 
- List/detail endpoints are public (auth is optional to show user's RSVP status).
- RSVP endpoints require user auth (`Authorization: Bearer <token>`).
- Admin endpoints require admin token (`Authorization: Bearer <token>`).

---

## 1. Get Upcoming Events
Retrieves a paginated list of upcoming events (date >= today), sorted by date ascending.

**Endpoint**: `GET /`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20) |
| `category` | string | No | Filter by category label (e.g. `worship`, `study`). Use `all` for all. |

**Example Request**:
```
GET /api/v1/events?category=worship&page=1&limit=20
```

**Example Response**:
```json
{
  "success": true,
  "message": "Upcoming events retrieved successfully",
  "data": {
    "events": [
      {
        "id": "uuid",
        "title": "Women's Bible Study",
        "category": "study",
        "categoryLabel": "STUDY",
        "categoryColor": "#f97316",
        "date": "May 8, 2025",
        "dateISO": "2025-05-08",
        "time": "10:00 AM",
        "location": "Room 204",
        "description": "Join us as we dive deep into the Word of God...",
        "attendingCount": 29,
        "hasRsvp": false,
        "isPast": false
      }
    ],
    "total": 12,
    "page": 1,
    "limit": 20
  }
}
```

---

## 2. Get Past Events (History)
Retrieves a paginated list of past events (date < today), sorted by date descending. 

**Endpoint**: `GET /history`

*(Same query parameters and response structure as `/`). In the app UI, the `attendingCount` label should become "attended", but the field name remains `attendingCount`.*

---

## 3. Get Event Details
Retrieves full details of a specific event.

**Endpoint**: `GET /:id`

**Example Response**:
```json
{
  "success": true,
  "message": "Event retrieved successfully",
  "data": {
    "id": "uuid",
    "title": "Women's Bible Study",
    "category": "study",
    "categoryLabel": "STUDY",
    "categoryColor": "#f97316",
    "date": "May 8, 2025",
    "dateISO": "2025-05-08",
    "time": "10:00 AM",
    "location": "Room 204",
    "description": "Join us as we dive deep into the Word of God, studying the book of Ruth...",
    "attendingCount": 29,
    "hasRsvp": false,
    "isPast": false,
    "createdAt": "2025-04-01T10:00:00.000Z"
  }
}
```

> **Add to Calendar Feature:** The app should use the `dateISO` (e.g. "2025-05-08") and `time` (e.g. "10:00 AM") fields to construct a calendar event client-side. No backend interaction is needed for this feature.

---

## 4. RSVP for an Event
Marks the authenticated user as attending the event.

**Endpoint**: `POST /:id/rsvp`

**Headers**:
- `Authorization`: Bearer <user_token>

**Request Body**:
```json
{
  "userId": "uuid-string"
}
```

**Example Response**:
```json
{
  "success": true,
  "message": "RSVP successful",
  "data": {
    "hasRsvp": true,
    "attendingCount": 30
  }
}
```

> **Note:** Duplicate RSVPs by the same user for the same event will be rejected with a `409 Conflict` error.

---

## 5. Cancel RSVP
Removes the authenticated user's RSVP for the event.

**Endpoint**: `DELETE /:id/rsvp`

**Headers**:
- `Authorization`: Bearer <user_token>

**Request Body**:
```json
{
  "userId": "uuid-string"
}
```

**Example Response**:
```json
{
  "success": true,
  "message": "RSVP cancelled",
  "data": {
    "hasRsvp": false,
    "attendingCount": 29
  }
}
```

---

## 6. Get Categories
Retrieves the list of active event categories (useful for building filter tabs). Includes an "All" category by default.

**Endpoint**: `GET /categories`

**Example Response**:
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    { "id": "all",     "label": "All",     "color": null,      "sortOrder": -1 },
    { "id": "uuid1",   "label": "Worship", "color": "#3b5bdb", "sortOrder": 0  },
    { "id": "uuid2",   "label": "Study",   "color": "#f97316", "sortOrder": 1  },
    { "id": "uuid3",   "label": "Youth",   "color": "#16a34a", "sortOrder": 2  },
    { "id": "uuid4",   "label": "Prayer",  "color": "#7c3aed", "sortOrder": 3  }
  ]
}
```

---

## Error Responses

All endpoints use standard HTTP status codes:
- `400 Bad Request`: Validation errors (missing required fields)
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Event or Category not found
- `409 Conflict`: User has already RSVP'd to this event
- `500 Internal Server Error`: Something went wrong on the server

**Error Format**:
```json
{
  "success": false,
  "message": "Error description",
  "errorMessages": [
    { "path": "field_name", "message": "Specific field error" }
  ]
}
```
