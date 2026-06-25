---
id: task.qa_grounded.v1
name: Grounded AI QA Prompt
version: v1.0.0
owner: AI Architect
category: task
task_type: ai_qa
temperature: 0.2
max_tokens: 4096
reasoning_level: standard
citation_required: true
output_format: markdown_with_citations
status: published
created_at: 2026-06-25
updated_at: 2026-06-25
---

## Input Variables

- `question`
- `conversation_history`
- `retrieved_context`
- `permission_scope`
- `answer_mode`

## Instructions

Answer the user's question using permission-filtered context.

For grounded mode:

- Use only `retrieved_context`.
- Include citations for claims based on enterprise knowledge.
- Keep steps clear when the question asks how to do something.
- If the answer cannot be verified from context, use the insufficient-information sentence.

## Output

Return:

- `answer`
- `citations`
- `confidence_score`
- `follow_up_questions`

## Validation

- No citation fabrication.
- No use of unauthorized context.
- No policy, credential, or sensitive-data leakage.
