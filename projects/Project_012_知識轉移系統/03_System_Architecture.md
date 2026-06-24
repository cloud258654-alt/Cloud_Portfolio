# AI Knowledge Transfer System (KTS)

## System Architecture

Version: v1.0.0
Document Type: System Architecture
Author: Project Manager / System Architect
Last Updated: 2026-06-25

---

# 1. Architecture Goal

本文件定義 AI Knowledge Transfer System 的系統架構。

目標是建立一套可擴充、可維護、可模組化、可安全部署的企業級知識轉移平台。

本系統支援：

* 文件知識管理
* AI 智慧問答
* RAG 知識檢索
* 錄音轉知識
* SOP 自動生成
* 新人教育訓練
* AI Agent 工作助理
* LINE Bot 知識助理
* 離職交接 AI
* 權限控管
* 知識治理
* 分析儀表板

---

# 2. High Level Architecture

```text
User
│
├── Web App
├── Mobile Browser
└── LINE Bot
    │
    ▼
Frontend Layer
Next.js / React / Tailwind / Shadcn UI
    │
    ▼
Backend API Layer
FastAPI / Python
    │
    ├── Auth Service
    ├── Document Service
    ├── Search Service
    ├── RAG Service
    ├── AI QA Service
    ├── Agent Service
    ├── Training Service
    ├── Analytics Service
    └── Admin Service
    │
    ▼
AI Processing Layer
OCR / Whisper / Chunking / Embedding / RAG / LLM / Agent
    │
    ▼
Data Layer
PostgreSQL / pgvector / Redis / MinIO
```

---

# 3. Frontend Layer

## 3.1 Technology

建議使用：

* Next.js
* React
* TypeScript
* Tailwind CSS
* Shadcn UI
* Zustand 或 Redux Toolkit
* React Query

---

## 3.2 Main Pages

前端主要頁面：

```text
/pages
├── dashboard
├── documents
├── ai-chat
├── sop
├── training
├── agents
├── analytics
├── admin
└── login
```

---

## 3.3 UI Principles

UI 設計原則：

* 簡潔
* 易搜尋
* 易理解
* 支援新人快速上手
* 支援部門主管審核知識
* 支援管理者查看使用數據

---

# 4. Backend API Layer

## 4.1 Technology

建議使用：

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* Alembic
* Celery
* Redis

---

## 4.2 Backend Services

```text
/backend
├── auth_service
├── document_service
├── ingestion_service
├── search_service
├── rag_service
├── qa_service
├── agent_service
├── training_service
├── governance_service
├── analytics_service
└── admin_service
```

---

## 4.3 Service Responsibility

| Service            | Responsibility              |
| ------------------ | --------------------------- |
| Auth Service       | 登入、JWT、角色權限                 |
| Document Service   | 文件上傳、版本、分類、標籤               |
| Ingestion Service  | OCR、文字抽取、Chunking、Embedding |
| Search Service     | 關鍵字搜尋、向量搜尋、Hybrid Search    |
| RAG Service        | 檢索文件、組裝上下文、生成回答             |
| QA Service         | AI 問答紀錄、引用來源、回饋             |
| Agent Service      | 任務型 AI Agent 工作流程           |
| Training Service   | 新人課程、測驗、學習紀錄                |
| Governance Service | 文件審核、有效期限、廢止流程              |
| Analytics Service  | 使用量、熱門問題、知識缺口               |
| Admin Service      | 系統設定、使用者管理、稽核紀錄             |

---

# 5. AI Processing Layer

## 5.1 OCR

用途：

* 掃描 PDF
* 圖片
* 表單
* 拍照文件

輸出：

```text
Image / PDF
↓
OCR
↓
Extracted Text
```

---

## 5.2 Speech to Text

用途：

* 老員工訪談錄音
* 會議錄音
* 教學錄音

建議：

* Whisper
* 或其他 Speech-to-Text 模型

輸出：

```text
Audio
↓
Speech-to-Text
↓
Transcript
↓
Summary
↓
FAQ / Knowledge Item
```

---

## 5.3 Document Chunking

文件進入 RAG 前必須切塊。

Chunk 原則：

* 保留標題
* 保留段落語意
* 保留頁碼
* 保留文件來源
* 避免切斷 SOP 步驟

Chunk Metadata：

```text
document_id
chunk_id
title
section
page_number
department
version
permission_scope
created_at
```

---

## 5.4 Embedding

將文字轉為向量。

用途：

* 語意搜尋
* 相似知識推薦
* RAG 檢索
* FAQ 比對

存放位置：

* pgvector
* 或獨立 Vector DB

---

## 5.5 RAG

RAG 流程：

```text
User Question
↓
Query Rewrite
↓
Hybrid Search
↓
Retrieve Relevant Chunks
↓
Permission Filter
↓
Context Assembly
↓
LLM Answer
↓
Citation
↓
User Feedback
```

---

## 5.6 LLM

支援多模型策略：

* OpenAI GPT
* Claude
* Gemini
* Local LLM

必須抽象化 Model Provider，避免系統綁死單一模型。

---

## 5.7 AI Agent

AI Agent 主要用於任務型流程。

