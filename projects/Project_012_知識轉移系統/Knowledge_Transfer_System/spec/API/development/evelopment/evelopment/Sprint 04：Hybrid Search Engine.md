# Sprint_04_Hybrid_Search

AI Knowledge Transfer System

Sprint Development Plan

Sprint : 04

Sprint Name : Enterprise Hybrid Search Engine

Version : v1.0.0

Owner : Project Manager / AI Search Architect

Last Update : 2026-06-25

---

# 1. Sprint Goal

建立 Enterprise Hybrid Search Engine。

完成後，所有 Knowledge 都能透過：

Keyword + Semantic + Permission

完成企業級搜尋。

本 Sprint 完成後：

```text
User

↓

Hybrid Search

↓

Permission Filter

↓

Reranker

↓

Citation

↓

Top Results
```

後續：

AI QA

Agent

Training

SOP

全部共用此 Search Engine。

---

# 2. Business Value

企業搜尋不是 Google Search。

必須：

✓ 搜得到

✓ 找得到

✓ 找得快

✓ 找得準

✓ 看得到（權限）

因此：

Hybrid Search 是整個 AI Platform 的核心。

---

# 3. Scope

本 Sprint 包含：

```text
BM25 Search

Vector Search

Hybrid Search

Permission Filter

Metadata Filter

Department Filter

Reranker

Citation Builder

Search History

Popular Search

Search Suggestion

Search Analytics
```

---

# 4. Out of Scope

本 Sprint 不包含：

```text
Chat

AI QA

Agent

SOP

Training
```

---

# 5. Search Architecture

```
User Query

↓

Query Parser

↓

Permission Check

↓

BM25

+

Vector Search

↓

Merge

↓

Reranker

↓

Citation Builder

↓

Top Results
```

---

# 6. Backend Folder

新增：

```
backend/app/search/

search_engine.py

bm25_engine.py

vector_engine.py

hybrid_engine.py

reranker.py

permission_filter.py

citation_builder.py

query_parser.py

search_service.py
```

---

# 7. Search Flow

```
Query

↓

Keyword Search

↓

Vector Search

↓

Merge

↓

Permission

↓

Rerank

↓

Top 10

↓

Response
```

---

# 8. Query Parser

Parser：

需支援：

```
keyword

phrase

tag

department

owner

date

document type
```

例如：

```
ERP SOP

採購流程

新人教育

ISO 9001

設備保養
```

---

# 9. Keyword Search

使用：

```
PostgreSQL

GIN

pg_trgm

tsvector
```

搜尋：

```
title

summary

content

tag
```

---

# 10. Vector Search

使用：

```
pgvector
```

搜尋：

```
embedding
```

Top：

```
Top 50
```

---

# 11. Hybrid Search

權重：

```
Keyword

40%

+

Embedding

60%
```

權重需可設定。

---

# 12. Reranker

重新排序：

依：

```
semantic

keyword

freshness

permission

department

document score
```

輸出：

```
Top 10
```

---

# 13. Citation

每個結果：

需包含：

```
Document

Version

Page

Chunk

Section

Score
```

---

# 14. Permission Filter

搜尋前：

需檢查：

```
Department

Role

Permission

Classification
```

禁止：

搜尋到：

無權限文件。

---

# 15. Metadata Filter

Frontend：

Filter：

```
Department

Category

Owner

Status

Tag

Language

Date

Version
```

---

# 16. Search API

建立：

## Search

```
POST /api/v1/search
```

Request：

```json
{
    "query":"ISO SOP",
    "page":1,
    "page_size":10,
    "department":"Engineering"
}
```

---

## Suggestion

```
GET /search/suggestion
```

---

## Popular

```
GET /search/popular
```

---

## History

```
GET /search/history
```

---

# 17. Frontend

建立：

```
/search
```

包含：

```
Large Search Box

Filter

Result

Citation

Preview

AI Summary

Sort
```

---

# 18. Result Card

每筆：

```
Title

Summary

Department

Owner

Version

Updated

Score

Citation
```

---

# 19. Search Analytics

紀錄：

```
Query

Click

Latency

Top Click

No Result

Popular
```

---

# 20. Performance

要求：

```
100萬 Chunk

搜尋

< 2 秒
```

---

# 21. Backend Tests

建立：

```
test_keyword_search.py

test_vector_search.py

test_permission_filter.py

test_reranker.py
```

---

# 22. Acceptance Criteria

完成：

```
Keyword Search

Vector Search

Hybrid Search

Permission

Citation

Suggestion

History

Analytics

API

Frontend
```

全部正常。

---

# 23. Definition of Done

```
Search Engine 完成

API 完成

Frontend 完成

Permission 完成

Reranker 完成

Tests 通過
```

---

# 24. Codex Execution

不要開始：

```
Chat

AI QA

Agent
```

只完成：

Enterprise Search。

---

# 25. Deliverables

完成請輸出：

```
Search Folder Tree

API List

Search Flow

Performance

Tests

Known Issues
```

---

# 26. Next Sprint

完成後進入：

```
development/Sprint_05_AI_QA.md
```

內容：

```
Enterprise AI QA

Conversation

Citation

Memory

Feedback

Context Window

Streaming

Prompt Management
```
