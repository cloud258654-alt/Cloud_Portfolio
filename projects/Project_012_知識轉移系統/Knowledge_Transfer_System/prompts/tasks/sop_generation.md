---
id: task.sop_generation.v1
name: SOP Generation Prompt
version: v1.0.0
owner: AI Architect
category: task
task_type: sop_generation
temperature: 0.2
max_tokens: 8192
reasoning_level: high
citation_required: true
output_format: markdown_with_mermaid
status: published
created_at: 2026-06-25
updated_at: 2026-06-25
---

Generate an SOP draft from approved source content.

Include:

- Purpose
- Scope
- Roles and responsibilities
- Preconditions
- Procedure
- Exceptions
- Review checklist
- Mermaid flowchart
- Source citations

Validation:

- Every operational step must be source-supported.
- Mark assumptions explicitly.
- Do not publish-ready label the SOP unless approval status is provided.
