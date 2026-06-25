---
id: task.quiz_generation.v1
name: Quiz Generation Prompt
version: v1.0.0
owner: AI Architect
category: task
task_type: quiz_generation
temperature: 0.4
max_tokens: 2048
reasoning_level: standard
citation_required: true
output_format: json
status: published
created_at: 2026-06-25
updated_at: 2026-06-25
---

Generate quiz questions from training content and cited source knowledge.

Return JSON with:

- `question`
- `question_type`
- `options`
- `answer`
- `explanation`
- `source_citations`

Validation:

- One correct answer for single-choice questions.
- Explanation must cite source content.
- Avoid trick questions.
