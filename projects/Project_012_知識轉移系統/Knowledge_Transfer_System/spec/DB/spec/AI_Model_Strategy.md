# AI_Model_Strategy

AI Knowledge Transfer System

AI Model Strategy Specification

Version : v1.0.0

Owner : AI Architect

Last Update : 2026-06-25

---

# 1. Purpose

本文件定義 AI Knowledge Transfer System 的 AI 模型策略。

本系統不綁定單一模型供應商，而是採用：

Model Provider Abstraction

支援：

* LLM
* Embedding
* OCR
* Speech to Text
* Video Understanding
* Reranker
* Agent Reasoning
* Cost Control
* Model Fallback

---

# 2. AI Model Architecture

```text
User Request
↓
AI Gateway
↓
Model Router
↓
Task Classifier
↓
Model Selection
↓
Provider Adapter
↓
Model Execution
↓
Result Validation
↓
Response
```

---

# 3. Model Provider Abstraction

系統必須支援多模型供應商。

支援：

```text
OpenAI
Anthropic Claude
Google Gemini
Local LLM
Azure OpenAI
Ollama
HuggingFace
```

所有 AI 呼叫不可直接寫死模型名稱，必須透過：

```text
AI Gateway
Model Router
Provider Adapter
```

---

# 4. Task Type Mapping

| Task                       | Recommended Model Type |
| -------------------------- | ---------------------- |
| AI QA                      | LLM                    |
| SOP Generation             | LLM                    |
| Training Course Generation | LLM                    |
| Agent Planning             | Reasoning LLM          |
| Embedding                  | Embedding Model        |
| Reranking                  | Reranker Model         |
| OCR                        | OCR Model              |
| Speech to Text             | STT Model              |
| Video to SOP               | Vision / Video Model   |
| Sensitive Data Masking     | NER / LLM              |
| Knowledge Gap Analysis     | LLM + Analytics        |

---

# 5. LLM Strategy

## 5.1 Main LLM Usage

用於：

```text
AI QA
SOP Generation
FAQ Generation
Course Generation
Quiz Generation
Agent Planning
Offboarding Summary
Governance Analysis
Dashboard Insight
```

---

## 5.2 Recommended LLM Tier

### High Reasoning Tier

用於：

```text
Agent Planning
SOP Generation
Governance Risk Analysis
Knowledge Gap Analysis
```

要求：

```text
high reasoning
long context
stable output
tool calling
citation awareness
```

---

### Standard Tier

用於：

```text
AI QA
FAQ
Summary
Training Lesson
Quiz
```

要求：

```text
fast
cost effective
stable
```

---

### Low Cost Tier

用於：

```text
classification
tagging
keyword extraction
title generation
simple summary
```

---

# 6. Embedding Strategy

## 6.1 Purpose

Embedding 用於：

```text
Semantic Search
Hybrid Search
RAG
FAQ Matching
Experience Retrieval
SOP Retrieval
Agent Memory Search
```

---

## 6.2 Embedding Model Requirements

```text
multilingual
Chinese support
English support
stable dimension
low cost
high recall
```

---

## 6.3 Storage

Embedding 存入：

```text
PostgreSQL + pgvector
```

---

## 6.4 Embedding Dimension

預設：

```text
1536
```

但系統必須支援不同 dimension。

---

# 7. Reranker Strategy

Reranker 用於提升搜尋品質。

流程：

```text
User Query
↓
Hybrid Search Top 50
↓
Reranker
↓
Top 5 / Top 10
↓
RAG Context
```

---

## 7.1 Reranker Usage

用於：

```text
AI QA
Agent Search
SOP Search
Experience Search
Training Mentor
```

---

# 8. OCR Strategy

## 8.1 OCR Usage

用於：

```text
Scanned PDF
Image
Screenshot
Screen Recording Frame
Form
Receipt
Legacy Document
```

---

## 8.2 OCR Engines

建議：

```text
Primary: PaddleOCR
Fallback: Tesseract
Optional: Cloud Vision OCR
```

---

## 8.3 OCR Output

```text
text
page
position
confidence
language
bounding_box
```

---

# 9. Speech To Text Strategy

## 9.1 Usage

用於：

```text
Experience Recording
Meeting Recording
Offboarding Interview
Video Audio Extraction
Voice QA
```

---

## 9.2 Recommended Engine

```text
Primary: Whisper
Fallback: Cloud STT
```

---

## 9.3 Output

```text
transcript
segments
timestamp
speaker
language
confidence
```

---

# 10. Video Understanding Strategy

## 10.1 Usage

用於：

