# Task070105_REST_API

AI Knowledge Transfer System

Task Specification

Task ID : TASK-07-01-05

Epic : EPIC-07 Enterprise AI SOP Generator

Story : STORY-07-01 Database Foundation

Sprint : Sprint 07

Task Name : SOP REST API Layer

Version : v1.0.0

Priority : High

Estimated Effort : 4~6 Hours

Owner : Backend Engineer

Status : Ready

Last Update : 2026-06-26

---

# 1. Task Goal

建立 SOP 模組的 FastAPI REST API Layer。

本 Task 只負責建立 Router / Endpoint / API Wiring，並呼叫已完成的 Service Layer。

不得在 API Layer 撰寫商業邏輯。

目標架構：

```text
FastAPI Router
    ↓
Service Layer
    ↓
Repository Layer
    ↓
SQLAlchemy ORM
    ↓
PostgreSQL
```

---

# 2. Current Completed Dependencies

已完成：

```text
Task070101 Alembic Migration      ✅
Task070102 SQLAlchemy Models      ✅
Task070103 Repository Layer       ✅
Task070104 Service Layer          ✅
```

本 Task 必須基於既有 Service Layer 實作。

---

# 3. Scope

本 Task 僅完成：

* SOP Router
* SOP CRUD API
* SOP Version API
* SOP Step API
* SOP Review API
* SOP Publish API
* SOP Archive API
* Router registration
* Basic request / response wiring
* Error mapping

---

# 4. Out of Scope

不得建立或修改：

* AI SOP Generator
* Mermaid Generator
* Export PDF / Word
* Frontend
* Tests
* Migration
* Repository major refactor
* Service major refactor
* Workflow Engine
* Permission Engine

---

# 5. Target Files

允許新增：

```text
backend/app/api/v1/endpoints/sops.py
```

允許必要時更新：

```text
backend/app/api/v1/router.py
```

若專案已有 router 聚合結構，請依現有架構註冊。

---

# 6. API Prefix

所有 SOP API 掛載於：

```text
/api/v1/sops
```

---

# 7. Required API Endpoints

## 7.1 SOP CRUD

### Create SOP

```http
POST /api/v1/sops
```

用途：

建立 SOP Draft。

---

### List SOPs

```http
GET /api/v1/sops
```

支援 query：

```text
keyword
department_id
status
template_id
created_by
page
page_size
```

---

### Get SOP Detail

```http
GET /api/v1/sops/{sop_id}
```

---

### Update SOP

```http
PUT /api/v1/sops/{sop_id}
```

---

### Soft Delete SOP

```http
DELETE /api/v1/sops/{sop_id}
```

只呼叫 Service soft delete，不可直接刪除資料。

---

### Restore SOP

```http
POST /api/v1/sops/{sop_id}/restore
```

---

# 8. SOP Status API

### Submit for Review

```http
POST /api/v1/sops/{sop_id}/submit
```

---

### Publish SOP

```http
POST /api/v1/sops/{sop_id}/publish
```

---

### Archive SOP

```http
POST /api/v1/sops/{sop_id}/archive
```

---

# 9. SOP Version API

### Create Version

```http
POST /api/v1/sops/{sop_id}/versions
```

---

### List Versions

```http
GET /api/v1/sops/{sop_id}/versions
```

---

### Rollback Version

```http
POST /api/v1/sops/{sop_id}/versions/{version_id}/rollback
```

---

# 10. SOP Step API

### List Steps

```http
GET /api/v1/sops/{sop_id}/versions/{version_id}/steps
```

---

### Add Step

```http
POST /api/v1/sops/{sop_id}/versions/{version_id}/steps
```

---

### Update Step

```http
PUT /api/v1/sops/{sop_id}/versions/{version_id}/steps/{step_id}
```

---

### Delete Step

```http
DELETE /api/v1/sops/{sop_id}/versions/{version_id}/steps/{step_id}
```

---

### Reorder Steps

```http
POST /api/v1/sops/{sop_id}/versions/{version_id}/steps/reorder
```

---

# 11. SOP Review API

### List Reviews

```http
GET /api/v1/sops/{sop_id}/versions/{version_id}/reviews
```

---

### Approve Review

```http
POST /api/v1/sops/{sop_id}/versions/{version_id}/approve
```

