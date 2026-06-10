# Bible API Documentation (Mobile App)

This document outlines the REST API endpoints available for the Church App's native Bible Reader module.

## Base URL
All endpoints are relative to the main API base URL:
`https://<server-domain>/api/v1/bible`

## Authentication
Use the standard Church App authentication headers (e.g., Bearer token) for these endpoints. No third-party API keys are required on the client side.

## Supported Translation IDs
Use the following IDs when requesting specific translations via the `version` query parameter.

| Version | ID |
|---------|----|
| KJV | 1 |
| NLT | 116 |
| AMP | 1588 |
| NIV | 111 |
| MSG | 97 |

> **Note**: If `version` is omitted in any request, the API will default to `1` (KJV).

---

## 1. Get Supported Versions
Returns a list of all active Bible versions supported by the church app.

**Request**
`GET /versions`

**Example Response**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Versions retrieved successfully",
  "data": [
    { 
      "id": 1, 
      "name": "King James Version", 
      "abbreviation": "KJV", 
      "isActive": true 
    }
  ]
}
```

---

## 2. Get Books
Returns a list of all Old and New Testament books for a given version.

**Request**
`GET /books?version={versionId}`

**Query Parameters**
- `version` (optional, number): The translation ID.

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

---

## 3. Get Chapters
Returns a list of chapters for a specific book.

**Request**
`GET /books/:bookId/chapters?version={versionId}`

**Path Parameters**
- `bookId` (required, string): The 3-letter book ID (e.g., `GEN`).

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

---

## 4. Get Verses
Returns the plain text verses for a specific chapter, ready to be rendered in native UI text components.

**Request**
`GET /books/:bookId/chapters/:chapter/verses?version={versionId}`

**Path Parameters**
- `bookId` (required, string): The 3-letter book ID (e.g., `GEN`).
- `chapter` (required, string/number): The chapter number (e.g., `1`).

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
      },
      {
        "verse_number": "2",
        "text": "And the earth was without form, and void; and darkness was upon the face of the deep..."
      }
    ]
  }
}
```

---

## 5. Search Bible
Searches the text of the Bible for a specific keyword or phrase.

**Request**
`GET /search?q={query}&version={versionId}`

**Query Parameters**
- `q` (required, string): The search query (e.g., "love").
- `version` (optional, number): The translation ID.

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