```text
Screen Record To SOP
Video Training
Meeting Video
Operation Recording
```

---

## 10.2 Pipeline

```text
Video
↓
Frame Extraction
↓
OCR
↓
UI Detection
↓
Action Detection
↓
Step Detection
↓
SOP Generation
```

---

## 10.3 Model Requirements

```text
image understanding
UI detection
action reasoning
OCR integration
timeline awareness
```

---

# 11. Agent Model Strategy

## 11.1 Agent Planning

Agent Planning 需使用高推理模型。

用於：

```text
task decomposition
tool selection
dependency planning
risk detection
human approval decision
```

---

## 11.2 Agent Execution

Agent Execution 可依任務分級：

```text
high risk task → high reasoning model
normal task → standard model
simple task → low cost model
```

---

# 12. Prompt Management

所有 Prompt 不可寫死在程式碼內。

Prompt 必須存放於：

```text
prompts/
```

建議：

```text
prompts/
├── QA_prompt.md
├── SOP_prompt.md
├── Training_prompt.md
├── Quiz_prompt.md
├── Agent_prompt.md
├── Search_prompt.md
├── Offboarding_prompt.md
├── Governance_prompt.md
└── Reranker_prompt.md
```

---

# 13. Model Router

Model Router 根據任務選擇模型。

## 13.1 Input

```json
{
  "task_type": "sop_generation",
  "risk_level": "medium",
  "language": "zh-TW",
  "context_length": 8000,
  "need_reasoning": true,
  "need_citation": true
}
```

---

## 13.2 Output

```json
{
  "provider": "openai",
  "model": "high_reasoning_model",
  "temperature": 0.2,
  "max_tokens": 4096
}
```

---

# 14. Temperature Strategy

| Task                      | Temperature |
| ------------------------- | ----------: |
| AI QA                     |   0.1 - 0.3 |
| SOP Generation            |   0.2 - 0.4 |
| Quiz Generation           |   0.3 - 0.5 |
| Creative Training Content |   0.5 - 0.7 |
| Governance Analysis       |   0.0 - 0.2 |
| Agent Planning            |   0.0 - 0.2 |

---

# 15. Cost Control

必須支援：

```text
token budget
daily usage limit
department quota
model tier routing
cache repeated answer
batch embedding
retry limit
large file manual trigger
```

---

# 16. Fallback Strategy

當主要模型失敗時：

```text
Primary Model
↓
Retry
↓
Fallback Model
↓
Lower Cost Model
↓
Human Review
```

---

# 17. Model Monitoring

需監控：

```text
token_usage
cost
latency
error_rate
fallback_rate
answer_quality
citation_rate
user_feedback
```

---

# 18. AI Safety

必須支援：

```text
prompt injection detection
sensitive data masking
permission check
citation validation
unsafe output filter
audit log
human in the loop
```

---

# 19. Citation Requirement

AI QA、SOP、Agent、Training Mentor 回答必須盡量引用來源。

引用格式：

```text
source_type
source_id
title
version
page
chunk_id
confidence_score
```

---

# 20. Model Configuration Table

建議建立設定表：

```text
ai_model_configs
```

欄位：

```text
id
provider
model_name
task_type
tier
temperature
max_tokens
is_active
fallback_model
metadata
created_at
updated_at
```

---

# 21. Provider Adapter Interface

所有供應商需實作一致介面：

```text
generate_text()
generate_embedding()
transcribe_audio()
analyze_image()
analyze_video()
rerank()
```

---

# 22. Local Model Strategy

未來可支援本地模型：

```text
Ollama
vLLM
Local Embedding
Local OCR
Local Whisper
```

適合：

```text
confidential document
on-premise deployment
cost reduction
offline environment
```

---

# 23. Recommended MVP Setup

v1.0 MVP 建議：

```text
LLM:
Cloud LLM

Embedding:
Cloud Embedding or bge-m3

OCR:
PaddleOCR

Speech:
Whisper

Vector:
pgvector

Reranker:
bge-reranker or cloud reranker

Video:
Frame OCR + LLM reasoning
```

---

# 24. Future Strategy

v2.0：

```text
multi-model routing
local LLM
private deployment
knowledge graph reasoning
agent memory optimization
multimodal search
video understanding model
```

---

# 25. Final Goal

本系統 AI Model Strategy 的最終目標：

不是綁定單一 AI 模型，

而是建立：

Enterprise AI Model Gateway

讓系統可以根據：

task

risk

cost

latency

security

自動選擇最佳模型。

確保平台：

scalable

cost controlled

secure

model independent

enterprise ready
