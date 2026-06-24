# AI Knowledge Transfer System (KTS)

## System Architecture

Version: v1.0.0
Document Type: System Architecture
Author: Project Manager / System Architect
Last Updated: 2026-06-25

## 1. Architecture Goal

The architecture goal is to build a modular AI Knowledge Transfer System that can collect, process, secure, search, and reuse enterprise knowledge.

The architecture supports:

- Document knowledge management
- AI question answering
- RAG-based knowledge retrieval
- Audio and video knowledge processing
- SOP generation
- Training workflows
- AI Agent assistance
- LINE Bot access
- Offboarding knowledge transfer
- Permission control
- Knowledge governance
- Analytics dashboard

## 2. High Level Architecture

```text
User
├── Web App
├── Mobile Browser
└── LINE Bot
    ↓
Frontend Layer
Next.js / React / Tailwind / Shadcn UI
    ↓
Backend API Layer
FastAPI / Python
    ├── Auth Service
    ├── Document Service
    ├── Search Service
    ├── RAG Service
    ├── AI QA Service
    ├── Agent Service
    ├── Training Service
    ├── Analytics Service
    └── Admin Service
    ↓
AI Processing Layer
OCR / Speech-to-Text / Chunking / Embedding / RAG / LLM / Agent
    ↓
Data Layer
PostgreSQL / pgvector / Redis / MinIO
```

## 3. Frontend Layer

### 3.1 Technology

- Next.js
- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- Zustand or Redux Toolkit
- React Query

### 3.2 Main Pages

```text
/pages
├── dashboard
├── documents
├── ai-chat
├── sop
├── training
├── agents
├── analytics
├── admin
└── login
```

### 3.3 UI Principles

- Clear navigation
- Fast search access
- Source visibility for AI answers
- Department-aware views
- Simple review and approval flows
- Usable on desktop and mobile browser

## 4. Backend API Layer

### 4.1 Technology

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Alembic
- Celery
- Redis

### 4.2 Backend Services

```text
/backend
├── auth_service
├── document_service
├── ingestion_service
├── search_service
├── rag_service
├── qa_service
├── agent_service
├── training_service
├── governance_service
├── analytics_service
└── admin_service
```

### 4.3 Service Responsibility

| Service | Responsibility |
|---|---|
| Auth Service | Login, JWT, SSO, and user identity |
| Document Service | Document upload, metadata, versioning, and file management |
| Ingestion Service | OCR, speech-to-text, chunking, and embedding |
| Search Service | Keyword search, vector search, and hybrid search |
| RAG Service | Retrieval, context assembly, permission filtering, and citation handling |
| QA Service | AI answer generation, conversation records, and feedback |
| Agent Service | AI Agent workflow orchestration |
| Training Service | Training content, quiz flow, and learning records |
| Governance Service | Review, approval, knowledge ownership, and lifecycle management |
| Analytics Service | Usage, search, QA, training, and knowledge gap analysis |
| Admin Service | System configuration, roles, permissions, and audit management |

## 5. AI Processing Layer

### 5.1 OCR

OCR is used for scanned PDFs, images, screenshots, and document images.

```text
Image / PDF
↓
OCR
↓
Extracted Text
```

### 5.2 Speech to Text

Speech-to-text is used for interviews, meetings, training videos, and handover recordings.

Supported direction:

- Whisper
- Enterprise speech-to-text provider

```text
Audio
↓
Speech-to-Text
↓
Transcript
↓
Summary
↓
FAQ / Knowledge Item
```

### 5.3 Document Chunking

Documents are split into chunks before embedding and RAG retrieval.

Chunk metadata should include:

```text
document_id
chunk_id
title
section
page_number
department
version
permission_scope
created_at
```

### 5.4 Embedding

Embeddings support semantic search, RAG retrieval, FAQ matching, and related knowledge discovery.

Storage options:

- pgvector
- External vector database, if required later

### 5.5 RAG

```text
User Question
↓
Query Rewrite
↓
Hybrid Search
↓
Retrieve Relevant Chunks
↓
Permission Filter
↓
Context Assembly
↓
LLM Answer
↓
Citation
↓
User Feedback
```

### 5.6 LLM

The system should allow model provider abstraction.

Potential providers:

- OpenAI GPT
- Claude
- Gemini
- Local LLM

### 5.7 AI Agent

AI Agent workflows support task-oriented assistance, such as finding SOPs, checking related knowledge, suggesting next steps, and producing summaries.

## 6. Data Layer

### 6.1 PostgreSQL

Used for:

- Users
- Roles
- Documents
- Permissions
- Conversations
- Training records
- Audit logs

