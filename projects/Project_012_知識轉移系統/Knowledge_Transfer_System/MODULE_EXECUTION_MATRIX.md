# Module Execution Matrix

System: AI Knowledge Transfer System (KTS)  
Version: v2.0.0-enterprise  
Last Updated: 2026-06-25

## 1. Purpose

This matrix converts the Enterprise AI Platform architecture into module-level implementation order. Each module must be implemented against:

1. `00_ENTERPRISE_MASTER_ARCHITECTURE.md`
2. `database/schema_v1.sql`
3. `spec/API/API_v1.md`
4. `spec/API/openapi/openapi_v1.yaml`

## 2. Build Sequence

| Order | Module | Implementation Goal | Depends On | Primary API |
|---:|---|---|---|---|
| 1 | M11 Permission Management | JWT, RBAC, department isolation, audit baseline | departments, users, roles | Auth, Users, Departments, Audit |
| 2 | M01 Document Knowledge Center | Upload, metadata, versioning, storage lifecycle | M11, MinIO, DB | Documents, Versions |
| 3 | M12 Search Engine | Keyword, vector, hybrid search with permission filters | M01, pgvector | Search |
| 4 | M02 AI QA Assistant | RAG answer, citation, conversation, feedback | M01, M12, LLM | AI QA, Feedback |
| 5 | M10 Knowledge Governance | Approval workflow and publish/archive lifecycle | M01, M11 | Approval, Audit |
| 6 | M03 Experience Transfer | Transcript, summary, FAQ/case extraction | M01, M02, STT | Experience, Knowledge |
| 7 | M04 SOP Generator | SOP draft, flow, review, publish | M01, M03, M10 | Knowledge, Approval |
| 8 | M05 Training Center | Course and lesson creation from knowledge | M01, M02, M11 | Training |
| 9 | M06 AI Agent | Agent task planning and step orchestration | M02, M12, M10 | Agent |
| 10 | M08 Screen Record To SOP | Video extraction to SOP draft | M04, STT/video processing | Experience, Knowledge |
| 11 | M09 Offboarding AI | Offboarding interview to reusable handover knowledge | M03, M04, M10 | Experience, Knowledge |
| 12 | M07 LINE Bot | Channel adapter to AI QA and document search | M02, Auth | Auth, AI QA, Search |
| 13 | M13 Analytics Dashboard | Usage, search, QA, feedback, training analytics | All audit-capable modules | Admin, Audit, Metrics |

## 3. Module Contracts

### M11 Permission Management

Tables:

- departments
- users
- roles
- user_roles
- audit_logs

Exit criteria:

- User can login and retrieve profile.
- Role checks protect admin-only APIs.
- Department isolation can be evaluated for a document.
- Audit log can be written for login, upload, delete, AI query, approval, and export.

### M01 Document Knowledge Center

Tables:

- documents
- document_versions
- document_chunks
- embeddings
- ingestion_jobs

Exit criteria:

- Document upload creates document and version records.
- Ingestion job tracks queued, processing, completed, and failed states.
- Chunks are linked to the exact document version.
- Published documents are searchable.

### M12 Search Engine

Tables:

- documents
- document_chunks
- embeddings

Exit criteria:

- Keyword search returns permitted chunks.
- Vector search returns permitted chunks.
- Hybrid search combines keyword and vector ranking.
- Search never leaks private, confidential, or admin-only content.

### M02 AI QA Assistant

Tables:

- conversations
- conversation_messages
- citations
- feedbacks

Exit criteria:

- Ask API stores user and assistant messages.
- Grounded answers include citations.
- Citation records link message, chunk, and document.
- Feedback can be submitted and audited.

### M10 Knowledge Governance

Tables:

- approval_workflows
- approval_steps
- audit_logs
- documents
- knowledge_items

Exit criteria:

- Approval workflow can be opened for document, SOP, or knowledge item.
- Approvers can approve or reject in sequence.
- Publish/archive actions are auditable.

### M03 Experience Transfer

Tables:

- experience_records
- knowledge_items
- embeddings

Exit criteria:

- Audio, video, text, interview, and meeting records can be created.
- Transcript and summary are persisted.
- Extracted FAQ, case, tip, or policy item can enter governance review.

### M04 SOP Generator

Tables:

- knowledge_items
- approval_workflows
- approval_steps

Exit criteria:

- SOP draft can be generated from document, experience, or screen record source.
- SOP draft keeps source references.
- SOP cannot publish without review when governance requires it.

### M05 Training Center

Tables:

- training_courses
- training_lessons
- training_progress

Exit criteria:

- Course can be created from published knowledge.
- Lesson can reference source document.
- User progress and completion are tracked.

### M06 AI Agent

Tables:

- agent_tasks
- agent_steps
- citations
- audit_logs

Exit criteria:

- Agent task can be accepted, executed, completed, failed, or cancelled.
- Each task stores ordered execution steps.
- Agent output cites retrieved enterprise knowledge when applicable.

### M07 LINE Bot

Tables:

- conversations
- conversation_messages
- citations
- audit_logs

Exit criteria:

- LINE channel maps incoming user identity to platform user identity.
- LINE questions use the same AI QA API and permission model.
- Responses keep citations where available.

### M08 Screen Record To SOP

Tables:

- experience_records
- knowledge_items
- approval_workflows

Exit criteria:

- Screen recording can be stored as an experience source.
- Transcript or extracted steps can generate an SOP draft.
- SOP draft enters governance review.

### M09 Offboarding AI

Tables:

- experience_records
- knowledge_items
- training_courses
- approval_workflows

Exit criteria:

- Offboarding interview captures critical handover knowledge.
- Extracted handover knowledge can become FAQ, SOP, case, or training material.
- Department manager can review and publish.

### M13 Analytics Dashboard

Tables:

- audit_logs
- conversations
- conversation_messages
- citations
- feedbacks
- training_progress
- documents

Exit criteria:

- Dashboard shows document count, ingestion status, search usage, QA usage, feedback quality, and training progress.
- Knowledge gaps can be inferred from failed search, low confidence answers, and negative feedback.

## 4. Implementation Rule

Every module must define:

- Database tables it owns or reads.
- API endpoints it exposes or consumes.
- Permission checks.
- Audit events.
- Background jobs, if any.
- Test cases for success path, permission denial, and failure path.
