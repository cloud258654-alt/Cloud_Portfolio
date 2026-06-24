# AI Knowledge Transfer System (KTS)

## API Specification v1

Version: v1.0.0
Document Type: API Specification
Author: Project Manager / System Architect
Last Updated: 2026-06-25

## 1. API Goal

Define the v1.0 MVP API surface for the AI Knowledge Transfer System.

v1.0 covers:

- Auth API
- User API
- Department API
- Document API
- Ingestion API
- Search API
- AI QA API
- Feedback API
- Audit API
- Admin API

## 2. API Design Principles

### 2.1 REST First

Use RESTful API design for v1.

### 2.2 JSON Response

All API responses should use JSON.

### 2.3 JWT Authentication

Protected APIs require a JWT bearer token.

### 2.4 RBAC Authorization

API access is controlled by role-based access control.

Roles:

- Employee
- Department Manager
- Administrator
- Auditor

### 2.5 Citation Required

AI answer APIs should return citations when answers are based on enterprise knowledge.

## 3. Base URL

```text
/api/v1
```

## 4. Standard Response Format

### Success

```json
{
  "success": true,
  "data": {},
  "message": "success"
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## 5. Authentication API

### 5.1 Login

```http
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "name": "User Name",
      "email": "user@example.com",
      "roles": ["Employee"]
    }
  },
  "message": "login success"
}
```

### 5.2 Refresh Token

```http
POST /api/v1/auth/refresh
```

Request:

```json
{
  "refresh_token": "refresh-token"
}
```

### 5.3 Logout

```http
POST /api/v1/auth/logout
```

### 5.4 Me

```http
GET /api/v1/auth/me
```

## 6. User API

### 6.1 List Users

```http
GET /api/v1/users
```

Query parameters:

```text
department_id
role
status
keyword
page
page_size
```

### 6.2 Get User Detail

```http
GET /api/v1/users/{user_id}
```

### 6.3 Create User

```http
POST /api/v1/users
```

Request:

```json
{
  "department_id": "uuid",
  "name": "User Name",
  "email": "user@example.com",
  "password": "password",
  "job_title": "Engineer",
  "roles": ["Employee"]
}
```

### 6.4 Update User

```http
PUT /api/v1/users/{user_id}
```

### 6.5 Disable User

```http
DELETE /api/v1/users/{user_id}
```

## 7. Department API

### 7.1 List Departments

```http
GET /api/v1/departments
```

### 7.2 Create Department

```http
POST /api/v1/departments
```

Request:

```json
{
  "name": "IT Department",
  "code": "IT",
  "parent_id": null
}
```

### 7.3 Update Department

```http
PUT /api/v1/departments/{department_id}
```

## 8. Document API

### 8.1 Upload Document

```http
POST /api/v1/documents/upload
```

Content-Type:

```text
multipart/form-data
```

Form data:

```text
file
title
description
department_id
permission_scope
tags
```

permission_scope:

```text
public
department
private
confidential
admin_only
```

Response:

```json
{
  "success": true,
  "data": {
    "document_id": "uuid",
    "title": "Purchase SOP",
    "status": "processing"
  },
  "message": "document uploaded"
}
```

### 8.2 List Documents

```http
GET /api/v1/documents
```

Query parameters:

```text
department_id
file_type
status
permission_scope
keyword
page
page_size
```

### 8.3 Get Document Detail

```http
GET /api/v1/documents/{document_id}
```

### 8.4 Update Document Metadata

```http
PUT /api/v1/documents/{document_id}
```

Request:

```json
{
  "title": "Purchase SOP v2",
  "description": "updated description",
  "permission_scope": "department",
  "tags": ["purchase", "SOP"]
}
```

### 8.5 Delete Document

```http
DELETE /api/v1/documents/{document_id}
```

### 8.6 Publish Document

```http
POST /api/v1/documents/{document_id}/publish
```

### 8.7 Archive Document

```http
POST /api/v1/documents/{document_id}/archive
```

## 9. Document Version API

### 9.1 List Versions

```http
GET /api/v1/documents/{document_id}/versions
```

### 9.2 Upload New Version

```http
POST /api/v1/documents/{document_id}/versions
```

Content-Type:

```text
multipart/form-data
```

## 10. Ingestion API

### 10.1 Start Ingestion

```http
POST /api/v1/ingestion/documents/{document_id}/start
```

Response:

```json
{
  "success": true,
  "data": {
    "job_id": "uuid",
    "document_id": "uuid",
    "status": "queued"
  },
  "message": "ingestion started"
}
```

### 10.2 Get Ingestion Status

```http
GET /api/v1/ingestion/jobs/{job_id}
```

Response:

```json
{
  "success": true,
  "data": {
    "job_id": "uuid",
    "status": "processing",
    "progress": 45,
    "current_step": "embedding"
  },
  "message": "success"
}
```

### 10.3 Rebuild Document Index

```http
POST /api/v1/ingestion/documents/{document_id}/rebuild
```

## 11. Search API

### 11.1 Keyword Search

```http
GET /api/v1/search/keyword
```

Query parameters:

```text
q
department_id
file_type
page
page_size
```

### 11.2 Vector Search

```http
POST /api/v1/search/vector
```

Request:

```json
{
  "query": "How do I submit a purchase request?",
  "department_id": "uuid",
  "top_k": 5
}
```

### 11.3 Hybrid Search

```http
POST /api/v1/search/hybrid
```

Request:

```json
{
  "query": "How do I submit a purchase request?",
  "department_id": "uuid",
  "top_k": 5,
  "filters": {
    "file_type": "pdf",
    "permission_scope": "department"
  }
}
```

Response:

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "document_id": "uuid",
        "chunk_id": "uuid",
        "title": "Purchase SOP",
        "content_preview": "To submit a purchase request, complete the request form...",
        "page_number": 3,
        "score": 0.92
      }
    ]
  },
  "message": "success"
}
```

