# Push Notification System Documentation

This document outlines the Push Notification system structure from the backend to the mobile app client. It details the different types of notifications sent by the system, their data payloads, and how the mobile app should handle them.

## Overview
The backend uses Firebase Cloud Messaging (FCM) to send notifications. It uses two delivery methods:
1. **Topic Messaging**: Used for broad broadcasts (e.g., all users subscribed to `sermon`, `service_reminder`, or `custom` topics).
2. **Targeted Multicast**: Used for specific user groups (e.g., event RSVP participants or prayer authors).

When a push notification is sent, a `data` payload is attached alongside the standard `title` and `body`. This `data` payload is crucial for deep-linking and in-app routing when the user taps the notification.

---

## Notification Types & Payloads

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

### 2. Event Reminder & Start
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

### 3. Prayer interaction
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

### 4. Sunday Service Reminder & Start
Triggered based on the admin's globally configured Sunday Service schedule.

- **Topic**: `service_reminder`
- **Data Payload**:
```json
{
  "type": "service_reminder"
}
```
- **App Action**: Navigate to the Sunday Service/Live Stream screen, or show a generic alert since no specific entity ID is attached.

### 5. Custom Admin Notifications
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
   - `service_reminder`
   - `custom`
   *(Alternatively, the backend can subscribe the raw tokens to these topics if preferred, but client-side topic subscription via the Firebase SDK is the standard approach).*

3. **Background & Foreground Handlers**:
   - Parse `message.data.type`.
   - Dispatch to your navigation router (e.g., deep linking logic) passing the associated ID (like `id` or `eventId`) as a navigation argument.
