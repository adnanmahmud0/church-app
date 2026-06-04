# Bible Module API

The Bible Reader module acts as a proxy for the YouVersion Platform API, providing caching, content sanitization, and structured endpoints for the church mobile app.

## Authentication Note
The mobile app does **NOT** need the YouVersion API key. The backend safely stores the key and attaches it to proxy requests. Use the standard Church App authentication headers for these endpoints.

## Base URL
Placeholder: `https://your-api-domain.com/api/bible`

## Supported Translation IDs
| Version | ID |
|---------|----|
| KJV | 1 |
| NLT | 116 |
| AMP | 1588 |
| NIV | 111 |
| MSG | 97 |

## General Notes
- **HTML Sanitization**: All verse text returned from these endpoints has HTML tags (like `<b>`, `<i>`, etc.) stripped for easy display in native components.
- **Rate Limiting**: Our backend caches requests. Books and Chapters are cached for 24 hours. Verses are cached for 1 hour.

## Error Response Format
If a request fails, the API returns a JSON error response:
```json
{
  "success": false,
  "message": "Error description here",
  "statusCode": 400
}
```

---

## Endpoints

### 1. Get Supported Versions
Returns the static list of supported Bible versions available in the app.

**Request**
`GET /versions`

**Example Request**
```javascript
fetch('https://your-api-domain.com/api/bible/versions')
  .then(res => res.json())
```

**Example Response**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Versions retrieved successfully",
  "data": [
    { "id": 1, "name": "King James Version", "abbreviation": "KJV", "isActive": true }
  ]
}
```

### 2. Get Books
Returns a list of all books for a specific version ID.

**Request**
`GET /books`

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| version | number | No | The ID of the Bible version (default: 1) |

**Example Request**
```javascript
fetch('https://your-api-domain.com/api/bible/books?version=1')
```

**Example Response**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Books retrieved successfully",
  "data": [
    {
      "id": "GEN",
      "name": "Genesis",
      "abbreviation": "Gen",
      "testament": "OT",
      "chapters_count": 50
    }
  ]
}
```

### 3. Get Chapters
Returns a list of chapters for a specific book.

**Request**
`GET /books/:bookId/chapters`

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| version | number | No | The ID of the Bible version (default: 1) |

**Example Request**
```javascript
fetch('https://your-api-domain.com/api/bible/books/GEN/chapters?version=1')
```

**Example Response**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Chapters retrieved successfully",
  "data": [
    { "chapter_number": "1" },
    { "chapter_number": "2" }
  ]
}
```

### 4. Get Verses
Returns all verses for a specific chapter in a book.

**Request**
`GET /books/:bookId/chapters/:chapter`

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| version | number | No | The ID of the Bible version (default: 1) |

**Example Request**
```javascript
fetch('https://your-api-domain.com/api/bible/books/GEN/chapters/1?version=1')
```

**Example Response**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Verses retrieved successfully",
  "data": {
    "book": "GEN",
    "chapter": "1",
    "version": 1,
    "verses": [
      {
        "verse_number": "1",
        "text": "In the beginning God created the heaven and the earth."
      }
    ]
  }
}
```

### 5. Search Bible
Searches the Bible content across YouVersion.

**Request**
`GET /search`

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | The search query (e.g., "love") |
| version | number | No | The ID of the Bible version (default: 1) |

**Example Request**
```javascript
fetch('https://your-api-domain.com/api/bible/search?q=love&version=1')
```

**Example Response**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Search completed successfully",
  "data": {
    "results": [
      {
        "book": "JHN",
        "chapter": "3",
        "verse": "16",
        "text": "For God so loved the world..."
      }
    ]
  }
}
```
