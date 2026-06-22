# Guest Authentication & Device ID Flow

This document explains the new authentication flow that allows users to access the app's features (such as favorite sermons, event RSVPs, prayer requests, devotionals, and giving) as a **Guest**, without requiring them to register an account with an email and password.

## 1. Concept

When a user first opens the app, the app registers the device with the backend using a unique `deviceId`. The backend silently creates a **GUEST** user profile. The app receives a standard JWT `accessToken` and `refreshToken`. 

The app can then use this token to access authenticated routes. All data the guest creates (favorites, RSVPs, history) is saved to this guest profile. 

If the user later decides to register for an account or log in to an existing account, the app sends the `deviceId` along with the registration/login request. The backend will seamlessly upgrade the guest profile or link the device, **preserving all their guest data**.

---

## 2. API Endpoints

### Step 1: App Startup (Device Initialization)
Run this when the app first launches if the user is not already logged in.

- **URL:** `/auth/device-init`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "deviceId": "unique_device_uuid_here", // Required: Generate/store a UUID on the device
    "fcmToken": "firebase_fcm_token_here", // Required: For push notifications
    "platform": "android"                  // Required: "android" | "ios" | "web"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Device initialized successfully",
    "data": {
      "accessToken": "ey...",
      "refreshToken": "ey..."
    }
  }
  ```
> **Action:** Save the `accessToken` and `refreshToken` exactly as you would for a normal login. Use the `accessToken` in the `Authorization: Bearer <token>` header for all subsequent API calls.

### Step 2: User Registration (Upgrading Guest to Full User)
If the user decides to create a profile, call the register endpoint and include the `deviceId`. The backend will upgrade their guest record to a full user record.

- **URL:** `/user/register`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "deviceId": "unique_device_uuid_here" // Important! Include the same deviceId
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Account created successfully",
    "data": { ... }
  }
  ```

### Step 3: User Login (Linking Device)
If the user already has an account and logs in from a device that was operating as a guest, include the `deviceId` in the login request. The backend will link this device to the logged-in user and clean up the temporary guest profile.

- **URL:** `/auth/login`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "Password123!",
    "deviceId": "unique_device_uuid_here" // Important! Include the same deviceId
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "User login successful",
    "data": {
      "accessToken": "ey...",
      "refreshToken": "ey..."
    }
  }
  ```

---

## 3. UI/UX Considerations for App Developers

- **Guest State:** Even though the user hasn't provided a name or email, the API will treat them as logged in via the token. `GET /user/profile` will return a profile where `name` and `email` are `null` or missing, and `role` is `"GUEST"`.
- **Profile Screen:** If the `role` is `"GUEST"`, show UI elements that encourage the user to "Create Account" or "Log In".
- **Logout:** If a guest clicks "Log Out" (which is essentially clearing app data), you can clear the tokens. On next launch, calling `device-init` with the same `deviceId` will recover their guest profile and return new tokens.
