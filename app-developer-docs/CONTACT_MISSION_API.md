# Contact & Mission — Flutter Integration Guide

## 1. Overview
- This screen displays the church's contact information, mission quote, and dynamic social media links.
- Single API endpoint, no authentication required.
- The user can configure the visibility of each social media link on the dashboard, so the app should only display links where `isEnabled` is true.

---

## 2. API Reference

### GET /api/v1/church-info/contact-and-mission

**Description:** Returns the contact information, short mission quote, notification defaults, and dynamic social media links for the app's "More" or "Contact" page.

**Authentication:** None required.

**Request:**
- Method: GET
- URL: `<BASE_URL>/api/v1/church-info/contact-and-mission`
- Headers: `Content-Type: application/json`

**Success Response — 200 OK:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Contact info and mission retrieved successfully",
  "data": {
    "address": "71 Stoneyburn Street, Stoneyburn, EH47 8JT",
    "sunday_service": "10:00 AM,12:30 PM",
    "email": "info@piwcstoneyburn.org",
    "website": "www.piwcstoneyburn.org",
    "our_mission": "\"To make heaven, to take as many people as possible with us, and to have a positive impact on society.\"",
    "social_links": [
      {
        "platform": "YouTube",
        "url": "https://youtube.com/...",
        "isEnabled": true,
        "_id": "60d5ecb8b392d7001f123456"
      },
      {
        "platform": "Instagram",
        "url": "https://instagram.com/...",
        "isEnabled": false,
        "_id": "60d5ecb8b392d7001f123457"
      }
    ],
    "notification_defaults": {
      "sermon": false,
      "service_reminder": false,
      "custom": true
    }
  }
}
```