### 6.2 pgvector

Used for:

- Document chunk embeddings
- FAQ embeddings
- Experience embeddings
- SOP embeddings

### 6.3 Redis

Used for:

- Cache
- Background job queue
- Rate limit
- Session support

### 6.4 MinIO / Object Storage

Used for:

- Original files
- Images
- Audio files
- Video files
- Generated documents

## 7. Core Data Flow

### 7.1 Document Ingestion Flow

```text
Upload File
↓
Store Original File
↓
Extract Text
↓
OCR if Needed
↓
Clean Text
↓
Chunking
↓
Embedding
↓
Store Metadata
↓
Index Ready
```

### 7.2 AI QA Flow

```text
User Question
↓
Auth Check
↓
Search Relevant Chunks
↓
Permission Filter
↓
Build Context
↓
LLM Generate Answer
↓
Return Answer + Citation
↓
Save Conversation
↓
Collect Feedback
```

### 7.3 Experience Transfer Flow

```text
Audio / Interview / Note
↓
Speech-to-Text
↓
Summarization
↓
FAQ Extraction
↓
Knowledge Review
↓
Approval
↓
Embedding
↓
Searchable Knowledge
```

### 7.4 SOP Generator Flow

```text
Document / Video / Audio
↓
Content Extraction
↓
Process Analysis
↓
Step Extraction
↓
SOP Draft
↓
Flowchart
↓
Manager Review
↓
Publish
```

## 8. Security Architecture

### 8.1 Authentication

- Email / Password
- OAuth
- SSO
- JWT

### 8.2 Authorization

The system uses RBAC.

Roles:

- Employee
- Department Manager
- Administrator
- Auditor

### 8.3 Permission Scope

```text
Public
Department
Private
Confidential
Admin Only
```

### 8.4 Audit Log

Audit events should include:

- Login
- Upload
- Delete
- Download
- AI Query
- Permission Change
- Document Approval
- Export

## 9. Module Dependency

| Module | Depends On |
|---|---|
| M01 Document Knowledge Center | Auth, Storage, DB |
| M02 AI QA Assistant | M01, Search, RAG, LLM |
| M03 Experience Transfer | STT, AI Summary, M01 |
| M04 SOP Generator | M01, LLM, Flowchart |
| M05 Training Center | M01, M02, User Role |
| M06 AI Agent | M01, M02, M12, Agent Service |
| M07 LINE Bot | M02, Auth, API |
| M08 Screen Record To SOP | Video Processing, M04 |
| M09 Offboarding AI | M01, M03, M04 |
| M10 Knowledge Governance | M01, Approval Workflow |
| M11 Permission Management | Auth, RBAC, Audit |
| M12 Search Engine | M01, pgvector, Keyword Search |
| M13 Analytics Dashboard | Logs, QA, Search, Training |

## 10. Deployment Architecture

### 10.1 Local Development

```text
Frontend
Backend
PostgreSQL
Redis
MinIO
```

Recommended tooling: Docker Compose.

### 10.2 Production

```text
Nginx
↓
Frontend
↓
Backend API
↓
PostgreSQL + pgvector
↓
Redis
↓
MinIO
↓
AI Provider API
```

### 10.3 Optional Enterprise Deployment

- On-Premise
- Private Cloud
- Hybrid Cloud

## 11. Recommended Future Folder Structure

This section is a future implementation reference only. These folders are not created during the current documentation-only phase.

```text
Knowledge_Transfer_System/
├── frontend/
├── backend/
├── database/
│   ├── schemas/
│   ├── migrations/
│   └── seed/
├── modules/
├── spec/
│   ├── API/
│   ├── ERD/
│   ├── PRD/
│   ├── TEST/
│   └── UI/
├── prompts/
├── assets/
└── versions/
```

## 12. Architecture Principles

### 12.1 Modular First

Each module should remain independently understandable and maintainable.

### 12.2 API First

Web, LINE Bot, and Agent workflows should communicate through clear API boundaries.

### 12.3 AI Provider Abstraction

The system should avoid hard dependency on a single AI provider.

### 12.4 Security by Design

Permission, audit, and data protection should be part of the architecture from the beginning.

### 12.5 Citation Required

AI-generated answers should include source citations when based on enterprise knowledge.

### 12.6 Human Review

High-impact knowledge, SOPs, and AI-generated content should support human review before publishing.

## 13. Next Documents

Recommended next documents:

- spec/ERD/ERD_v1.md
- spec/API/API_v1.md
- spec/PRD/PRD_M01_Document_Knowledge_Center.md
- modules/M01_Document_Knowledge_Center.md
