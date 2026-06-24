# M03_Experience_Ingestion_Pipeline

AI Knowledge Transfer System

Module Specification

Module : M03

Module Name : Experience Transfer

Pipeline : Experience Ingestion Pipeline

Version : v1.0.0

Owner : System Architect

Last Update : 2026-06-25

---

# 1. Purpose

本文件定義 M03 Experience Transfer 的資料處理流程。

目標是將：

* 老師傅錄音
* 維修經驗
* 客戶案例
* 供應商經驗
* 會議錄音
* 專案筆記
* Email
* 影片教學

轉換成：

* Transcript
* AI Summary
* FAQ
* Case Study
* Lessons Learned
* Knowledge Item
* RAG Chunk
* Embedding
* 可搜尋知識

---

# 2. Pipeline Overview

```text
Experience Source
↓
Upload / Record
↓
Validation
↓
Object Storage
↓
Audio Extraction
↓
Speech To Text
↓
Transcript Cleaning
↓
Speaker Detection
↓
AI Summary
↓
FAQ Extraction
↓
Case Extraction
↓
Knowledge Item Generation
↓
Human Review
↓
Publish
↓
Chunking
↓
Embedding
↓
RAG Ready
```

---

# 3. Supported Sources

## 3.1 Audio

```text
mp3
wav
m4a
aac
```

---

## 3.2 Video

```text
mp4
mov
avi
```

---

## 3.3 Text

```text
txt
md
docx
pdf
```

---

## 3.4 Email

```text
eml
msg
```

---

## 3.5 Manual Input

使用者可直接輸入：

```text
經驗標題
問題描述
處理方式
注意事項
案例結果
```

---

# 4. Source Categories

每筆經驗需分類：

```text
expert_experience
customer_case
supplier_case
maintenance_case
audit_case
meeting_note
project_review
offboarding_note
training_tip
```

---

# 5. Upload / Record Stage

## 5.1 Upload Flow

```text
User Upload
↓
File Validation
↓
Virus Scan
↓
Store Raw File
↓
Create Experience Record
↓
Start Background Job
```

---

## 5.2 Record Flow

```text
Start Recording
↓
Save Audio Stream
↓
Stop Recording
↓
Upload Audio File
↓
Start STT Job
```

---

## 5.3 Required Metadata

```text
title
department_id
created_by
source_type
category
expert_name
tags
permission_scope
language
```

---

# 6. Validation

檢查項目：

```text
file_extension
mime_type
file_size
duration
virus_scan
permission_scope
department_id
```

---

## 6.1 Size Limit

```text
audio: 500MB
video: 1GB
text: 100MB
email: 50MB
```

---

## 6.2 Duration Limit

```text
audio: 3 hours
video: 3 hours
```

---

# 7. Object Storage

使用：

```text
MinIO
```

建議路徑：

```text
experience/
department/
year/
month/
experience_id/
raw/
```

Example：

```text
experience/engineering/2026/06/exp_001/raw/maintenance_interview.mp3
```

---

# 8. Audio Extraction

若來源為 video：

```text
Video
↓
Extract Audio
↓
Save Audio
↓
Speech To Text
```

工具：

```text
ffmpeg
```

輸出：

```text
audio_path
duration
bitrate
sample_rate
```

---

# 9. Speech To Text

## 9.1 Engine

建議：

```text
Whisper
```

可替換：

```text
Google STT
Azure Speech
Local STT
```

---

## 9.2 Output

```text
transcript
segments
language
duration
confidence
speaker
timestamp
```

---

## 9.3 Segment Example

```json
{
  "start": "00:00:10",
  "end": "00:00:18",
  "speaker": "Speaker 1",
  "text": "這台設備最常故障的是 Sensor 接頭鬆脫。"
}
```

---

# 10. Transcript Cleaning

清理：

```text
口頭禪
重複詞
無意義停頓
多餘空白
雜訊標記
錯字
```

保留：

```text
專有名詞
型號
客戶名稱
設備名稱
錯誤代碼
SOP步驟
```

---

# 11. Speaker Detection

若為多人會議，需識別：

```text
Speaker 1
Speaker 2
Speaker 3
```

未來可對應：

```text
real_user_id
expert_profile
department
role
```

---

# 12. AI Summary Generation

AI 需輸出：

```text
summary
key_points
problems
causes
solutions
warnings
lessons_learned
related_tags
```

---

## 12.1 Summary Example

```text
本經驗主要說明設備 A-102 經常發生 Sensor 接頭鬆脫問題。
建議先檢查接頭，再測量電壓，最後更換 Sensor。
此問題過去多發生於高溫環境與連續運轉後。
```

---

# 13. FAQ Extraction

AI 自動產生 FAQ。

## 13.1 FAQ Format

```text
Q:
設備 A-102 常見故障原因是什麼？

A:
最常見原因是 Sensor 接頭鬆脫，其次是電壓不穩。
建議依序檢查接頭、測量電壓、必要時更換 Sensor。
```

---

## 13.2 FAQ Fields

```text
question
answer
source_experience_id
confidence_score
tags
department_id
status
```

---

# 14. Case Study Extraction

若內容包含問題、原因、處理方式，AI 應轉成 Case Study。

## 14.1 Case Format

