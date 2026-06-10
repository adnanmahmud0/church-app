# Community Module API Documentation

The Community module is a directory of church group links. Members see a list of community groups and tap Join to open the external group link (WhatsApp, Facebook, Telegram, etc.) in their device. No in-app messaging — the app only stores and displays the links.

**Base URL**: `https://your-api-domain.com/api/v1/community`

**Authentication:**
- List/detail endpoints are public.
- Admin endpoints require admin token (`Authorization: Bearer <token>`).

## Platform Values Reference

| platform | platformLabel |
|---|---|
| whatsapp | WhatsApp |
| facebook | Facebook Group |
| telegram | Telegram |
| messenger | Messenger |
| other | Community |

---

## 1. Get All Groups
Retrieves all active community groups, sorted by `sortOrder`. Admin sees all groups including inactive ones.

**Endpoint**: `GET /`

**Example Request**:
```
GET /api/v1/community
```

**Example Response**:
```json
{
  "success": true,
  "message": "Community groups retrieved successfully",
  "data": [
    {
      "id": "60d0fe4f5311236168a109ca",
      "title": "Building Fund Update",
      "description": "We've reached 68% of our building fund goal! Thank you for your generous giving.",
      "joinLink": "https://chat.whatsapp.com/xxxxx",
      "platform": "whatsapp",
      "platformLabel": "WhatsApp",
      "sortOrder": 1,
      "isActive": true,
      "createdAt": "2023-10-25T10:00:00.000Z"
    }
  ]
}
```

## 2. Get Group Details
Retrieves a single group detail.

**Endpoint**: `GET /:id`

---

## 3. Create Group (Admin)
Create a new community group.

**Endpoint**: `POST /`

**Body**:
```json
{
  "title": "Youth Night: Ignite — This Friday",
  "description": "All teens and young adults (13–25) are invited...",
  "joinLink": "https://chat.whatsapp.com/xxxxx",
  "platform": "whatsapp",
  "sortOrder": 2,
  "isActive": true
}
```

## 4. Update Group (Admin)
Update an existing group. All fields are optional.

**Endpoint**: `PATCH /:id`

**Body**: (Same as Create Group)

## 5. Delete Group (Admin)
Soft deletes a community group (sets `isActive` to false).

**Endpoint**: `DELETE /:id`

## 6. Reorder Groups (Admin)
Update the sort order for multiple items at once.

**Endpoint**: `PATCH /reorder`

**Body**:
```json
{
  "items": [
    { "id": "uuid1", "sortOrder": 1 },
    { "id": "uuid2", "sortOrder": 2 }
  ]
}
```

## 7. Get Stats (Admin)
Retrieves statistics for the community module.

**Endpoint**: `GET /stats`

**Example Response**:
```json
{
  "success": true,
  "data": {
    "totalGroups": 8,
    "activeGroups": 6,
    "byPlatform": [
      { "platform": "whatsapp", "count": 4 },
      { "platform": "facebook", "count": 2 }
    ]
  }
}
```

---

> [!NOTE]
> The `joinLink` is an external URL. The mobile app opens it with `Linking.openURL()` on React Native (or `window.open()` on web). The backend does not validate whether the link is still active.
