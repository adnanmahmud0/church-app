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
1. Request notification permissions from the user.
2. Retrieve the device's FCM token using the Firebase SDK.
3. Make an HTTP POST request to our `/api/v1/notifications/save-token` endpoint (as documented in Section 1) to save the token.
4. Listen for token refresh events and ensure the new token is also synced to the backend.

### Step 3: Handling Incoming Notifications & Deep Linking
When the backend automatically sends a notification, it will attach a **data payload** containing a `type` string to help the app route the user properly.

#### Supported Notification Types
Currently, the backend sends **3 types of notifications**, each with a specific `type` identifier in the data payload:

1. **New Sermon (`sermon`)**: Sent automatically when an Admin adds a new sermon. Includes the sermon ID.
   - Payload: `{ "type": "sermon", "id": "<sermon_id>" }`
   - Action: Navigate the user to the Sermon Details screen for this specific ID.
2. **Sunday Service (`service_reminder`)**: Sent before the Sunday service (e.g., 60 mins before) AND at the exact time the service starts.
   - Payload: `{ "type": "service_reminder" }`
   - Action: Navigate the user to the Sunday Service / Live Stream screen.
3. **Custom/Manual (`custom`)**: Sent manually by the Admin from the Push Notifications dashboard.
   - Payload: `{ "type": "custom" }`
   - Action: Navigate to a generic notifications center, or simply do nothing special and let the user open the app normally.
