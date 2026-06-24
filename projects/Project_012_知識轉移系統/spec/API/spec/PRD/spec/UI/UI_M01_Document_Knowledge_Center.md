# UI_M01_Document_Knowledge_Center

AI Knowledge Transfer System

UI Specification

Module : M01

Version : v1.0.0

Last Update : 2026-06-25

---

# 1. UI Design Philosophy

Theme:

Japanese Minimal Enterprise AI

---

Keywords:

Clean

Minimal

Elegant

AI First

Knowledge First

Soft Shadow

Large Radius

White Space

---

Color Palette

Primary

#F8F8F6

Pure White

---

Secondary

#EFECE7

Light Wood

---

AI Accent

#7AA6FF

Soft Blue

---

Success

#6BCB77

---

Warning

#FFD166

---

Danger

#FF6B6B

---

Border

#EAEAEA

---

# 2. Typography

Title

32px

Bold

---

Section

24px

Semi Bold

---

Body

16px

Regular

---

Caption

14px

Gray

---

# 3. Layout

```text
------------------------------------------------

Sidebar

--------------------------------

Dashboard

Documents

AI Search

SOP

Training

Agent

Analytics

Admin

--------------------------------

User Profile

------------------------------------------------

Main Content

------------------------------------------------
```

Sidebar Width

280 px

---

Content

Fluid Layout

Max Width

1600 px

---

# 4. Dashboard Page

File:

```text
/dashboard
```

---

Top Cards

```text
--------------------------------

Total Documents

12,450


AI Questions

28,912


Knowledge Coverage

92%


Pending Review

15

--------------------------------
```

---

Knowledge Trend

Line Chart

---

Department Distribution

Pie Chart

---

Popular Documents

Top 10

---

Recent Uploads

Latest 20

---

# 5. Document List Page

File:

```text
/documents
```

---

Search Bar

```text
[ Search documents.... ]

```

---

Filter

Department

Type

Tags

Version

Status

---

Document Table

```text
Title

Department

Version

Author

Updated

Status

Permission

Actions
```

---

Actions

Preview

Download

History

Edit

Delete

---

# 6. Upload Document Page

File

```text
/documents/upload
```

---

Drag & Drop

```text
+ Drop files here

or

Click to Upload
```

---

Supported

```text
PDF

Word

Excel

PPT

Image

Audio

Video

Markdown
```

---

Metadata

Title

Description

Department

Tags

Permission

---

Buttons

Save Draft

Upload

Cancel

---

# 7. Document Detail Page

File

```text
/documents/{id}
```

---

Header

```text
Document Name

Version

Department

Author

Permission

Created At

Updated At
```

---

AI Summary Card

```text
✨ AI Summary

This SOP describes:

1.

2.

3.

4.
```

---

Tags

```text
#Procurement

#SOP

#Inventory
```

---

Preview Panel

PDF Viewer

Word Viewer

Markdown Viewer

Image Viewer

---

# 8. Document Version Page

```text
/documents/{id}/versions
```

---

Timeline

```text
v2.0

2026/06/25

PM


v1.2

2026/05/10


v1.1

2026/04/20


v1.0

2026/04/01
```

---

Compare Button

Compare Version

---

Restore Button

Restore

---

# 9. AI Search Page

File

```text
/ai-search
```

---

Search Box

```text
請購流程怎麼走？
```

---

AI Answer Card

```text
Step 1

建立請購單


Step 2

主管簽核


Step 3

採購下單
```

---

Citation

```text
Source

採購SOP

Page 3

Confidence

92%
```

---

Related Documents

```text
採購SOP

供應商管理

ERP教學
```

---

# 10. Document Preview

Support

---

PDF Viewer

---

Word Viewer

---

Excel Preview

---

Markdown Viewer

---

Image Viewer

---

Audio Player

---

Video Player

---

# 11. Permission Setting

```text
Public

Department

Private

Confidential

Admin Only
```

---

Permission UI

Dropdown

---

# 12. Mobile Responsive

Support

Tablet

Mobile

Desktop

---

Sidebar

↓

Bottom Navigation

---

# 13. Component Library

Buttons

---

Primary

AI Blue

---

Secondary

White

---

Danger

Red

---

Cards

---

Shadow

0 8 32 rgba(0,0,0,0.05)

---

Radius

24px

---

# 14. Animation

Page Transition

0.3 sec

---

Card Hover

Scale 1.02

---

AI Summary

Fade In

---

Upload

Progress Animation

---

# 15. Empty State

No Document

```text
📂

No Document Found

Upload your first document
```

---

No Search Result

```text
🤖

No Relevant Knowledge Found

Try another keyword
```

---

# 16. Loading State

Skeleton UI

---

Upload Progress

---

OCR Progress

---

Embedding Progress

---

# 17. Dashboard Widgets

Total Documents

---

Total Departments

---

Knowledge Coverage

---

AI Search Count

---

Top Questions

---

Pending Review

---

Recent Activities

---

# 18. Future UI

Knowledge Graph

---

AI Agent Workspace

---

Multi Agent Collaboration

---

Voice Chat

---

Meeting Summary

---

# 19. Design Keywords

Apple

Japanese SaaS

Minimal

Elegant

Enterprise

AI First

Knowledge First

White Space

Soft Shadow

Premium