```text
Title:
設備 A-102 Sensor 異常案例

Problem:
設備運轉中頻繁停機。

Cause:
Sensor 接頭鬆脫。

Solution:
重新固定接頭並檢查電壓。

Result:
停機次數明顯下降。

Lesson Learned:
例行保養需加入 Sensor 接頭檢查。
```

---

# 15. Knowledge Item Generation

輸出知識項目類型：

```text
faq
case
tip
sop_suggestion
troubleshooting
customer_note
supplier_note
audit_note
training_note
```

---

# 16. Human Review

所有 AI 產出的知識不可直接發布。

流程：

```text
AI Draft
↓
Reviewer Check
↓
Edit
↓
Approve
↓
Publish
```

審核者：

```text
Department Manager
Knowledge Owner
Administrator
```

---

# 17. Publish Flow

```text
Approved Knowledge
↓
Create Knowledge Item
↓
Create Document Chunk
↓
Create Embedding
↓
Add Search Index
↓
Available for AI QA
```

---

# 18. Chunking Strategy

Experience Chunk 與 Document Chunk 不同。

## 18.1 Experience Chunk Rules

```text
Chunk Size: 300~500 tokens
Overlap: 50~80 tokens
Keep Question + Answer together
Keep Problem + Cause + Solution together
Keep Case完整性
```

---

## 18.2 Chunk Metadata

```text
experience_id
knowledge_item_id
category
expert_name
department_id
tags
source_type
timestamp
permission_scope
```

---

# 19. Embedding Strategy

Embedding Targets：

```text
summary
faq
case_study
lessons_learned
troubleshooting_steps
full_transcript_chunks
```

---

存入：

```text
pgvector
```

---

# 20. RAG Integration

M02 AI QA 可搜尋：

```text
documents
experience_records
knowledge_items
faq
case_studies
```

回答必須引用：

```text
experience_title
expert_name
date
category
confidence
```

---

# 21. Error Handling

## 21.1 Error Types

```text
UNSUPPORTED_FILE
FILE_TOO_LARGE
AUDIO_EXTRACTION_FAILED
STT_FAILED
TRANSCRIPT_EMPTY
SUMMARY_FAILED
FAQ_EXTRACTION_FAILED
CASE_EXTRACTION_FAILED
REVIEW_REQUIRED
EMBEDDING_FAILED
```

---

## 21.2 Error Response

```json
{
  "success": false,
  "error": {
    "code": "STT_FAILED",
    "message": "Speech to text processing failed."
  }
}
```

---

# 22. Retry Policy

```text
audio_extraction: retry 3 times
speech_to_text: retry 3 times
summary_generation: retry 3 times
faq_extraction: retry 3 times
embedding: retry 3 times
storage: retry 5 times
```

---

# 23. Dead Letter Queue

失敗任務放入：

```text
experience_dlq
```

管理員可以：

```text
retry
delete
manual_review
export_error_log
```

---

# 24. Background Jobs

Queue：

```text
Redis + Celery
```

Jobs：

```text
experience_upload_job
audio_extract_job
speech_to_text_job
transcript_clean_job
summary_job
faq_extract_job
case_extract_job
review_prepare_job
embedding_job
search_index_job
```

---

# 25. Monitoring

監控指標：

```text
upload_count
stt_success_rate
stt_failed_count
avg_transcript_time
summary_success_rate
faq_generated_count
case_generated_count
review_pending_count
published_knowledge_count
embedding_success_rate
```

---

# 26. Cost Control

避免成本失控：

```text
limit_audio_duration
limit_video_duration
batch_embedding
cache_transcript
reuse_summary
manual_trigger_for_large_files
```

---

# 27. Security

必須支援：

```text
JWT
RBAC
Department Isolation
Permission Scope
Encryption
Audit Log
Sensitive Data Masking
Signed URL
Virus Scan
```

---

# 28. Privacy / Sensitive Knowledge

若內容包含：

```text
個資
薪資
合約金額
客戶機密
供應商報價
內部稽核缺失
```

系統應：

```text
mask
restrict_access
require_review
log_access
```

---

# 29. Audit Log

必須紀錄：

```text
upload_experience
start_recording
download_audio
view_transcript
edit_summary
approve_knowledge
publish_knowledge
delete_experience
search_experience
ai_answer_using_experience
```

---

# 30. Success KPI

```text
STT Success Rate > 95%
Summary Quality Score > 4.3 / 5
FAQ Extraction Accuracy > 85%
Case Extraction Accuracy > 80%
Review Completion Rate > 90%
Knowledge Publish Rate > 70%
Search Accuracy > 90%
```

---

# 31. Future Enhancements

```text
Auto Interview Agent
AI Follow-up Questions
Expert Avatar
Voice QA
Video QA
Knowledge Graph
Skill Map
Expert Recommendation
Offboarding Knowledge Package
```

---

# 32. Final Goal

M03 Experience Ingestion Pipeline 的最終目標不是：

錄音轉文字

而是：

```text
Tacit Knowledge
↓
Structured Knowledge
↓
Searchable Knowledge
↓
AI QA
↓
AI Mentor
↓
Enterprise Experience Brain
```

讓企業內部最珍貴的經驗不再依賴單一員工，而能持續保存、傳承與再利用。