## 12. AI QA API

### 12.1 Ask AI

```http
POST /api/v1/ai/ask
```

Request:

```json
{
  "question": "How do I submit a purchase request?",
  "conversation_id": null,
  "department_id": "uuid",
  "top_k": 5,
  "model": "default",
  "answer_mode": "grounded"
}
```

answer_mode:

```text
grounded
summary
step_by_step
```

Response:

```json
{
  "success": true,
  "data": {
    "conversation_id": "uuid",
    "message_id": "uuid",
    "answer": "To submit a purchase request: 1. Complete the request form. 2. Submit it to your department manager. 3. Wait for approval.",
    "citations": [
      {
        "document_id": "uuid",
        "document_title": "Purchase SOP",
        "chunk_id": "uuid",
        "page_number": 3,
        "quote_text": "Purchase requests must be submitted through the approved request form.",
        "relevance_score": 0.92
      }
    ],
    "confidence_score": 0.86,
    "model_name": "default"
  },
  "message": "success"
}
```

### 12.2 List Conversations

```http
GET /api/v1/ai/conversations
```

### 12.3 Get Conversation Detail

```http
GET /api/v1/ai/conversations/{conversation_id}
```

### 12.4 Delete Conversation

```http
DELETE /api/v1/ai/conversations/{conversation_id}
```

## 13. Feedback API

### 13.1 Create Feedback

```http
POST /api/v1/feedback
```

Request:

```json
{
  "message_id": "uuid",
  "rating": 4,
  "feedback_type": "helpful",
  "comment": "The answer is useful, but please add more detail."
}
```

### 13.2 List Feedback

```http
GET /api/v1/feedback
```

Query parameters:

```text
message_id
user_id
feedback_type
page
page_size
```

## 14. Audit API

### 14.1 List Audit Logs

```http
GET /api/v1/audit-logs
```

Query parameters:

```text
user_id
action
target_type
start_date
end_date
page
page_size
```

## 15. Admin API

### 15.1 System Health

```http
GET /api/v1/admin/health
```

### 15.2 System Metrics

```http
GET /api/v1/admin/metrics
```

### 15.3 AI Model Settings

```http
GET /api/v1/admin/ai-settings
```

```http
PUT /api/v1/admin/ai-settings
```

Request:

```json
{
  "default_llm_provider": "openai",
  "default_model": "gpt-5",
  "embedding_model": "text-embedding-model",
  "max_tokens": 4096,
  "temperature": 0.2
}
```

## 16. Status Codes

| Code | Meaning |
|---:|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

## 17. Common Error Codes

| Error Code | Description |
|---|---|
| AUTH_INVALID_CREDENTIALS | Invalid email or password |
| AUTH_TOKEN_EXPIRED | Token expired |
| PERMISSION_DENIED | Permission denied |
| DOCUMENT_NOT_FOUND | Document not found |
| DOCUMENT_PROCESSING_FAILED | Document processing failed |
| SEARCH_NO_RESULT | No search results found |
| AI_GENERATION_FAILED | AI generation failed |
| VALIDATION_ERROR | Request validation failed |

## 18. RBAC API Permission Matrix

| API Group | Employee | Department Manager | Administrator | Auditor |
|---|---:|---:|---:|---:|
| Auth | Yes | Yes | Yes | Yes |
| User | No | View Department | Full | View |
| Department | No | View | Full | View |
| Document Upload | No | Yes | Yes | No |
| Document Search | Yes | Yes | Yes | Yes |
| Document Delete | No | Own Department | Full | No |
| AI Ask | Yes | Yes | Yes | Yes |
| Feedback | Yes | Yes | Yes | No |
| Audit Logs | No | No | Full | View |
| Admin Settings | No | No | Full | No |

## 19. v1 MVP Required API

```text
Auth API
Document API
Ingestion API
Search API
AI QA API
Feedback API
Audit API
Admin Health API
```

## 20. Next Step

Recommended next document:

```text
spec/PRD/PRD_M01_Document_Knowledge_Center.md
```

M01 should provide the document foundation for AI QA, RAG, SOP, and Agent workflows.
