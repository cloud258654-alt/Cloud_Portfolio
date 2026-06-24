# PRD_M12_Search_Engine

AI Knowledge Transfer System

Product Requirement Document

Module : M12

Module Name : Search Engine

Version : v1.0.0

Owner : Product Manager

Last Update : 2026-06-25

---

# 1. Vision

建立：

Enterprise AI Search Platform

提供：

Fast

Accurate

Permission Aware

Citation Based

AI Ready

Search Experience

---

不是：

Keyword Search

而是：

Enterprise Second Brain

---

# 2. Objectives

Objective 1

Hybrid Search

---

Objective 2

Semantic Search

---

Objective 3

Permission Search

---

Objective 4

Citation Ranking

---

Objective 5

AI Agent Search

---

# 3. Search Architecture

```text
User Query

↓

Query Understanding

↓

Permission Filter

↓

Hybrid Search

--------------------------------

Keyword Search

BM25 Search

Embedding Search

FAQ Search

SOP Search

Experience Search

Case Search

Meeting Search

--------------------------------

↓

Reranker

↓

Citation Ranking

↓

AI Answer
```

---

# 4. Search Sources

Support：

```text
documents

faq

case_studies

experience

sop

training

meeting

knowledge_package

agent_memory
```

---

來源：

M01

Documents

---

M03

Experience

---

M04

SOP

---

M05

Training

---

M09

Knowledge Package

---

M06

Agent Memory

---

# 5. Query Understanding

AI分析：

```text
intent

entity

department

time

topic

risk

permission
```

---

Example

User：

```text
設備停機怎麼辦？
```

Intent：

```text
troubleshooting
```

Entity：

```text
設備
```

---

# 6. Search Types

Support：

```text
keyword

bm25

embedding

hybrid

vector

knowledge_graph
```

---

# 7. Keyword Search

Example：

```text
Sensor

設備停機

請購

供應商
```

---

Support：

```text
contains

wildcard

fuzzy

prefix

exact
```

---

# 8. BM25 Search

適合：

```text
documents

faq

sop

meeting
```

---

Output：

```text
score

document

highlight

snippet
```

---

# 9. Embedding Search

支援：

```text
semantic search

similarity search

question answer

experience retrieval
```

---

Vector Database：

```text
pgvector
```

---

Embedding：

```text
text-embedding

bge-m3

gte-large
```

---

# 10. Hybrid Search

建議：

```text
Keyword

30%

BM25

20%

Embedding

40%

Popularity

5%

Freshness

5%
```

---

Output：

```text
hybrid_score
```

---

# 11. Reranker

重新排序：

依照：

```text
semantic similarity

citation

freshness

permission

quality score

popularity
```

---

Top：

```text
Top 5

Top 10

Top 20
```

---

# 12. Citation Ranking

每筆結果：

```text
title

source

author

version

page

date

confidence

permission
```

---

Example

```text
設備維修SOP

v2.1

Page 5

Engineering

Confidence

92%
```

---

# 13. Permission Search

AI搜尋前：

先過濾：

```text
department

role

document_classification

owner

clearance
```

---

Example

HR：

只能搜尋：

```text
HR
```

---

Finance：

只能搜尋：

```text
Finance
```

---

# 14. Sensitive Search

禁止：

```text
salary

contract

bank account

personal data

secret document
```

---

AI：

```text
deny

mask

audit
```

---

# 15. Search FAQ

User：

```text
主管不在怎麼辦？
```

↓

FAQ Search

↓

Answer

↓

Citation

---

# 16. Search SOP

User：

```text
請購流程？
```

↓

SOP Search

↓

Step

↓

Flowchart

↓

Citation

---

# 17. Search Experience

User：

```text
設備常見故障？
```

↓

Experience

↓

FAQ

↓

Case

↓

Mentor

---

# 18. Search Meeting

Search：

```text
meeting

action item

decision

summary

speaker
```

---

Example

```text
去年供應商會議

↓

Decision

改用B供應商
```

---

# 19. Knowledge Graph Search

Future：

```text
設備

↓

Sensor

↓

故障

↓

FAQ

↓

Case

↓

SOP

↓

Training
```

---

Graph Search：

```text
relation

neighbor

path

entity
```

---

# 20. Agent Search

M06 Agent：

可搜尋：

```text
documents

faq

sop

experience

meeting

memory
```

---

Agent：

```text
search

↓

reason

↓

tool

↓

action
```

---

# 21. Search History

保存：

```text
query

user

department

result_count

clicked

citation

timestamp
```

---

# 22. Search Suggestion

輸入：

```text
設備
```

AI：

```text
設備停機

設備維修

設備保養

設備Sensor

設備FAQ
```

---

# 23. Search Analytics

統計：

```text
top keyword

failed query

popular faq

popular sop

popular case

popular expert
```

---

# 24. Search Dashboard

Cards：

```text
Total Searches

Search Success Rate

Top FAQ

Top SOP

Top Expert

Citation Rate

Failed Searches

Knowledge Gap
```

---

# 25. Search KPI

```text
Search Accuracy >90%

Citation >95%

Permission Accuracy >100%

Search Time <2 sec

Top5 Hit Rate >85%

Search Satisfaction >4.5
```

---

# 26. Integration

M01

Documents

---

M02

AI QA

---

M03

Experience

---

M04

SOP

---

M05

Training

---

M06

Agent

---

M09

Offboarding

---

M10

Governance

---

# 27. Future Features

```text
Knowledge Graph Search

Image Search

Voice Search

Video Search

Multimodal Search

Agent Search

Reasoning Search

Federated Search
```

---

# 28. Competitive Advantage

傳統：

Keyword Search

↓

Documents

---

M12：

Hybrid Search

↓

Knowledge

↓

FAQ

↓

Experience

↓

SOP

↓

Mentor

↓

Agent

↓

Enterprise AI Search

````

---

# 29. Search Formula

```text
Final Score

=

Keyword

×

0.3

+

BM25

×

0.2

+

Embedding

×

0.4

+

Freshness

×

0.05

+

Popularity

×

0.05
````

---

# 30. Final Goal

M12

不是：

搜尋框

也不是：

全文搜尋

而是：

Enterprise AI Search Platform

讓：

User Ask

↓

Search Understand

↓

Knowledge Retrieve

↓

Citation

↓

AI Answer

↓

Agent Execute

成為：

Enterprise Second Brain。
