# Push Notifications API Integration (Flutter)

This document outlines how the Flutter app should communicate with the backend to enable push notifications using Firebase Cloud Messaging (FCM).

## 1. Backend API Endpoint

You need to send the device's FCM token to the backend so we know where to route the notifications.

- **URL:** `{{BASE_URL}}/api/v1/notifications/save-token`
- **Method:** `POST`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer <user_token>` *(Optional, if the user is currently logged in)*

**Request Body JSON:**
```json
{
  "token": "fcm_device_token_here",
  "user": "65b2a1... (Optional: MongoDB User ID if logged in)",
  "platform": "android" // Can be "android", "ios", or "web"
}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Device token saved successfully",
  "data": {
    "token": "fcm_device_token_here",
    "user": null,
    "platform": "android",
    "_id": "6678...",
    "createdAt": "2024-06-21T...",
    "updatedAt": "2024-06-21T..."
  }
}
```

---

## 2. Flutter Implementation Guide

### Step 1: Add Dependencies
Add the required Firebase and HTTP packages to your `pubspec.yaml`:
```yaml
dependencies:
  firebase_core: ^latest_version
  firebase_messaging: ^latest_version
  http: ^latest_version
```

### Step 2: Request Permissions & Send Token to Backend
Here is the Dart implementation to get the token, handle permissions (for iOS/Android 13+), and send it to our backend API:

```dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io' show Platform;

class PushNotificationService {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;

  Future<void> init() async {
    // 1. Request permission (required for iOS and Android 13+)
    NotificationSettings settings = await _fcm.requestPermission();
    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('User granted notification permission');
    }

    // 2. Get the FCM device token
    String? token = await _fcm.getToken();
    if (token != null) {
      print("FCM Token: $token");
      await saveTokenToBackend(token);
    }

    // 3. Listen for token refreshes (in case the token expires/changes)
    _fcm.onTokenRefresh.listen((newToken) {
      saveTokenToBackend(newToken);
    });
  }

  Future<void> saveTokenToBackend(String token) async {
    // OPTIMIZATION: Only send to backend if the token is new or changed
    // SharedPreferences prefs = await SharedPreferences.getInstance();
    // String? savedToken = prefs.getString('fcm_token');
    // if (savedToken == token) return; // Already saved to backend, skip!

    final String platform = Platform.isIOS ? 'ios' : 'android';
    
    try {
      final response = await http.post(
        // Replace with your actual live/dev API URL
        Uri.parse('https://your-api-domain.com/api/v1/notifications/save-token'),
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer YOUR_USER_TOKEN', // If user is logged in
        },
        body: jsonEncode({
          'token': token,
          'platform': platform,
          // 'user': 'USER_ID', // Provide if user is logged in
        }),
      );

      if (response.statusCode == 200) {
        print('Token successfully saved to the backend!');
        // await prefs.setString('fcm_token', token); // Save locally after success
      } else {
        print('Failed to save token: ${response.body}');
      }
    } catch (e) {
      print('Error sending token to backend: $e');
    }
  }
}
```

### Step 3: Handling Incoming Notifications & Deep Linking
Make sure to also implement the standard Firebase message handlers in your app to show the notifications when the app is open or in the background:
- `FirebaseMessaging.onMessage.listen(...)` (Foreground)
- `FirebaseMessaging.onBackgroundMessage(...)` (Background/Terminated)

When the backend automatically sends a notification (e.g., when an Admin adds a new Sermon), it will attach a **data payload** to the notification.

**Example Data Payload from Backend:**
```json
{
  "type": "sermon",
  "id": "6678abc123..."
}
```

**Flutter Deep Linking Implementation:**
When the user taps the notification, you can extract the `type` and `id` to navigate directly to the correct screen:

```dart
// 1. Handle notification tap when app is in background but alive
FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
  _handleNotificationInteraction(message);
});

// 2. Handle notification tap when app was completely terminated
FirebaseMessaging.instance.getInitialMessage().then((RemoteMessage? message) {
  if (message != null) {
    _handleNotificationInteraction(message);
  }
});

void _handleNotificationInteraction(RemoteMessage message) {
  if (message.data.isNotEmpty) {
    final String? type = message.data['type'];
    final String? id = message.data['id'];

    if (type == 'sermon' && id != null) {
      // Navigate to the Sermon Details screen using your router
      // Navigator.pushNamed(context, '/sermon-details', arguments: id);
      print('Navigate to sermon with ID: $id');
    }
  }
}
```
