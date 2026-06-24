# PRD_M05_Training_Center

AI Knowledge Transfer System

Product Requirement Document

Module: M05
Module Name: Training Center
Version: v1.0.0
Owner: Product Manager
Last Update: 2026-06-25

## 1. Vision

M05 AI Training Center turns enterprise documents, experience, and SOPs into structured learning content.

Inputs:

- Document
- Experience
- SOP

AI-generated outputs:

- Course
- Quiz
- Flash Card
- AI Mentor
- Learning Path
- Certification

The goal is to reduce onboarding time, standardize internal training, and help knowledge become learnable.

## 2. Business Problems

The module addresses:

- New employee onboarding takes 3 to 6 months.
- Expert training time is limited.
- SOPs are difficult for new employees to learn.
- Training content is scattered and inconsistent.
- Employee turnover causes training knowledge loss.

## 3. Objectives

- Generate training courses with AI.
- Generate quizzes with AI.
- Build learning paths.
- Provide AI Mentor support for learning questions.
- Track enterprise learning progress.

## 4. Data Sources

- M01 Document Center
- M03 Experience Transfer
- M04 SOP Generator
- FAQ
- Case Study
- Meeting Summary

## 5. Training Workflow

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

## 6. User Stories

### Story 1: New Employee Learns Required Knowledge

As a new employee, I want to follow a learning path and complete quizzes so I can become productive faster.

### Story 2: Manager Tracks Team Progress

As a manager, I want to see training progress so I can identify weak knowledge areas.

### Story 3: Learner Uses AI Mentor

As a learner, I want to ask AI Mentor questions so I can understand course content and SOPs.

## 7. Functional Requirements

- FR001 Generate Course
- FR002 Generate Quiz
- FR003 Generate Flash Card
- FR004 Learning Path
- FR005 Certification
- FR006 AI Mentor

## 8. Course Structure

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

Example:

```text
Course: Purchase Process

Lesson 1: Purchase process overview
Lesson 2: Prepare purchase request
Lesson 3: Manager approval
Lesson 4: Submit to procurement
```

## 9. Course Metadata

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

Difficulty:

```text
Beginner
Intermediate
Advanced
```

## 10. AI Course Generator

Input:

```text
SOP
FAQ
Experience
Case
```

Output:

```text
Course
Lesson
Summary
Quiz
Flash Card
```

## 11. Lesson Structure

Each lesson should include:

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

## 12. Quiz Generator

Supported quiz types:

- Single Choice
- Multiple Choice
- True / False
- Fill Blank
- Scenario Question

## 13. Quiz Example

```text
Question: What is the first step in the purchase process?

A: Prepare purchase request
B: Manager approval
C: Submit to procurement

Answer: A
```

## 14. Flash Card

Front:

```text
What is the first step in the purchase process?
```

Back:

```text
Prepare the purchase request.
```

Supported media:

```text
Text
Image
Audio
```

## 15. AI Mentor

Example:

```text
User: What should I do if manager approval is rejected?
↓
AI references:
SOP
FAQ
Case
Experience
↓
Answer
```

Supported interaction:

```text
Text
Voice
Image
```

## 16. Learning Path

Example role:

```text
Procurement Specialist
```

Learning path:

```text
Level 1: Purchase process
Level 2: Supplier management
Level 3: Procurement risk
Level 4: Contract management
```

## 17. Training Status

Supported statuses:

```text
not_started
learning
completed
certified
```

## 18. Certification

Flow:

```text
Quiz Pass
↓
Certificate
```

Certificate fields:

```text
Certificate ID
Employee
Course
Score
Issue Date
Expire Date
```

## 19. Gamification

- Knowledge Point
- Experience Point
- Level
- Badges

Badges:

```text
Beginner
Silver
Gold
Master
```

## 20. Leaderboard

Leaderboard types:

- Top Learner
- Top Quiz Score
- Top Knowledge Contributor
- Top Mentor User

## 21. AI Recommendation

Recommendation inputs:

- Department
- Position
- Past Courses
- Quiz Result
- Experience

Recommended items:

```text
Next Course
Related SOP
FAQ
Case
Mentor
```

## 22. Dashboard

Cards:

```text
Total Courses
Completed Courses
Training Hours
Quiz Accuracy
Certification Count
AI Mentor Usage
Learning Progress
```

## 23. Manager Dashboard

Manager view:

```text
Department Progress
Pending Training
Certification Rate
Weak Knowledge Areas
Top Learners
Top Mistakes
```

## 24. KPI

| KPI | Target |
|---|---:|
| Training Completion | > 90% |
| Quiz Accuracy | > 85% |
| Certification Rate | > 80% |
| AI Mentor Satisfaction | > 4.5 / 5 |
| Average Learning Time | Reduce 50% |

## 25. Integration

- M01 Documents
- M02 AI QA
- M03 Experience
- M04 SOP
- M06 AI Agent

## 26. Future Features

- Video Course
- Voice Training
- AI Tutor Avatar
- Simulation Training
- VR Training
- Skill Map
- AI Coach

## 27. Design Principles

- AI First
- Micro Learning
- Learn By Doing
- Gamification
- Personalized Learning
- Citation Required

## 28. Final Goal

M05 should become an Enterprise AI Learning Platform.

It should support:

- AI Course
- AI Quiz
- AI Mentor
- Learning Path
- Certification
- Gamification
- Knowledge Recommendation

The final goal is to help the enterprise become a learning organization where knowledge can be learned, verified, retained, and reused.
