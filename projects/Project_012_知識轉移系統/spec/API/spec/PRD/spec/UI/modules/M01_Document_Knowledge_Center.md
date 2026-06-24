# M01_Document_Knowledge_Center

AI Knowledge Transfer System

Module Specification

Module : M01

Version : v1.0.0

Owner : Product Manager

Last Update : 2026-06-25

---

# 1. Module Overview

Document Knowledge Center 是整個 AI Knowledge Transfer System 的核心。

它的角色不是：

「文件上傳系統」

而是：

> Enterprise Knowledge Repository

企業知識中心。

作為：

* RAG
* AI QA
* SOP Generator
* Experience Transfer
* AI Agent
* Training Center

唯一知識來源（Single Source of Truth）。

---

# 2. Business Objectives

解決：

---

文件散落

```text
Word

Excel

PDF

PPT

Email

圖片

錄音

影片
```

---

知識找不到

---

版本混亂

---

老員工離職知識流失

---

新人找不到SOP

---

# 3. Module Responsibilities

M01負責：

### Document Management

文件管理

---

### OCR

文字辨識

---

### Chunking

文件切塊

---

### Embedding

向量化

---

### Metadata

文件屬性管理

---

### Search

搜尋

---

### Version Control

版本管理

---

### Permission

權限管理

---

# 4. User Story

---

Story 1

身為：

採購人員

我希望：

上傳採購SOP

讓其他人查詢

因此：

減少重複回答。

---

Story 2

身為：

新人

我希望：

輸入：

請購流程？

AI直接回答。

---

Story 3

身為：

主管

我希望：

管理SOP版本。

---

# 5. Business Flow

```text
Upload File

↓

Store Original File

↓

OCR

↓

Clean Text

↓

Chunking

↓

Embedding

↓

Metadata

↓

Review

↓

Publish

↓

Search

↓

AI QA
```

---

# 6. Upload Workflow

Step1

選擇文件

---

Step2

填寫：

```text
Title

Description

Department

Tags

Permission
```

---

Step3

Upload

---

Step4

Storage

MinIO

---

Step5

建立Document Record

---

Step6

Background Job

OCR

Chunking

Embedding

---

Step7

Published

---

# 7. Document Lifecycle

```text
Draft

↓

Uploaded

↓

Processing

↓

OCR

↓

Chunked

↓

Embedded

↓

Review

↓

Published

↓

Archived
```

---

# 8. State Machine

Document Status

```text
draft

↓

processing

↓

published

↓

archived


processing

↓

rejected
```

---

# 9. File Types

Support

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

jpg

png

mp3

wav

m4a

mp4

eml
```

---

# 10. Storage Design

Object Storage

MinIO

---

Structure

```text
documents/

department/

year/

month/

uuid/

filename
```

Example

```text
documents

procurement

2026

06

a12f34

procurement_sop.pdf
```

---

# 11. OCR Pipeline

Input

```text
PDF

Image

Scan
```

↓

OCR

↓

Extract Text

↓

Clean

↓

Store

---

Metadata

```text
page

confidence

language
```

---

# 12. Chunking Pipeline

Input

```text
Document
```

↓

Section Detection

↓

Chunk

↓

Metadata

↓

Store

---

Chunk Rule

```text
512 tokens

overlap

100 tokens
```

---

Chunk Metadata

```text
page

title

section

version

department
```

---

# 13. Embedding Pipeline

Chunk

↓

Embedding Model

↓

Vector

↓

pgvector

---

Store

```text
chunk_id

vector

model

dimension
```

---

# 14. Search Engine

Support

---

Keyword Search

```text
採購流程
```

---

Semantic Search

```text
請購流程怎麼做？
```

---

Hybrid Search

Keyword

*

Embedding

---

Ranking

Top K

---

# 15. Permission Model

Role

```text
Employee

Manager

Admin

Auditor
```

---

Document Scope

```text
public

department

private

confidential

admin_only
```

---

Permission Check

Search之前：

必須先檢查權限。

---

# 16. Version Control

Example

```text
採購SOP

v1.0

v1.1

v1.2

v2.0
```

---

每個版本：

```text
Version

Uploader

Change Note

Created Time
```

---

支援：

Compare

Rollback

---

# 17. AI Summary

文件上傳後：

AI自動產生：

---

Summary

```text
這份文件主要說明：

1.

2.

3.

4.
```

---

Keywords

```text
採購

SOP

請購

驗收
```

---

FAQ

```text
Q

請購流程？

A

...
```

---

# 18. Background Jobs

Queue

---

OCR Job

---

Chunk Job

---

Embedding Job

---

Summary Job

---

FAQ Job

---

Search Index Job

---

# 19. Retry Policy

OCR失敗

Retry

3次

---

Embedding失敗

Retry

3次

---

Upload失敗

Resume Upload

---

# 20. Error Handling

Error

```text
Unsupported File

OCR Failed

Chunk Failed

Embedding Failed

Permission Denied

Storage Error
```

---

Response

```json
{
"success":false,
"error":"OCR_FAILED"
}
```

---

# 21. Dashboard Metrics

Total Documents

---

Documents By Department

---

Upload Trend

---

OCR Success Rate

---

Embedding Count

---

Search Count

---

AI QA Count

---

# 22. Monitoring

Prometheus

---

Grafana

---

Track

```text
upload_time

ocr_time

embedding_time

search_time

qa_time
```

---

# 23. Security

JWT

---

RBAC

---

Department Isolation

---

Audit Log

---

File Encryption

---

Signed URL

---

Virus Scan

---

# 24. Scalability

Support

100,000+

Documents

---

10M+

Chunks

---

1M+

Embeddings

---

Concurrent Users

1000+

---

# 25. Dependencies

Database

PostgreSQL

---

Vector

pgvector

---

Storage

MinIO

---

Queue

Redis

Celery

---

AI

GPT

Claude

Gemini

---

OCR

Tesseract

PaddleOCR

---

# 26. Future Features

Image Caption

---

Video to SOP

---

Knowledge Graph

---

Auto FAQ

---

AI Knowledge Curator

---

# 27. Final Goal

M01 不只是：

Document Center

而是：

Enterprise Knowledge Repository

成為：

RAG

AI QA

Agent

Training

Analytics

Knowledge Graph

的核心知識引擎。
