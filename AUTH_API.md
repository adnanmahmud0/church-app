# Authentication & User API Documentation

This document provides a comprehensive guide for frontend developers to integrate the Auth and User modules.

*Note: Endpoints are relative to your base API URL (e.g. `http://localhost:5000/api/v1`).*

---

## 1. User Module

### Register a New User
Creates a new user account. (Verification is bypassed).

- **URL:** `/user/register`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body (JSON):**
  ```json
  {
    "name": "John Doe",       // required
    "email": "user@email.com",// required
    "password": "password123",// required
    "image": "url_string"     // optional
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "User created successfully",
    "data": { ...userObject }
  }
  ```

### Get User Profile
Retrieves the logged-in user's profile.

- **URL:** `/user/profile`
- **Method:** `GET`
- **Auth Required:** Yes (Bearer Token)
- **Success Response:** `200 OK`
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Profile data retrieved successfully",
    "data": { ...userObject }
  }
  ```

### Update User Profile
Updates the user's profile details or avatar image.

- **URL:** `/user/profile`
- **Method:** `PATCH`
- **Auth Required:** Yes (Bearer Token)
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `image` (File): The avatar image file (optional).
  - `data` (Stringified JSON): 
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@email.com"
    }
    ```
- **Success Response:** `200 OK`
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Profile updated successfully",
    "data": { ...updatedUserObject }
  }
  ```

---

## 2. Auth Module

### Login User
Authenticates a user and returns access/refresh tokens.

- **URL:** `/auth/login`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body (JSON):**
  ```json
  {
    "email": "user@email.com", // required
    "password": "password123"  // required
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
