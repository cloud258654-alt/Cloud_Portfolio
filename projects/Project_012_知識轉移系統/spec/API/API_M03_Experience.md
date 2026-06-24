# API_M03_Experience

AI Knowledge Transfer System

API Specification

Module : M03

Module Name : Experience Transfer

Version : v1.0.0

Owner : System Architect

Last Update : 2026-06-25

---

# 1. API Goal

本文件定義 M03 Experience Transfer 的 API 規格。

M03 API 主要支援：

* 經驗資料上傳
* 錄音經驗建立
* 語音轉文字
* AI 摘要
* FAQ 生成
* Case Study 生成
* 知識項目發布
* 經驗搜尋
* 審核流程
* AI QA 引用來源

---

# 2. Base URL

```text
/api/v1/experience
```

---

# 3. Authentication

除健康檢查外，所有 API 都必須使用 JWT。

Header：

```http
Authorization: Bearer <access_token>
```

---

# 4. Permission Roles

| Role               | Permission    |
| ------------------ | ------------- |
| Employee           | 建立草稿、查看有權限的經驗 |
| Department Manager | 審核、發布、管理部門經驗  |
| Administrator      | 全部權限          |
| Auditor            | 只讀與稽核         |

---

# 5. Standard Response Format

## Success

```json
{
  "success": true,
  "data": {},
  "message": "success"
}
```

---

## Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

---

# 6. Experience Record API

---

## 6.1 Create Manual Experience

```http
POST /api/v1/experience
```

### Request

```json
{
  "title": "設備 A-102 Sensor 異常處理經驗",
  "department_id": "uuid",
  "category": "maintenance_case",
  "source_type": "manual",
  "expert_name": "王工程師",
  "content": "這台設備最常故障的是 Sensor 接頭鬆脫...",
  "tags": ["設備", "Sensor", "維修"],
  "permission_scope": "department",
  "language": "zh-TW"
}
```

### Response

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

---

## 6.2 Upload Experience File

```http
POST /api/v1/experience/upload
```

### Content-Type

```text
multipart/form-data
```

### Form Data

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

### Response

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

---

## 6.3 List Experiences

```http
GET /api/v1/experience
```

### Query Parameters

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

---

## 6.4 Get Experience Detail

```http
GET /api/v1/experience/{experience_id}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "設備 A-102 Sensor 異常處理經驗",
    "department_id": "uuid",
    "category": "maintenance_case",
    "source_type": "audio",
    "expert_name": "王工程師",
    "transcript": "這台設備最常故障的是 Sensor 接頭鬆脫...",
    "summary": "本經驗說明設備 A-102 常見 Sensor 異常排除方式。",
    "status": "reviewed",
    "tags": ["設備", "Sensor", "維修"],
    "permission_scope": "department",
    "created_at": "2026-06-25T10:00:00"
  },
  "message": "success"
}
```

---

## 6.5 Update Experience Metadata

```http
PUT /api/v1/experience/{experience_id}
```

### Request

```json
{
  "title": "設備 A-102 Sensor 故障排除經驗",
  "category": "maintenance_case",
  "expert_name": "王工程師",
  "tags": ["設備", "Sensor", "維修", "保養"],
  "permission_scope": "department"
}
```

---

## 6.6 Delete Experience

```http
DELETE /api/v1/experience/{experience_id}
```

---

# 7. Recording API

---

## 7.1 Create Recording Session

```http
POST /api/v1/experience/recording/session
```

### Request

```json
{
  "title": "老師傅設備維修訪談",
  "department_id": "uuid",
  "category": "maintenance_case",
  "expert_name": "王工程師",
  "permission_scope": "department",
  "language": "zh-TW"
}
```

### Response

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

---

## 7.2 Complete Recording Session

```http
POST /api/v1/experience/recording/session/{session_id}/complete
```

### Response

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

---

# 8. Processing API

---

## 8.1 Start Processing

```http
POST /api/v1/experience/{experience_id}/process
```

### Request

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

---

## 8.2 Get Processing Status

```http
GET /api/v1/experience/jobs/{job_id}
```

### Response

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

---

## 8.3 Retry Failed Job

```http
POST /api/v1/experience/jobs/{job_id}/retry
```

---

# 9. Transcript API

---

## 9.1 Get Transcript

```http
GET /api/v1/experience/{experience_id}/transcript
```

---

## 9.2 Update Transcript

```http
PUT /api/v1/experience/{experience_id}/transcript
```

### Request

```json
{
  "transcript": "修正後的逐字稿內容..."
}
```

---

## 9.3 Get Transcript Segments

```http
GET /api/v1/experience/{experience_id}/transcript/segments
```

---

# 10. AI Summary API

---

## 10.1 Generate Summary

```http
POST /api/v1/experience/{experience_id}/summary/generate
```

---

## 10.2 Get Summary

```http
GET /api/v1/experience/{experience_id}/summary
```

---

## 10.3 Update Summary

```http
PUT /api/v1/experience/{experience_id}/summary
```

### Request

```json
{
  "summary": "本經驗主要說明設備 Sensor 故障排除方式。",
  "key_points": [
    "常見原因為接頭鬆脫",
    "需測量電壓",
    "必要時更換 Sensor"
  ],
  "lessons_learned": [
    "定期保養需加入 Sensor 接頭檢查"
  ]
}
```

---

# 11. FAQ API

---

## 11.1 Generate FAQ

```http
POST /api/v1/experience/{experience_id}/faq/generate
```

---

## 11.2 List FAQ

```http
GET /api/v1/experience/{experience_id}/faq
```

