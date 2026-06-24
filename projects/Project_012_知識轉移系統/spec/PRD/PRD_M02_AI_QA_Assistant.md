# PRD_M02_AI_QA_Assistant

AI Knowledge Transfer System

Product Requirement Document

Module : M02

Module Name : AI QA Assistant

Version : v1.0.0

Owner : Product Manager

Last Update : 2026-06-25

---

# 1. Module Vision

建立企業級 AI 問答助理。

使用者不需要：

找資料

翻SOP

找老師傅

找主管

直接輸入：

問題

↓

AI理解

↓

搜尋企業知識

↓

推理

↓

回答

↓

引用來源

↓

持續學習

---

# 2. Business Problems

企業目前：

---

不知道去哪找文件

---

SOP太多

---

FAQ重複詢問

---

新人一直問

---

老師傅經驗找不到

---

# 3. Module Objectives

Objective 1

AI理解自然語言

---

Objective 2

回答必須有依據

Citation Required

---

Objective 3

支援多輪對話

---

Objective 4

支援部門知識隔離

---

Objective 5

AI持續改善

---

# 4. User Stories

---

Story 1

身為：

新人

我希望：

直接問：

請購流程？

AI回答。

---

Story 2

身為：

工程師

我希望：

設備異常如何排除？

AI引用：

SOP

FAQ

維修紀錄

---

Story 3

身為：

主管

我希望：

AI回答必須有來源。

---

# 5. Supported Questions

例如：

---

請購流程？

---

供應商如何新增？

---

ERP怎麼報工？

---

請假規定？

---

設備異常如何排除？

---

客戶A特殊要求？

---

# 6. Functional Requirements

---

FR001

Ask Question

---

Input

```text
Question

Conversation ID

Department

Language
```

---

Example

```text
請購流程怎麼走？
```

---

Output

```text
Answer

Citation

Confidence

Related Documents
```

---

FR002

Multi Turn Conversation

---

Example

```text
Q

請購流程？


A

...


Q

那主管簽核呢？


A

...
```

AI要記得上下文。

---

FR003

Citation

回答必須：

```text
Document

Version

Page

Chunk

Score
```

---

Example

```text
採購SOP

v2.0

page 3

confidence

92%
```

---

FR004

Related Documents

顯示：

```text
採購SOP

請購表

供應商管理

ERP教學
```

---

FR005

Feedback

使用者：

👍

👎

Comment

---

FR006

Conversation History

保存：

所有對話。

---

# 7. AI Workflow

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

---

# 8. Query Rewrite

例如：

使用者：

```text
請購怎麼做？
```

AI：

轉成：

```text
請購流程 SOP

採購申請

主管簽核
```

增加搜尋準確率。

---

# 9. Search Strategy

使用：

Hybrid Search

---

Keyword Search

*

Embedding Search

---

Reranking

---

Top K

預設：

5

---

# 10. RAG Strategy

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

---

Context Limit

4000 tokens

---

Chunk Size

512 tokens

---

Overlap

100 tokens

---

# 11. AI Answer Modes

Support：

---

Grounded Mode

只根據文件回答

---

Summary Mode

摘要回答

---

Step By Step

逐步教學

---

FAQ Mode

簡短回答

---

Expert Mode

專家分析

---

# 12. AI Prompt Template

System Prompt

```text
You are Enterprise AI Assistant.

Rules:

Answer only from retrieved documents.

Always cite source.

If unknown:

say

I don't know.

Never hallucinate.
```

---

# 13. Confidence Score

AI回答：

```text
0~100%
```

---

Calculation

Search Score

*

Rerank Score

*

LLM Score

---

Display：

```text
Confidence

92%
```

---

# 14. Citation Format

顯示：

```text
Source

採購SOP

Version

v2.0

Page

3

Chunk

chunk_003

Score

0.92
```

---

# 15. Conversation Memory

保存：

```text
conversation_id

message

answer

citations

feedback

timestamp
```

---

Memory Window

20 Messages

---

# 16. Feedback Learning

User：

👍

↓

Boost

---

👎

↓

Lower Rank

---

Comment

↓

Knowledge Improvement

---

# 17. Permission

Search前：

先檢查：

---

Role

Employee

---

Department

Procurement

---

Permission

department

---

只有有權限才能查。

---

# 18. Error Handling

Question Too Long

---

No Knowledge Found

---

Permission Denied

---

LLM Timeout

---

Citation Missing

---

# 19. UI Layout

```text
------------------------------------------------

Sidebar

Chat History

New Chat

Favorites

------------------------------------------------

Main Chat

Question

Answer

Citation

Feedback

------------------------------------------------

Related Documents

------------------------------------------------
```

---

# 20. AI Answer Card

```text
Answer

請購流程如下：

1.

建立請購單

2.

主管簽核

3.

採購下單


Confidence

92%


Source

採購SOP

Page 3
```

---

# 21. Dashboard Metrics

AI Questions

---

Success Rate

---

Citation Rate

---

Avg Response Time

---

Top Questions

---

User Satisfaction

---

# 22. Performance

Response Time

<5 sec

---

Search

<2 sec

---

Citation

100%

---

Availability

99.5%

---

# 23. Security

JWT

---

RBAC

---

Department Isolation

---

Prompt Injection Protection

---

Sensitive Data Filter

---

Audit Log

---

# 24. Future Features

Voice QA

---

Image QA

---

Meeting QA

---

Video QA

---

Agent QA

---

Knowledge Graph QA

---

# 25. Success KPI

Answer Accuracy

> 85%

---

Citation Rate

> 95%

---

User Satisfaction

> 4.5 / 5

---

AI Adoption Rate

> 80%

---

# 26. Final Goal

M02 不只是：

Chatbot

而是：

Enterprise AI Assistant

具備：

Search

Reasoning

Citation

Memory

Feedback

Learning

Agent Collaboration

成為企業員工最主要的知識入口。
