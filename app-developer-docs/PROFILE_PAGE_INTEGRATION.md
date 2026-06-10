# My Profile Page API Integration

This document outlines the API endpoints and data structures required to implement the "My Profile" page in the Flutter application. 

## Endpoints Overview

| Action | Method | Endpoint | Description |
|---|---|---|---|
| Get Combined Profile | `GET` | `/api/v1/user/profile` | Returns the combined user info, giving summary, and 3 recent favorite sermons for the main profile dashboard. |
| Get Giving Summary | `GET` | `/api/v1/user/giving/summary` | Returns just the giving summary. Useful for refreshing giving data when coming back to the profile tab. |
| Get Giving History | `GET` | `/api/v1/user/giving/history` | Paginated donation history. Supports `page`, `limit`, and `year` query params. |
| Update Profile | `PUT` | `/api/v1/user/profile` | Update user profile data (e.g. `name`). |
| Logout | `POST` | `/api/v1/auth/logout` | Call when user hits "Logout". Server-side logout hook. |

---

## 1. Combined Profile Dashboard

**Endpoint:** `GET /api/v1/user/profile`  
**Auth Required:** Yes (Bearer Token)  

This endpoint gives you everything you need for the first screen of the "My Profile" UI without making separate requests for giving summary or favorite sermons.

**Example Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile data retrieved successfully",
  "data": {
    "user": {
      "id": "60d0fe4f5311236168a109ca",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "initials": "JD",
      "member_since": "January 2023",
      "status": "ACTIVE MEMBER"
    },
    "giving_summary": {
      "total_given_this_year": 1250.00,
      "currency": "GBP",
      "year": 2024,
      "last_gift": {
        "amount": 100.00,
        "currency": "GBP",
        "date": "2024-05-12",
        "date_display": "May 12, 2024"
      },
      "giving_streak_weeks": 4,
      "total_given_all_time": 4500.00,
      "total_donations_count": 32
    },
    "saved_sermons": [
      {
        "_id": "60d0fe...",
        "title": "Finding Peace",
        "speaker": "Pastor John",
        "date": "2024-05-10T10:00:00.000Z"
      }
    ]
  }
}
```

---

## 2. Get Giving Summary (Standalone)

**Endpoint:** `GET /api/v1/user/giving/summary`  
**Auth Required:** Yes  

Use this to get or refresh just the giving summary section.

**Example Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Giving summary retrieved successfully",
  "data": {
    "total_given_this_year": 1250.00,
    "currency": "GBP",
    "year": 2024,
    "last_gift": {
      "amount": 100.00,
      "currency": "GBP",
      "date": "2024-05-12",
      "date_display": "May 12, 2024"
    },
    "giving_streak_weeks": 4,
    "total_given_all_time": 4500.00,
    "total_donations_count": 32
  }
}
```

---

## 3. Paginated Giving History

**Endpoint:** `GET /api/v1/user/giving/history`  
**Auth Required:** Yes  

Supports pagination and optional filtering by year.

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `year` (optional, e.g., 2024)

**Example Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Giving history retrieved successfully",
  "data": [
    {
      "id": "60d0fe...",
      "amount": 100.00,
      "currency": "GBP",
      "donated_at": "2024-05-12T10:00:00.000Z",
      "date_display": "May 12, 2024"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 32,
    "total_pages": 2,
    "has_next_page": true
  }
}
```

---

## 4. Update Profile

**Endpoint:** `PUT /api/v1/user/profile`  
**Auth Required:** Yes  
**Content-Type:** `application/json`

Allows the user to update their basic profile information, such as their name. Note: Updating an image still requires the `PATCH /api/v1/user/profile` endpoint utilizing `multipart/form-data`.

**Request Body:**
```json
{
  "name": "Jane Smith"
}
```

**Example Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully",
  "data": {
    "_id": "60d0fe...",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "USER"
  }
}
```

---

## 5. Logout

**Endpoint:** `POST /api/v1/auth/logout`  
**Auth Required:** Yes  

A simple endpoint to hit when the user clicks the "Logout" button. This notifies the backend, allowing future expansion for token blacklisting. The frontend should clear the JWT token upon receiving a 200 OK.

**Example Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully",
  "data": null
}
```

---

## Flutter Integration Models

```dart
class ProfilePayload {
  final UserInfo user;
  final GivingSummary givingSummary;
  final List<dynamic> savedSermons;

  ProfilePayload({
    required this.user,
    required this.givingSummary,
    required this.savedSermons,
  });

  factory ProfilePayload.fromJson(Map<String, dynamic> json) {
    return ProfilePayload(
      user: UserInfo.fromJson(json['user']),
      givingSummary: GivingSummary.fromJson(json['giving_summary']),
      savedSermons: json['saved_sermons'] ?? [],
    );
  }
}

class UserInfo {
  final String name;
  final String initials;
  final String memberSince;
  final String status;

  UserInfo({
    required this.name,
    required this.initials,
    required this.memberSince,
    required this.status,
  });

  factory UserInfo.fromJson(Map<String, dynamic> json) {
    return UserInfo(
      name: json['name'],
      initials: json['initials'],
      memberSince: json['member_since'],
      status: json['status'],
    );
  }
}

class GivingSummary {
  final double totalGivenThisYear;
  final LastGift? lastGift;
  final int givingStreakWeeks;

  GivingSummary({
    required this.totalGivenThisYear,
    this.lastGift,
    required this.givingStreakWeeks,
  });

  factory GivingSummary.fromJson(Map<String, dynamic> json) {
    return GivingSummary(
      totalGivenThisYear: json['total_given_this_year']?.toDouble() ?? 0.0,
      lastGift: json['last_gift'] != null ? LastGift.fromJson(json['last_gift']) : null,
      givingStreakWeeks: json['giving_streak_weeks'] ?? 0,
    );
  }
}

class LastGift {
  final double amount;
  final String currency;
  final String dateDisplay;

  LastGift({
    required this.amount,
    required this.currency,
    required this.dateDisplay,
  });

  factory LastGift.fromJson(Map<String, dynamic> json) {
    return LastGift(
      amount: json['amount']?.toDouble() ?? 0.0,
      currency: json['currency'],
      dateDisplay: json['date_display'],
    );
  }
}
```
