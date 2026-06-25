# Sprint_03_Document_Ingestion

AI Knowledge Transfer System

Sprint Development Plan

Sprint : 03

Sprint Name : Document Ingestion Pipeline & Knowledge Extraction

Version : v1.0.0

Owner : Project Manager / AI Architect

Last Update : 2026-06-25

---

# 1. Sprint Goal

建立完整的 Document Ingestion Pipeline。

Document Center 上傳完成後，

系統必須自動完成：

```text
Upload

↓

Queue

↓

Document Parser

↓

OCR

↓

Text Extraction

↓

Chunk

↓

Metadata Extraction

↓

Embedding

↓

Vector Storage

↓

Knowledge Index

↓

Ready For AI QA
```

完成後：

Document 即可被：

* AI QA
* Search
* Agent
* SOP
* Training

共同使用。

---

# 2. Business Value

Sprint 03 是整個 Knowledge Platform 的核心。

所有 AI 能力都依賴：

Knowledge Pipeline。

---

# 3. Scope

本 Sprint 包含：

```text
Document Queue
Background Worker
Document Parser
OCR
Language Detection
Chunk Generation
Metadata Extraction
Embedding
Vector Database
Knowledge Index
Retry
Error Handling
Processing Status
```

---

# 4. Out of Scope

不包含：

```text
AI QA
Chat
Search UI
SOP
Training
Agent
```

---

# 5. Pipeline

完整流程：

```text
Document Uploaded
        │
        ▼
Queue
        │
        ▼
Worker
        │
        ▼
File Type Detection
        │
        ▼
Parser
        │
        ▼
OCR (if needed)
        │
        ▼
Text Cleaning
        │
        ▼
Language Detection
        │
        ▼
Chunk Builder
        │
        ▼
Metadata Extraction
        │
        ▼
Embedding
        │
        ▼
pgvector
        │
        ▼
Knowledge Ready
```

---

# 6. Worker Architecture

建立 Celery Worker：

```text
document_worker

ocr_worker

embedding_worker

metadata_worker

retry_worker
```

每個 Worker：

只能負責一件事。

---

# 7. Supported File Types

Parser：

```text
PDF

DOCX

PPTX

XLSX

TXT

MD

CSV
```

OCR：

```text
PNG

JPG

JPEG

WEBP

Scanned PDF
```

Media：

```text
MP3

WAV

MP4

MOV
```

---

# 8. Parser

建立：

```text
DocumentParser
```

依副檔名：

```text
PDFParser

WordParser

ExcelParser

PowerPointParser

MarkdownParser

TextParser
```

採用 Strategy Pattern。

---

# 9. OCR

建立：

```text
OCRService
```

預設：

```text
PaddleOCR
```

Fallback：

```text
Tesseract
```

OCR Output：

```text
page

text

bbox

confidence

language
```

---

# 10. Chunk Strategy

Chunk Size：

```text
800 Tokens
```

Overlap：

```text
100 Tokens
```

Chunk Metadata：

```text
Document

Page

Section

Chunk Index

Token Count

Language
```

---

# 11. Metadata Extraction

AI 自動抽取：

```text
Title

Keywords

Department

Topic

Language

Summary

Entities

Tags
```

---

# 12. Language Detection

支援：

```text
Traditional Chinese

Simplified Chinese

English

Japanese
```

每個 Chunk：

需記錄：

```text
language
```

---

# 13. Embedding

使用：

依 AI_Model_Strategy。

流程：

```text
Chunk

↓

Embedding

↓

pgvector
```

每個 Chunk：

一筆 Vector。

---

# 14. Database

新增：

```text
knowledge.ingestion_jobs

knowledge.chunk_metadata

knowledge.embedding_jobs
```

更新：

```text
document_chunks

embeddings
```

---

# 15. Status

Document：

```text
uploaded

processing

parsed

embedded

indexed

completed

failed
```

Frontend：

需即時看到。

---

# 16. Retry

失敗：

自動：

```text
Retry

3 Times
```

之後：

```text
failed
```

需人工重新執行。

---

# 17. API

建立：

## Reprocess

```http
POST /documents/{id}/reprocess
```

---

## Processing Status

```http
GET /documents/{id}/processing
```

---

## Chunk List

```http
GET /documents/{id}/chunks
```

---

## Metadata

```http
GET /documents/{id}/metadata
```

---

# 18. Frontend

Document Detail：

新增：

```text
Processing Status

Progress Bar

Chunk Count

Embedding Status

Language

Summary

Metadata
```

---

# 19. Progress

例如：

```text
Upload

██████████

OCR

██████

Chunk

███████

Embedding

████

Completed
```

---

# 20. Logging

記錄：

```text
parser

ocr

chunk

embedding

retry

processing time
```

---

# 21. Performance

要求：

100MB PDF：

```text
30 秒內完成
```

1000 頁：

背景處理。

不得阻塞 API。

---

# 22. Tests

建立：

```text
test_pdf_parser.py

test_ocr.py

test_chunk.py

test_embedding.py
```

---

# 23. Acceptance Criteria

完成：

```text
PDF 可解析

DOCX 可解析

OCR 正常

Chunk 正常

Embedding 正常

Vector 正常

Retry 正常

Processing API 正常

Frontend Status 正常
```

---

# 24. Definition of Done

```text
Worker 完成

Queue 完成

Parser 完成

OCR 完成

Chunk 完成

Embedding 完成

Metadata 完成

Processing UI 完成

API 完成

Tests 完成
```

---

# 25. Codex Execution

本 Sprint：

不要：

```text
AI QA

Search UI

Chat

Agent
```

只完成：

Knowledge Pipeline。

---

# 26. Deliverables

請輸出：

```text
Folder Tree

Worker Tree

Parser List

Queue Flow

API List

Migration

Test Result

Performance Result
```

---

# 27. Next Sprint

下一個 Sprint：

```text
development/Sprint_04_Hybrid_Search.md
```

內容：

```text
BM25

Vector Search

Hybrid Search

Reranker

Citation

Permission Filter

Search API

Search UI

Search Analytics
```
