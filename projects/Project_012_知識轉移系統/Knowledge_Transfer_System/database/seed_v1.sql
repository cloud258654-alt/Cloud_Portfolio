-- AI Knowledge Transfer System (KTS)
-- Seed data v1
-- Run after schema_v1.sql

INSERT INTO auth.roles (name, description)
VALUES
    ('employee', 'Default employee access'),
    ('manager', 'Manager access for team and department workflows'),
    ('department_admin', 'Department-level administration access'),
    ('knowledge_owner', 'Knowledge review and ownership access'),
    ('auditor', 'Read-only audit and governance access'),
    ('system_admin', 'Full system administration access')
ON CONFLICT (name) DO NOTHING;

INSERT INTO auth.permissions (code, resource_type, action, description)
VALUES
    ('auth.me.read', 'auth', 'read', 'Read own authenticated profile'),
    ('users.read', 'users', 'read', 'Read user records'),
    ('users.manage', 'users', 'manage', 'Create and update user records'),
    ('documents.read', 'documents', 'read', 'Read permitted documents'),
    ('documents.upload', 'documents', 'upload', 'Upload documents'),
    ('documents.manage', 'documents', 'manage', 'Manage document metadata and lifecycle'),
    ('search.use', 'search', 'use', 'Use keyword, vector, and hybrid search'),
    ('ai.ask', 'ai', 'ask', 'Ask AI assistant'),
    ('feedback.create', 'feedback', 'create', 'Create feedback for AI answers'),
    ('governance.approve', 'governance', 'approve', 'Approve or reject governed knowledge'),
    ('audit.read', 'audit', 'read', 'Read audit logs'),
    ('admin.manage', 'admin', 'manage', 'Manage system settings')
ON CONFLICT (code) DO NOTHING;

INSERT INTO auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM auth.roles r
JOIN auth.permissions p ON p.code IN (
    'auth.me.read',
    'documents.read',
    'search.use',
    'ai.ask',
    'feedback.create'
)
WHERE r.name = 'employee'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM auth.roles r
JOIN auth.permissions p ON p.code IN (
    'auth.me.read',
    'users.read',
    'documents.read',
    'documents.upload',
    'documents.manage',
    'search.use',
    'ai.ask',
    'feedback.create',
    'governance.approve'
)
WHERE r.name IN ('manager', 'department_admin', 'knowledge_owner')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM auth.roles r
JOIN auth.permissions p ON p.code IN (
    'auth.me.read',
    'audit.read'
)
WHERE r.name = 'auditor'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM auth.roles r
JOIN auth.permissions p ON TRUE
WHERE r.name = 'system_admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO agent.agents (name, agent_type, description, capabilities, tools)
VALUES
    ('Knowledge Agent', 'knowledge_agent', 'Finds and summarizes enterprise knowledge.', '["search","retrieve","summarize"]'::jsonb, '["hybrid_search","rag"]'::jsonb),
    ('SOP Agent', 'sop_agent', 'Drafts SOP content from documents and experience records.', '["retrieve","analyze","generate"]'::jsonb, '["rag","sop_generator"]'::jsonb),
    ('Training Agent', 'training_agent', 'Creates training material from approved knowledge.', '["retrieve","generate","quiz"]'::jsonb, '["rag","quiz_generator"]'::jsonb),
    ('Search Agent', 'search_agent', 'Optimizes search and retrieval workflows.', '["search","rerank"]'::jsonb, '["keyword_search","vector_search","hybrid_search"]'::jsonb),
    ('HR Agent', 'hr_agent', 'Supports HR knowledge and offboarding workflows.', '["retrieve","summarize","handover"]'::jsonb, '["rag","experience_transfer"]'::jsonb),
    ('Procurement Agent', 'procurement_agent', 'Supports procurement SOP and policy questions.', '["retrieve","validate","generate"]'::jsonb, '["rag","policy_check"]'::jsonb),
    ('Governance Agent', 'governance_agent', 'Assists with knowledge review and governance checks.', '["review","validate","audit"]'::jsonb, '["approval_workflow","audit_log"]'::jsonb),
    ('Analytics Agent', 'analytics_agent', 'Analyzes usage, quality, and knowledge gaps.', '["analyze","report"]'::jsonb, '["metric_events","audit_logs"]'::jsonb)
ON CONFLICT DO NOTHING;

