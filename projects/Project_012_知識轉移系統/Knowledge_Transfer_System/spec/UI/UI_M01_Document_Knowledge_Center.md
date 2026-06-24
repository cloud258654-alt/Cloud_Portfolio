# UI_M01_Document_Knowledge_Center

AI Knowledge Transfer System

UI Specification

Module: M01
Version: v1.0.0
Last Update: 2026-06-25

## 1. UI Design Philosophy

Theme:

```text
Japanese Minimal Enterprise AI
```

Keywords:

- Clean
- Minimal
- Elegant
- AI First
- Knowledge First
- Soft Shadow
- White Space
- Enterprise

## 2. Color Palette

| Token | Color | Purpose |
|---|---|---|
| Primary | #F8F8F6 | App background |
| Surface | #FFFFFF | Main surfaces |
| Secondary | #EFECE7 | Light neutral background |
| AI Accent | #7AA6FF | AI-related actions and highlights |
| Success | #6BCB77 | Success state |
| Warning | #FFD166 | Warning state |
| Danger | #FF6B6B | Danger state |
| Border | #EAEAEA | Borders and dividers |

## 3. Typography

| Style | Size | Weight | Usage |
|---|---:|---|---|
| Title | 32px | Bold | Page title |
| Section | 24px | Semi Bold | Section heading |
| Body | 16px | Regular | Main content |
| Caption | 14px | Regular | Secondary text |

## 4. Layout

```text
App Shell
├── Sidebar
│   ├── Dashboard
│   ├── Documents
│   ├── AI Search
│   ├── SOP
│   ├── Training
│   ├── Agent
│   ├── Analytics
│   ├── Admin
│   └── User Profile
└── Main Content
```

Layout rules:

- Sidebar width: 280px on desktop.
- Main content: fluid layout.
- Max content width: 1600px.
- Tablet and mobile should collapse the sidebar into navigation optimized for smaller screens.

## 5. Dashboard Page

Route:

```text
/dashboard
```

Top cards:

```text
Total Documents: 12,450
AI Questions: 28,912
Knowledge Coverage: 92%
Pending Review: 15
```

Sections:

- Knowledge Trend: line chart.
- Department Distribution: pie chart.
- Popular Documents: top 10.
- Recent Uploads: latest 20.

## 6. Document List Page

Route:

```text
/documents
```

Search:

```text
Search documents...
```

Filters:

- Department
- Type
- Tags
- Version
- Status

Document table columns:

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

Actions:

- Preview
- Download
- History
- Edit
- Delete

## 7. Upload Document Page

Route:

```text
/documents/upload
```

Upload area:

```text
Drop files here
or
Click to upload
```

Supported upload types:

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

Metadata fields:

- Title
- Description
- Department
- Tags
- Permission

Buttons:

- Save Draft
- Upload
- Cancel

## 8. Document Detail Page

Route:

```text
/documents/{id}
```

Header fields:

```text
Document Name
Version
Department
Author
Permission
Created At
Updated At
```

AI Summary card:

```text
AI Summary

This SOP describes:
1. Required preparation.
2. Review workflow.
3. Approval rules.
4. Related forms.
```

Tags example:

```text
#Procurement
#SOP
#Inventory
```

Preview panel should support:

- PDF Viewer
- Word Viewer
- Markdown Viewer
- Image Viewer

## 9. Document Version Page

Route:

```text
/documents/{id}/versions
```

Timeline example:

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

Actions:

- Compare Version
- Restore

## 10. AI Search Page

Route:

```text
/ai-search
```

Search box example:

```text
How do I submit a purchase request?
```

AI answer card example:

```text
Step 1
Open the purchase request form.

Step 2
Submit it to the department manager.

Step 3
Wait for approval and record the result.
```

Citation example:

```text
Source: Purchase SOP
Page: 3
Confidence: 92%
```

Related documents example:

```text
Purchase SOP
Approval Policy
ERP Upload Guide
```

## 11. Document Preview

Preview should support:

- PDF Viewer
- Word Viewer
- Excel Preview
- Markdown Viewer
- Image Viewer
- Audio Player
- Video Player

## 12. Permission Setting

Permission values:

```text
Public
Department
Private
Confidential
Admin Only
```

Permission UI:

- Dropdown.
- Current permission indicator.
- Optional warning for confidential or admin-only documents.

## 13. Mobile Responsive

Supported breakpoints:

- Desktop
- Tablet
- Mobile

Responsive behavior:

- Desktop uses sidebar navigation.
- Tablet may use collapsed sidebar.
- Mobile uses bottom navigation or compact menu.

## 14. Component Library

Buttons:

- Primary: AI Blue.
- Secondary: White.
- Danger: Red.

Cards:

- Soft shadow.
- Stable spacing.
- Clear heading and content hierarchy.

Suggested shadow:

```text
0 8px 32px rgba(0, 0, 0, 0.05)
```

## 15. Animation

Recommended motion:

- Page transition: 0.3 seconds.
- Card hover: subtle scale or shadow change.
- AI summary: fade in.
- Upload: progress animation.

## 16. Empty State

No document:

```text
No Document Found
Upload your first document
```

No search result:

```text
No Relevant Knowledge Found
Try another keyword
```

## 17. Loading State

Loading states:

- Skeleton UI.
- Upload Progress.
- OCR Progress.
- Embedding Progress.

## 18. Dashboard Widgets

Widgets:

- Total Documents
- Total Departments
- Knowledge Coverage
- AI Search Count
- Top Questions
- Pending Review
- Recent Activities

## 19. Future UI

Future UI areas:

- Knowledge Graph
- AI Agent Workspace
- Multi Agent Collaboration
- Voice Chat
- Meeting Summary

## 20. Design Keywords

- Apple
- Japanese SaaS
- Minimal
- Elegant
- Enterprise
- AI First
- Knowledge First
- White Space
- Soft Shadow
- Premium
