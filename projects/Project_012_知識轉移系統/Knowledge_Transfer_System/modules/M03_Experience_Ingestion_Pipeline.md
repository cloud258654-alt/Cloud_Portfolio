# M03_Experience_Ingestion_Pipeline

AI Knowledge Transfer System

Module Specification

Module: M03
Module Name: Experience Transfer
Pipeline: Experience Ingestion Pipeline
Version: v1.0.0
Owner: System Architect
Last Update: 2026-06-25

## 1. Purpose

The M03 Experience Ingestion Pipeline transforms tacit experience into structured, searchable, and AI-ready knowledge.

It processes:

- Expert interviews
- Maintenance experience
- Customer cases
- Supplier cases
- Meeting recordings
- Project reviews
- Email
- Video records

Outputs:

- Transcript
- AI Summary
- FAQ
- Case Study
- Lessons Learned
- Knowledge Item
- RAG Chunk
- Embedding
- Searchable knowledge

## 2. Pipeline Overview

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

## 3. Supported Sources

Audio:

```text
mp3
wav
m4a
aac
```

Video:

```text
mp4
mov
avi
```

Text:

```text
txt
md
docx
pdf
```

Email:

```text
eml
msg
```

Manual input:

```text
experience_title
problem_description
solution
lesson_learned
case_result
```

## 4. Source Categories

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

## 5. Upload / Record Stage

Upload flow:

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

Record flow:

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

Required metadata:

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

## 6. Validation

Validation items:

```text
file_extension
mime_type
file_size
duration
virus_scan
permission_scope
department_id
```

Size limits:

```text
audio: 500MB
video: 1GB
text: 100MB
email: 50MB
```

Duration limits:

```text
audio: 3 hours
video: 3 hours
```

## 7. Object Storage

Storage:

```text
MinIO
```

Path structure:

```text
experience/
department/
year/
month/
experience_id/
raw/
```

Example:

```text
experience/engineering/2026/06/exp_001/raw/maintenance_interview.mp3
```

## 8. Audio Extraction

For video files:

```text
Video
↓
Extract Audio
↓
Save Audio
↓
Speech To Text
```

Tool:

```text
ffmpeg
```

Output:

```text
audio_path
duration
bitrate
sample_rate
```

## 9. Speech To Text

Recommended engine:

```text
Whisper
```

Alternative engines:

```text
Google STT
Azure Speech
Local STT
```

Output:

```text
transcript
segments
language
duration
confidence
speaker
timestamp
```

Segment example:

```json
{
  "start": "00:00:10",
  "end": "00:00:18",
  "speaker": "Speaker 1",
  "text": "The equipment issue started after the sensor calibration failed."
}
```

## 10. Transcript Cleaning

Remove:

```text
filler words
repeated words
irrelevant noise
formatting artifacts
```

Normalize:

```text
project names
customer names
equipment names
error codes
SOP steps
```

## 11. Speaker Detection

Speaker labels:

```text
Speaker 1
Speaker 2
Speaker 3
```

Optional mapping:

```text
real_user_id
expert_profile
department
role
```

## 12. AI Summary Generation

AI outputs:

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

## 13. FAQ Extraction

FAQ fields:

```text
question
answer
source_experience_id
confidence_score
tags
department_id
status
```

Example:

```text
Q: What should be checked first when A-102 sensor values are abnormal?
A: Check calibration status, recent maintenance records, and whether the sensor was replaced.
```

## 14. Case Study Extraction

Case format:

```text
Title
Problem
Cause
Solution
Result
Lesson Learned
```

## 15. Knowledge Item Generation

Knowledge item types:

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

## 16. Human Review

Review flow:

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

Reviewer roles:

```text
Department Manager
Knowledge Owner
Administrator
```

## 17. Publish Flow

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

## 18. Chunking Strategy

Experience chunk rules:

```text
Chunk Size: 300-500 tokens
Overlap: 50-80 tokens
Keep Question + Answer together
Keep Problem + Cause + Solution together
Keep case history intact
```

Chunk metadata:

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

## 19. Embedding Strategy

Embedding targets:

```text
summary
faq
case_study
lessons_learned
troubleshooting_steps
full_transcript_chunks
```

Storage:

```text
pgvector
```

## 20. RAG Integration

M02 AI QA can retrieve from:

```text
documents
experience_records
knowledge_items
faq
case_studies
```

Citation fields:

```text
experience_title
expert_name
date
category
confidence
```

## 21. Error Handling

Error types:

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

Error response:

```json
{
  "success": false,
  "error": {
    "code": "STT_FAILED",
    "message": "Speech to text processing failed."
  }
}
```

## 22. Retry Policy

```text
audio_extraction: retry 3 times
speech_to_text: retry 3 times
summary_generation: retry 3 times
faq_extraction: retry 3 times
embedding: retry 3 times
storage: retry 5 times
```

## 23. Dead Letter Queue

Queue:

```text
experience_dlq
```

Operations:

```text
retry
delete
manual_review
export_error_log
```

## 24. Background Jobs

Queue:

```text
Redis + Celery
```

Jobs:

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

## 25. Monitoring

Metrics:

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

## 26. Cost Control

Controls:

```text
limit_audio_duration
limit_video_duration
batch_embedding
cache_transcript
reuse_summary
manual_trigger_for_large_files
```

## 27. Security

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

## 28. Privacy / Sensitive Knowledge

Sensitive content may include:

```text
personal data
salary
pricing
customer confidential information
supplier confidential information
audit findings
```

System actions:

```text
mask
restrict_access
require_review
log_access
```

## 29. Audit Log

Events:

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

## 30. Success KPI

```text
STT Success Rate > 95%
Summary Quality Score > 4.3 / 5
FAQ Extraction Accuracy > 85%
Case Extraction Accuracy > 80%
Review Completion Rate > 90%
Knowledge Publish Rate > 70%
Search Accuracy > 90%
```

## 31. Future Enhancements

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

## 32. Final Goal

The M03 Experience Ingestion Pipeline transforms tacit knowledge into structured enterprise knowledge.

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
