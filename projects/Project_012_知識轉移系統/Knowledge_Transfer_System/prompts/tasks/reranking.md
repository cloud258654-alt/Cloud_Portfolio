---
id: task.reranking.v1
name: Reranking Prompt
version: v1.0.0
owner: AI Architect
category: task
task_type: reranking
temperature: 0.0
max_tokens: 1024
reasoning_level: low
citation_required: false
output_format: json
status: published
created_at: 2026-06-25
updated_at: 2026-06-25
---

Rerank candidate chunks against the user query.

Score each candidate using:

- Direct answer relevance
- Source authority
- Recency/version
- Permission validity
- Citation usefulness

Return JSON array sorted by relevance.
