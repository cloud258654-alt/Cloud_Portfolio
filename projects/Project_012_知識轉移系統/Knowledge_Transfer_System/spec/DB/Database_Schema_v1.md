# Database_Schema_v1

AI Knowledge Transfer System

Database Specification

Version : v1.0.0

Owner : System Architect

Last Update : 2026-06-25

---

# 1. Purpose

本文件定義 AI Knowledge Transfer System v1.0 的資料庫設計。

資料庫需支援：

* 使用者與組織
* 權限與角色
* 文件知識庫
* RAG Chunk
* Embedding
* AI QA
* 經驗轉移
* SOP
* Training
* Agent
* Governance
* Search
* Analytics
* Audit Log

---

# 2. Database Engine

建議：

```text
PostgreSQL 16+
```

必要 Extension：

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

---

# 3. Global Design Rules

所有資料表需遵守：

```text
id UUID PRIMARY KEY
created_at TIMESTAMP
updated_at TIMESTAMP
deleted_at TIMESTAMP NULL
status VARCHAR
metadata JSONB
```

---

# 4. Core Schemas

建議使用 PostgreSQL schema 分域管理：

```text
auth
org
knowledge
ai
training
agent
governance
analytics
audit
```

---

# 5. Auth Domain

---

## 5.1 auth.users

```sql
CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    job_title VARCHAR(100),
    employment_status VARCHAR(50) DEFAULT 'active',
    status VARCHAR(50) DEFAULT 'active',
    last_login_at TIMESTAMP NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);
```

---

## 5.2 auth.roles

```sql
CREATE TABLE auth.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);
```

---

## 5.3 auth.user_roles

```sql
CREATE TABLE auth.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    role_id UUID NOT NULL REFERENCES auth.roles(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);
```

---

## 5.4 auth.permissions

```sql
CREATE TABLE auth.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(150) UNIQUE NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5.5 auth.role_permissions

```sql
CREATE TABLE auth.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES auth.roles(id),
    permission_id UUID NOT NULL REFERENCES auth.permissions(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);
```

---

# 6. Organization Domain

---

## 6.1 org.departments

```sql
CREATE SCHEMA IF NOT EXISTS org;

CREATE TABLE org.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NULL REFERENCES org.departments(id),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);
```

---

# 7. Knowledge Domain

---

## 7.1 knowledge.documents

```sql
CREATE SCHEMA IF NOT EXISTS knowledge;

CREATE TABLE knowledge.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NULL REFERENCES org.departments(id),
    uploaded_by UUID NULL REFERENCES auth.users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_type VARCHAR(50),
    storage_path TEXT NOT NULL,
    permission_scope VARCHAR(50) DEFAULT 'department',
    classification VARCHAR(50) DEFAULT 'internal',
    status VARCHAR(50) DEFAULT 'draft',
    current_version VARCHAR(50) DEFAULT 'v1.0.0',
    expire_at TIMESTAMP NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);
```

---

## 7.2 knowledge.document_versions

```sql
CREATE TABLE knowledge.document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES knowledge.documents(id),
    version_no VARCHAR(50) NOT NULL,
    file_hash VARCHAR(255),
    storage_path TEXT NOT NULL,
    change_note TEXT,
    created_by UUID NULL REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(document_id, version_no)
);
```

---

## 7.3 knowledge.document_chunks

```sql
CREATE TABLE knowledge.document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES knowledge.documents(id),
    document_version_id UUID NULL REFERENCES knowledge.document_versions(id),
    chunk_index INTEGER NOT NULL,
    title VARCHAR(255),
    section VARCHAR(255),
    page_number INTEGER,
    content TEXT NOT NULL,
    token_count INTEGER DEFAULT 0,
    permission_scope VARCHAR(50) DEFAULT 'department',
    classification VARCHAR(50) DEFAULT 'internal',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7.4 knowledge.embeddings

