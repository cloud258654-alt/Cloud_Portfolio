# Sprint_02_Document_Center

AI Knowledge Transfer System

Sprint Development Plan

Sprint : 02

Sprint Name : Enterprise Document Center

Version : v1.0.0

Owner : Project Manager / Tech Lead

Last Update : 2026-06-25

---

# 1. Sprint Goal

建立企業級文件管理中心（Document Center）。

完成後使用者可以：

* 上傳文件
* 建立資料夾
* 管理文件版本
* 編輯 Metadata
* 指派權限
* 分類文件
* 搜尋文件（Metadata）
* 下載文件
* 預覽文件
* 歸檔文件

**注意：本 Sprint 不解析文件內容。**

---

# 2. Business Value

Document Center 是 Knowledge Platform 的入口。

所有知識最終都來自：

```text
PDF
Word
Excel
PowerPoint
Image
Video
Audio
ZIP
Markdown
Text
```

Sprint 2 先解決：

**Document Lifecycle Management**

---

# 3. Scope

本 Sprint 包含：

```text
Document CRUD
Folder Management
Version Management
Metadata
Document Status
Document Preview
Download
Soft Delete
Restore
Permission Scope
Tag
Category
Favorite
Recent Documents
Document Activity
```

---

# 4. Out of Scope

不包含：

```text
OCR
Chunk
Embedding
Vector Search
AI QA
RAG
SOP
Training
```

全部留到 Sprint 3。

---

# 5. Database Tables

建立：

```text
knowledge.documents
knowledge.document_versions
knowledge.document_tags
knowledge.tags
knowledge.document_favorites
knowledge.document_activities
```

若不存在請建立 Migration。

---

# 6. Backend Folder

新增：

```text
backend/app/api/v1/endpoints/documents.py
backend/app/models/document.py
backend/app/models/tag.py
backend/app/schemas/document.py
backend/app/repositories/document_repository.py
backend/app/services/document_service.py
backend/app/services/storage_service.py
```

---

# 7. Storage

所有檔案存放：

```text
MinIO
```

Bucket：

```text
documents
```

路徑：

```text
documents/

department/

year/

month/

uuid_filename.ext
```

不得直接使用原始檔名。

---

# 8. Allowed File Types

允許：

```text
pdf
doc
docx
xls
xlsx
ppt
pptx
txt
md
csv
png
jpg
jpeg
webp
mp4
mov
mp3
wav
zip
```

---

# 9. Upload Constraints

單檔：

```text
1 GB
```

支援：

```text
Drag & Drop

Multiple Upload

Progress

Cancel Upload
```

---

# 10. Metadata

每份文件：

```text
Title
Description
Department
Category
Tags
Owner
Permission Scope
Classification
Language
Version
Expire Date
```

---

# 11. Document Status

狀態：

```text
draft
review
published
archived
deleted
```

---

# 12. API

## Upload

```http
POST /api/v1/documents
```

Multipart：

```text
file
title
department_id
category
tags
description
```

---

## List

```http
GET /api/v1/documents
```

支援：

```text
keyword
department
category
owner
status
tag
favorite
page
page_size
```

---

## Detail

```http
GET /api/v1/documents/{id}
```

---

## Update

```http
PUT /api/v1/documents/{id}
```

---

## Delete

```http
DELETE /api/v1/documents/{id}
```

Soft Delete：

```text
status=deleted
```

---

## Restore

```http
POST /api/v1/documents/{id}/restore
```

---

## Download

```http
GET /api/v1/documents/{id}/download
```

---

## Preview

```http
GET /api/v1/documents/{id}/preview
```

v1：

PDF：

Browser Preview

Office：

Download

Image：

Direct Preview

---

# 13. Version Management

支援：

```text
Upload New Version

History

Rollback

Compare Metadata
```

Version：

```text
v1.0.0

v1.1.0

v2.0.0
```

不得覆蓋舊版本。

---

# 14. Permission

Document：

```text
public

internal

department

private

confidential
```

依 Sprint 1 RBAC 控制。

---

# 15. Frontend Pages

建立：

```text
/documents

/documents/upload

/documents/{id}

/documents/favorites

/documents/recent
```

---

# 16. UI

依照：

Design_System.md

首頁：

```text
Search

Upload Button

Recent Documents

Favorite

Statistics

Category Cards
```

Document Card：

```text
File Icon

Title

Department

Version

Owner

Updated Time

Status

Tags
```

---

# 17. Document Detail

右側：

```text
Metadata

Version

Download

Preview

Activity

Permission

Favorite
```

---

# 18. Favorite

User：

可加入：

```text
Favorite
```

API：

```http
POST /documents/{id}/favorite
```

---

# 19. Activity Log

記錄：

```text
Upload

Download

Update

Delete

Restore

Preview
```

---

# 20. Backend Tests

建立：

```text
test_document_upload.py

test_document_list.py

test_document_download.py
```

至少：

```text
Upload

List

Update

Delete

Restore

Permission
```

---

# 21. Acceptance Criteria

完成：

```text
文件可上傳 MinIO

Metadata 可儲存 PostgreSQL

Version 可建立

Download 正常

Preview 正常

Favorite 正常

Recent 正常

Delete/Restore 正常

API Test 全部通過
```

---

# 22. Definition of Done

```text
CRUD 完成

Storage 完成

Version 完成

Metadata 完成

Favorite 完成

Activity Log 完成

Frontend 完成

Backend 完成

測試完成
```

---

# 23. Codex Execution

重要：

不要：

```text
OCR

Chunk

Embedding

AI QA

Search Index
```

那些全部：

Sprint 03。

本 Sprint：

只完成：

Enterprise Document Center。

---

# 24. Deliverables

完成後請輸出：

```text
完整 Folder Tree

API List

Migration

MinIO Structure

Frontend Pages

Test Result

Next Sprint
```

---

# 25. Next Sprint

下一個 Sprint：

```text
development/Sprint_03_Document_Ingestion.md
```

內容包含：

```text
OCR

Document Parser

Chunk

Embedding

Vector Database

Queue

Celery Worker

Background Jobs

Knowledge Extraction

Document Index Pipeline
```
