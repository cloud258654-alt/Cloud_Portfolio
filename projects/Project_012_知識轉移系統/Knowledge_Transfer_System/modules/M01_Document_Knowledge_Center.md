# M01_Document_Knowledge_Center

AI Knowledge Transfer System

Module Specification

Module: M01
Version: v1.0.0
Owner: Product Manager
Last Update: 2026-06-25

## 1. Module Overview

Document Knowledge Center is the foundation of the AI Knowledge Transfer System.

It acts as the Enterprise Knowledge Repository and provides source knowledge for:

- RAG
- AI QA
- SOP Generator
- Experience Transfer
- AI Agent
- Training Center

The module establishes a reliable single source of truth for enterprise knowledge.

## 2. Business Objectives

The module addresses:

- Scattered documents across Word, Excel, PDF, PPT, Email, images, audio, and video.
- Knowledge that cannot be searched or reused.
- Confusing or duplicated document versions.
- Expert experience that is not captured as reusable knowledge.
- Training content that is not connected to SOP or document knowledge.

## 3. Module Responsibilities

M01 is responsible for:

- Document Management
- OCR
- Chunking
- Embedding
- Metadata
- Search
- Version Control
- Permission Management

## 4. User Story

### Story 1: Department Manager Uploads SOP

As a department manager, I want to upload a department SOP so employees can find and use the correct version.

Expected result:

- The SOP is stored, processed, indexed, and searchable.

### Story 2: Employee Searches Knowledge

As an employee, I want to ask how to complete a purchase request so AI can answer from approved knowledge.

Expected result:

- AI returns a grounded answer with citations.

### Story 3: Manager Maintains SOP Versions

As a manager, I want to manage SOP versions so the team always uses the correct document.

Expected result:

- Version history is visible and rollback or comparison is possible.

## 5. Business Flow

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

## 6. Upload Workflow

1. User selects a document.
2. User fills metadata:

```text
Title
Description
Department
Tags
Permission
```

3. User uploads the file.
4. File is stored in MinIO.
5. System creates a document record.
6. Background jobs run OCR, chunking, and embedding.
7. Document is reviewed and published.

## 7. Document Lifecycle

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

## 8. State Machine

Document status:

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

## 9. File Types

Supported file types:

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

## 10. Storage Design

Object storage:

```text
MinIO
```

Storage structure:

```text
documents/
department/
year/
month/
uuid/
filename
```

Example:

```text
documents/
procurement/
2026/
06/
a12f34/
procurement_sop.pdf
```

## 11. OCR Pipeline

Input:

```text
PDF
Image
Scan
```

Flow:

```text
OCR
↓
Extract Text
↓
Clean
↓
Store
```

Metadata:

```text
page
confidence
language
```

## 12. Chunking Pipeline

Flow:

```text
Document
↓
Section Detection
↓
Chunk
↓
Metadata
↓
Store
```

Chunk rule:

```text
512 tokens
overlap: 100 tokens
```

Chunk metadata:

```text
page
title
section
version
department
```

## 13. Embedding Pipeline

Flow:

```text
Chunk
↓
Embedding Model
↓
Vector
↓
pgvector
```

Stored fields:

```text
chunk_id
vector
model
dimension
```

## 14. Search Engine

Supported search modes:

- Keyword Search
- Semantic Search
- Hybrid Search

Keyword search example:

```text
purchase process
```

Semantic search example:

```text
How do I submit a purchase request?
```

Hybrid search:

```text
Keyword
+
Embedding
```

Ranking:

```text
Top K
```

## 15. Permission Model

Roles:

```text
Employee
Manager
Admin
Auditor
```

Document scopes:

```text
public
department
private
confidential
admin_only
```

Permission checks must apply before search results and AI citations are returned.

## 16. Version Control

Example:

```text
Purchase SOP
v1.0
v1.1
v1.2
v2.0
```

Version metadata:

```text
Version
Uploader
Change Note
Created Time
```

Supported actions:

- Compare
- Rollback

## 17. AI Summary

After document processing, AI can generate:

- Summary
- Keywords
- FAQ

Summary example:

```text
This document describes:
1. Purchase request preparation.
2. Manager approval.
3. Required attachments.
4. Related system steps.
```

Keywords example:

```text
purchase
SOP
approval
attachment
```

FAQ example:

```text
Q: How do I submit a purchase request?
A: Complete the request form, attach required documents, and submit it for manager approval.
```

## 18. Background Jobs

Queue jobs:

- OCR Job
- Chunk Job
- Embedding Job
- Summary Job
- FAQ Job
- Search Index Job

## 19. Retry Policy

- OCR failed: retry 3 times.
- Embedding failed: retry 3 times.
- Upload failed: support resume upload.

## 20. Error Handling

Errors:

```text
Unsupported File
OCR Failed
Chunk Failed
Embedding Failed
Permission Denied
Storage Error
```

Response example:

```json
{
  "success": false,
  "error": "OCR_FAILED"
}
```

## 21. Dashboard Metrics

- Total Documents
- Documents By Department
- Upload Trend
- OCR Success Rate
- Embedding Count
- Search Count
- AI QA Count

## 22. Monitoring

Tools:

- Prometheus
- Grafana

Tracked metrics:

```text
upload_time
ocr_time
embedding_time
search_time
qa_time
```

## 23. Security

Security requirements:

- JWT
- RBAC
- Department Isolation
- Audit Log
- File Encryption
- Signed URL
- Virus Scan

## 24. Scalability

Targets:

```text
100,000+ documents
10M+ chunks
1M+ embeddings
1000+ concurrent users
```

## 25. Dependencies

Database:

```text
PostgreSQL
```

Vector:

```text
pgvector
```

Storage:

```text
MinIO
```

Queue:

```text
Redis
Celery
```

AI:

```text
GPT
Claude
Gemini
```

OCR:

```text
Tesseract
PaddleOCR
```

## 26. Future Features

- Image Caption
- Video to SOP
- Knowledge Graph
- Auto FAQ
- AI Knowledge Curator

## 27. Final Goal

M01 provides the Enterprise Knowledge Repository for:

- RAG
- AI QA
- Agent workflows
- Training
- Analytics
- Knowledge Graph

The final goal is to make enterprise documents structured, searchable, governed, reusable, and AI-ready.
