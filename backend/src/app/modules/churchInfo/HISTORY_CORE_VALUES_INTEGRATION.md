# History & Core Values — Flutter Integration Guide

## 1. Overview
- This screen displays static CMS content managed by the admin.
- Single API endpoint, no authentication required.
- Content: A single HTML formatted string containing Our History, Our Mission, and Core Values.
- Admin can update content anytime via a rich text editor — app always fetches latest on screen open.
- The Flutter app should render this HTML content using a package like `flutter_html`.

---

## 2. Base URL & Environment
- Env variable name used in this project: `NEXT_PUBLIC_API_URL` (in backend it uses `PORT` or frontend uses `.env` file). For Flutter, use standard `API_BASE_URL`.
- Example `.env` entry:
  ```env
  API_BASE_URL=http://localhost:5000
  ```
- How to set base URL in Flutter:
  ```dart
  const String API_BASE_URL = String.fromEnvironment('API_BASE_URL', defaultValue: 'http://localhost:5000');
  ```

---

## 3. API Reference

### GET /api/v1/church-info

**Description:** Returns the full History & Core Values HTML content.

**Authentication:** None required.

**Request:**
- Method: GET
- URL: `<BASE_URL>/api/v1/church-info`
- Headers: `Content-Type: application/json`
- No query params, no body

**Success Response — 200 OK:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Church info retrieved successfully",
  "data": {
    "content": "<h2>Our History</h2><p>Founded with a vision...</p><h2>Our Mission</h2><p>To empower...</p><h2>Core Values</h2><ul><li>...</li></ul>",
    "updated_at": "2025-05-04T10:30:00.000Z",
    "updated_by": "Admin"
  }
}
```

**Error Responses:**
| Status | Meaning | Flutter should do |
|--------|---------|-------------------|
| 500 | Server error | Show error state with retry button |
| Network error | No connection | Show offline message with retry |

---

## 4. Dart Model Classes

Provide complete, copy-pasteable Dart model classes:

```dart
class ChurchInfoResponse {
  final bool success;
  final String message;
  final ChurchInfo data;

  ChurchInfoResponse({
    required this.success,
    required this.message,
    required this.data,
  });

  factory ChurchInfoResponse.fromJson(Map<String, dynamic> json) {
    return ChurchInfoResponse(
      success: json['success'] as bool,
      message: json['message'] as String,
      data: ChurchInfo.fromJson(json['data'] as Map<String, dynamic>),
    );
  }
}

class ChurchInfo {
  final String content;
  final DateTime updatedAt;

  ChurchInfo({
    required this.content,
    required this.updatedAt,
  });

  factory ChurchInfo.fromJson(Map<String, dynamic> json) {
    return ChurchInfo(
      content: json['content'] as String,
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }
}
```

---

## 5. API Service Class

Provide a complete ChurchInfoService class:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ChurchInfoService {
  static const String _baseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: 'http://localhost:5000');

  Future<ChurchInfo> getChurchInfo() async {
    final response = await http
        .get(
          Uri.parse('$_baseUrl/api/v1/church-info'),
          headers: {'Content-Type': 'application/json'},
        )
        .timeout(const Duration(seconds: 10));

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body) as Map<String, dynamic>;
      final apiResponse = ChurchInfoResponse.fromJson(json);
      if (apiResponse.success) {
        return apiResponse.data;
      } else {
        throw Exception(apiResponse.message);
      }
    } else {
      throw Exception('Failed to load church info: ${response.statusCode}');
    }
  }
}
```

---

## 6. Screen Integration — Step by Step

### 6.1 On Screen Open
1. Call ChurchInfoService().getChurchInfo()
2. While loading: show CircularProgressIndicator centered on screen
3. On success: render HTML content (see layout below)
4. On error: show error widget with "Failed to load content" message and "Retry" button
   that calls the API again

### 6.2 Screen Layout (matches UI screenshots)
Top to bottom in a SingleChildScrollView:

1. AppBar: title "History & Core Values", back arrow, no actions
2. Padding: 16px horizontal, 24px vertical on all content
3. Section — Content:
   - Use `flutter_html` to render `churchInfo.content`.
   - Setup custom styles for tags like `h2` (white, bold, size 22), `p` (light gray, size 15, height 1.6), and `ul`/`li`.

### 6.3 Colors (match existing app dark navy theme)
- Background: #0D1B4B (or match existing app theme color)
- Section heading: white (#FFFFFF)
- Body text / descriptions: #C5CAE9 or similar light gray-white
- Bullet value title: white, bold
- AppBar background: same as screen background or slightly darker

---

## 7. Error & Loading States

| State | What to show |
|-------|-------------|
| Loading | Centered CircularProgressIndicator |
| Success | Full scrollable content rendering HTML |
| Network error | Icon + "No internet connection" + Retry button |
| Server error (500) | Icon + "Something went wrong" + Retry button |

---

## 8. Caching (Optional but Recommended)

To avoid loading on every screen open:
- Cache the API response in memory or shared_preferences
- Cache duration: 1 hour
- On screen open: show cached content immediately, then refresh in background
- Update cache after successful refresh

---

## 9. Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| API_BASE_URL | Backend base URL | https://api.yourchurch.com |

Set in Flutter using --dart-define or flutter_dotenv.

---

## 10. Dependencies

Add to pubspec.yaml if not already present:
```yaml
dependencies:
  http: ^1.2.0
  flutter_html: ^3.0.0-alpha.6 # Used to render the HTML returned from the server
```

---

## 11. Developer Checklist

- [ ] API_BASE_URL configured in Flutter environment
- [ ] ChurchInfoResponse and ChurchInfo model classes added
- [ ] ChurchInfoService added
- [ ] `flutter_html` installed to render content
- [ ] Screen shows loading spinner while fetching
- [ ] Content is parsed and displayed as HTML correctly
- [ ] Error state shown with Retry button on failure
- [ ] Retry button re-fetches from API
- [ ] Screen matches dark navy design from screenshots
- [ ] AppBar shows back arrow and correct title
