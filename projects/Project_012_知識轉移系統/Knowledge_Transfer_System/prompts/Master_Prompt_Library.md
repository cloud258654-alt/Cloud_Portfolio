# Master Prompt Library

System: AI Knowledge Transfer System (KTS)  
Version: v1.0.0  
Owner: AI Architect  
Last Updated: 2026-06-25  
Execution Status: Implemented as prompt operating contracts

## 1. Purpose

The Master Prompt Library treats prompts as enterprise AI assets, not hard-coded strings.

Every production prompt should be:

- Version controlled
- Reusable
- Testable
- Maintainable
- Observable
- Governed

## 2. Prompt Architecture

```text
User Request
-> System Prompt
-> Task Prompt
-> Context Builder
-> Retrieved Knowledge
-> Output Template
-> Response Validator
-> Audit / Metrics
```

## 3. Directory Contract

```text
prompts/
  README.md
  prompt_manifest.json
  system/
  tasks/
  agents/
  templates/
  test_cases/
  versions/
```

## 4. Categories

| Category | Purpose |
|---|---|
| System | Global AI identity, safety, security, citation rules |
| Task | Task-specific instructions and output requirements |
| Agent | Multi-agent role, tool, scope, and permission prompts |
| Template | JSON, citation, checklist, table, Mermaid output formats |
| Test | Prompt regression cases |
| Version | Changelog and archived prompt versions |

## 5. Prompt Metadata

Each prompt file starts with YAML front matter:

```yaml
---
id:
name:
version:
owner:
category:
task_type:
temperature:
max_tokens:
reasoning_level:
citation_required:
output_format:
status:
created_at:
updated_at:
---
```

Allowed lifecycle states:

```text
draft -> review -> approved -> published -> deprecated -> archived
```

## 6. Required Prompt Sections

Task prompts should include:

- Input variables
- Instructions
- Retrieval/context rules
- Output format
- Validation rules
- Failure behavior

Agent prompts should include:

- Role
- Responsibilities
- Allowed tools
- Knowledge scope
- Permission scope
- Human approval triggers
- Output format

## 7. Citation Rules

When enterprise knowledge is used, output must preserve:

- source_type
- source_id
- title
- version
- page
- chunk_id
- confidence_score

If retrieved context is insufficient, use:

```text
I don't have sufficient verified information.
```

## 8. Security Rules

Prompts must defend against:

- Prompt injection
- Jailbreak attempts
- Instruction override
- Sensitive data leakage
- Permission bypass
- Citation fabrication

System prompts always outrank task, agent, retrieved, and user content.

## 9. Testing

Prompt regression cases include:

- Input
- Expected behavior
- Must include
- Must not include
- Score threshold
- Pass/fail

## 10. Metrics

Track:

- Accuracy
- Citation rate
- Latency
- Cost
- Hallucination rate
- User satisfaction
- Retry rate
- Fallback rate

## 11. AI Gateway Integration

```text
Prompt Loader
-> Variable Injection
-> Model Router
-> LLM / Tool Adapter
-> Output Validator
-> Invocation Log
```

Implementation artifacts:

- `prompt_manifest.json`
- `database/schema_v1.sql`
  - `ai.prompt_templates`
  - `ai.prompt_versions`
  - `ai.prompt_evaluations`
- `spec/API/openapi/openapi_v1.yaml`
  - `/admin/prompts`
  - `/admin/prompts/{prompt_id}/versions`
  - `/admin/prompts/evaluations`

## 12. Final Goal

The prompt library becomes the Enterprise Prompt Operating System for:

- AI QA
- AI Agent
- Search
- Training
- SOP
- Analytics
- Governance

It gives the platform one managed layer for prompt security, testing, monitoring, optimization, and rollback.
