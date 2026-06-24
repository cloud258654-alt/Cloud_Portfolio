# UI_M03_Experience_Transfer

AI Knowledge Transfer System

UI Specification

Module: M03
Module Name: Experience Transfer
Version: v1.0.0
Last Update: 2026-06-25
Design Style: Japanese Minimal Enterprise AI

## 1. Design Philosophy

Experience is knowledge. Knowledge is an asset.

The UI should help users turn expert experience, operational stories, and meeting knowledge into reusable enterprise knowledge.

Keywords:

```text
Minimal
Elegant
Storytelling
Human Centered
Knowledge First
Premium
AI Assistant
Large White Space
```

## 2. Color Palette

| Token | Color | Purpose |
|---|---|---|
| Background | #F8F8F6 | App background |
| Card | #FFFFFF | Content surfaces |
| Experience Accent | #89A7FF | Experience module highlight |
| Knowledge | #6BCB77 | Knowledge-ready state |
| Case Study | #FFD166 | Case study highlight |
| Danger | #FF6B6B | Error or destructive action |
| Border | #ECECEC | Dividers and borders |

## 3. Main Layout

Desktop layout:

```text
Sidebar
├── Experience
├── FAQ
├── Case
├── Meeting
├── Experts
└── Knowledge Graph

Main Content

Right Panel
├── AI Summary
└── Related Experience
```

Layout width:

- Sidebar: 280px.
- Main: fluid.
- Right Panel: 380px.

## 4. Dashboard

Cards:

```text
Experience Records: 12,580
Experts: 138
Case Studies: 3,240
FAQ: 18,450
Knowledge Coverage: 92%
```

## 5. Experience Upload

Route:

```text
/experience/upload
```

Upload area:

```text
Drag files here
Audio
Video
Text
Meeting
Email
```

Supported file types:

```text
mp3
wav
m4a
mp4
docx
txt
md
eml
```

Metadata:

- Title
- Department
- Category
- Tags
- Expert
- Permission

Buttons:

- Save Draft
- Upload
- Cancel

## 6. Recording Mode

Workflow:

```text
Start Recording
↓
Speech to Text
↓
AI Summary
↓
FAQ
↓
Knowledge
```

Live transcript example:

```text
The machine failure usually starts with abnormal sensor readings...
First check the calibration record...
Then confirm whether the sensor was replaced recently...
```

## 7. Experience Detail

Route:

```text
/experience/{id}
```

Header:

```text
Title
Expert
Department
Category
Date
Tags
```

AI summary card:

```text
AI Summary

Main issue:
Sensor troubleshooting.

Recommended actions:
1. Check calibration status.
2. Review error logs.
3. Replace sensor if required.
```

## 8. FAQ Card

```text
Q: What should be checked first when sensor values are abnormal?
A: Check calibration status, maintenance history, and recent replacement records.
```

Buttons:

- Copy
- Share
- Favorite

## 9. Case Study Card

```text
Case: Supplier delay issue
Cause: Approval confirmation was missing.
Solution: Add approval status check before supplier scheduling.
Lesson: Make approval status visible before external coordination.
```

Buttons:

- View Detail
- Export PDF

## 10. Related Experience

Example:

```text
Sensor troubleshooting record
Equipment maintenance FAQ
Customer complaint case
Supplier coordination experience
```

Interaction:

- Click to preview.

## 11. Expert Profile

Card:

```text
Photo
Senior Engineer
Experience: 18 Years
Department: Engineering
Knowledge: 356
Cases: 89
FAQ: 120
```

Badges:

- Gold Expert
- Knowledge Master

## 12. Meeting Summary

Input:

```text
Meeting Recording
```

AI output:

```text
Summary
Action Items
FAQ
Knowledge
```

Display:

- Meeting Summary
- Action Items
- FAQ
- Related Cases

## 13. Timeline

Experience timeline:

```text
2024
Equipment case

2025
Supplier issue

2026
Customer experience
```

Interaction:

- Click to expand.

## 14. Search

Search placeholder examples:

```text
Search experience...
equipment issue
supplier complaint
customer case
ISO audit
```

Filters:

- Department
- Category
- Expert
- Tags
- Date

## 15. AI Mentor

Special card:

```text
Ask Expert

Question:
What should I check first for this equipment issue?

AI Mentor references:
Senior Engineer
Maintenance cases
FAQ
SOP
Related issues
```

## 16. Knowledge Graph

Future graph view:

```text
Equipment
↓
Sensor
↓
Issue
↓
Case
↓
FAQ
↓
SOP
```

## 17. Contribution Ranking

Top contributors:

```text
1. Senior Engineer - 356
2. Procurement Manager - 280
3. QA Lead - 199
```

Badges:

- Gold
- Silver
- Bronze

## 18. Feedback

Buttons:

- Helpful
- Wrong

Comment placeholder:

```text
Tell us what should be improved.
```

## 19. Empty State

```text
Share Your Experience

Every Experience
Can Become
Enterprise Knowledge
```

## 20. Loading State

- Uploading...
- Transcribing...
- Generating FAQ...
- Generating Summary...
- Publishing...

## 21. Mobile UI

Bottom navigation:

```text
Experience
FAQ
Case
Expert
Profile
```

Floating button:

```text
Record Experience
```

## 22. Gamification

- Knowledge Points
- Expert Level
- Gold Expert
- Knowledge Master
- Top Contributor

## 23. Future Features

- AI Avatar Expert
- Voice QA
- Video QA
- Knowledge Graph
- Auto Interview
- AI Mentor

## 24. Accessibility

- Dark Mode
- Keyboard Shortcut
- Responsive
- Screen Reader

## 25. Design Keywords

- Apple
- Japanese SaaS
- Elegant
- Knowledge First
- Human Centered
- Minimal
- Soft Shadow
- Premium
- AI Mentor

## 26. Final Goal

The final UI goal is to become an Enterprise Experience Hub.

It should transform:

```text
Experience
↓
AI Summary
↓
FAQ
↓
Case
↓
Mentor
↓
Knowledge Graph
```

The interface should make tacit knowledge visible, searchable, and reusable.
