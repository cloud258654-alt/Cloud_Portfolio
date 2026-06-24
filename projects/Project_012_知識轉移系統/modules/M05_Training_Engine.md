# M05_Training_Engine

AI Knowledge Transfer System

Module Specification

Module : M05

Module Name : Training Center

Engine : Training Engine

Version : v1.0.0

Owner : System Architect

Last Update : 2026-06-25

---

# 1. Purpose

Training Engine 負責：

將：

Document

Experience

SOP

FAQ

Case

Meeting

↓

AI分析

↓

產生：

Course

Lesson

Quiz

Flash Card

AI Mentor

Learning Path

Certification

---

# 2. Engine Overview

```text
Knowledge

↓

AI Analysis

↓

Course Generator

↓

Lesson Generator

↓

Quiz Generator

↓

Flash Card Generator

↓

Learning Path Generator

↓

AI Mentor

↓

Certification

↓

Dashboard
```

---

# 3. Input Sources

Support：

```text
documents

sop

faq

case_studies

experience

meeting

manual_input
```

---

# 4. Course Generator

Input：

```text
請購流程SOP
```

↓

AI

↓

Output：

```text
Course

採購流程基礎


Lesson1

請購概念


Lesson2

建立請購單


Lesson3

主管簽核


Lesson4

採購下單
```

---

# 5. Course Metadata

```text
course_id

title

description

department

difficulty

duration

version

status

tags
```

---

Difficulty

```text
beginner

intermediate

advanced
```

---

# 6. Lesson Generator

每個Lesson：

```text
title

objective

summary

content

example

mistakes

quiz

reference
```

---

Example

```text
Lesson

主管簽核


Objective

了解主管簽核流程


Content

主管確認：

預算

需求

供應商


Mistakes

預算填錯

供應商缺資料
```

---

# 7. Quiz Generator

Support：

---

Single Choice

---

Multiple Choice

---

True False

---

Fill Blank

---

Scenario

---

# 8. Quiz Example

```text
Question

請購第一步？


A

建立請購單


B

採購下單


C

驗收入庫


Answer

A
```

---

# 9. Quiz Metadata

```text
quiz_id

lesson_id

difficulty

question_type

answer

explanation

score
```

---

# 10. Flash Card Generator

Front

```text
請購第一步？
```

Back

```text
建立請購單
```

---

Support

```text
text

image

audio
```

---

# 11. Flash Card Example

```text
Front

主管簽核目的？


Back

確認：

需求

預算

供應商
```

---

# 12. AI Mentor Engine

User

```text
主管不在怎麼辦？
```

↓

AI

↓

Search：

SOP

FAQ

Case

Experience

↓

Answer

---

Citation：

```text
採購SOP

v2.0

Page 3
```

---

# 13. Mentor Modes

Support：

---

Grounded

只根據知識庫

---

Teaching

逐步教學

---

Example

舉例說明

---

Expert

專家模式

---

# 14. Learning Path Generator

依照：

---

Department

---

Position

---

Experience

---

Quiz Score

---

Certification

---

產生：

```text
Level1

請購流程


Level2

供應商管理


Level3

採購策略


Level4

風險管理
```

---

# 15. Adaptive Learning

Quiz 成績：

80↓

↓

推薦：

```text
重新學習

Flash Card

FAQ

AI Mentor
```

---

95↑

↓

進階課程

---

# 16. Certification Engine

完成：

```text
Course

+

Quiz

+

Pass Score
```

↓

Certificate

---

Certificate

```text
certificate_id

employee

course

score

issue_date

expire_date
```

---

# 17. Certificate Level

```text
Bronze

Silver

Gold

Master
```

---

# 18. Recommendation Engine

AI推薦：

---

Next Course

---

Related SOP

---

FAQ

---

Case

---

Mentor

---

# 19. Recommendation Example

使用者：

```text
採購助理
```

AI：

```text
推薦：

請購流程

供應商管理

採購風險

ERP操作
```

---

# 20. Learning Record

保存：

```text
employee_id

course_id

progress

quiz_score

certificate

last_login

study_time
```

---

# 21. Gamification

Knowledge Point

---

Experience Point

---

Level

---

Badges

```text
Beginner

Silver

Gold

Master
```

---

# 22. Leaderboard

Top Learner

---

Top Quiz

---

Top Study Time

---

Top Mentor User

---

Top Contributor

---

# 23. AI Mentor Memory

保存：

```text
conversation_id

question

answer

citation

feedback

timestamp
```

---

Memory Window

20 messages

---

# 24. Dashboard Metrics

```text
Total Courses

Completed Courses

Learning Hours

Quiz Accuracy

Certification Rate

AI Mentor Usage

Knowledge Coverage
```

---

# 25. Manager Dashboard

主管可查看：

```text
Department Progress

Training Completion

Top Learners

Weak Knowledge Area

Certification Rate

Pending Training
```

---

# 26. Course Version Control

```text
v1.0

v1.1

v1.2

v2.0
```

---

保存：

```text
author

change_note

created_at
```

---

Support：

Compare

Rollback

---

# 27. Background Jobs

```text
course_generate_job

lesson_generate_job

quiz_generate_job

flashcard_generate_job

learning_path_job

certificate_job

mentor_index_job

recommendation_job
```

---

# 28. Error Handling

```text
COURSE_GENERATE_FAILED

QUIZ_GENERATE_FAILED

FLASHCARD_FAILED

CERTIFICATE_FAILED

MENTOR_TIMEOUT

RECOMMENDATION_FAILED
```

---

# 29. Security

Support：

```text
JWT

RBAC

Department Isolation

Certificate Verification

Audit Log

Encryption
```

---

# 30. Audit Log

Track：

```text
start_learning

finish_course

quiz_submit

certificate_issue

mentor_chat

course_view

download_certificate
```

---

# 31. KPI

```text
Training Completion >90%

Quiz Accuracy >85%

Certification >80%

Mentor Satisfaction >4.5

Learning Time Reduce 50%
```

---

# 32. Future Features

```text
AI Tutor Avatar

Voice Learning

Video Course

Simulation Training

VR Training

Skill Graph

AI Coach

Learning Companion
```

---

# 33. Final Goal

M05 Training Engine

不是：

LMS

也不是：

線上課程平台

而是：

Enterprise AI Learning Engine

讓：

Knowledge

↓

SOP

↓

Course

↓

Mentor

↓

Certification

↓

Continuous Learning

↓

Human Growth

成為企業 AI 學習與人才培育的核心引擎。
