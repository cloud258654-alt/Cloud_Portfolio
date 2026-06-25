---
id: task.search_rewrite.v1
name: Search Rewrite Prompt
version: v1.0.0
owner: AI Architect
category: task
task_type: search_rewrite
temperature: 0.1
max_tokens: 1024
reasoning_level: low
citation_required: false
output_format: json
status: published
created_at: 2026-06-25
updated_at: 2026-06-25
---

Rewrite the user's search intent for keyword, vector, and hybrid retrieval.

Return JSON:

- `original_query`
- `rewritten_query`
- `keywords`
- `semantic_query`
- `filters`
- `search_mode`

Validation:

- Preserve user meaning.
- Do not add facts not present in the query.
