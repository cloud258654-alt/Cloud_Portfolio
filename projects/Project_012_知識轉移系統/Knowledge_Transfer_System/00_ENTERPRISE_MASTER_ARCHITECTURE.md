# Enterprise AI Platform Master Architecture

System: AI Knowledge Transfer System (KTS)  
Version: v2.0.0-enterprise  
Document Type: Enterprise Master Architecture  
Last Updated: 2026-06-25  
Execution Order: Architecture -> Database -> API -> Module

## 1. Purpose

This document is the execution entry point for building the Enterprise AI Platform. It consolidates the existing KTS architecture, ERD, API, PRD, and module documents into one implementation sequence.

The platform goal is to turn enterprise documents, employee experience, SOPs, training knowledge, and operational workflows into governed, searchable, AI-ready knowledge.

## 2. Enterprise Scope

The Enterprise AI Platform includes:

- Enterprise Knowledge Repository
- Document ingestion, OCR, chunking, embedding, and version control
- Hybrid search and RAG retrieval
- AI QA assistant with citation and feedback
- Experience transfer from audio, video, text, interviews, and meetings
- SOP generation and approval workflow
- Training center connected to enterprise knowledge
- AI agent orchestration
- LINE Bot and external channel access
- Permission, RBAC, audit, and governance
- Analytics dashboard for knowledge usage and gaps

## 3. Architecture Layering

```text
Client Channels
  Web App / Mobile Browser / LINE Bot / Admin Console

Frontend Layer
  Next.js / React / TypeScript / Tailwind / Shadcn UI

Backend API Layer
  FastAPI / Pydantic / SQLAlchemy / Alembic

Domain Services
  Auth / Document / Ingestion / Search / RAG / QA / Agent
  Training / Governance / Analytics / Admin

AI Processing Layer
  OCR / Speech-to-Text / Chunking / Embedding / RAG / LLM / Agent Tools

Data Layer
  PostgreSQL / pgvector / Redis / MinIO

Operations Layer
  Docker Compose / Observability / Audit / Backups / CI
```

## 4. Execution Roadmap

### Phase A: Architecture Baseline

Reference documents:

- `03_System_Architecture.md`
- `spec/ERD/ERD_v1.md`
- `spec/API/API_v1.md`
- `modules/`

Deliverables:

- Master architecture and execution sequence
- Service boundary map
- Module dependency map
- Platform non-functional requirements

Status: Completed in this document.

### Phase B: Database Foundation

Reference:

- `database/schema_v1.sql`
- `spec/ERD/ERD_v1.md`

Deliverables:

- PostgreSQL schema
- pgvector extension setup
- RBAC tables
- Document, chunk, embedding, QA, feedback, audit, governance, training, and agent tables
- Required indexes and vector index

Status: Ready for implementation.

### Phase C: API Contract

Reference:

- `spec/API/API_v1.md`
- `spec/API/openapi/openapi_v1.yaml`

Deliverables:

- REST API contract under `/api/v1`
- Standard response envelope
- Auth, user, department, document, ingestion, search, AI QA, feedback, audit, admin, module APIs
- RBAC expectations

Status: Ready for backend implementation.

### Phase D: Module Implementation

Reference:

- `modules/M01_Document_Knowledge_Center.md`
- `modules/M02_AI_QA_Assistant.md`
- `modules/M03_Experience_Transfer.md`
- `modules/M04_SOP_Generator.md`
- `modules/M05_Training_Center.md`
- `modules/M06_AI_Agent.md`
- `modules/M07_LINE_Bot.md`
- `modules/M08_Screen_Record_To_SOP.md`
- `modules/M09_Offboarding_AI.md`
- `modules/M10_Knowledge_Governance.md`
- `modules/M11_Permission_Management.md`
- `modules/M12_Search_Engine.md`
- `modules/M13_Analytics_Dashboard.md`

Deliverables:

- Feature modules implemented against the database and API contract
- Background processing jobs
- Frontend pages and admin workflows
- Tests for permission, ingestion, retrieval, citation, and audit behavior

Status: Sequenced by `MODULE_EXECUTION_MATRIX.md`.

## 5. Service Boundary Map

