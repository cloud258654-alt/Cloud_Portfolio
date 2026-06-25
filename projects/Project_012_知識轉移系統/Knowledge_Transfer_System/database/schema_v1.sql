-- AI Knowledge Transfer System (KTS)
-- Database schema v1
-- Implements spec/DB/Database_Schema_v1.md

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS org;
CREATE SCHEMA IF NOT EXISTS knowledge;
CREATE SCHEMA IF NOT EXISTS ai;
CREATE SCHEMA IF NOT EXISTS training;
CREATE SCHEMA IF NOT EXISTS agent;
CREATE SCHEMA IF NOT EXISTS governance;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE TABLE IF NOT EXISTS org.departments (
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

CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NULL REFERENCES org.departments(id),
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

CREATE TABLE IF NOT EXISTS auth.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS auth.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    role_id UUID NOT NULL REFERENCES auth.roles(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

CREATE TABLE IF NOT EXISTS auth.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(150) UNIQUE NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES auth.roles(id),
    permission_id UUID NOT NULL REFERENCES auth.permissions(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS knowledge.documents (
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

CREATE TABLE IF NOT EXISTS knowledge.document_versions (
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

CREATE TABLE IF NOT EXISTS knowledge.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(30),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge.document_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES knowledge.documents(id),
    tag_id UUID NOT NULL REFERENCES knowledge.tags(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(document_id, tag_id)
);

CREATE TABLE IF NOT EXISTS knowledge.document_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES knowledge.documents(id),
    user_id UUID NULL REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(document_id, user_id)
);

CREATE TABLE IF NOT EXISTS knowledge.document_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES knowledge.documents(id),
    user_id UUID NULL REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    result VARCHAR(50) DEFAULT 'success',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge.ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES knowledge.documents(id),
    status VARCHAR(50) DEFAULT 'queued',
    stage VARCHAR(100) DEFAULT 'queue',
    progress INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge.document_chunks (
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

CREATE TABLE IF NOT EXISTS knowledge.chunk_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chunk_id UUID NOT NULL REFERENCES knowledge.document_chunks(id),
    language VARCHAR(50),
    keywords JSONB DEFAULT '[]'::jsonb,
    entities JSONB DEFAULT '[]'::jsonb,
    summary TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge.embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_type VARCHAR(100) NOT NULL,
    source_id UUID NOT NULL,
    embedding_model VARCHAR(150) NOT NULL,
    vector VECTOR(1536),
    dimension INTEGER DEFAULT 1536,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge.embedding_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES knowledge.documents(id),
    chunk_id UUID NULL REFERENCES knowledge.document_chunks(id),
    status VARCHAR(50) DEFAULT 'queued',
    provider VARCHAR(100),
    model VARCHAR(150),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge.knowledge_items (
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

CREATE TABLE IF NOT EXISTS knowledge.experience_records (
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

CREATE TABLE IF NOT EXISTS knowledge.experience_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experience_id UUID NOT NULL REFERENCES knowledge.experience_records(id),
    segment_index INTEGER NOT NULL,
    speaker VARCHAR(100),
    start_time DOUBLE PRECISION,
    end_time DOUBLE PRECISION,
    text TEXT NOT NULL,
    confidence DOUBLE PRECISION,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge.sops (
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

CREATE TABLE IF NOT EXISTS knowledge.sop_versions (
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

CREATE TABLE IF NOT EXISTS knowledge.search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NULL REFERENCES auth.users(id),
    query TEXT NOT NULL,
    search_type VARCHAR(100),
    result_count INTEGER DEFAULT 0,
    clicked_result_id UUID NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NULL REFERENCES auth.users(id),
    title VARCHAR(255),
    channel VARCHAR(50) DEFAULT 'web',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS ai.conversation_messages (
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

CREATE TABLE IF NOT EXISTS ai.citations (
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

CREATE TABLE IF NOT EXISTS ai.feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES ai.conversation_messages(id),
    user_id UUID NULL REFERENCES auth.users(id),
    rating INTEGER,
    feedback_type VARCHAR(100),
    comment TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai.model_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(100) NOT NULL,
    model_name VARCHAR(150) NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    tier VARCHAR(100) NOT NULL,
    temperature NUMERIC(3,2) DEFAULT 0.2,
    max_tokens INTEGER DEFAULT 4096,
    is_active BOOLEAN DEFAULT true,
    fallback_model VARCHAR(150),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider, model_name, task_type, tier)
);

CREATE TABLE IF NOT EXISTS ai.model_invocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NULL REFERENCES auth.users(id),
    task_type VARCHAR(100) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    model_name VARCHAR(150) NOT NULL,
    tier VARCHAR(100),
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    estimated_cost NUMERIC(12,6),
    latency_ms INTEGER,
    status VARCHAR(50) DEFAULT 'completed',
    fallback_used BOOLEAN DEFAULT false,
    error_code VARCHAR(150),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai.prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_key VARCHAR(150) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    owner VARCHAR(150),
    status VARCHAR(50) DEFAULT 'draft',
    citation_required BOOLEAN DEFAULT false,
    output_format VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS ai.prompt_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_template_id UUID NOT NULL REFERENCES ai.prompt_templates(id),
    version_no VARCHAR(50) NOT NULL,
    prompt_path TEXT NOT NULL,
    prompt_body TEXT,
    change_note TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_by UUID NULL REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(prompt_template_id, version_no)
);

CREATE TABLE IF NOT EXISTS ai.prompt_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_version_id UUID NOT NULL REFERENCES ai.prompt_versions(id),
    test_case_id VARCHAR(150) NOT NULL,
    input_payload JSONB DEFAULT '{}'::jsonb,
    expected_behavior TEXT,
    actual_output TEXT,
    score NUMERIC(5,2),
    passed BOOLEAN,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training.courses (
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

CREATE TABLE IF NOT EXISTS training.lessons (
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

CREATE TABLE IF NOT EXISTS training.quizzes (
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

CREATE TABLE IF NOT EXISTS training.progress (
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

CREATE TABLE IF NOT EXISTS training.certificates (
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

CREATE TABLE IF NOT EXISTS agent.agents (
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

CREATE TABLE IF NOT EXISTS agent.tasks (
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

CREATE TABLE IF NOT EXISTS agent.steps (
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

CREATE TABLE IF NOT EXISTS agent.memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NULL REFERENCES agent.agents(id),
    user_id UUID NULL REFERENCES auth.users(id),
    memory_type VARCHAR(100),
    content TEXT,
    embedding_id UUID NULL REFERENCES knowledge.embeddings(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS governance.approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type VARCHAR(100) NOT NULL,
    target_id UUID NOT NULL,
    requested_by UUID NULL REFERENCES auth.users(id),
    status VARCHAR(50) DEFAULT 'pending',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS governance.approval_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES governance.approval_workflows(id),
    approver_id UUID NOT NULL REFERENCES auth.users(id),
    step_order INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    comment TEXT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit.audit_logs (
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

CREATE TABLE IF NOT EXISTS audit.ai_audit_logs (
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

CREATE TABLE IF NOT EXISTS analytics.metric_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(150) NOT NULL,
    user_id UUID NULL REFERENCES auth.users(id),
    target_type VARCHAR(100),
    target_id UUID,
    value NUMERIC(12,2),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_department_id ON auth.users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users(email);
CREATE INDEX IF NOT EXISTS idx_documents_department_id ON knowledge.documents(department_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON knowledge.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_classification ON knowledge.documents(classification);
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON knowledge.document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_tags_document_id ON knowledge.document_tags(document_id);
CREATE INDEX IF NOT EXISTS idx_document_favorites_user_id ON knowledge.document_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_document_activities_document_id ON knowledge.document_activities(document_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_document_id ON knowledge.ingestion_jobs(document_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_status ON knowledge.ingestion_jobs(status);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON knowledge.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_version_id ON knowledge.document_chunks(document_version_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_content_trgm ON knowledge.document_chunks USING gin (content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_chunk_metadata_chunk_id ON knowledge.chunk_metadata(chunk_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_source ON knowledge.embeddings(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_embedding_jobs_document_id ON knowledge.embedding_jobs(document_id);
CREATE INDEX IF NOT EXISTS idx_embedding_jobs_chunk_id ON knowledge.embedding_jobs(chunk_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_type ON knowledge.knowledge_items(knowledge_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_department_id ON knowledge.knowledge_items(department_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON ai.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON ai.conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_citations_message_id ON ai.citations(message_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_message_id ON ai.feedbacks(message_id);
CREATE INDEX IF NOT EXISTS idx_model_configs_task_type ON ai.model_configs(task_type);
CREATE INDEX IF NOT EXISTS idx_model_configs_active ON ai.model_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_model_invocations_task_type ON ai.model_invocations(task_type);
CREATE INDEX IF NOT EXISTS idx_model_invocations_created_at ON ai.model_invocations(created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_key ON ai.prompt_templates(prompt_key);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_task_type ON ai.prompt_templates(task_type);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_template_id ON ai.prompt_versions(prompt_template_id);
CREATE INDEX IF NOT EXISTS idx_prompt_evaluations_version_id ON ai.prompt_evaluations(prompt_version_id);
CREATE INDEX IF NOT EXISTS idx_experience_department_id ON knowledge.experience_records(department_id);
CREATE INDEX IF NOT EXISTS idx_experience_segments_experience_id ON knowledge.experience_segments(experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_segments_text_trgm ON knowledge.experience_segments USING gin (text gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_sops_department_id ON knowledge.sops(department_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_user ON training.progress(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_user ON agent.tasks(requested_by);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent.tasks(status);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_target ON governance.approval_workflows(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_audit_logs_user_id ON audit.ai_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_metric_events_type ON analytics.metric_events(event_type);
CREATE INDEX IF NOT EXISTS idx_metric_events_user_id ON analytics.metric_events(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON knowledge.search_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_embeddings_vector
ON knowledge.embeddings
USING ivfflat (vector vector_cosine_ops)
WITH (lists = 100);