```sql
CREATE TABLE knowledge.embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_type VARCHAR(100) NOT NULL,
    source_id UUID NOT NULL,
    embedding_model VARCHAR(150) NOT NULL,
    vector VECTOR(1536),
    dimension INTEGER DEFAULT 1536,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7.5 knowledge.knowledge_items

```sql
CREATE TABLE knowledge.knowledge_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_type VARCHAR(100),
    source_id UUID,
    department_id UUID NULL REFERENCES org.departments(id),
    title VARCHAR(255) NOT NULL,
    knowledge_type VARCHAR(100) NOT NULL,
    question TEXT,
    answer TEXT,
    content TEXT,
    permission_scope VARCHAR(50) DEFAULT 'department',
    classification VARCHAR(50) DEFAULT 'internal',
    status VARCHAR(50) DEFAULT 'draft',
    created_by UUID NULL REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);
```

---

# 8. AI QA Domain

---

## 8.1 ai.conversations

```sql
CREATE SCHEMA IF NOT EXISTS ai;

CREATE TABLE ai.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    title VARCHAR(255),
    channel VARCHAR(50) DEFAULT 'web',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);
```

---

## 8.2 ai.conversation_messages

```sql
CREATE TABLE ai.conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai.conversations(id),
    sender_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    model_name VARCHAR(150),
    token_usage INTEGER DEFAULT 0,
    confidence_score NUMERIC(5,2),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 8.3 ai.citations

