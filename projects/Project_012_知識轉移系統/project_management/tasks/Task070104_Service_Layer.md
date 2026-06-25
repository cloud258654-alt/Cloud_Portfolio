# Task070104_Service_Layer

AI Knowledge Transfer System

Task Specification

Task ID : TASK-07-01-04

Epic : EPIC-07 Enterprise AI SOP Generator

Story : STORY-07-01 Database Foundation

Sprint : Sprint 07

Task Name : SOP Service Layer

Version : v1.0.0

Priority : High

Estimated Effort : 4~6 Hours

Owner : Backend Engineer

Status : Ready

Last Update : 2026-06-25

---

# 1. Task Goal

建立 SOP 模組的 Service Layer。

本 Task 只負責建立 SOP 商業邏輯層，讓後續 REST API、AI Generator、Review Workflow、Frontend 都能透過 Service 存取 SOP 功能。

Service Layer 必須位於：

```text
backend/app/services/sop_service.py
```

---

# 2. Why Service Layer

目前已完成：

```text
Task070101 Alembic Migration
Task070102 SQLAlchemy Models
Task070103 Repository Layer
```

接下來不可直接：

```text
API -> Repository
```

必須採用企業級分層：

```text
API
 ↓
Service
 ↓
Repository
 ↓
Database
```

原因：

* 商業規則集中管理
* 方便加入 Audit Log
* 方便加入 Permission Check
* 方便加入 Review Workflow
* 方便加入 AI Generation
* 方便加入 Notification
* 方便未來 Agent 呼叫

---

# 3. Scope

本 Task 僅完成：

* SOPService
* SOPTemplateService
* SOPVersionService
* SOPReviewService
* SOPAttachmentService
* 基礎商業規則
* 狀態轉換
* 版本建立
* Soft Delete
* Publish / Archive 基礎邏輯

---

# 4. Out of Scope

不得建立：

* REST API
* Router
* Pydantic Schema
* Frontend
* AI SOP Generator
* Mermaid Generator
* Export PDF / Word
* Tests
* Migration
* Repository 修改（除非必要修 bug）

---

# 5. Target Files

新增：

```text
backend/app/services/sop_service.py
```

必要時可更新：

```text
backend/app/services/__init__.py
```

不得新增其他檔案，除非現有專案架構必要。

---

# 6. Required Classes

在 `sop_service.py` 中建立：

```text
SOPService
SOPTemplateService
SOPVersionService
SOPReviewService
SOPAttachmentService
```

若專案風格偏向單一 Service，可建立一個 `SOPService`，但必須以清楚 method 分區管理。

---

# 7. SOPService Methods

至少包含：

```text
create_sop()
update_sop()
get_sop()
get_sop_by_code()
list_sops()
list_sops_by_department()
soft_delete_sop()
restore_sop()
archive_sop()
publish_sop()
```

---

# 8. SOP Version Methods

至少包含：

```text
create_version()
get_current_version()
list_versions()
rollback_to_version()
```

規則：

* 不得覆蓋舊版本
* 每次發布或重大修改需建立新 version
* version 格式預設 `v1.0.0`
* rollback 不刪除歷史版本，只切換 current version

---

# 9. SOP Step Methods

至少包含：

```text
add_step()
update_step()
delete_step()
reorder_steps()
list_steps()
```

規則：

* step_order 不可重複
* reorder 必須保持連續排序
* delete_step 採 soft delete 或從版本中移除，依現有資料結構處理

---

# 10. SOP Review Methods

至少包含：

```text
submit_for_review()
approve_review()
reject_review()
request_revision()
list_reviews()
```

狀態：

```text
Draft
Review
Approved
Published
Archived
Deleted
```

Review 狀態：

```text
Pending
Approved
Rejected
Need Revision
```

---

# 11. SOP Attachment Methods

至少包含：

```text
add_attachment()
list_attachments()
remove_attachment()
```

本 Task 不處理 MinIO 上傳。

Attachment 僅處理已存在的：

```text
file_name
storage_path
mime_type
file_size
uploaded_by
```

