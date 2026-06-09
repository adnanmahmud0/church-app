# Sermons Feature — App Integration Guide

## 1. Overview
The Sermons feature allows users to browse, search, filter, and listen to published church sermons. 
It consists of two main screens:
- **Sermons List**: A browsable list of all sermons, featuring a search bar and a series filter tab.
- **Sermon Detail**: A dedicated screen for a single sermon that includes an audio player, key scripture, tags, and a share button.

All Sermons endpoints are **public** and do not require any authentication.

---

## 2. Base URL & Environment Setup
The backend API base URL is defined by the `NEXT_PUBLIC_API_URL` environment variable.

Example `.env` entry:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

The app should configure its HTTP client (e.g., Axios or fetch) to use this base URL.
Example Axios setup:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

---

## 3. Authentication
**All Sermons endpoints are PUBLIC — no token required.**

However, for reference (in case future endpoints are protected), the app stores authentication tokens using the `token` key (along with `refreshToken` for re-authentication). In the web frontend, this is managed via `Cookies.get('token')`. In a mobile context, it is typically managed via SecureStorage or AsyncStorage.

When required, the header format is:
```
Authorization: Bearer <token>
```

---

## 4. API Endpoints — Full Reference

### 4.1 GET /api/v1/sermons
List published sermons with optional search and series filter.

**Query Parameters:**
| Name | Type | Required | Description |
|---|---|---|---|
| search | string | No | Search query to filter by title, speaker, or tags. |
| series_id | string | No | Filter sermons by a specific series ID. |
| page | number | No | Page number for pagination (default: 1). |
| limit | number | No | Number of items per page (default: 20). |

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Sermons retrieved successfully",
  "data": {
    "data": [
      {
        "id": "60d5ecb8b392d7001f3e3a41",
        "title": "Faith in the Valley",
        "speaker": "Pastor John Doe",
        "series": {
          "id": "60d5ecb8b392d7001f3e3a55",
          "name": "Mountain Moving Faith"
        },
        "date": "2025-05-04T10:00:00.000Z",
        "duration_seconds": 2520,
        "audio_url": "http://localhost:5000/audio/sermon1.mp3",
        "thumbnail_url": "http://localhost:5000/image/sermon1_thumb.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "total_pages": 3,
      "has_next_page": true
    }
  }
}
```

**Error Responses:**
| Status Code | Meaning | App Should Do |
|---|---|---|
| 500 | Server Error | Show "Something went wrong. Please try again." |

### 4.2 GET /api/v1/sermons/latest
Get the most recently added sermons (used for the home page).

**Query Parameters:**
| Name | Type | Required | Description |
|---|---|---|---|
| limit | number | No | Number of latest sermons to retrieve (default: 3). |

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Latest sermons retrieved successfully",
  "data": [
    {
      "id": "60d5ecb8b392d7001f3e3a41",
      "title": "Faith in the Valley",
      "speaker": "Pastor John Doe",
      "date": "2025-05-04T10:00:00.000Z",
      "duration_seconds": 2520
    }
  ]
}
```

### 4.3 GET /api/v1/sermons/:id
Get full detail of a single sermon by ID.

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Sermon detail retrieved successfully",
  "data": {
    "id": "60d5ecb8b392d7001f3e3a41",
    "title": "Faith in the Valley",
    "speaker": "Pastor John Doe",
    "series": {
      "id": "60d5ecb8b392d7001f3e3a55",
      "name": "Mountain Moving Faith"
    },
    "date": "2025-05-04T10:00:00.000Z",
    "duration_seconds": 2520,
    "audio_url": "http://localhost:5000/audio/sermon1.mp3",
    "thumbnail_url": "http://localhost:5000/image/sermon1_thumb.jpg",
    "key_scripture": "Psalms 23:4",
    "description": "An in-depth look at holding onto faith during difficult seasons.",
    "tags": ["faith", "hope", "struggle"]
  }
}
```

**Error Responses:**
| Status Code | Meaning | App Should Do |
|---|---|---|
| 404 | Not Found | Show "Sermon not found" with a back button. |
| 500 | Server Error | Show "Something went wrong. Please try again." |

### 4.4 GET /api/v1/sermon-series
Get all active sermon series (used to populate filter tabs).

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Sermon series retrieved successfully",
  "data": [
    {
      "id": "60d5ecb8b392d7001f3e3a55",
      "name": "Mountain Moving Faith"
    }
  ]
}
```

