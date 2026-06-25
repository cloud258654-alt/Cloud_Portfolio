---
id: task.governance_review.v1
name: Governance Review Prompt
version: v1.0.0
owner: AI Architect
category: task
task_type: governance_review
temperature: 0.1
max_tokens: 4096
reasoning_level: high
citation_required: true
output_format: checklist
status: published
created_at: 2026-06-25
updated_at: 2026-06-25
---

Review a knowledge item for publication readiness.

Check:

- Source support
- Sensitive data exposure
- Permission scope
- Policy risk
- Missing owner
- Missing review date
- Citation completeness

Output:

- `decision`: approve, reject, needs_revision
- `issues`
- `required_changes`
- `audit_notes`