```sql
CREATE TABLE ai.citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES ai.conversation_messages(id),
    source_type VARCHAR(100) NOT NULL,
    source_id UUID NOT NULL,
    document_id UUID NULL REFERENCES knowledge.documents(id),
    chunk_id UUID NULL REFERENCES knowledge.document_chunks(id),
    page_number INTEGER,
    quote_text TEXT,
    relevance_score NUMERIC(5,2),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 8.4 ai.feedbacks

```sql
CREATE TABLE ai.feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES ai.conversation_messages(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    rating INTEGER,
    feedback_type VARCHAR(100),
    comment TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

# 9. Experience Domain

---

## 9.1 knowledge.experience_records

```sql
CREATE TABLE knowledge.experience_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NULL REFERENCES auth.users(id),
    department_id UUID NULL REFERENCES org.departments(id),
    title VARCHAR(255) NOT NULL,
    source_type VARCHAR(100),
    category VARCHAR(100),
    expert_name VARCHAR(150),
    raw_storage_path TEXT,
    transcript TEXT,
    summary TEXT,
    permission_scope VARCHAR(50) DEFAULT 'department',
    classification VARCHAR(50) DEFAULT 'internal',
    status VARCHAR(50) DEFAULT 'draft',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);
```

---

# 10. SOP Domain

---

## 10.1 knowledge.sops

```sql
CREATE TABLE knowledge.sops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NULL REFERENCES org.departments(id),
    title VARCHAR(255) NOT NULL,
    sop_type VARCHAR(100),
    purpose TEXT,
    scope TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    mermaid_flowchart TEXT,
    version_no VARCHAR(50) DEFAULT 'v1.0.0',
    permission_scope VARCHAR(50) DEFAULT 'department',
    classification VARCHAR(50) DEFAULT 'internal',
    status VARCHAR(50) DEFAULT 'draft',
    created_by UUID NULL REFERENCES auth.users(id),
    approved_by UUID NULL REFERENCES auth.users(id),
    approved_at TIMESTAMP NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);
```

---

## 10.2 knowledge.sop_versions

```sql
CREATE TABLE knowledge.sop_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sop_id UUID NOT NULL REFERENCES knowledge.sops(id),
    version_no VARCHAR(50) NOT NULL,
    content JSONB DEFAULT '{}'::jsonb,
    mermaid_flowchart TEXT,
    change_note TEXT,
    created_by UUID NULL REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(sop_id, version_no)
);
```

---

# 11. Training Domain

---

## 11.1 training.courses

```sql
CREATE SCHEMA IF NOT EXISTS training;

CREATE TABLE training.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NULL REFERENCES org.departments(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(50) DEFAULT 'beginner',
    duration_minutes INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    created_by UUID NULL REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);
```

---

## 11.2 training.lessons

```sql
CREATE TABLE training.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES training.courses(id),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    lesson_order INTEGER DEFAULT 0,
    reference_source_type VARCHAR(100),
    reference_source_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 11.3 training.quizzes

```sql
CREATE TABLE training.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NULL REFERENCES training.lessons(id),
    course_id UUID NULL REFERENCES training.courses(id),
    question TEXT NOT NULL,
    question_type VARCHAR(100) DEFAULT 'single_choice',
    options JSONB DEFAULT '[]'::jsonb,
    answer JSONB DEFAULT '{}'::jsonb,
    explanation TEXT,
    score INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 11.4 training.progress

```sql
CREATE TABLE training.progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    course_id UUID NOT NULL REFERENCES training.courses(id),
    progress_percent NUMERIC(5,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'not_started',
    score NUMERIC(5,2),
    completed_at TIMESTAMP NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);
```

---

## 11.5 training.certificates

```sql
CREATE TABLE training.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    course_id UUID NOT NULL REFERENCES training.courses(id),
    certificate_no VARCHAR(100) UNIQUE NOT NULL,
    score NUMERIC(5,2),
    level VARCHAR(50),
    issued_at TIMESTAMP DEFAULT NOW(),
    expire_at TIMESTAMP NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);
```

---

# 12. Agent Domain

---

## 12.1 agent.agents

```sql
CREATE SCHEMA IF NOT EXISTS agent;

CREATE TABLE agent.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    agent_type VARCHAR(100) NOT NULL,
    description TEXT,
    capabilities JSONB DEFAULT '[]'::jsonb,
    tools JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'active',
    version_no VARCHAR(50) DEFAULT 'v1.0.0',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 12.2 agent.tasks

```sql
CREATE TABLE agent.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requested_by UUID NOT NULL REFERENCES auth.users(id),
    agent_id UUID NULL REFERENCES agent.agents(id),
    task_title VARCHAR(255),
    task_input TEXT,
    task_output TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(50) DEFAULT 'normal',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP NULL
);
```

---

## 12.3 agent.steps

```sql
CREATE TABLE agent.steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES agent.tasks(id),
    step_order INTEGER DEFAULT 0,
    action_type VARCHAR(100),
    input_payload JSONB DEFAULT '{}'::jsonb,
    output_payload JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP NULL
);
```

---

## 12.4 agent.memories

```sql
CREATE TABLE agent.memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NULL REFERENCES agent.agents(id),
    user_id UUID NULL REFERENCES auth.users(id),
    memory_type VARCHAR(100),
    content TEXT,
    embedding_id UUID NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

# 13. Governance Domain

---

## 13.1 governance.approval_workflows

```sql
CREATE SCHEMA IF NOT EXISTS governance;

CREATE TABLE governance.approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type VARCHAR(100) NOT NULL,
    target_id UUID NOT NULL,
    requested_by UUID NULL REFERENCES auth.users(id),
    status VARCHAR(50) DEFAULT 'pending',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 13.2 governance.approval_steps

```sql
CREATE TABLE governance.approval_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES governance.approval_workflows(id),
    approver_id UUID NOT NULL REFERENCES auth.users(id),
    step_order INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    comment TEXT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

# 14. Audit Domain

---

## 14.1 audit.audit_logs

```sql
CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE audit.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NULL REFERENCES auth.users(id),
    action VARCHAR(150) NOT NULL,
    target_type VARCHAR(100),
    target_id UUID,
    result VARCHAR(50),
    ip_address VARCHAR(100),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 14.2 audit.ai_audit_logs

```sql
CREATE TABLE audit.ai_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NULL REFERENCES auth.users(id),
    question TEXT,
    answer TEXT,
    model_name VARCHAR(150),
    citation JSONB DEFAULT '[]'::jsonb,
    confidence_score NUMERIC(5,2),
    permission_result VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

