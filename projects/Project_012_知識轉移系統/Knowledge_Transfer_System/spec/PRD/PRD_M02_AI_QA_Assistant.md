# PRD_M02_AI_QA_Assistant

AI Knowledge Transfer System

Product Requirement Document

Module: M02
Module Name: AI QA Assistant
Version: v1.0.0
Owner: Product Manager
Last Update: 2026-06-25

## 1. Module Vision

M02 AI QA Assistant provides an enterprise AI assistant that answers user questions from approved internal knowledge.

The assistant should support:

- Natural language questions
- AI understanding
- Enterprise knowledge search
- Answer generation
- Citations
- Feedback
- Conversation memory

## 2. Business Problems

The module addresses:

- Users cannot quickly find the right document.
- SOPs are difficult to understand or locate.
- FAQ answers are repeated by different people.
- New employee questions consume senior employee time.
- Expert knowledge is hard to reuse.

## 3. Module Objectives

- Provide AI-assisted enterprise question answering.
- Require citations for knowledge-grounded answers.
- Support multi-turn conversations.
- Respect department and permission boundaries.
- Improve AI answers through feedback.

## 4. User Stories

### Story 1: Employee Asks an Operational Question

As an employee, I want to ask how to submit a purchase request so the AI can answer using internal SOPs.

### Story 2: New Employee Learns a Process

As a new employee, I want the AI to explain related SOPs, FAQ, and experience records so I can understand the process faster.

### Story 3: Manager Verifies Answer Sources

As a manager, I want AI answers to include citations so I can verify whether the answer is reliable.

## 5. Supported Questions

Example supported questions:

- How do I submit a purchase request?
- What documents are required for approval?
- How do I upload data to ERP?
- What is the standard handover process?
- Which SOP explains this process?
- What is the difference between process A and process B?

## 6. Functional Requirements

### FR001 Ask Question

Input:

```text
Question
Conversation ID
Department
Language
```

Example:

```text
How do I submit a purchase request?
```

Output:

```text
Answer
Citation
Confidence
Related Documents
```

### FR002 Multi-Turn Conversation

The assistant should remember recent conversation context.

Example:

```text
Q: How do I submit a purchase request?
A: ...

Q: What documents should I attach?
A: ...
```

### FR003 Citation

AI answers should include:

```text
Document
Version
Page
Chunk
Score
```

Example:

```text
Purchase SOP
v2.0
page 3
confidence 92%
```

### FR004 Related Documents

The answer should display related documents when available:

```text
Purchase SOP
Approval Policy
ERP Upload Guide
FAQ
```

### FR005 Feedback

Users can provide feedback:

```text
helpful
not_helpful
comment
```

### FR006 Conversation History

The system should store conversation history for review and continuation.

## 7. AI Workflow

```text
Question
↓
Permission Check
↓
Rewrite Query
↓
Hybrid Search
↓
Retrieve Chunks
↓
Rerank
↓
Build Context
↓
LLM
↓
Generate Answer
↓
Citation
↓
Save History
↓
Feedback
```

## 8. Query Rewrite

The system may rewrite user questions into better search queries.

User question:

```text
How do I request a purchase?
```

Rewritten queries:

```text
purchase request SOP
purchase approval process
manager approval steps
```

## 9. Search Strategy

Search method:

```text
Hybrid Search
```

Hybrid search combines:

```text
Keyword Search
+
Embedding Search
```

Additional strategy:

- Reranking
- Top K default: 5

## 10. RAG Strategy

```text
Question
↓
Top 5 Chunks
↓
Permission Filter
↓
RAG Context
↓
LLM
↓
Answer
```

Defaults:

```text
Context Limit: 4000 tokens
Chunk Size: 512 tokens
Overlap: 100 tokens
```

## 11. AI Answer Modes

Supported modes:

- Grounded Mode: answer only from retrieved enterprise knowledge.
- Summary Mode: summarize related knowledge.
- Step By Step: provide procedural guidance.
- FAQ Mode: format answer as Q&A.
- Expert Mode: provide deeper explanation for advanced users.

## 12. AI Prompt Template

System prompt:

```text
You are Enterprise AI Assistant.

Rules:
- Answer only from retrieved documents.
- Always cite source.
- If unknown, say "I don't know."
- Never hallucinate.
```

## 13. Confidence Score

Confidence range:

```text
0-100%
```

Signals:

- Search Score
- Rerank Score
- LLM Score

Display:

```text
Confidence: 92%
```

## 14. Citation Format

Citation display:

```text
Source: Purchase SOP
Version: v2.0
Page: 3
Chunk: chunk_003
Score: 0.92
```

## 15. Conversation Memory

Stored fields:

```text
conversation_id
message
answer
citations
feedback
timestamp
```

Default memory window:

```text
20 messages
```

## 16. Feedback Learning

Feedback effects:

- Helpful feedback can boost similar results.
- Negative feedback can lower ranking.
- Comments can support knowledge improvement.

## 17. Permission

Search and answer generation must apply permission filtering.

Example:

```text
Role: Employee
Department: Procurement
Permission: department
```

Documents outside the user's permission scope must not be returned or cited.

## 18. Error Handling

Error cases:

- Question Too Long
- No Knowledge Found
- Permission Denied
- LLM Timeout
- Citation Missing

## 19. UI Layout

```text
Sidebar
├── Chat History
├── New Chat
└── Favorites

Main Chat
├── Question
├── Answer
├── Citation
└── Feedback

Related Documents
```

## 20. AI Answer Card

Example:

```text
Answer

To submit a purchase request:
1. Open the purchase request form.
2. Submit it to the department manager.
3. Wait for approval and record the result.

Confidence
92%

Source
Purchase SOP, page 3
```

## 21. Dashboard Metrics

- AI Questions
- Success Rate
- Citation Rate
- Avg Response Time
- Top Questions
- User Satisfaction

## 22. Performance

| Metric | Target |
|---|---:|
| Response Time | < 5 sec |
| Search | < 2 sec |
| Citation | 100% for grounded answers |
| Availability | 99.5% |

## 23. Security

Security requirements:

- JWT
- RBAC
- Department Isolation
- Prompt Injection Protection
- Sensitive Data Filter
- Audit Log

## 24. Future Features

- Voice QA
- Image QA
- Meeting QA
- Video QA
- Agent QA
- Knowledge Graph QA

## 25. Success KPI

| KPI | Target |
|---|---:|
| Answer Accuracy | > 85% |
| Citation Rate | > 95% |
| User Satisfaction | > 4.5 / 5 |
| AI Adoption Rate | > 80% |

## 26. Final Goal

M02 should evolve from a chatbot into an Enterprise AI Assistant.

It should combine:

- Search
- Reasoning
- Citation
- Memory
- Feedback
- Learning
- Agent Collaboration

The final goal is to make enterprise knowledge accessible through reliable AI conversation.