---

### Reject Review

```http
POST /api/v1/sops/{sop_id}/versions/{version_id}/reject
```

---

### Request Revision

```http
POST /api/v1/sops/{sop_id}/versions/{version_id}/request-revision
```

---

# 12. SOP Template API

### List Templates

```http
GET /api/v1/sops/templates
```

---

### Get Template

```http
GET /api/v1/sops/templates/{template_id}
```

---

### Create Template

```http
POST /api/v1/sops/templates
```

---

### Update Template

```http
PUT /api/v1/sops/templates/{template_id}
```

---

### Deactivate Template

```http
POST /api/v1/sops/templates/{template_id}/deactivate
```

---

# 13. Request / Response Rule

若專案已有 Standard Response：

```json
{
  "success": true,
  "data": {},
  "message": "success"
}
```

請沿用。

不得自創不同格式。

---

# 14. Pydantic Schema Rule

若目前尚未有 SOP Pydantic Schema：

可在本 Task 中建立最小 request model 於 `sops.py` 內部，僅供 API 使用。

但不要建立大型 schema 檔案。

正式 Schema 可留到下一個 Task。

---

# 15. Dependency Rule

API Layer 可使用：

```text
get_db
get_current_user
SOPService
```

若 `get_current_user` 尚未成熟，可先以 TODO 標記，但不要破壞既有 Auth。

---

# 16. Business Logic Rule

API Layer 不得寫：

* 狀態轉換邏輯
* publish validation
* review validation
* version rollback logic
* step reorder logic

全部交給 Service Layer。

---

# 17. Error Mapping

Service Layer Exception 需轉換為 HTTP response：

```text
SOPNotFoundError -> 404
SOPInvalidStatusError -> 400
SOPPublishValidationError -> 400
SOPReviewError -> 400
Unexpected Error -> 500
```

---

# 18. Router Registration

更新：

```text
backend/app/api/v1/router.py
```

加入：

```python
api_router.include_router(sops.router, prefix="/sops", tags=["SOP"])
```

實際語法需配合專案既有 router 命名。

---

# 19. Logging

API 需保留基本 logging：

```text
create_sop
update_sop
publish_sop
archive_sop
review_sop
```

不得記錄敏感資訊。

---

# 20. Permission Ready

本 Task 不實作完整 Permission。

但 Endpoint 需預留：

```text
current_user
current_user_id
department_id
```

未來接 M11 Permission Management。

---

# 21. OpenAPI / Swagger

完成後 Swagger `/docs` 必須能顯示：

* SOP CRUD
* Version
* Step
* Review
* Template

---

# 22. Acceptance Criteria

完成後必須符合：

* `sops.py` 可正常 import
* router 可成功註冊
* FastAPI 啟動無錯
* Swagger 顯示 SOP endpoints
* API 層只呼叫 Service
* API 層無直接 DB SQL
* API 層無 AI 呼叫
* API 層無 Frontend 修改
* Service Exceptions 有對應 HTTP status

---

# 23. Definition of Done

完成定義：

* SOP Router 完成
* CRUD Endpoint 完成
* Version Endpoint 完成
* Step Endpoint 完成
* Review Endpoint 完成
* Template Endpoint 完成
* Router Registration 完成
* Swagger 可顯示
* FastAPI 啟動成功
* 完成後停止

---

# 24. Codex / OpenCode Execution Instruction

請依照本 Task 執行。

重要限制：

不要建立：

```text
AI Generator
Mermaid
Export
Frontend
Tests
Migration
Major Repository Refactor
Major Service Refactor
```

只允許建立 / 修改：

```text
backend/app/api/v1/endpoints/sops.py
backend/app/api/v1/router.py
```

必要時可在 `sops.py` 內建立最小 request model。

完成後請回報：

```text
新增檔案
修改檔案
Endpoint 清單
Router 註冊位置
是否有直接 DB SQL
是否有 AI 呼叫
是否有 Frontend 修改
Swagger 是否正常
FastAPI 是否正常啟動
是否有 import / lint warning
```

---

# 25. Next Task

下一個 Task：

```text
Task070106_API_Schema_Validation.md
```

內容：

* 正式 Pydantic Schema
* Request / Response Models
* Input Validation
* Pagination Response
* OpenAPI Response Example
