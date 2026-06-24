# PRD_M03_Experience_Transfer

AI Knowledge Transfer System

Product Requirement Document

Module: M03
Module Name: Experience Transfer
Version: v1.0.0
Owner: Product Manager
Last Update: 2026-06-25

## 1. Module Vision

M03 Experience Transfer converts expert experience, audio, video, email, meeting records, and manual notes into structured enterprise knowledge.

The module should generate:

- FAQ
- Case Study
- Knowledge Base entries
- Lessons learned
- Searchable experience records

The goal is to preserve practical knowledge before it is lost and make it usable by AI QA, AI Agent, training, and decision support.

## 2. Business Problems

The module addresses:

- Expert knowledge leaves with employees.
- Important experience is passed verbally and cannot be reused.
- Troubleshooting cases are not documented.
- Offboarding handover is incomplete.
- New employees cannot easily learn from past experience.

## 3. Objectives

- Capture expert experience in structured form.
- Convert audio and video into knowledge through transcription.
- Generate FAQ from experience records.
- Build a case library.
- Provide citations for AI answers based on experience knowledge.

## 4. Knowledge Types

Supported knowledge types:

- Expert Experience
- Customer Experience
- Supplier Experience
- Maintenance Experience
- Audit Experience
- Meeting Knowledge
- Project Experience

## 5. Supported Sources

Audio:

```text
mp3
wav
m4a
```

Video:

```text
mp4
mov
```

Text:

```text
txt
docx
md
```

Other:

- Email: eml
- Meeting Transcript
- Manual Input

## 6. User Stories

### Story 1: Expert Records Troubleshooting Experience

As an expert, I want to record troubleshooting experience by voice so the system can convert it into searchable knowledge.

### Story 2: New Employee Asks About a Past Case

As a new employee, I want to ask how a previous issue was solved so AI can answer from case records, FAQ, and experience summaries.

### Story 3: Manager Preserves Team Knowledge

As a manager, I want to capture team experience before employee transfer or offboarding so knowledge is retained.

## 7. Functional Requirements

### FR001 Record Experience

The system should support experience input from:

- Audio
- Video
- Text

### FR002 Speech to Text

Workflow:

```text
Audio
↓
Whisper
↓
Transcript
```

### FR003 AI Summary

AI should generate:

- Summary
- Keywords
- FAQ
- Case
- Lessons Learned

### FR004 Experience Search

Search examples:

```text
equipment troubleshooting
supplier issue handling
customer complaint case
ISO audit finding
```

### FR005 Knowledge Approval

Managers should review generated knowledge before publication.

Flow:

```text
Manager Review
↓
Published
```

## 8. Audio Workflow

```text
Audio
↓
Whisper
↓
Transcript
↓
Summary
↓
FAQ
↓
Knowledge Item
↓
Review
↓
Published
```

## 9. Video Workflow

```text
Video
↓
Audio Extraction
↓
Whisper
↓
Transcript
↓
Frame Analysis
↓
OCR
↓
Step Detection
↓
Summary
↓
Knowledge
```

## 10. Meeting Workflow

```text
Meeting Recording
↓
Transcript
↓
AI Summary
↓
Action Items
↓
FAQ
↓
Knowledge Base
```

## 11. AI Summary

Input example:

```text
The maintenance engineer explains that the sensor failed because calibration was skipped.
The team replaced the sensor and updated the inspection checklist.
```

Output example:

```text
Summary:
The issue was caused by skipped sensor calibration.

Recommended steps:
1. Check calibration status.
2. Verify sensor reading.
3. Replace sensor if required.
4. Update inspection checklist.
```

## 12. FAQ Generation

Input:

```text
Transcript
```

AI-generated FAQ:

```text
Q: What should be checked first when the sensor value is abnormal?
A: Check the calibration status and recent maintenance record.
```

Storage:

```text
knowledge_items
```

## 13. Case Library

Case fields:

```text
Case ID
Title
Problem
Cause
Solution
Lesson Learned
Department
Tags
```

Example:

```text
Case: Supplier delivery delay
Cause: Missing approval confirmation
Solution: Add approval checkpoint before delivery confirmation
Lesson: Make approval status visible before supplier scheduling
```

## 14. Knowledge Categories

- FAQ
- Case Study
- Expert Tips
- Troubleshooting
- Customer Experience
- Audit Knowledge
- Training Material

## 15. Metadata

Experience metadata:

```text
Author
Department
Knowledge Type
Keywords
Summary
Tags
Created At
Status
```

## 16. Status Flow

```text
Draft
↓
Transcripted
↓
AI Summary
↓
Review
↓
Published
↓
Archived
```

## 17. Permission

Supported permission scopes:

- public
- department
- private
- confidential
- admin_only

## 18. Search

Supported search modes:

- Keyword
- Semantic Search
- Hybrid Search

Example:

```text
How was the customer complaint solved last time?
```

Expected result types:

- Case
- FAQ
- Meeting
- Experience

## 19. AI QA Integration

Example flow:

```text
User asks: How was this troubleshooting issue solved?
↓
M02 AI QA
↓
Search Experience / FAQ / SOP / Case
↓
Answer
↓
Citation
```

## 20. Citation

Citation example:

```text
Source: Maintenance Experience Record
Author: Senior Engineer
Date: 2026-06-25
Confidence: 92%
```

## 21. Dashboard

Dashboard metrics:

- Experience Count
- Top Experts
- Popular FAQ
- Top Cases
- Department Knowledge
- Contribution Ranking

## 22. Gamification

Optional gamification:

- Top Contributor
- Expert Badge
- Knowledge Master
- Gold Expert
- Reward Point

## 23. AI Knowledge Curator

AI curator capabilities:

- Detect duplicate experience records.
- Suggest FAQ.
- Recommend related cases.
- Identify knowledge gaps.

## 24. Offboarding Integration

Offboarding inputs:

- Email
- Documents
- Audio
- Meeting

AI-generated outputs:

- Knowledge Package
- Customer Notes
- Case
- FAQ

## 25. Security

Security requirements:

- JWT
- RBAC
- Department Isolation
- Sensitive Knowledge Masking
- Encryption
- Audit Log

## 26. KPI

| KPI | Target |
|---|---:|
| Knowledge Retention | > 90% |
| FAQ Coverage | > 80% |
| Experience Search Accuracy | > 90% |
| User Satisfaction | > 4.5 / 5 |

## 27. Future Features

- Avatar Expert
- Voice QA
- Video QA
- Knowledge Graph
- Auto Interview
- AI Mentor

## 28. Final Goal

M03 should become the Enterprise Experience Brain.

It captures:

- Expert experience
- Customer experience
- Supplier experience
- Maintenance knowledge
- Audit experience
- Team memory

It supports:

- AI QA
- AI Agent
- Training
- Decision Support

The final goal is to preserve experience as reusable enterprise knowledge.