---

# 12. SOP Template Methods

至少包含：

```text
create_template()
update_template()
get_template()
list_templates()
deactivate_template()
```

---

# 13. Business Rules

Service Layer 必須落實以下規則：

## 13.1 Status Transition

允許：

```text
Draft -> Review
Review -> Approved
Approved -> Published
Published -> Archived
Archived -> Draft
```

禁止：

```text
Published -> Review
Deleted -> Published
```

---

## 13.2 Publish Rule

發布 SOP 前必須符合：

```text
has_title
has_current_version
has_steps
review_status = Approved
```

不符合時需丟出明確例外。

---

## 13.3 Archive Rule

只有 Published 或 Approved 的 SOP 可 Archive。

---

## 13.4 Soft Delete Rule

刪除不直接移除資料。

需更新：

```text
deleted_at
status = Deleted
```

---

## 13.5 Restore Rule

只有 Deleted SOP 可 Restore。

Restore 後狀態預設：

```text
Draft
```

---

# 14. Error Handling

請使用專案既有 exception pattern。

若沒有專用 exception，可建立 Service 內部明確例外類別，但不要新增新檔案。

至少支援：

```text
SOPNotFoundError
SOPInvalidStatusError
SOPPublishValidationError
SOPVersionError
SOPReviewError
```

錯誤訊息需清楚，方便 API 層轉換。

---

# 15. Transaction Rule

Service 方法應假設由外層管理 DB Session。

不要在每個 method 中自行建立新的 DB 連線。

需要多步驟操作時，應保持同一 session。

---

# 16. Repository Usage

Service 必須透過：

```text
backend/app/repositories/sop_repository.py
```

不得直接寫複雜 SQL。

允許使用 repository 已提供方法。

若 repository 方法不足，先用現有方法完成；除非必要，不要修改 repository。

---

# 17. Audit Ready

本 Task 不實作 Audit Log。

但 Service method 需保留未來可插入 audit 的位置，例如：

```text
# TODO: audit log
```

不要實際寫 audit service。

---

# 18. Permission Ready

本 Task 不實作 permission check。

但 method 參數需保留：

```text
current_user_id
department_id
```

以便後續 API 或 Permission Service 使用。

---

# 19. AI Ready

本 Task 不實作 AI。

但方法命名需保留未來擴充：

```text
create_sop()
create_version()
```

不要建立：

```text
generate_ai_sop()
```

AI 相關留給 Story0703。

---

# 20. Coding Standard

遵守：

* Python Type Hint
* SQLAlchemy Session 注入
* Repository Pattern
* No hard-coded DB session
* No API dependency
* No FastAPI Depends
* No Frontend
* No AI call

---

# 21. Acceptance Criteria

完成後必須符合：

* `sop_service.py` 可正常 import
* Service class 可初始化
* Service methods 命名完整
* Status transition 有明確控制
* Publish validation 有實作
* 不直接操作 API / Router
* 不建立任何 Frontend / AI / Tests
* 不修改 Migration

---

# 22. Definition of Done

完成定義：

* SOPService 完成
* Template methods 完成
* Version methods 完成
* Step methods 完成
* Review methods 完成
* Attachment methods 完成
* Business rules 完成
* Error handling 完成
* Code Review Ready
* 完成後停止

---

# 23. Codex / OpenCode Execution Instruction

請依照本 Task 執行。

重要限制：

不要建立：

```text
API
Router
Schema
Frontend
AI
Tests
Migration
Export
Mermaid
```

只允許建立 / 修改：

```text
backend/app/services/sop_service.py
backend/app/services/__init__.py
```

完成後請回報：

```text
新增檔案
修改檔案
Service class 清單
Method 清單
Business rules 實作狀態
是否有直接 DB SQL
是否有 circular import
是否有 lint / import warning
```

---

# 24. Next Task

下一個 Task：

```text
Task070105_REST_API.md
```

內容：

* SOP CRUD API
* Review API
* Version API
* Publish API
* Archive API
* Swagger Docs