| Service | Primary Responsibility | Primary Tables |
|---|---|---|
| Auth Service | Login, JWT, roles, identity | users, roles, user_roles |
| Department Service | Organization tree | departments |
| Document Service | Upload, metadata, versions, lifecycle | documents, document_versions |
| Ingestion Service | OCR, text extraction, chunking, embedding jobs | document_chunks, embeddings, ingestion_jobs |
| Search Service | Keyword, vector, hybrid search | documents, document_chunks, embeddings |
| RAG Service | Permission filtering, context assembly, citation mapping | document_chunks, citations |
| QA Service | Conversation, answer generation, feedback | conversations, conversation_messages, feedbacks |
| Experience Service | Transcript, summary, extracted knowledge | experience_records, knowledge_items |
| SOP Service | SOP draft, review, publish | knowledge_items, approval_workflows |
| Training Service | Courses, lessons, progress | training_courses, training_lessons, training_progress |
| Agent Service | Agent task orchestration | agent_tasks, agent_steps |
| Governance Service | Approval, lifecycle, ownership | approval_workflows, approval_steps |
| Analytics Service | Metrics, usage, knowledge gaps | audit_logs, conversations, feedbacks |
| Admin Service | Settings, health, audit access | system_settings, audit_logs |

## 6. Core Platform Flows

### 6.1 Document To RAG

```text
Upload -> Store Object -> Create Document Version -> Extract Text
-> OCR If Needed -> Chunk -> Embed -> Publish -> Search/RAG Ready
```

Required guarantees:

- Each AI answer must be traceable to source chunks when enterprise knowledge is used.
- Permission filtering must run before returning search results or citations.
- Document version and chunk version must remain linked.

### 6.2 AI QA

```text
Question -> Auth/RBAC -> Hybrid Search -> Permission Filter
-> Context Assembly -> LLM Answer -> Citation Persist -> Feedback
```

Required guarantees:

- Grounded answers include citations.
- Ungrounded answers must be marked as non-enterprise-source responses.
- Feedback is linked to the assistant message.

### 6.3 Knowledge Governance

```text
Draft Knowledge -> Review Request -> Approval Steps
-> Approved/Rejected -> Publish/Archive -> Audit
```

Required guarantees:

- High-impact knowledge, SOPs, and policy content require human review.
- Approval decisions are auditable.

### 6.4 Agent Execution

```text
Task Request -> Plan Steps -> Retrieve Knowledge -> Execute Tools
-> Validate Output -> Persist Result -> Audit
```

Required guarantees:

- Every agent task stores steps and status.
- Agent outputs should cite enterprise knowledge when used.
- Failed steps preserve enough payload metadata for debugging.

## 7. Permission Model

Roles:

- Employee
- Department Manager
- Administrator
- Auditor

Document scopes:

- public
- department
- private
- confidential
- admin_only

Permission rules:

- Employee can access public and allowed department knowledge.
- Department Manager can manage department knowledge and review department workflows.
- Administrator has full system access.
- Auditor can read audit and governed records but cannot mutate operational data.
- Search, RAG, QA, Agent, Training, and Analytics must enforce the same permission model.

## 8. Platform Non-Functional Requirements

| Area | Requirement |
|---|---|
| Security | JWT, RBAC, audit logging, signed object access |
| Traceability | Document version -> chunk -> citation -> answer |
| Reliability | Background jobs are retryable and observable |
| Scalability | 100K+ documents, 10M+ chunks, 1M+ embeddings |
| Maintainability | API-first modules with clear service ownership |
| Governance | Human review for SOP, policy, and high-impact AI-generated knowledge |
| Observability | Health checks, metrics, ingestion status, audit trail |

## 9. Implementation Milestones

| Milestone | Scope | Exit Criteria |
|---|---|---|
| M0 | Platform contracts | Master architecture, DB schema, OpenAPI, module matrix exist |
| M1 | Auth and organization | Login, JWT, user, role, department APIs work |
| M2 | Document foundation | Upload, version, metadata, ingestion job lifecycle work |
| M3 | Search and RAG | Keyword/vector/hybrid search with permission filtering |
| M4 | AI QA | Ask API returns answer, citations, conversation, feedback |
| M5 | Governance | Approval workflow, audit, lifecycle enforcement |
| M6 | Experience and SOP | Audio/text experience to knowledge item and SOP draft |
| M7 | Training and Agent | Training flows and agent orchestration |
| M8 | Analytics and Channels | Dashboard metrics and LINE Bot/API channel integration |

## 10. Source Of Truth

Build order:

1. Architecture: this document and `03_System_Architecture.md`
2. Database: `database/schema_v1.sql`
3. API: `spec/API/API_v1.md` and `spec/API/openapi/openapi_v1.yaml`
4. Module: `MODULE_EXECUTION_MATRIX.md` and `modules/`

Any future code implementation should treat these files as the contract before creating frontend, backend, or worker services.
