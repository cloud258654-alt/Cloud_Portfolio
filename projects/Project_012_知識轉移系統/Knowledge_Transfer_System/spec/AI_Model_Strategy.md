# AI Model Strategy

System: AI Knowledge Transfer System (KTS)  
Version: v1.0.0  
Owner: AI Architect  
Last Updated: 2026-06-25  
Execution Status: Implemented as platform contracts

## 1. Purpose

This specification defines the Enterprise AI Model Gateway strategy for KTS. It keeps AI features model-independent while supporting task routing, cost control, fallback, monitoring, safety, and citation-aware enterprise RAG.

## 2. Architecture

```text
User Request
-> AI Gateway
-> Model Router
-> Task Classifier
-> Model Selection
-> Provider Adapter
-> Model Execution
-> Result Validation
-> Response
```

## 3. Provider Abstraction

Supported provider categories:

- Cloud LLM
- Cloud embedding
- Cloud reranker
- Cloud vision/video model
- Azure OpenAI compatible provider
- Anthropic compatible provider
- Google Gemini compatible provider
- Local LLM through Ollama or vLLM
- Local embedding model
- Local OCR
- Local Whisper/STT

Provider adapter interface:

```text
generate_text()
generate_embedding()
transcribe_audio()
analyze_image()
analyze_video()
rerank()
```

## 4. Task Routing

| Task | Model Type | Default Tier |
|---|---|---|
| AI QA | LLM | standard |
| SOP Generation | LLM | high_reasoning |
| Training Course Generation | LLM | standard |
| Agent Planning | Reasoning LLM | high_reasoning |
| Embedding | Embedding Model | embedding |
| Reranking | Reranker Model | reranker |
| OCR | OCR Model | ocr |
| Speech to Text | STT Model | stt |
| Video to SOP | Vision / Video Pipeline | vision_video |
| Sensitive Data Masking | NER / LLM | low_cost |
| Knowledge Gap Analysis | LLM + Analytics | high_reasoning |

## 5. Tier Strategy

High reasoning tier:

- Agent planning
- SOP generation
- Governance risk analysis
- Knowledge gap analysis

Standard tier:

- AI QA
- FAQ generation
- Summary
- Training lesson
- Quiz generation

Low cost tier:

- Classification
- Tagging
- Keyword extraction
- Title generation
- Simple summary

## 6. Embedding Strategy

Embeddings support:

- Semantic search
- Hybrid search
- RAG
- FAQ matching
- Experience retrieval
- SOP retrieval
- Agent memory search

Default dimension: `1536`

Storage: `PostgreSQL + pgvector`

## 7. Reranker Flow

```text
User Query
-> Hybrid Search Top 50
-> Reranker
-> Top 5 / Top 10
-> RAG Context
```

## 8. OCR, STT, Video

OCR primary engine: PaddleOCR  
OCR fallback: Tesseract  
STT primary engine: Whisper  
STT fallback: Cloud STT  
Video pipeline: frame extraction -> OCR -> UI detection -> action detection -> step detection -> SOP generation

## 9. Router Input And Output

Input:

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

Output:

```json
{
  "provider": "cloud_llm",
  "model": "high_reasoning_model",
  "temperature": 0.2,
  "max_tokens": 4096
}
```

## 10. Temperature Strategy

| Task | Temperature |
|---|---:|
| AI QA | 0.1 - 0.3 |
| SOP Generation | 0.2 - 0.4 |
| Quiz Generation | 0.3 - 0.5 |
| Creative Training Content | 0.5 - 0.7 |
| Governance Analysis | 0.0 - 0.2 |
| Agent Planning | 0.0 - 0.2 |

## 11. Cost And Fallback

Cost controls:

- Token budget
- Daily usage limit
- Department quota
- Model tier routing
- Cache repeated answers
- Batch embedding
- Retry limit
- Large file manual trigger

Fallback flow:

```text
Primary Model
-> Retry
-> Fallback Model
-> Lower Cost Model
-> Human Review
```

## 12. Monitoring

Track:

- token_usage
- cost
- latency
- error_rate
- fallback_rate
- answer_quality
- citation_rate
- user_feedback

Implemented table:

- `ai.model_invocations`

## 13. Safety

Required controls:

- Prompt injection detection
- Sensitive data masking
- Permission check
- Citation validation
- Unsafe output filter
- Audit log
- Human in the loop

## 14. Citation Requirement

AI QA, SOP, Agent, and Training Mentor responses must keep citation metadata when enterprise knowledge is used:

- source_type
- source_id
- title
- version
- page
- chunk_id
- confidence_score

## 15. Implementation Artifacts

Database:

- `database/schema_v1.sql`
  - `ai.model_configs`
  - `ai.model_invocations`
- `database/seed_v1.sql`
  - Default model routing configs

API:

- `spec/API/openapi/openapi_v1.yaml`
  - `/admin/ai-model-configs`
  - `/admin/ai-model-configs/{config_id}`
  - `/ai/router/select`

Prompts:

- `prompts/QA_prompt.md`
- `prompts/SOP_prompt.md`
- `prompts/Training_prompt.md`
- `prompts/Quiz_prompt.md`
- `prompts/Agent_prompt.md`
- `prompts/Search_prompt.md`
- `prompts/Offboarding_prompt.md`
- `prompts/Governance_prompt.md`
- `prompts/Reranker_prompt.md`

## 16. MVP Setup

Use abstract routing aliases in configuration first:

- `high_reasoning_model`
- `standard_llm_model`
- `low_cost_llm_model`
- `multilingual_embedding_1536`
- `standard_reranker`
- `paddleocr_primary`
- `whisper_primary`
- `frame_ocr_llm_reasoning`

Concrete provider model names should be environment-specific configuration, not hard-coded platform architecture.
