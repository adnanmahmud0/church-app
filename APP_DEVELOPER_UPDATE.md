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
