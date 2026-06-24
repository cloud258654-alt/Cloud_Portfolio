# PRD_M01_Document_Knowledge_Center

AI Knowledge Transfer System

Product Requirement Document

Version: v1.0.0
Module: M01
Module Name: Document Knowledge Center
Last Update: 2026-06-25
Owner: Product Manager

## 1. Module Vision

M01 Document Knowledge Center is the foundation of the AI Knowledge Transfer System.

It centralizes enterprise knowledge from:

- Word
- Excel
- PDF
- PPT
- Images
- Audio
- Video
- Markdown
- Email

The module provides a single source of truth for AI search, RAG, FAQ, SOP, AI QA, and version control.

## 2. Business Problems

### 2.1 Scattered Documents

Enterprise knowledge is often distributed across:

```text
Word
Excel
PDF
PPT
Email
LINE
Teams
Personal storage
```

This makes knowledge difficult to find, reuse, and govern.

### 2.2 Confusing SOP Versions

Common version naming issues:

```text
Purchase_SOP_v1
Purchase_SOP_new
Purchase_SOP_final
Purchase_SOP_final_final
Purchase_SOP_latest
```

Without clear version control, users cannot know which document is correct.

### 2.3 Knowledge Cannot Be Reused

Important knowledge exists in files, recordings, and personal experience but is not structured for search, RAG, or AI QA.

## 3. Module Objectives

- Build a centralized document repository.
- Prepare documents for AI search.
- Support RAG workflows.
- Support document version control.
- Support permission management.

## 4. User Roles

### Employee

Can:

- Search documents.
- View permitted documents.
- Ask AI questions based on document knowledge.

Cannot:

- Delete protected documents.

### Department Manager

Can:

- Manage department documents.
- Edit document metadata.
- Review documents.
- Approve documents.

### Administrator

Can:

- Manage all document knowledge settings and system-level document policies.

## 5. Supported File Types

| Type | Extension |
|---|---|
| PDF | .pdf |
| Word | .doc .docx |
| Excel | .xls .xlsx |
| PowerPoint | .ppt .pptx |
| Text | .txt |
| Markdown | .md |
| Image | .jpg .jpeg .png |
| Audio | .mp3 .wav .m4a |
| Video | .mp4 |
| Email | .eml |

## 6. Functional Requirements

### FR001 Upload Document

Users can upload supported document and media files.

Supported upload types:

```text
PDF
Word
Excel
PPT
Image
Audio
Video
```

Input fields:

```text
title
description
department
tags
permission_scope
document_type
```

Output fields:

```text
document_id
version
status
upload_time
```

### FR002 OCR

The system should support OCR for:

```text
scanned PDF
image
screenshot
```

Output:

```text
extracted_text
```

### FR003 Metadata

Each document should maintain metadata:

```text
document_id
title
department
tags
author
version
permission
status
created_time
updated_time
```

### FR004 Version Control

Supported version format:

```text
v1.0
v1.1
v1.2
v2.0
```

Version records should include:

```text
version
changed_by
changed_at
change_note
```

### FR005 Document Status

Supported statuses:

```text
draft
processing
published
archived
rejected
```

### FR006 Permission

Supported permission scopes:

```text
public
department
private
confidential
admin_only
```

### FR007 Search

The module should support keyword search, semantic search, and hybrid search.

Keyword search example:

```text
purchase process
```

Semantic search example:

```text
How do I submit a purchase request?
```

Expected AI-related results:

```text
Purchase SOP
Purchase process
FAQ
Related forms
```

Hybrid search combines:

```text
Keyword
+
Embedding
```

## 7. Non Functional Requirements

| Requirement | Target |
|---|---:|
| Upload 10MB document | < 5 seconds |
| OCR for 100-page PDF | < 1 minute |
| Search response | < 2 seconds |
| AI QA response | < 5 seconds |
| Availability | 99.5% |

## 8. Document Lifecycle

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

## 9. RAG Preparation

### Chunking

Example:

```text
Chunk 1
Purchase request overview

Chunk 2
Manager approval rules

Chunk 3
Required attachments
```

### Metadata

```text
page
section
department
version
permission
```

### Embedding

Embedding storage:

```text
pgvector
```

## 10. Search Workflow

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

## 11. AI QA Workflow

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

## 12. UI Pages

- Document List
- Document Upload
- Document Detail
- Document Version
- Document Search
- Document Preview
- Document Permission

## 13. Document Detail UI

The document detail page should show:

```text
document_name
version
status
department
created_time
updated_time
permission
tags
AI_summary
related_documents
```

## 14. Dashboard Widget

The dashboard should show:

```text
document_count
recent_documents
most_viewed_documents
high_value_documents
documents_pending_review
AI_search_count
```

## 15. API

Required document APIs:

```text
POST /documents/upload
GET /documents
GET /documents/{id}
PUT /documents/{id}
DELETE /documents/{id}
```

## 16. Database Tables

Related tables:

```text
documents
document_versions
document_chunks
embeddings
audit_logs
```

## 17. Security

Security requirements:

- RBAC
- Department Isolation
- JWT
- Audit Log
- Encryption

## 18. Future Features

### v1.1

- Image OCR enhancement

### v1.2

- Audio transcript

### v1.3

- Video to SOP

### v2.0

- Auto SOP
- Knowledge Graph
- AI Agent

## 19. Success KPI

| KPI | Target |
|---|---:|
| Document management completion | > 99% |
| OCR accuracy | > 95% |
| Search Accuracy | > 90% |
| AI Citation Rate | > 95% |
| User Satisfaction | > 4.5 / 5 |

## 20. Final Goal

M01 is the foundation of the Enterprise Knowledge Repository.

It enables:

- AI QA
- RAG
- Agent workflows
- Training
- Analytics

The final goal is to make document knowledge reliable, searchable, permission-aware, and usable as the system's single source of truth.
