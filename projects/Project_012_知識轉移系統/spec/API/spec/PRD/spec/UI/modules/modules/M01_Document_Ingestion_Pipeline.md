# M01_Document_Ingestion_Pipeline

AI Knowledge Transfer System

Module Specification

Version : v1.0.0

Owner : System Architect

Last Update : 2026-06-25

---

# 1. Purpose

本模組負責：

將企業各種格式的知識文件

轉換成：

AI可以理解

AI可以搜尋

AI可以引用

AI可以推理

的知識資產。

---

# 2. Pipeline Overview

```text
Upload File

↓

File Validation

↓

Virus Scan

↓

Object Storage

↓

Document Parser

↓

OCR

↓

Text Cleaning

↓

Metadata Extraction

↓

Chunking

↓

Embedding

↓

Vector Database

↓

Search Index

↓

AI Ready
```

---

# 3. Supported Input

## Documents

```text
pdf

doc

docx

xls

xlsx

ppt

pptx

txt

md

csv
```

---

## Images

```text
jpg

jpeg

png

tiff

bmp
```

---

## Audio

```text
mp3

wav

m4a
```

---

## Video

```text
mp4

mov
```

---

## Email

```text
eml

msg
```

---

# 4. File Upload Stage

Upload API

```text
POST

/documents/upload
```

---

Validation

檢查：

```text
副檔名

檔案大小

病毒

MIME Type
```

---

限制：

```text
pdf

100 MB


audio

500 MB


video

1 GB
```

---

# 5. Virus Scan

使用：

ClamAV

---

流程：

```text
Upload

↓

Virus Scan

↓

Safe ?

↓

Yes

↓

Continue


No

↓

Reject
```

---

# 6. Object Storage

使用：

MinIO

---

Structure

```text
documents

department

year

month

uuid

filename
```

---

Example

```text
documents

procurement

2026

06

abcd123

sop.pdf
```

---

# 7. Document Parser

依照格式：

---

PDF

使用：

PyMuPDF

pdfplumber

---

Word

python-docx

---

Excel

openpyxl

---

PPT

python-pptx

---

Markdown

markdown parser

---

Email

extract：

subject

body

attachment

---

# 8. OCR Pipeline

如果：

```text
Image

Scan PDF

Photo
```

↓

OCR

---

推薦：

PaddleOCR

---

備援：

Tesseract

---

輸出：

```text
text

page

confidence

language
```

---

# 9. OCR Workflow

```text
Image

↓

Preprocess

↓

Denoise

↓

Deskew

↓

OCR

↓

Confidence Check

↓

Store Text
```

---

如果：

Confidence

<80%

↓

人工審核

---

# 10. Audio Pipeline

Input

```text
mp3

wav

m4a
```

↓

Whisper

↓

Transcript

↓

Summary

↓

FAQ

↓

Knowledge

---

Metadata

```text
speaker

duration

language

confidence
```

---

# 11. Video Pipeline

Input

```text
mp4

mov
```

↓

Extract Audio

↓

Whisper

↓

Transcript

↓

Frame Sampling

↓

Image OCR

↓

Step Detection

↓

SOP

---

輸出：

```text
Transcript

SOP

FAQ

Summary
```

---

# 12. Text Cleaning

Remove

```text
Extra Space

Header

Footer

Page Number

Special Characters
```

---

Normalize

```text
Line Break

Unicode

Date

Currency
```

---

# 13. Metadata Extraction

AI自動產生：

```text
Title

Department

Category

Keywords

Summary

Author

Language

Version
```

---

Example

```text
採購SOP

Department

Procurement


Keywords

請購

驗收

供應商


Summary

本文件描述採購流程...
```

---

# 14. Chunking Strategy

非常重要

---

Rule

```text
Chunk Size

512 Tokens


Overlap

100 Tokens
```

---

Keep

```text
Section

Title

Page

Header
```

---

Don't Split

```text
SOP Step

Table

Flowchart
```

---

# 15. Chunk Example

Original

```text
Step1

建立請購單

Step2

主管簽核

Step3

採購下單
```

---

Chunk

```text
chunk_id

page=3

section=procurement


content

Step1...

Step2...

Step3...
```

---

# 16. Embedding Pipeline

Chunk

↓

Embedding

↓

Vector

↓

Store

---

推薦：

OpenAI Embedding

---

Dimension

```text
1536
```

---

Store

```text
chunk_id

vector

model

created_at
```

---

# 17. Vector Database

使用：

pgvector

---

Index

ivfflat

---

Distance

cosine similarity

---

Store：

```text
document

chunk

faq

sop

experience
```

---

# 18. Search Index

建立：

---

Keyword

---

Vector

---

Hybrid

---

Ranking

---

Top K

---

# 19. Search Workflow

```text
Question

↓

Permission Check

↓

Keyword Search

+

Vector Search

↓

Merge

↓

Ranking

↓

Top K

↓

Return
```

---

# 20. Citation Generation

AI回答必須：

回傳：

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
Source

採購SOP

v2.0

page 3

confidence

92%
```

---

# 21. Background Jobs

Queue

Redis

Celery

---

Jobs

OCR Job

---

Chunk Job

---

Embedding Job

---

Summary Job

---

FAQ Job

---

Index Job

---

# 22. Retry Policy

OCR

Retry

3次

---

Embedding

Retry

3次

---

Summary

Retry

3次

---

Storage

Retry

5次

---

# 23. Dead Letter Queue

失敗工作：

移入：

```text
DLQ

ocr_failed

embedding_failed

storage_failed
```

---

管理員可：

Retry

Delete

Manual Review

---

# 24. Monitoring

Prometheus

---

Grafana

---

監控：

```text
Upload Time

OCR Time

Embedding Time

Chunk Time

Search Time

Token Usage
```

---

# 25. Cost Estimation

1000份文件

---

OCR

約

USD 5~10

---

Embedding

USD 10~30

---

Storage

< USD 5

---

Total

USD 20~50

---

# 26. Security

Virus Scan

---

Signed URL

---

Encryption

AES256

---

JWT

---

RBAC

---

Department Isolation

---

Audit Log

---

# 27. Scalability

Support

```text
100K+

Documents


10M+

Chunks


1M+

Embeddings


1000+

Concurrent Users
```

---

# 28. Future Pipeline

Image Caption

---

Knowledge Graph

---

Auto FAQ

---

Auto SOP

---

Video to SOP

---

AI Knowledge Curator

---

# 29. Final Goal

這條 Pipeline

不是：

Upload → OCR

而是：

```text
Raw Knowledge

↓

AI Understand

↓

AI Search

↓

AI Answer

↓

AI Reasoning

↓

AI Agent

↓

Enterprise Brain
```

成為企業 AI Knowledge Engine 的核心基礎設施。