INSERT INTO ai.model_configs (
    provider,
    model_name,
    task_type,
    tier,
    temperature,
    max_tokens,
    is_active,
    fallback_model,
    metadata
)
VALUES
    ('cloud_llm', 'high_reasoning_model', 'agent_planning', 'high_reasoning', 0.1, 8192, true, 'standard_llm_model', '{"requires_citation_awareness": true}'::jsonb),
    ('cloud_llm', 'high_reasoning_model', 'sop_generation', 'high_reasoning', 0.2, 8192, true, 'standard_llm_model', '{"requires_structured_output": true}'::jsonb),
    ('cloud_llm', 'standard_llm_model', 'ai_qa', 'standard', 0.2, 4096, true, 'low_cost_llm_model', '{"requires_citations": true}'::jsonb),
    ('cloud_llm', 'standard_llm_model', 'training_generation', 'standard', 0.4, 4096, true, 'low_cost_llm_model', '{"supports_quiz_generation": true}'::jsonb),
    ('cloud_llm', 'low_cost_llm_model', 'classification', 'low_cost', 0.1, 1024, true, NULL, '{"use_for": ["tagging", "keyword_extraction", "title_generation"]}'::jsonb),
    ('cloud_embedding', 'multilingual_embedding_1536', 'embedding', 'embedding', 0.0, 0, true, 'local_embedding_model', '{"dimension": 1536, "language": ["zh-TW", "en"]}'::jsonb),
    ('cloud_reranker', 'standard_reranker', 'reranking', 'reranker', 0.0, 0, true, 'local_reranker_model', '{"input_top_k": 50, "output_top_k": 10}'::jsonb),
    ('local_ocr', 'paddleocr_primary', 'ocr', 'ocr', 0.0, 0, true, 'tesseract_fallback', '{"output": ["text", "page", "position", "confidence", "language"]}'::jsonb),
    ('local_stt', 'whisper_primary', 'speech_to_text', 'stt', 0.0, 0, true, 'cloud_stt_fallback', '{"output": ["transcript", "segments", "timestamp", "speaker"]}'::jsonb),
    ('hybrid_video', 'frame_ocr_llm_reasoning', 'video_understanding', 'vision_video', 0.2, 4096, true, NULL, '{"pipeline": ["frame_extraction", "ocr", "ui_detection", "step_detection"]}'::jsonb)
ON CONFLICT (provider, model_name, task_type, tier) DO NOTHING;

INSERT INTO ai.prompt_templates (
    prompt_key,
    name,
    category,
    task_type,
    owner,
    status,
    citation_required,
    output_format,
    metadata
)
VALUES
    ('system.enterprise_ai.v1', 'Enterprise AI System Prompt', 'system', 'global', 'AI Architect', 'published', true, 'markdown', '{"path": "prompts/system/enterprise_ai_system.md"}'::jsonb),
    ('task.qa_grounded.v1', 'Grounded AI QA Prompt', 'task', 'ai_qa', 'AI Architect', 'published', true, 'markdown_with_citations', '{"path": "prompts/tasks/qa_grounded.md"}'::jsonb),
    ('task.sop_generation.v1', 'SOP Generation Prompt', 'task', 'sop_generation', 'AI Architect', 'published', true, 'markdown_with_mermaid', '{"path": "prompts/tasks/sop_generation.md"}'::jsonb),
    ('task.training_generation.v1', 'Training Generation Prompt', 'task', 'training_generation', 'AI Architect', 'published', true, 'markdown', '{"path": "prompts/tasks/training_generation.md"}'::jsonb),
    ('task.quiz_generation.v1', 'Quiz Generation Prompt', 'task', 'quiz_generation', 'AI Architect', 'published', true, 'json', '{"path": "prompts/tasks/quiz_generation.md"}'::jsonb),
    ('task.search_rewrite.v1', 'Search Rewrite Prompt', 'task', 'search_rewrite', 'AI Architect', 'published', false, 'json', '{"path": "prompts/tasks/search_rewrite.md"}'::jsonb),
    ('task.offboarding_extraction.v1', 'Offboarding Knowledge Extraction Prompt', 'task', 'offboarding_extraction', 'AI Architect', 'published', true, 'markdown', '{"path": "prompts/tasks/offboarding_extraction.md"}'::jsonb),
    ('task.governance_review.v1', 'Governance Review Prompt', 'task', 'governance_review', 'AI Architect', 'published', true, 'checklist', '{"path": "prompts/tasks/governance_review.md"}'::jsonb),
    ('task.reranking.v1', 'Reranking Prompt', 'task', 'reranking', 'AI Architect', 'published', false, 'json', '{"path": "prompts/tasks/reranking.md"}'::jsonb),
    ('agent.knowledge.v1', 'Knowledge Agent Prompt', 'agent', 'agent_planning', 'AI Architect', 'published', true, 'markdown', '{"path": "prompts/agents/knowledge_agent.md"}'::jsonb)
ON CONFLICT (prompt_key) DO NOTHING;
