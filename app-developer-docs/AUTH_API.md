# Auth Module API Documentation

*Note: Endpoints are relative to your base API URL (e.g. `http://localhost:5000/api/v1`).*

---

### Device Initialization (Guest Access)
Registers a device and creates a guest session for a user who hasn't logged in yet.

- **URL:** `/auth/device-init`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body (JSON):**
  ```json
  {
    "deviceId": "unique_device_uuid_here", // required
    "fcmToken": "firebase_fcm_token_here", // required
    "platform": "android"                  // required: "android" | "ios" | "web"
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Device initialized successfully",
    "data": { "accessToken": "...", "refreshToken": "..." }
  }
  ```

---

### Login User
Authenticates a user and returns access/refresh tokens.

- **URL:** `/auth/login`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body (JSON):**
  ```json
  {
    "email": "user@email.com", // required
    "password": "password123", // required
    "deviceId": "uuid_string"  // optional (used to link guest session to account)
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "User login successful",
    "data": { "accessToken": "...", "refreshToken": "..." }
  }
  ```

### Refresh Token
Generates a new access token using a valid refresh token.

- **URL:** `/auth/refresh`
- **Method:** `POST`
- **Auth Required:** No (Token sent in cookies/body)
- **Request Body (JSON):**
  ```json
  {
    "refreshToken": "your_refresh_token_string" // optional if stored in cookies
  }
  ```

### Forget Password
Sends a password reset code to the user's email.

- **URL:** `/auth/forget-password`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body (JSON):**
  ```json
  {
    "email": "user@email.com" // required
  }
  ```

### Reset Password
Resets the user's password using the one-time code.

- **URL:** `/auth/reset-password`
- **Method:** `POST`
- **Auth Required:** Yes (Reset Token in headers)
- **Request Body (JSON):**
  ```json
  {
    "newPassword": "newPassword123",    // required
    "confirmPassword": "newPassword123" // required
  }
  ```

### Change Password
Changes the currently logged-in user's password.

- **URL:** `/auth/change-password`
- **Method:** `POST`
- **Auth Required:** Yes (Bearer Token)
- **Request Body (JSON):**
  ```json
  {
    "currentPassword": "oldPassword123", // required
    "newPassword": "newPassword123",     // required
    "confirmPassword": "newPassword123"  // required
  }
  ```

### Verify Email & Resend Email (Optional/Disabled)
*Note: Registration verification is currently turned off. These endpoints are available but not required for registration.*

- **Verify Email:** `POST /auth/verify-email`
  - Body: `{ "email": "...", "oneTimeCode": 1234 }`
- **Resend Code:** `POST /auth/resend-verify-email`
  - Body: `{ "email": "..." }`
