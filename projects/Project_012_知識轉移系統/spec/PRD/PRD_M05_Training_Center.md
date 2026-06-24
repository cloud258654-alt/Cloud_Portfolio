# PRD_M05_Training_Center

AI Knowledge Transfer System

Product Requirement Document

Module : M05

Module Name : Training Center

Version : v1.0.0

Owner : Product Manager

Last Update : 2026-06-25

---

# 1. Vision

建立企業 AI Training Center。

讓：

Document

*

Experience

*

SOP

↓

AI

↓

Course

↓

Quiz

↓

Flash Card

↓

AI Mentor

↓

Learning Path

↓

Certification

---

目的：

降低教育成本

縮短新人訓練時間

標準化企業知識

建立持續學習文化。

---

# 2. Business Problems

企業目前：

---

新人需要 3~6 個月上手

---

老師傅沒時間教

---

SOP 太長看不懂

---

教育訓練品質不一致

---

離職造成知識斷層

---

# 3. Objectives

Objective 1

AI 自動產生課程

---

Objective 2

AI 自動出題

---

Objective 3

建立 Learning Path

---

Objective 4

AI Mentor 即時教學

---

Objective 5

建立企業證照制度

---

# 4. Data Sources

M01

Document Center

---

M03

Experience Transfer

---

M04

SOP Generator

---

FAQ

---

Case Study

---

Meeting Summary

---

# 5. Training Workflow

```text
Document

+

Experience

+

SOP

↓

AI Analysis

↓

Course Generation

↓

Quiz Generation

↓

Flash Card

↓

Learning Path

↓

AI Mentor

↓

Certification

↓

Dashboard
```

---

# 6. User Stories

Story 1

新人

↓

觀看課程

↓

完成測驗

↓

取得證照

---

Story 2

主管

↓

查看學習進度

---

Story 3

AI Mentor

↓

回答問題

↓

推薦課程

---

# 7. Functional Requirements

FR001

Generate Course

---

FR002

Generate Quiz

---

FR003

Generate Flash Card

---

FR004

Learning Path

---

FR005

Certification

---

FR006

AI Mentor

---

# 8. Course Structure

每堂課：

```text
Course

↓

Lesson

↓

Section

↓

Quiz

↓

Summary
```

---

Example

```text
Course

採購流程


Lesson 1

請購概念


Lesson 2

建立請購單


Lesson 3

主管簽核


Lesson 4

採購下單
```

---

# 9. Course Metadata

```text
course_id

title

department

difficulty

duration

author

tags

status

version
```

---

Difficulty

```text
Beginner

Intermediate

Advanced
```

---

# 10. AI Course Generator

輸入：

```text
SOP

FAQ

Experience

Case
```

↓

AI

↓

輸出：

```text
Course

Lesson

Summary

Quiz

Flash Card
```

---

# 11. Lesson Structure

每個 Lesson：

```text
Title

Learning Objective

Summary

Content

Example

Common Mistakes

Quiz

Reference
```

---

# 12. Quiz Generator

Support：

---

Single Choice

---

Multiple Choice

---

True / False

---

Fill Blank

---

Scenario Question

---

# 13. Quiz Example

```text
Question

請購第一步？

A

建立請購單

B

主管簽核

C

採購下單

Answer

A
```

---

# 14. Flash Card

Front

```text
請購第一步？
```

Back

```text
建立請購單
```

---

Support：

```text
Text

Image

Audio
```

---

# 15. AI Mentor

User

```text
主管不在怎麼辦？
```

↓

AI

↓

引用：

SOP

FAQ

Case

Experience

↓

Answer

---

Support：

```text
Text

Voice

Image
```

---

# 16. Learning Path

Example

Role：

採購助理

↓

Learning Path

```text
Level1

請購流程


Level2

供應商管理


Level3

採購談判


Level4

風險管理
```

---

# 17. Training Status

Track：

```text
not_started

learning

completed

certified
```

---

# 18. Certification

Quiz Pass

↓

Certificate

---

Certificate：

```text
Certificate ID

Employee

Course

Score

Issue Date

Expire Date
```

---

# 19. Gamification

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

# 20. Leaderboard

Top Learner

---

Top Quiz Score

---

Top Knowledge Contributor

---

Top Mentor User

---

# 21. AI Recommendation

根據：

---

Department

---

Position

---

Past Courses

---

Quiz Result

---

Experience

---

推薦：

```text
Next Course

Related SOP

FAQ

Case

Mentor
```

---

# 22. Dashboard

Cards：

```text
Total Courses

Completed Courses

Training Hours

Quiz Accuracy

Certification Count

AI Mentor Usage

Learning Progress
```

---

# 23. Manager Dashboard

主管可看：

```text
Department Progress

Pending Training

Certification Rate

Weak Knowledge Areas

Top Learners

Top Mistakes
```

---

# 24. KPI

Training Completion

> 90%

---

Quiz Accuracy

> 85%

---

Certification Rate

> 80%

---

AI Mentor Satisfaction

> 4.5

---

Average Learning Time

Reduce 50%

---

# 25. Integration

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

M06

AI Agent

---

# 26. Future Features

Video Course

---

Voice Training

---

AI Tutor Avatar

---

Simulation Training

---

VR Training

---

Skill Map

---

AI Coach

---

# 27. Design Principles

AI First

---

Micro Learning

---

Learn By Doing

---

Gamification

---

Personalized Learning

---

Citation Required

---

# 28. Final Goal

M05 不只是：

LMS

也不是：

線上課程平台

而是：

Enterprise AI Learning Platform

具備：

AI Course

AI Quiz

AI Mentor

Learning Path

Certification

Gamification

Knowledge Recommendation

讓企業：

知識保存

↓

知識標準化

↓

知識傳承

↓

持續成長

成為真正的 Learning Organization。