### 4.5 POST /api/v1/user/profile/favorite-sermons/:sermonId
Toggle a sermon as a favorite for the currently authenticated user. Requires authentication token.

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Favorite sermon toggled successfully",
  "data": {
    "id": "userId123",
    "name": "John Doe",
    "favoriteSermons": ["60d5ecb8b392d7001f3e3a41"]
  }
}
```

### 4.6 GET /api/v1/user/profile/favorite-sermons
Retrieve the list of favorite sermons for the authenticated user.

**Query Parameters:**
| Name | Type | Required | Description |
|---|---|---|---|
| limit | number | No | Number of favorite sermons to retrieve (e.g. 3 for profile page). |

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Favorite sermons retrieved successfully",
  "data": [
    {
      "id": "60d5ecb8b392d7001f3e3a41",
      "title": "Faith in the Valley",
      "speaker": "Pastor John Doe"
    }
  ]
}
```

---

## 5. Data Models

### 5.1 Sermon (List Item)
```json
{
  "id": "60d5ecb8b392d7001f3e3a41",
  "title": "Faith in the Valley",
  "speaker": "Pastor John Doe",
  "series": {
    "id": "60d5ecb8b392d7001f3e3a55",
    "name": "Mountain Moving Faith"
  },
  "date": "2025-05-04T10:00:00.000Z",
  "duration_seconds": 2520,
  "audio_url": "http://localhost:5000/audio/sermon1.mp3",
  "thumbnail_url": "http://localhost:5000/image/sermon1_thumb.jpg"
}
```

### 5.2 Sermon (Detail — full object)
```json
{
  "id": "60d5ecb8b392d7001f3e3a41",
  "title": "Faith in the Valley",
  "speaker": "Pastor John Doe",
  "series": {
    "id": "60d5ecb8b392d7001f3e3a55",
    "name": "Mountain Moving Faith"
  },
  "date": "2025-05-04T10:00:00.000Z",
  "duration_seconds": 2520,
  "audio_url": "http://localhost:5000/audio/sermon1.mp3",
  "thumbnail_url": "http://localhost:5000/image/sermon1_thumb.jpg",
  "key_scripture": "Psalms 23:4",
  "description": "An in-depth look at holding onto faith during difficult seasons.",
  "tags": ["faith", "hope", "struggle"]
}
```

### 5.3 Sermon Series
```json
{
  "id": "60d5ecb8b392d7001f3e3a55",
  "name": "Mountain Moving Faith"
}
```

### 5.4 Paginated Response Wrapper
```json
{
  "data": [
    /* array of items */
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3,
    "has_next_page": true
  }
}
```

---

## 6. Screen Integration — Step by Step

### 6.1 Sermons List Screen

**On Mount:**
1. Call `GET /api/v1/sermon-series` → populate filter tabs. Prepend "All" tab (`series_id: null`).
2. Call `GET /api/v1/sermons?page=1&limit=20` → render initial sermon list.

**Search:**
3. Debounce user input 300ms.
4. Call `GET /api/v1/sermons?search=<query>&page=1`.
5. Replace current list with results (do not append).

**Series Filter:**
6. On tab press, call `GET /api/v1/sermons?series_id=<id>&page=1`.
7. "All" tab clears the `series_id` param.
8. Reset page to 1 on every filter change.

**Pagination:**
9. On scroll to bottom (or "Load More" press), increment page.
10. Call `GET /api/v1/sermons?page=<next>&limit=20` (preserve active search/series params).
11. Append new results to existing list.
12. Hide load trigger if `has_next_page` is false.

**Display:**
13. Duration: `Math.ceil(duration_seconds / 60) + " min"`
14. Date: format as "May 4, 2025"
15. Series name: uppercase, gold/yellow color
16. If `thumbnail_url` is null, show default blue gradient placeholder with play icon.

### 6.2 Sermon Detail Screen

**On Mount:**
1. Read `sermon_id` from navigation params.
2. Call `GET /api/v1/sermons/:id`.
3. Render all fields.

**Audio Player:**
4. Initialize player with `audio_url`.
5. If `audio_url` is null or load fails → show "Audio unavailable" message, hide player controls.
6. Play/Pause: toggle audio playback, update button icon.
7. Rewind: seek to `Math.max(0, currentTime - 15)`.
8. Forward: seek to `Math.min(duration, currentTime + 15)`.
9. Scrubber: bind to `currentTime`, allow drag to seek position.
10. Update current time display every second during playback (mm:ss format).

**Key Scripture:**
11. Display in dedicated card with "KEY SCRIPTURE" label.

**Tags:**
12. Render tags array as pill badges, each prefixed with "#".
13. If tags array is empty, hide the tags row.

**Share:**
14. On "Share This Sermon" press, trigger native share sheet.
15. Share text: `"<title> — <speaker>"`
16. Share URL: `<BASE_URL>/sermons/<id>` (e.g., frontend URL if applicable).

---

## 7. Helper Functions

