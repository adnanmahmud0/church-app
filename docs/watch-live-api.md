# Watch Live API Documentation

The Watch Live module lets users watch the church's live stream or recent services. YouTube is integrated via the YouTube Data API v3 — live status and past videos are fetched automatically. Other platforms (Facebook Live, etc.) are configured by the admin as external links that the app opens in the browser.

**Base URL**: `https://your-api-domain.com/api/v1/watch-live`

> [!IMPORTANT]
> - All `GET` endpoints are public.
> - All admin/settings endpoints (POST, PATCH, DELETE) require a valid admin token (Authorization: Bearer).
> - **The YouTube API key is stored server-side only.** The mobile app never receives it. All YouTube data is proxied through the backend.

---

## Public Endpoints

### 1. Get YouTube Live Status
Call this on app launch and every 60 seconds while the Watch Live screen is open. Use the `isLive` boolean to show/hide the live banner.

**Request:** `GET /api/v1/watch-live/youtube/status`

**Response:**
```json
{
  "success": true,
  "data": {
    "isLive": true,
    "liveStream": {
      "videoId": "abc123",
      "title": "Sunday Worship Service",
      "channelTitle": "PIWC Stoneyburn",
      "thumbnailUrl": "https://i.ytimg.com/vi/abc123/maxresdefault.jpg",
      "watchUrl": "https://www.youtube.com/watch?v=abc123",
      "startedAt": "2026-06-01T10:00:00Z"
    },
    "upcomingStream": null
  }
}
```

### 2. Get Recent YouTube Videos
Returns recent past videos from the channel.

**Request:** `GET /api/v1/watch-live/youtube/recent?limit=10`

> [!NOTE]
> Duration is returned as a human-readable string (e.g. '2h 15min') — no parsing needed on the client.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "videoId": "xyz789",
      "title": "Sunday Service — 4 May 2026",
      "channelTitle": "PIWC Stoneyburn",
      "thumbnailUrl": "https://i.ytimg.com/vi/xyz789/mqdefault.jpg",
      "watchUrl": "https://www.youtube.com/watch?v=xyz789",
      "duration": "2h 15min",
      "publishedAt": "2026-05-04T13:30:00Z",
      "publishedFormatted": "4 May 2026"
    }
  ]
}
```

### 3. Get Channel Info
**Request:** `GET /api/v1/watch-live/youtube/channel`

**Response:**
```json
{
  "success": true,
  "data": {
    "channelId": "UCxxxxxx",
    "channelTitle": "PIWC Stoneyburn",
    "channelUrl": "https://www.youtube.com/channel/UCxxxxxx",
    "subscriberCount": "1240",
    "thumbnailUrl": "https://..."
  }
}
```

### 4. Get Streaming Platforms
Returns all configured streaming platforms (YouTube + manual platforms).

**Request:** `GET /api/v1/watch-live/platforms`

> [!NOTE]
> Use the `watchUrl` field. Open with `Linking.openURL()` on React Native.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "youtube_id",
      "label": "YouTube Live",
      "description": "Opens YouTube in browser",
      "icon": "youtube",
      "color": "#FF0000",
      "isYoutube": true,
      "isActive": true,
      "watchUrl": null
    }
  ]
}
```

### 5. Get Service Info
Returns static church service times and address.

**Request:** `GET /api/v1/watch-live/service-info`

**Response:**
```json
{
  "success": true,
  "data": {
    "schedule": "Every Sunday",
    "time": "10:00 AM – 12:30 PM",
    "address": "71 Stoneyburn Street, EH47 8JT"
  }
}
```

---

## Admin Endpoints (Auth Required)

### 1. Get Settings
**Request:** `GET /api/v1/watch-live/settings`

**Response:**
```json
{
  "success": true,
  "data": {
    "youtubeApiKey": "AIzaSy••••••••••••••••••8D94",
    "youtubeChannelId": "UCxxxxxx",
    "serviceSchedule": "Every Sunday",
    "serviceTime": "10:00 AM – 12:30 PM",
    "serviceAddress": "71 Stoneyburn Street, EH47 8JT"
  }
}
```

### 2. Update Settings
**Request:** `PATCH /api/v1/watch-live/settings`

**Body:**
```json
{
  "youtubeApiKey": "new_api_key_here",
  "youtubeChannelId": "UCxxxxxx",
  "serviceSchedule": "Every Sunday",
  "serviceTime": "10:00 AM – 12:30 PM",
  "serviceAddress": "71 Stoneyburn Street, EH47 8JT"
}
```

### 3. Test YouTube Connection
**Request:** `POST /api/v1/watch-live/settings/test-youtube`

**Body:** (Optional, will use saved DB keys if omitted)
```json
{
  "youtubeApiKey": "optional_override_key",
  "youtubeChannelId": "optional_override_channel_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "channelTitle": "PIWC Stoneyburn"
  }
}
```

### 4. Add Platform
**Request:** `POST /api/v1/watch-live/platforms`

**Body:**
```json
{
  "label": "Facebook Live",
  "description": "Opens Facebook in browser",
  "icon": "facebook",
  "color": "#1877F2",
  "watchUrl": "https://www.facebook.com/PIWCStoneyburn/live",
  "isActive": true
}
```

### 5. Update Platform
**Request:** `PATCH /api/v1/watch-live/platforms/:id`

### 6. Delete Platform
**Request:** `DELETE /api/v1/watch-live/platforms/:id`

### 7. Reorder Platforms
**Request:** `PATCH /api/v1/watch-live/platforms/reorder`
**Body:**
```json
{
  "items": [
    { "id": "platform_id_1", "sortOrder": 1 },
    { "id": "platform_id_2", "sortOrder": 2 }
  ]
}
```