範例：

```text
客戶急單怎麼處理？
↓
Agent 查 SOP
↓
Agent 查庫存規則
↓
Agent 查合約條款
↓
Agent 產生處理建議
```

---

# 6. Data Layer

## 6.1 PostgreSQL

用途：

* 使用者
* 部門
* 文件
* 權限
* 問答紀錄
* 訓練紀錄
* 稽核紀錄

---

## 6.2 pgvector

用途：

* 文件 Chunk Embedding
* FAQ Embedding
* Experience Embedding
* SOP Embedding

---

## 6.3 Redis

用途：

* Cache
* Background Job Queue
* Rate Limit
* Session Support

---

## 6.4 MinIO / Object Storage

用途：

* 原始文件
* 圖片
* 錄音
* 影片
* 匯出檔案

---

# 7. Core Data Flow

## 7.1 Document Ingestion Flow

```text
Upload File
↓
Store Original File
↓
Extract Text
↓
OCR if Needed
↓
Clean Text
↓
Chunking
↓
Embedding
↓
Store Metadata
↓
Index Ready
```

---

## 7.2 AI QA Flow

```text
User Question
↓
Auth Check
↓
Search Relevant Chunks
↓
Permission Filter
↓
Build Context
↓
LLM Generate Answer
↓
Return Answer + Citation
↓
Save Conversation
↓
Collect Feedback
```

---

## 7.3 Experience Transfer Flow

```text
Audio / Interview / Note
↓
Speech-to-Text
↓
Summarization
↓
FAQ Extraction
↓
Knowledge Review
↓
Approval
↓
Embedding
↓
Searchable Knowledge
```

---

## 7.4 SOP Generator Flow

```text
Document / Video / Audio
↓
Content Extraction
↓
Process Analysis
↓
Step Extraction
↓
SOP Draft
↓
Flowchart
↓
Manager Review
↓
Publish
```

---

# 8. Security Architecture

## 8.1 Authentication

支援：

* Email / Password
* OAuth
* SSO
* JWT

---

## 8.2 Authorization

採用 RBAC。

主要角色：

* Employee
* Department Manager
* Administrator
* Auditor

---

## 8.3 Permission Scope

文件權限範圍：

```text
Public
Department
Private
Confidential
Admin Only
```

---

## 8.4 Audit Log

所有重要行為都需要紀錄：

* Login
* Upload
* Delete
* Download
* AI Query
* Permission Change
* Document Approval
* Export

---

# 9. Module Dependency

| Module                        | Depends On                    |
| ----------------------------- | ----------------------------- |
| M01 Document Knowledge Center | Auth, Storage, DB             |
| M02 AI QA Assistant           | M01, Search, RAG, LLM         |
| M03 Experience Transfer       | STT, AI Summary, M01          |
| M04 SOP Generator             | M01, LLM, Flowchart           |
| M05 Training Center           | M01, M02, User Role           |
| M06 AI Agent                  | M01, M02, M12, Agent Service  |
| M07 LINE Bot                  | M02, Auth, API                |
| M08 Screen Record To SOP      | Video Processing, M04         |
| M09 Offboarding AI            | M01, M03, M04                 |
| M10 Knowledge Governance      | M01, Approval Workflow        |
| M11 Permission Management     | Auth, RBAC, Audit             |
| M12 Search Engine             | M01, pgvector, Keyword Search |
| M13 Analytics Dashboard       | Logs, QA, Search, Training    |

---

# 10. Deployment Architecture

## 10.1 Local Development

```text
Frontend
Backend
PostgreSQL
Redis
MinIO
```

建議使用 Docker Compose。

---

## 10.2 Production

建議架構：

```text
Nginx
↓
Frontend
↓
Backend API
↓
PostgreSQL + pgvector
↓
Redis
↓
MinIO
↓
AI Provider API
```

---

## 10.3 Optional Enterprise Deployment

可支援：

* On-Premise
* Private Cloud
* Hybrid Cloud

---

# 11. Recommended Folder Structure

```text
Knowledge_Transfer_System/
├── frontend/
├── backend/
├── database/
│   ├── schemas/
│   ├── migrations/
│   └── seed/
├── modules/
├── spec/
│   ├── API/
│   ├── ERD/
│   ├── PRD/
│   ├── TEST/
│   └── UI/
├── prompts/
├── assets/
└── versions/
```

---

# 12. Architecture Principles

## 12.1 Modular First

每個模組可獨立修改、擴充、停用。

---

## 12.2 API First

前端、LINE Bot、Agent 都必須透過 API 溝通。

---

## 12.3 AI Provider Abstraction

不可綁死單一 AI 供應商。

---

## 12.4 Security by Design

權限與稽核必須在第一版就納入。

---

## 12.5 Citation Required

AI 回答必須盡量提供來源引用。

---

## 12.6 Human Review

重要知識發布前需人工審核。

---

# 13. Next Documents

本文件完成後，下一步需建立：

* spec/ERD/ERD_v1.md
* spec/API/API_v1.md
* spec/PRD/PRD_M01_Document_Knowledge_Center.md
* modules/M01_Document_Knowledge_Center.md
