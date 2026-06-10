# Watch Live Feature — App Integration Guide

## 1. Overview
The Watch Live module handles fetching YouTube live stream status, recent videos, channel information, and custom streaming platforms.
It allows the app to display live indicators and video links to the congregation.

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

### 3.1 YouTube Live Stream
```json
{
  "videoId": "jNQXAC9IVRw",
  "title": "Sunday Worship Service - Live",
  "channelTitle": "Church Channel",
  "thumbnailUrl": "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
  "watchUrl": "https://www.youtube.com/watch?v=jNQXAC9IVRw",
  "startedAt": "2025-05-04T10:00:00.000Z",
  "scheduledAt": "2025-05-04T10:00:00.000Z",
  "scheduledAtFormatted": "May 4, 10:00 AM"
}
```

### 3.2 Platform
```json
{
  "id": "60d5ecb8b392d7001f3e3a41",
  "label": "Facebook Live",
  "description": "Watch our service on Facebook.",
  "icon": "facebook",
  "color": "#1877F2",
  "isYoutube": false,
  "isActive": true,
  "watchUrl": "https://facebook.com/church/live",
  "sortOrder": 1
}
```

---

## 4. Public API Endpoints (App Developer)

### 4.1 GET /api/v1/watch-live/youtube/status
Fetch the current live stream status (if the church is currently live or has an upcoming stream).

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "YouTube status fetched successfully",
  "data": {
    "isLive": true,
    "liveStream": {
      "videoId": "jNQXAC9IVRw",
      "title": "Sunday Worship Service - Live",
      "channelTitle": "Church Channel",
      "thumbnailUrl": "https://i.ytimg.com/vi/...",
      "watchUrl": "https://www.youtube.com/watch?v=...",
      "startedAt": "2025-05-04T10:00:00.000Z"
    },
    "upcomingStream": null
  }
}
```

### 4.2 GET /api/v1/watch-live/youtube/recent
Fetch a list of recent videos from the church's YouTube channel.

**Query Parameters:**
| Name | Type | Required | Description |
|---|---|---|---|
| limit | number | No | Number of recent videos to return (default: 10). |

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Recent videos fetched successfully",
  "data": [
    {
      "videoId": "jNQXAC9IVRw",
      "title": "Sunday Worship Service - Archive",
      "channelTitle": "Church Channel",
      "thumbnailUrl": "https://i.ytimg.com/vi/...",
      "watchUrl": "https://www.youtube.com/watch?v=...",
      "duration": "1:30:00",
      "publishedAt": "2025-05-03T10:00:00.000Z",
      "publishedFormatted": "May 3, 2025"
    }
  ]
}
```

### 4.3 GET /api/v1/watch-live/youtube/channel
Fetch the YouTube channel's basic information (subscriber count, thumbnail).

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Channel info fetched successfully",
  "data": {
    "channelId": "UC...",
    "channelTitle": "Church Channel",
    "channelUrl": "https://youtube.com/channel/...",
    "subscriberCount": "1000",
    "thumbnailUrl": "https://yt3.ggpht.com/..."
  }
}
```

### 4.4 GET /api/v1/watch-live/platforms
Fetch the active alternative streaming platforms (e.g., Facebook, Twitch, Web).

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Platforms fetched successfully",
  "data": [
    {
      "id": "60d5ecb8b392d7001f3e3a41",
      "label": "Facebook Live",
      "description": "Watch our service on Facebook.",
      "icon": "facebook",
      "color": "#1877F2",
      "isYoutube": false,
      "isActive": true,
      "watchUrl": "https://facebook.com/church/live",
      "sortOrder": 1
    }
  ]
}
```

### 4.5 GET /api/v1/watch-live/service-info
Fetch the basic church service information (schedule, time, address).

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Service info fetched successfully",
  "data": {
    "schedule": "Every Sunday",
    "time": "10:00 AM",
    "address": "123 Church St, City, ST 12345"
  }
}
```

---

## 6. App Developer Checklist

**Watch Live Screen Integration:**
- [ ] Query `GET /api/v1/watchLive/youtube/status` to determine if there is an active or upcoming live stream.
- [ ] If `isLive` is true, display a prominent LIVE badge and stream player/link using `liveStream.watchUrl`.
- [ ] Fetch the recent video archive using `GET /api/v1/watchLive/youtube/recent`.
- [ ] Fetch and display alternate streaming platforms using `GET /api/v1/watchLive/platforms`.
- [ ] Fetch and display the physical service address using `GET /api/v1/watchLive/service-info`.
