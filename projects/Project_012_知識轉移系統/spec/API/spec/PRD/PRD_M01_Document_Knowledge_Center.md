# PRD_M01_Document_Knowledge_Center

AI Knowledge Transfer System

Product Requirement Document

Version : v1.0.0

Module : M01

Module Name : Document Knowledge Center

Last Update : 2026-06-25

Owner : Product Manager

---

# 1. Module Vision

建立企業統一的知識文件中心。

將：

Word

Excel

PDF

PPT

圖片

錄音

影片

Markdown

Email

統一保存。

並提供：

* AI搜尋
* RAG
* FAQ
* SOP
* AI問答
* Version Control

成為企業唯一知識來源（Single Source of Truth）。

---

# 2. Business Problems

企業目前：

### 文件散落

```text
Word

Excel

PDF

PPT

Email

Line

Teams

共享資料夾
```

無法搜尋。

---

### SOP版本混亂

例如：

```text
採購SOP_v1

採購SOP_new

採購SOP_final

採購SOP_final_final

採購SOP_latest
```

不知道哪份才正確。

---

### 知識無法傳承

老員工離職

↓

知識跟著消失。

---

# 3. Module Objectives

目標：

---

Objective 1

建立統一文件中心

---

Objective 2

文件支援AI搜尋

---

Objective 3

支援RAG

---

Objective 4

支援版本控制

---

Objective 5

支援權限管理

---

# 4. User Roles

## Employee

可以：

* 搜尋文件
* 閱讀文件
* AI問答

不能：

* 刪除文件

---

## Department Manager

可以：

* 上傳文件
* 編輯Metadata
* 發布文件
* 審核文件

---

## Administrator

可以：

* 所有操作

---

# 5. Supported File Types

支援：

| Type       | Extension       |
| ---------- | --------------- |
| PDF        | .pdf            |
| Word       | .doc .docx      |
| Excel      | .xls .xlsx      |
| PowerPoint | .ppt .pptx      |
| Text       | .txt            |
| Markdown   | .md             |
| Image      | .jpg .jpeg .png |
| Audio      | .mp3 .wav .m4a  |
| Video      | .mp4            |
| Email      | .eml            |

---

# 6. Functional Requirements

---

## FR001 Upload Document

使用者可以：

上傳：

```text
PDF

Word

Excel

PPT

Image

Audio

Video
```

---

輸入：

```text
標題

描述

部門

標籤

權限

文件類型
```

---

輸出：

```text
Document ID

Version

Status

Upload Time
```

---

## FR002 OCR

如果：

```text
掃描PDF

圖片

照片
```

系統：

自動OCR。

---

輸出：

```text
Extracted Text
```

---

## FR003 Metadata

每份文件必須有：

```text
Document ID

Title

Department

Tags

Author

Version

Permission

Status

Created Time

Updated Time
```

---

## FR004 Version Control

支援：

```text
v1.0

v1.1

v1.2

v2.0
```

並保留：

```text
版本

修改者

修改時間

修改說明
```

---

## FR005 Document Status

狀態：

```text
draft

processing

published

archived

rejected
```

---

## FR006 Permission

權限：

```text
public

department

private

confidential

admin_only
```

---

## FR007 Search

支援：

### Keyword Search

例如：

```text
採購流程
```

---

### Semantic Search

例如：

```text
請購流程怎麼做？
```

AI找到：

```text
採購SOP

請購表單

FAQ

流程圖
```

---

### Hybrid Search

Keyword

*

Embedding

---

# 7. Non Functional Requirement

---

## Upload Time

10MB文件

< 5 秒

---

## OCR

100頁PDF

< 1分鐘

---

## Search

< 2 秒

---

## AI QA

< 5 秒

---

## Availability

99.5%

---

# 8. Document Lifecycle

```text
Upload

↓

Processing

↓

OCR

↓

Chunking

↓

Embedding

↓

Review

↓

Published

↓

Archived
```

---

# 9. RAG Preparation

文件需要：

---

Chunking

例如：

```text
Chunk 1

採購流程


Chunk 2

主管簽核


Chunk 3

驗收入庫
```

---

Metadata

```text
page

section

department

version

permission
```

---

Embedding

存入：

pgvector

---

# 10. Search Workflow

```text
User Search

↓

Permission Check

↓

Keyword Search

+

Vector Search

↓

Ranking

↓

Top K

↓

Return Results
```

---

# 11. AI QA Workflow

```text
Question

↓

Hybrid Search

↓

Retrieve Chunks

↓

Permission Filter

↓

RAG Context

↓

LLM

↓

Answer

↓

Citation

↓

Feedback
```

---

# 12. UI Pages

---

Document List

---

Document Upload

---

Document Detail

---

Document Version

---

Document Search

---

Document Preview

---

Document Permission

---

# 13. Document Detail UI

顯示：

```text
文件名稱

版本

作者

部門

建立時間

修改時間

權限

標籤

AI摘要

相關文件
```

---

# 14. Dashboard Widget

顯示：

```text
文件總數

各部門文件

最新文件

熱門文件

待審核文件

AI搜尋次數
```

---

# 15. API

使用：

```text
POST

/documents/upload


GET

/documents


GET

/documents/{id}


PUT

/documents/{id}


DELETE

/documents/{id}
```

---

# 16. Database Tables

使用：

```text
documents

document_versions

document_chunks

embeddings

audit_logs
```

---

# 17. Security

必須：

RBAC

Department Isolation

JWT

Audit Log

Encryption

---

# 18. Future Features

v1.1

圖片OCR

---

v1.2

Audio Transcript

---

v1.3

Video to SOP

---

v2.0

Auto SOP

Knowledge Graph

AI Agent

---

# 19. Success KPI

文件上傳成功率

> 99%

---

OCR成功率

> 95%

---

Search Accuracy

> 90%

---

AI Citation Rate

> 95%

---

User Satisfaction

> 4.5 / 5

---

# 20. Final Goal

M01 不只是：

Document Center

而是：

Enterprise Knowledge Repository

成為：

AI QA

RAG

Agent

Training

Analytics

的核心資料來源（Single Source of Truth）。
