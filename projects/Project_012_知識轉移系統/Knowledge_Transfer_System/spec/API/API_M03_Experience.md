# API_M03_Experience

AI Knowledge Transfer System

API Specification

Module: M03
Module Name: Experience Transfer
Version: v1.0.0
Owner: System Architect
Last Update: 2026-06-25

## 1. API Goal

Define the API surface for M03 Experience Transfer.

The M03 API supports:

- Experience record management
- Audio and video upload
- Speech-to-text processing
- AI summary generation
- FAQ generation
- Case study generation
- Knowledge item publishing
- Experience search
- Review workflow
- AI QA citation sources

## 2. Base URL

```text
/api/v1/experience
```

## 3. Authentication

Protected APIs require JWT authentication.

Header:

```http
Authorization: Bearer <access_token>
```

## 4. Permission Roles

| Role | Permission |
|---|---|
| Employee | Create and view permitted experience records |
| Department Manager | Review, approve, and manage department experience |
| Administrator | Full access |
| Auditor | Read audit-related records |

## 5. Standard Response Format

Success:

```json
{
  "success": true,
  "data": {},
  "message": "success"
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## 6. Experience Record API

### 6.1 Create Manual Experience

```http
POST /api/v1/experience
```

Request:

```json
{
  "title": "A-102 sensor troubleshooting experience",
  "department_id": "uuid",
  "category": "maintenance_case",
  "source_type": "manual",
  "expert_name": "Senior Engineer",
  "content": "The equipment issue started after the sensor calibration failed.",
  "tags": ["equipment", "sensor", "maintenance"],
  "permission_scope": "department",
  "language": "en"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "experience_id": "uuid",
    "status": "draft"
  },
  "message": "experience created"
}
```

### 6.2 Upload Experience File

```http
POST /api/v1/experience/upload
```

Content-Type:

```text
multipart/form-data
```

Form data:

```text
file
title
department_id
category
source_type
expert_name
tags
permission_scope
language
```

Response:

```json
{
  "success": true,
  "data": {
    "experience_id": "uuid",
    "job_id": "uuid",
    "status": "uploaded"
  },
  "message": "experience file uploaded"
}
```

### 6.3 List Experiences

```http
GET /api/v1/experience
```

Query parameters:

```text
department_id
category
source_type
status
expert_name
keyword
tag
start_date
end_date
page
page_size
```

### 6.4 Get Experience Detail

```http
GET /api/v1/experience/{experience_id}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "A-102 sensor troubleshooting experience",
    "department_id": "uuid",
    "category": "maintenance_case",
    "source_type": "audio",
    "expert_name": "Senior Engineer",
    "transcript": "The equipment issue started after the sensor calibration failed.",
    "summary": "The issue was caused by failed sensor calibration.",
    "status": "reviewed",
    "tags": ["equipment", "sensor", "maintenance"],
    "permission_scope": "department",
    "created_at": "2026-06-25T10:00:00"
  },
  "message": "success"
}
```

### 6.5 Update Experience Metadata

```http
PUT /api/v1/experience/{experience_id}
```

Request:

```json
{
  "title": "A-102 sensor issue resolution",
  "category": "maintenance_case",
  "expert_name": "Senior Engineer",
  "tags": ["equipment", "sensor", "maintenance", "calibration"],
  "permission_scope": "department"
}
```

### 6.6 Delete Experience

```http
DELETE /api/v1/experience/{experience_id}
```

## 7. Recording API

### 7.1 Create Recording Session

```http
POST /api/v1/experience/recording/session
```

Request:

```json
{
  "title": "Maintenance interview",
  "department_id": "uuid",
  "category": "maintenance_case",
  "expert_name": "Senior Engineer",
  "permission_scope": "department",
  "language": "en"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "experience_id": "uuid",
    "upload_url": "signed-url"
  },
  "message": "recording session created"
}
```

### 7.2 Complete Recording Session

```http
POST /api/v1/experience/recording/session/{session_id}/complete
```

Response:

```json
{
  "success": true,
  "data": {
    "experience_id": "uuid",
    "job_id": "uuid",
    "status": "queued"
  },
  "message": "recording completed"
}
```

## 8. Processing API

### 8.1 Start Processing

```http
POST /api/v1/experience/{experience_id}/process
```

Request:

```json
{
  "steps": [
    "speech_to_text",
    "summary",
    "faq",
    "case_study",
    "embedding"
  ]
}
```

### 8.2 Get Processing Status

```http
GET /api/v1/experience/jobs/{job_id}
```

Response:

```json
{
  "success": true,
  "data": {
    "job_id": "uuid",
    "experience_id": "uuid",
    "status": "processing",
    "progress": 65,
    "current_step": "faq_extraction"
  },
  "message": "success"
}
```

### 8.3 Retry Failed Job

```http
POST /api/v1/experience/jobs/{job_id}/retry
```

## 9. Transcript API

### 9.1 Get Transcript

```http
GET /api/v1/experience/{experience_id}/transcript
```

### 9.2 Update Transcript

```http
PUT /api/v1/experience/{experience_id}/transcript
```

Request:

```json
{
  "transcript": "Updated transcript content."
}
```

### 9.3 Get Transcript Segments

```http
GET /api/v1/experience/{experience_id}/transcript/segments
```

## 10. AI Summary API

### 10.1 Generate Summary

```http
POST /api/v1/experience/{experience_id}/summary/generate
```

### 10.2 Get Summary

```http
GET /api/v1/experience/{experience_id}/summary
```

### 10.3 Update Summary

```http
PUT /api/v1/experience/{experience_id}/summary
```

Request:

```json
{
  "summary": "The sensor issue was caused by calibration failure.",
  "key_points": [
    "Check calibration first.",
    "Review maintenance logs.",
    "Replace sensor if needed."
  ],
  "lessons_learned": [
    "Add sensor calibration to routine inspection."
  ]
}
```

## 11. FAQ API

### 11.1 Generate FAQ

```http
POST /api/v1/experience/{experience_id}/faq/generate
```

### 11.2 List FAQ

```http
GET /api/v1/experience/{experience_id}/faq
```

### 11.3 Create FAQ Manually

```http
POST /api/v1/experience/{experience_id}/faq
```

Request:

```json
{
  "question": "What should be checked first when A-102 sensor values are abnormal?",
  "answer": "Check calibration status and recent maintenance records first.",
  "tags": ["equipment", "sensor"]
}
```

### 11.4 Update FAQ

```http
PUT /api/v1/experience/faq/{faq_id}
```

### 11.5 Delete FAQ

```http
DELETE /api/v1/experience/faq/{faq_id}
```

## 12. Case Study API

### 12.1 Generate Case Study

```http
POST /api/v1/experience/{experience_id}/case-study/generate
```

### 12.2 List Case Studies

```http
GET /api/v1/experience/{experience_id}/case-study
```

### 12.3 Create Case Study Manually

```http
POST /api/v1/experience/{experience_id}/case-study
```

Request:

```json
{
  "title": "A-102 sensor issue case",
  "problem": "Sensor values were abnormal during equipment operation.",
  "cause": "Sensor calibration failed.",
  "solution": "Recalibrate the sensor and replace it if the reading remains unstable.",
  "result": "Equipment returned to stable operation.",
  "lesson_learned": "Include sensor calibration in routine inspection."
}
```

### 12.4 Update Case Study

```http
PUT /api/v1/experience/case-study/{case_id}
```

### 12.5 Delete Case Study

```http
DELETE /api/v1/experience/case-study/{case_id}
```

## 13. Knowledge Publish API

### 13.1 Prepare Knowledge Items

```http
POST /api/v1/experience/{experience_id}/knowledge/prepare
```

Response:

```json
{
  "success": true,
  "data": {
    "knowledge_items": [
      {
        "type": "faq",
        "title": "A-102 sensor first check",
        "status": "draft"
      },
      {
        "type": "case",
        "title": "A-102 sensor issue case",
        "status": "draft"
      }
    ]
  },
  "message": "knowledge items prepared"
}
```

### 13.2 Publish Knowledge Items

```http
POST /api/v1/experience/{experience_id}/knowledge/publish
```

Request:

```json
{
  "knowledge_item_ids": ["uuid", "uuid"]
}
```

### 13.3 List Knowledge Items

```http
GET /api/v1/experience/{experience_id}/knowledge
```

## 14. Review API

### 14.1 Submit For Review

```http
POST /api/v1/experience/{experience_id}/review/submit
```

### 14.2 Approve Experience

```http
POST /api/v1/experience/{experience_id}/review/approve
```

Request:

```json
{
  "comment": "Content is accurate and can be published."
}
```

### 14.3 Reject Experience

```http
POST /api/v1/experience/{experience_id}/review/reject
```

Request:

```json
{
  "comment": "Please add more detail about the root cause."
}
```

## 15. Search API

### 15.1 Search Experience

```http
POST /api/v1/experience/search
```

Request:

```json
{
  "query": "How was the sensor issue solved?",
  "department_id": "uuid",
  "category": "maintenance_case",
  "top_k": 5,
  "filters": {
    "expert_name": "Senior Engineer",
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
        "experience_id": "uuid",
        "title": "A-102 sensor troubleshooting experience",
        "summary": "The issue was caused by failed sensor calibration.",
        "score": 0.92,
        "expert_name": "Senior Engineer",
        "category": "maintenance_case"
      }
    ]
  },
  "message": "success"
}
```

## 16. Expert API

### 16.1 List Experts

```http
GET /api/v1/experience/experts
```

Query parameters:

```text
department_id
keyword
tag
page
page_size
```

### 16.2 Get Expert Profile

```http
GET /api/v1/experience/experts/{expert_id}
```

## 17. Dashboard API

### 17.1 Experience Metrics

```http
GET /api/v1/experience/dashboard/metrics
```

Response:

```json
{
  "success": true,
  "data": {
    "experience_count": 12580,
    "faq_count": 18450,
    "case_count": 3240,
    "expert_count": 138,
    "pending_review": 35,
    "published_knowledge": 9820
  },
  "message": "success"
}
```

### 17.2 Top Contributors

```http
GET /api/v1/experience/dashboard/top-contributors
```

## 18. Error Codes

| Code | Description |
|---|---|
| EXPERIENCE_NOT_FOUND | Experience record not found |
| EXPERIENCE_PERMISSION_DENIED | Permission denied |
| EXPERIENCE_UPLOAD_FAILED | Experience upload failed |
| UNSUPPORTED_FILE | Unsupported file type |
| FILE_TOO_LARGE | File too large |
| STT_FAILED | Speech-to-text failed |
| TRANSCRIPT_EMPTY | Transcript is empty |
| SUMMARY_FAILED | AI summary failed |
| FAQ_GENERATION_FAILED | FAQ generation failed |
| CASE_GENERATION_FAILED | Case study generation failed |
| REVIEW_REQUIRED | Review required |
| PUBLISH_FAILED | Publish failed |
| EMBEDDING_FAILED | Embedding failed |

## 19. Required MVP APIs

```text
POST /experience
POST /experience/upload
GET /experience
GET /experience/{experience_id}
POST /experience/{experience_id}/process
GET /experience/jobs/{job_id}
GET /experience/{experience_id}/transcript
PUT /experience/{experience_id}/transcript
POST /experience/{experience_id}/summary/generate
GET /experience/{experience_id}/summary
POST /experience/{experience_id}/faq/generate
GET /experience/{experience_id}/faq
POST /experience/{experience_id}/review/submit
POST /experience/{experience_id}/review/approve
POST /experience/search
GET /experience/dashboard/metrics
```

## 20. Next Step

Recommended next document:

```text
spec/PRD/PRD_M04_SOP_Generator.md
```

M04 should use M01 document knowledge and M03 experience content to generate SOP drafts and workflow knowledge.
