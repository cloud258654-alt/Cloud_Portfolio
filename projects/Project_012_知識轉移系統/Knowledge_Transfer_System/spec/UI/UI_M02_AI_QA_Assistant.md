# UI_M02_AI_QA_Assistant

AI Knowledge Transfer System

UI Specification

Module: M02
Module Name: AI QA Assistant
Version: v1.0.0
Last Update: 2026-06-25
Design Style: Japanese Minimal Enterprise AI

## 1. UI Philosophy

The AI QA Assistant should feel like an Enterprise Copilot, not a generic chatbot.

It should help users:

- Search enterprise knowledge.
- Understand SOPs.
- Resolve repeated questions.
- Learn from experience records.
- Trigger future Agent workflows.

UI keywords:

```text
Apple Style
Japanese SaaS
Minimal
Elegant
AI First
Large White Space
Premium
Knowledge First
```

## 2. Color System

| Token | Color | Purpose |
|---|---|---|
| Background | #F8F8F6 | App background |
| Card | #FFFFFF | Main surfaces |
| AI Accent | #7AA6FF | AI actions and highlights |
| Success | #6BCB77 | High confidence and success |
| Warning | #FFD166 | Medium confidence and warnings |
| Danger | #FF6B6B | Low confidence and errors |
| Border | #ECECEC | Dividers and borders |

## 3. Layout

Desktop:

```text
Sidebar
├── History
├── Favorites
└── Recent

Main Chat
├── Question
├── Answer
└── Citation

Related Documents
```

Layout width:

- Sidebar: 280px.
- Main: flexible.
- Right Panel: 380px.

## 4. Sidebar

Menu items:

- New Chat
- Recent Chat
- Favorites
- My Documents
- My SOP
- Knowledge Graph (v2)
- Voice Chat (v2)

## 5. Main Chat Area

Structure:

```text
User Question
↓
AI Thinking
↓
Answer
↓
Citation
↓
Feedback
```

## 6. Question Box

Input style:

- Large input.
- Clear placeholder.
- Support multiline questions.

Placeholder examples:

```text
Ask anything about enterprise knowledge...

Examples:
How do I submit a purchase request?
How do I upload ERP data?
Which SOP explains inventory approval?
What should I prepare before handover?
```

Buttons:

- Send
- Voice
- Attach File

## 7. AI Thinking UI

Example:

```text
Searching Knowledge...
Procurement SOP
FAQ
Experience
Related Documents
Generating Answer...
```

Animation:

- Fade
- Pulse

## 8. Answer Card

Card style:

- Large radius.
- Soft shadow.
- White background.
- Clear source and confidence area.

Example:

```text
To submit a purchase request:

1. Open the purchase request form.
2. Submit it to your department manager.
3. Wait for approval.
4. Attach required supporting documents.
```

## 9. Confidence Score

Display:

```text
Confidence: 92%
```

Color rules:

- 90+ green.
- 70-90 yellow.
- Below 70 red.

## 10. Citation Card

Citation card should show:

```text
Document
Version
Page
Chunk
Confidence
```

Example:

```text
Source: Purchase SOP
Version: v2.0
Page: 3
Confidence: 92%
```

## 11. Related Documents

Related documents example:

```text
Purchase SOP
ERP Upload Guide
Approval Policy
Purchase Form
```

Interaction:

- Click to preview.

## 12. Document Preview

Preview support:

- PDF Viewer
- Word Viewer
- Markdown Viewer
- Image Viewer
- Audio Player
- Video Player

## 13. Chat History

History fields:

- Title
- Last Message
- Time
- Favorite
- Delete

Example title:

```text
Purchase request process
```

## 14. Favorite QA

Favorite categories:

```text
Common Questions
ERP
Purchase
Approval
Inventory
ISO
```

Interaction:

- Quick open.

## 15. AI Modes

Mode dropdown:

- Grounded
- Summary
- Step By Step
- Expert
- FAQ

## 16. Feedback UI

Buttons:

- Helpful
- Wrong

Text area placeholder:

```text
Tell us what should be improved.
```

Action:

- Submit

## 17. Empty State

```text
Welcome to AI Assistant

Ask anything about:
SOP
FAQ
Documents
Experience
Training
```

## 18. No Result

```text
No Knowledge Found

Try:
Another Keyword
Upload Document
Contact Manager
```

## 19. Loading State

Loading steps:

- AI Thinking
- Searching...
- Retrieving Documents...
- Building Context...
- Generating Answer...

## 20. Voice QA (Future)

Workflow:

```text
Voice
↓
Whisper
↓
Text
↓
AI QA
↓
Voice Response
```

## 21. Image QA (Future)

Image QA flow:

```text
Upload Image
↓
Ask Question
↓
Image Analysis
+
Knowledge Search
↓
Answer
```

## 22. Agent Mode (Future)

Tab:

```text
AI Agent
```

Example:

```text
User asks for process help.
↓
Agent finds SOP.
↓
Agent checks related knowledge.
↓
Agent suggests next action.
↓
Agent produces a task summary.
```

## 23. Mobile UI

Bottom navigation:

```text
Chat
History
Documents
Agent
Profile
```

Floating button:

```text
Ask AI
```

## 24. Animation

Recommended motion:

- Answer: fade in.
- Citation: slide up.
- Card hover: subtle scale, 1.02 maximum.
- Loading: pulse.

## 25. Accessibility

Support:

- Dark Mode
- Keyboard Shortcut
- Screen Reader
- Responsive Layout

## 26. Dashboard Widgets

Widgets:

- Questions Today
- Avg Response Time
- Top Questions
- Citation Rate
- Satisfaction
- Knowledge Coverage

## 27. Future UI

- Knowledge Graph
- Multi Agent
- Voice Assistant
- Meeting Summary
- AI Avatar

## 28. Design Keywords

- Apple
- Japanese SaaS
- Minimal
- Elegant
- Enterprise
- AI Copilot
- White Space
- Premium
- Soft Shadow
- Knowledge First

## 29. Final Goal

The final UI goal is not a ChatGPT clone. It should be an Enterprise AI Copilot.

Flow:

```text
Ask AI
↓
Get Trusted Answer
↓
Take Action
```

The assistant should help users find knowledge, understand SOPs, reuse experience, and act with confidence.