---

## 11.3 Create FAQ Manually

```http
POST /api/v1/experience/{experience_id}/faq
```

### Request

```json
{
  "question": "設備 A-102 常見故障原因是什麼？",
  "answer": "最常見原因是 Sensor 接頭鬆脫，其次是電壓不穩。",
  "tags": ["設備", "Sensor"]
}
```

---

## 11.4 Update FAQ

```http
PUT /api/v1/experience/faq/{faq_id}
```

---

## 11.5 Delete FAQ

```http
DELETE /api/v1/experience/faq/{faq_id}
```

---

# 12. Case Study API

---

## 12.1 Generate Case Study

```http
POST /api/v1/experience/{experience_id}/case-study/generate
```

---

## 12.2 List Case Studies

```http
GET /api/v1/experience/{experience_id}/case-study
```

---

## 12.3 Create Case Study Manually

```http
POST /api/v1/experience/{experience_id}/case-study
```

### Request

```json
{
  "title": "設備 A-102 Sensor 異常案例",
  "problem": "設備運轉中頻繁停機。",
  "cause": "Sensor 接頭鬆脫。",
  "solution": "重新固定接頭並檢查電壓。",
  "result": "停機次數下降。",
  "lesson_learned": "例行保養需加入 Sensor 接頭檢查。"
}
```

---

## 12.4 Update Case Study

```http
PUT /api/v1/experience/case-study/{case_id}
```

---

## 12.5 Delete Case Study

```http
DELETE /api/v1/experience/case-study/{case_id}
```

---

# 13. Knowledge Publish API

---

## 13.1 Prepare Knowledge Items

```http
POST /api/v1/experience/{experience_id}/knowledge/prepare
```

### Response

```json
{
  "success": true,
  "data": {
    "knowledge_items": [
      {
        "type": "faq",
        "title": "設備 A-102 常見故障原因",
        "status": "draft"
      },
      {
        "type": "case",
        "title": "設備 A-102 Sensor 異常案例",
        "status": "draft"
      }
    ]
  },
  "message": "knowledge items prepared"
}
```

---

## 13.2 Publish Knowledge Items

```http
POST /api/v1/experience/{experience_id}/knowledge/publish
```

### Request

```json
{
  "knowledge_item_ids": ["uuid", "uuid"]
}
```

---

## 13.3 List Knowledge Items

```http
GET /api/v1/experience/{experience_id}/knowledge
```

---

# 14. Review API

---

## 14.1 Submit For Review

```http
POST /api/v1/experience/{experience_id}/review/submit
```

---

## 14.2 Approve Experience

```http
POST /api/v1/experience/{experience_id}/review/approve
```

### Request

```json
{
  "comment": "內容正確，可以發布。"
}
```

---

## 14.3 Reject Experience

```http
POST /api/v1/experience/{experience_id}/review/reject
```

### Request

```json
{
  "comment": "缺少設備型號與處理結果，請補充。"
}
```

---

# 15. Search API

---

## 15.1 Search Experience

```http
POST /api/v1/experience/search
```

### Request

```json
{
  "query": "設備 Sensor 故障如何排除？",
  "department_id": "uuid",
  "category": "maintenance_case",
  "top_k": 5,
  "filters": {
    "expert_name": "王工程師",
    "permission_scope": "department"
  }
}
```

### Response

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "experience_id": "uuid",
        "title": "設備 A-102 Sensor 異常處理經驗",
        "summary": "此經驗說明 Sensor 接頭鬆脫的排除方式。",
        "score": 0.92,
        "expert_name": "王工程師",
        "category": "maintenance_case"
      }
    ]
  },
  "message": "success"
}
```

---

# 16. Expert API

---

## 16.1 List Experts

```http
GET /api/v1/experience/experts
```

### Query Parameters

```text
department_id
keyword
tag
page
page_size
```

---

## 16.2 Get Expert Profile

```http
GET /api/v1/experience/experts/{expert_id}
```

---

# 17. Dashboard API

---

## 17.1 Experience Metrics

```http
GET /api/v1/experience/dashboard/metrics
```

### Response

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

---

## 17.2 Top Contributors

```http
GET /api/v1/experience/dashboard/top-contributors
```

---

# 18. Error Codes

| Code                         | Description     |
| ---------------------------- | --------------- |
| EXPERIENCE_NOT_FOUND         | 經驗資料不存在         |
| EXPERIENCE_PERMISSION_DENIED | 權限不足            |
| EXPERIENCE_UPLOAD_FAILED     | 經驗檔案上傳失敗        |
| UNSUPPORTED_FILE             | 不支援的檔案格式        |
| FILE_TOO_LARGE               | 檔案過大            |
| STT_FAILED                   | 語音轉文字失敗         |
| TRANSCRIPT_EMPTY             | 逐字稿為空           |
| SUMMARY_FAILED               | AI 摘要失敗         |
| FAQ_GENERATION_FAILED        | FAQ 生成失敗        |
| CASE_GENERATION_FAILED       | Case Study 生成失敗 |
| REVIEW_REQUIRED              | 需要人工審核          |
| PUBLISH_FAILED               | 發布失敗            |
| EMBEDDING_FAILED             | 向量化失敗           |

---

# 19. Required MVP APIs

v1.0 必須完成：

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

---

# 20. Next Step

本 API 文件完成後，下一步建議建立：

```text
spec/PRD/PRD_M04_SOP_Generator.md
```

M04 將把 M01 文件與 M03 經驗內容，轉換成標準化 SOP、流程圖與新人訓練教材。
