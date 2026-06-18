# Share URL API Guide for App Developers

This document explains how to retrieve the generated Deep Link (`share_url`) from the backend for sharing a specific sermon.

## 1. Overview
The backend automatically generates a Deep Link (`share_url`) for every sermon. You do not need to manually construct the deep link URL in the Flutter app. Instead, simply use the `share_url` string provided in the backend API response whenever the user taps the "Share" button.

---

## 2. API Endpoints

The `share_url` is automatically included in the response of the following `GET` endpoints:

### GET /api/v1/sermons/:id
Use this endpoint to get the full details of a specific sermon, which includes the ready-to-use share URL.

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Sermon detail retrieved successfully",
  "data": {
    "id": "6a3453e42c5ab9757793def6",
    "title": "Future Communications Representative",
    "speaker": "Curvo bellum...",
    "category": {
      "id": "6a20cb948b7b9e83fe28a658",
      "name": "Pearline Olsonmm"
    },
    "date": "2026-03-11T00:00:00.000Z",
    "duration_seconds": 128,
    "video_url": "Valetudo ascit...",
    "thumbnail_url": "...",
    "description": "Alii degenero...",
    "tags": [],
    "share_url": "https://church-app.com/share/sermons/6a3453e42c5ab9757793def6"
  }
}
```

*(Note: The `share_url` field is also returned in the paginated list endpoint `GET /api/v1/sermons` and the recent list `GET /api/v1/sermons/latest` inside each sermon object).*

---

## 3. Flutter Implementation Step

When implementing the share functionality in the mobile app, you can use the standard Flutter `share_plus` package (or similar) and pass the `share_url` variable.

**Example Pseudo-code:**
```dart
import 'package:share_plus/share_plus.dart';

void shareSermon(Sermon sermon) {
  // Share the sermon title and the deep link
  Share.share('${sermon.title} - ${sermon.speaker}\nListen here: ${sermon.shareUrl}');
}
```