# 15. Analytics Domain

---

## 15.1 analytics.metric_events

```sql
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE TABLE analytics.metric_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(150) NOT NULL,
    user_id UUID NULL REFERENCES auth.users(id),
    target_type VARCHAR(100),
    target_id UUID,
    value NUMERIC(12,2),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

# 16. Search Domain

---

## 16.1 knowledge.search_logs

```sql
CREATE TABLE knowledge.search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NULL REFERENCES auth.users(id),
    query TEXT NOT NULL,
    search_type VARCHAR(100),
    result_count INTEGER DEFAULT 0,
    clicked_result_id UUID NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

# 17. Indexes

```sql
CREATE INDEX idx_users_department_id ON auth.users(department_id);
CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_documents_department_id ON knowledge.documents(department_id);
CREATE INDEX idx_documents_status ON knowledge.documents(status);
CREATE INDEX idx_documents_classification ON knowledge.documents(classification);
CREATE INDEX idx_document_chunks_document_id ON knowledge.document_chunks(document_id);
CREATE INDEX idx_document_chunks_content_trgm ON knowledge.document_chunks USING gin (content gin_trgm_ops);
CREATE INDEX idx_knowledge_items_type ON knowledge.knowledge_items(knowledge_type);
CREATE INDEX idx_conversations_user_id ON ai.conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON ai.conversation_messages(conversation_id);
CREATE INDEX idx_experience_department_id ON knowledge.experience_records(department_id);
CREATE INDEX idx_sops_department_id ON knowledge.sops(department_id);
CREATE INDEX idx_training_progress_user ON training.progress(user_id);
CREATE INDEX idx_agent_tasks_user ON agent.tasks(requested_by);
CREATE INDEX idx_audit_logs_user_id ON audit.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit.audit_logs(created_at);
CREATE INDEX idx_metric_events_type ON analytics.metric_events(event_type);
CREATE INDEX idx_search_logs_user_id ON knowledge.search_logs(user_id);
```

---

# 18. Vector Index

```sql
CREATE INDEX idx_embeddings_vector
ON knowledge.embeddings
USING ivfflat (vector vector_cosine_ops)
WITH (lists = 100);
```

---

# 19. Default Enum Values

建議由 Application 層控管：

```text
status:
draft
processing
review
published
archived
deleted

permission_scope:
public
internal
department
private
confidential
admin_only

classification:
public
internal
department
confidential
secret
restricted
```

---

# 20. Seed Data

Default Roles：

```text
employee
manager
department_admin
knowledge_owner
auditor
system_admin
```

Default Agents：

```text
knowledge_agent
sop_agent
training_agent
search_agent
hr_agent
procurement_agent
governance_agent
analytics_agent
```

---

# 21. MVP Required Tables

MVP 第一階段必須建立：

```text
auth.users
auth.roles
auth.user_roles
auth.permissions
auth.role_permissions
org.departments
knowledge.documents
knowledge.document_versions
knowledge.document_chunks
knowledge.embeddings
knowledge.knowledge_items
ai.conversations
ai.conversation_messages
ai.citations
ai.feedbacks
audit.audit_logs
analytics.metric_events
```

---

# 22. Future Tables

v2.0 可加入：

```text
tenant.organizations
billing.subscriptions
integration.connectors
notification.messages
workflow.workflow_instances
knowledge.graph_nodes
knowledge.graph_edges
```

---

# 23. Next Step

本文件完成後，請建立：

```text
spec/AI_Model_Strategy.md
```

此文件需定義：

* LLM
* Embedding
* OCR
* Speech to Text
* Video Understanding
* Reranker
* Cost Control
* Model Provider Abstraction
