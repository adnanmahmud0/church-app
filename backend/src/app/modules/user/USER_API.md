# User Module API Documentation

*Note: Endpoints are relative to your base API URL (e.g. `http://localhost:5000/api/v1`).*

---

### Register a New User
Creates a new user account. (Email verification is currently bypassed).

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