### 7.1 Duration Formatting
```javascript
// "42 min" for sermon cards
function formatDuration(seconds) {
  return `${Math.ceil(seconds / 60)} min`;
}
```

### 7.2 Audio Time Formatting
```javascript
// "12:36" for audio player
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
```

### 7.3 Date Formatting
```javascript
// "May 4, 2025"
function formatSermonDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
```

### 7.4 Sermon API Service (axios example)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
});

class SermonService {
  static async getSermons({ search, series_id, page = 1, limit = 20 }) {
    const params = { page, limit };
    if (search) params.search = search;
    if (series_id) params.series_id = series_id;
    
    const response = await api.get('/sermons', { params });
    return response.data;
  }

  static async getSermonById(id) {
    const response = await api.get(`/sermons/${id}`);
    return response.data;
  }

  static async getSermonSeries() {
    const response = await api.get('/sermon-series');
    return response.data;
  }
}

export default SermonService;
```

---

## 8. UI Reference

### 8.1 Color Tokens
| Element | Color |
|---|---|
| Background | #0D1B4B (dark navy) |
| Card background | slightly lighter navy |
| Series name text | Gold / #FFD700 |
| Sermon title | White |
| Speaker name | Blue accent |
| Date / secondary text | Light gray |
| Duration | Gold |
| Active tab | White background, dark text |
| Inactive tab | Dark outlined |
| Audio progress bar fill | Blue |
| Play button | Blue circle |
| Scripture label | Gold uppercase |

### 8.2 Sermon Card Layout
- **Left**: 64×64 rounded square, blue gradient bg, yellow play icon centered.
- **Right column**: series name (small caps, gold) → title (bold white) → speaker (gray) → bottom row: date (left) + duration (right, gold).

### 8.3 Sermon Detail Layout
Top to bottom order:
1. Nav bar (back arrow, "Sermon" title, bookmark icon)
2. Header area (purple/blue gradient, mic icon, series badge)
3. Sermon title + speaker name + date/duration row
4. Audio player card
5. Key scripture card
6. About This Message + tags
7. Share button

---

## 9. States & Error Handling

| State | What to show |
|---|---|
| Loading list | Skeleton cards (3–4 placeholder rows) |
| Loading detail | Full screen spinner or skeleton |
| Empty search result | "No sermons found" with search icon |
| Empty series filter | "No sermons in this series yet" |
| API error (network) | "Could not load sermons. Tap to retry." |
| API error (500) | "Something went wrong. Please try again." |
| Sermon not found (404) | "Sermon not found" with back button |
| Audio load failure | "Audio unavailable" below player, hide controls |
| Audio buffering | Show loading indicator on play button |

---

## 10. Environment Variables

| Variable | Description | Example |
|---|---|---|
| NEXT_PUBLIC_API_URL | Backend API Base URL | http://localhost:5000/api/v1 |

---

## 11. App Developer Checklist

**Sermons List**
- [ ] Sermon list loads on screen mount
- [ ] Series filter tabs populated from API
- [ ] "All" tab shows all sermons
- [ ] Series tab filters correctly
- [ ] Search input debounced (300ms)
- [ ] Search filters by title, speaker, and tags
- [ ] Pagination works (load more on scroll)
- [ ] `has_next_page` hides load trigger when false
- [ ] Duration displayed as "X min"
- [ ] Date formatted as "Month D, YYYY"
- [ ] Tapping a card navigates to Sermon Detail with correct ID

**Sermon Detail**
- [ ] All sermon fields displayed correctly
- [ ] Audio player initializes with `audio_url`
- [ ] Play/pause works
- [ ] Rewind 15s works (clamps at 0)
- [ ] Forward 15s works (clamps at duration)
- [ ] Scrubber shows progress and allows seeking
- [ ] Current time updates every second during playback
- [ ] "Audio unavailable" shown if audio fails
- [ ] Key scripture card displayed
- [ ] Tags rendered as #pill badges
- [ ] Share button triggers native share sheet with title + URL

**Error & Edge Cases**
- [ ] Loading state shown during API calls
- [ ] Retry shown on network error
- [ ] Empty state shown when no results
- [ ] 404 handled on detail screen
- [ ] App does not crash if tags array is empty
- [ ] App does not crash if `thumbnail_url` is null
- [ ] App does not crash if `audio_url` is null

---

## 12. Notes for Backend Developer

- Ensure CORS is configured to allow requests from the mobile app's origin
- Ensure audio files are served with correct `Content-Type: audio/mpeg` (or appropriate type)
- Ensure audio URLs support HTTP Range requests (required for audio seeking on mobile)
- Ensure all list endpoints return the pagination wrapper consistently
- Tags should always be returned as an array (never null — return empty array if none)
- `thumbnail_url` and `audio_url` should be absolute URLs (not relative paths)
