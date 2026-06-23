# App Developer Update: Registration Flow Changes

This document outlines the recent backend changes to the user registration flow, which require adjustments on the mobile app side.

## 1. OTP Verification Removed
The backend no longer requires users to verify their email via OTP immediately after registration.
- **Backend Change**: Users are now created with `verified: true` by default.
- **Action Required**: You no longer need to navigate the user to an "OTP Verification" screen after they successfully register.

## 2. Auto-Login on Registration
The backend has been updated to automatically return an `accessToken` and `refreshToken` when a user registers, exactly like the Login endpoint does.

- **Backend Change**: The response from `POST /api/v1/user/register` has changed. It now includes the tokens inside the `data` object.

### New API Response for `/api/v1/user/register`
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User created successfully",
  "data": { 
    "user": { 
      "_id": "...",
      "name": "John Doe",
      "email": "user@email.com",
      "role": "USER",
      "verified": true,
      // ...other user fields
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR..."
  }
}
```

- **Action Required**: 
  1. Update your API parsing logic for the registration endpoint to handle the nested `data.user`, `data.accessToken`, and `data.refreshToken`.
  2. Save the `accessToken` and `refreshToken` locally exactly how you do during a normal Login. Depending on your framework, this is usually stored in:
     - **Flutter**: `flutter_secure_storage` or `shared_preferences`
     - **React Native**: `AsyncStorage` or `SecureStore`
     - **Native iOS / Android**: `Keychain`, `UserDefaults`, or `EncryptedSharedPreferences`
  3. Navigate the user directly to the Home Screen (or main app flow) since they are now fully registered, verified, and logged in. No need to show a separate login screen.

## 3. Prayer Requests - Edit & Delete (With Guest Support)

We have updated the Prayer Requests API to fully support editing and deleting requests. Crucially, this now supports **unauthenticated guests** who created requests using a `device_fingerprint`.

### A. Edit a Prayer Request
**Endpoint:** `PATCH /api/v1/prayer/requests/:id`
**Authentication:** Optional (Bearer token if logged in, otherwise use `device_fingerprint`).

**Body:**
```json
{
  "content": "Updated prayer content...",
  "author_name": "John Doe",
  "is_anonymous": false,
  "device_fingerprint": "your_device_id_here" // REQUIRED if the user is a guest
}
```

### B. Delete a Prayer Request
**Endpoint:** `DELETE /api/v1/prayer/requests/:id`
**Authentication:** Optional (Bearer token if logged in, otherwise use `device_fingerprint`).

**Body:**
```json
{
  "device_fingerprint": "your_device_id_here" // REQUIRED if the user is a guest
}
```

**Note on Authorization:**
- If the user is logged in, the backend checks `author_user_id === user.id`.
- If the user is a guest, the backend checks `prayer.device_fingerprint === req.body.device_fingerprint`.
- Admin users can edit/delete any request.

## 4. Bible API - Get Versions with Full Book Data
The Bible API has been updated to include full book data within the `GET /versions` response. This makes it easier to load all books for all supported versions simultaneously without making subsequent API calls.

**Endpoint:** `GET /api/v1/bible/versions`
**Method:** `GET`
**Authentication:** Optional / Bearer Token

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Versions retrieved successfully",
  "data": [
    {
      "id": 12,
      "name": "American Standard Version",
      "abbreviation": "ASV",
      "isActive": true,
      "books": [
        {
          "id": "GEN",
          "name": "Genesis",
          "abbreviation": "Gen",
          "testament": "OT",
          "chapters_count": 50
        },
        ...
      ]
    }
  ]
}
```

**Troubleshooting Data Not Updating:**
If a user selects a version like KJV or NIV and the data does not seem to update (showing the exact same chapters/verses as another translation), this is because the YouVersion API key configured in the backend doesn't have permission for that copyrighted translation. In those cases, the backend API silently falls back to the public domain **WEBUS** translation to prevent the app from crashing. Ensure your API key has explicit approval for copyrighted versions.
