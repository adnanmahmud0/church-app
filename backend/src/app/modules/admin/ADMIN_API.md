# Admin API Documentation

This document outlines the API endpoints available for the Admin Management module. All endpoints are prefixed with `/api/v1/admin`.

---

## 1. Get All Admins

Retrieves a list of all users with `admin` or `super_admin` roles.

- **URL:** `/`
- **Method:** `GET`
- **Auth Required:** `super_admin` only
- **Content-Type:** `application/json`

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Admins retrieved successfully",
  "data": [
    {
      "_id": "60d0fe4f5311236168a109ca",
      "name": "Super Admin",
      "email": "super@example.com",
      "role": "super_admin",
      "status": "active",
      "verified": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    // ...
  ]
}
```

---

## 2. Create Admin

Creates a new user with the `admin` role. (Super admins cannot be created via this endpoint).

- **URL:** `/`
- **Method:** `POST`
- **Auth Required:** `super_admin` only
- **Content-Type:** `application/json`

### Request Body

```json
{
  "name": "Jane Admin",        // Required: string
  "email": "jane@example.com", // Required: string, valid email
  "password": "Password123"    // Required: string, minimum 8 characters
}
```

### Success Response

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Admin created successfully",
  "data": {
    "_id": "60d0fe4f5311236168a109cb",
    "name": "Jane Admin",
    "email": "jane@example.com",
    "role": "admin",
    "verified": true,
    // ...
  }
}
```

---

## 3. Update Admin

Updates an existing admin's details. You cannot update a `super_admin` account or change their role through this endpoint.

- **URL:** `/:id`
- **Method:** `PUT`
- **Auth Required:** `super_admin` only
- **Content-Type:** `application/json`

### Request Parameters

- `id`: The MongoDB ObjectId of the admin to update.

### Request Body (All fields are optional)

```json
{
  "name": "Jane Smith",         // Optional: string
  "email": "janes@example.com", // Optional: string, valid email
  "password": "NewPassword123"  // Optional: string, minimum 8 characters
}
```

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Admin updated successfully",
  "data": {
    // updated admin document (excluding password)
  }
}
```

---

## 4. Delete Admin

Deletes an existing admin. You cannot delete a `super_admin` account, and you cannot delete your own account.

- **URL:** `/:id`
- **Method:** `DELETE`
- **Auth Required:** `super_admin` only
- **Content-Type:** `application/json`

### Request Parameters

- `id`: The MongoDB ObjectId of the admin to delete.

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Admin deleted successfully",
  "data": {
    // deleted admin document
  }
}
```

---

## 5. Update Profile

Updates the currently authenticated admin's own profile. If an `admin` updates their email, it will require email verification. `super_admin` accounts cannot change their email address.

- **URL:** `/profile`
- **Method:** `PUT`
- **Auth Required:** `admin` or `super_admin`
- **Content-Type:** `application/json`

### Request Body (All fields are optional)

```json
{
  "name": "John Doe",             // Optional: string
  "email": "john.doe@example.com",// Optional: string, valid email (restricted for super_admin)
  "password": "NewPassword123",   // Optional: string, minimum 8 characters
  "currentPassword": "OldPassword"// Required ONLY if providing a new `password`
}
```

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully",
  "data": {
    // updated profile document (excluding password)
  }
}
```
