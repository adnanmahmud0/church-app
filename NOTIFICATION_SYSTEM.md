# Push Notification System Documentation

This document outlines the Push Notification system structure from the backend to the mobile app client. It details the different types of notifications sent by the system, their data payloads, and how the mobile app should handle them.

## Overview
The backend uses Firebase Cloud Messaging (FCM) via the `firebase-admin` SDK to send notifications. It uses two delivery methods:
1. **Topic Messaging**: Used for broad broadcasts (e.g., all users subscribed to `sermon`, `service_reminder`, or `custom` topics).
2. **Targeted Multicast**: Used for specific user groups (e.g., event RSVP participants or prayer authors).

When a push notification is sent, a `data` payload is attached alongside the standard `title` and `body`. This `data` payload is crucial for deep-linking and in-app routing when the user taps the notification.

---

## 1. Firebase Backend Setup (For Backend/Admin)

For notifications to work, the backend requires a Firebase Admin SDK private key.
1. Go to your Firebase Console -> Project Settings -> Service Accounts.
2. Click "Generate new private key".
3. Save the downloaded JSON file.
4. Convert the JSON file content to a base64 string or set the individual environment variables in your `.env` file as required by your `firebase.ts` configuration (e.g., `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).

---

## 2. API Endpoints

### Register Device Token
To send targeted notifications to a user, the backend must know their current FCM device token. The app should call this endpoint every time the user logs in or launches the app.

- **Endpoint**: `POST /api/v1/notifications/device-token`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "token": "dck_1x...fcm_token_string",
  "userId": "64a2b1... (optional, inferred from auth token if omitted)",
  "deviceType": "android" // 'android' | 'ios' | 'web'
}
```

---

## 3. Notification Types & Payloads

Your app should parse the `data.type` field from the notification payload to determine the routing or action to perform. Below are the supported notification types:

### 1. New Sermon
Triggered automatically when the admin uploads a new Sermon video.

- **Topic**: `sermon`
- **Data Payload**:
```json
{
  "type": "sermon",
  "id": "64a2b1c3e4b0f9a12d3c4e5f" // The ID of the newly created sermon
}
```
- **App Action**: Navigate to the Sermon Details/Player screen and load the sermon using the provided `id`.

### 2. New Devotional
Triggered automatically when the admin posts or publishes a Devotional.

- **Topic**: `devotional`
- **Data Payload**:
```json
{
  "type": "devotional",
  "devotionalId": "64b3c2d4e5f0g9a12d3c4e5f" // The ID of the newly created devotional
}
```
- **App Action**: Navigate to the Devotional details screen and load the devotional using the provided `devotionalId`.

### 3. Event Reminder & Start
Triggered for users who have RSVP'd to a specific event. This is sent based on the admin's configured reminder timings (e.g., 60 mins before) and exactly when the event starts.

- **Delivery**: Targeted multicast (only sent to users who RSVP'd)
- **Data Payload**:
```json
{
  "type": "event",
  "eventId": "64b3c2d4e5f0g9a12d3c4e5f" // The ID of the event starting/reminding
}
```
- **App Action**: Navigate to the Event Details screen using the provided `eventId`.

### 4. Prayer interaction
Triggered when someone interacts with a user's prayer request (e.g., clicking "I Prayed For This").

- **Delivery**: Targeted strictly to the original author of the prayer.
- **Data Payload**:
```json
{
  "type": "prayer",
  "id": "64c4d3e5f6g0h9a12d3c4e5f" // The ID of the prayer request
}
```
- **App Action**: Navigate to the specific Prayer Request screen so the author can see the interactions.

### 5. Sunday Service Reminder & Start
Triggered based on the admin's globally configured Sunday Service schedule.

- **Topic**: `service_reminder`
- **Data Payload**:
```json
{
  "type": "service_reminder"
}
```
- **App Action**: Navigate to the Sunday Service/Live Stream screen, or show a generic alert since no specific entity ID is attached.

### 6. Custom Admin Notifications
Triggered manually by the admin from the Notification dashboard. This allows the admin to broadcast generic announcements or link to external URLs.

- **Topic**: `custom`
- **Data Payload**:
```json
{
  "type": "custom",
  "url": "https://example.com/announcement" // Optional: A URL provided by the admin
}
```
- **App Action**: If a `url` is provided, open it in an in-app WebView or the device's default browser. If no `url` is provided, simply show the notification alert or route to the app's home screen.

---

## Handling Notifications on the Client (App)

To ensure these notifications work seamlessly, the app developer must:

1. **Register the Device Token**: When the user logs in or opens the app, retrieve the FCM token and send it to the backend to register the device.
   - `POST /api/v1/notifications/device-token`
   - Body: `{ "token": "fcm_token_here", "userId": "user_id_here", "deviceType": "ios|android" }`

2. **Subscribe to Topics**: Ensure the app subscribes the user to the generic Firebase topics upon initialization (if you prefer handling topic subscriptions directly on the client side):
   - `sermon`
   - `devotional`
   - `service_reminder`
   - `custom`
   *(Alternatively, the backend can subscribe the raw tokens to these topics if preferred, but client-side topic subscription via the Firebase SDK is the standard approach).*

3. **Background & Foreground Handlers**:
   - Parse `message.data.type`.
   - Dispatch to your navigation router (e.g., deep linking logic) passing the associated ID (like `id`, `eventId`, or `devotionalId`) as a navigation argument.

---

## User Notification Preferences

The system allows users to turn specific notifications on or off. The user profile (`GET /api/v1/user/profile`) now includes a `notificationPreferences` object:

```json
"notificationPreferences": {
  "sermon": true,
  "devotional": true,
  "event": true,
  "prayer": true,
  "service_reminder": true,
  "custom": true
}
```

You can update these settings via `PATCH /api/v1/user/update-profile`.

### How these preferences are enforced:
1. **Targeted Notifications (`event`, `prayer`)**: The backend enforces these automatically. If the user sets `"event": false`, the backend will simply skip sending them the event reminder push.
2. **Topic-Based Notifications (`sermon`, `devotional`, `service_reminder`, `custom`)**: The backend broadcasts these to Firebase topics and *cannot* skip individual users. **The app developer must handle this.** 
   - When the user toggles one of these off in your app settings, you must call the Firebase SDK to unsubscribe them from that topic (e.g., `messaging().unsubscribeFromTopic('sermon')`).
   - When they toggle it back on, call `messaging().subscribeToTopic('sermon')`.
