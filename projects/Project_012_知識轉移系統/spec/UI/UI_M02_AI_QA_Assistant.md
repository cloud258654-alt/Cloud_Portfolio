# UI_M02_AI_QA_Assistant

AI Knowledge Transfer System

UI Specification

Module : M02

Module Name : AI QA Assistant

Version : v1.0.0

Last Update : 2026-06-25

Design Style :

Japanese Minimal Enterprise AI

---

# 1. UI Philosophy

AI 不只是聊天工具。

而是：

Enterprise Copilot

幫助使用者：

* 搜尋知識
* 理解 SOP
* 解決問題
* 查詢經驗
* 執行 Agent

---

UI Keywords

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

---

# 2. Color System

Background

```text
#F8F8F6
```

Pure White

---

Card

```text
#FFFFFF
```

---

AI Accent

```text
#7AA6FF
```

Soft Blue

---

Success

```text
#6BCB77
```

---

Warning

```text
#FFD166
```

---

Danger

```text
#FF6B6B
```

---

Border

```text
#ECECEC
```

---

# 3. Layout

Desktop

```text
--------------------------------------------------------

Sidebar

History

Favorites

Recent

----------------

Main Chat

Question

Answer

Citation

----------------

Related Documents

--------------------------------------------------------
```

---

Width

Sidebar

280px

---

Main

Flexible

---

Right Panel

380px

---

# 4. Sidebar

Menu

---

New Chat

---

Recent Chat

---

Favorites

---

My Documents

---

My SOP

---

Knowledge Graph

(v2)

---

Voice Chat

(v2)

---

# 5. Main Chat Area

Structure

```text
--------------------------------

User Question

--------------------------------

AI Thinking

--------------------------------

Answer

--------------------------------

Citation

--------------------------------

Feedback

--------------------------------
```

---

# 6. Question Box

Large Input

---

Placeholder

```text
請輸入你的問題...

例如：

請購流程怎麼走？

ERP如何報工？

供應商如何新增？

設備異常怎麼處理？
```

---

Buttons

Send

---

Voice

---

Attach File

---

# 7. AI Thinking UI

AI回答前：

顯示：

```text
🤖 Searching Knowledge...

✓ Procurement SOP

✓ FAQ

✓ Experience

✓ Related Documents

Generating Answer...
```

---

Animation

Fade

Pulse

---

# 8. Answer Card

Card Style

Large Radius

Shadow

White Background

---

Example

```text
請購流程如下：

1.

建立請購單


2.

主管簽核


3.

採購下單


4.

驗收入庫
```

---

# 9. Confidence Score

Show

```text
Confidence

92%
```

---

Color

90+

Green

---

70~90

Yellow

---

Below 70

Red

---

# 10. Citation Card

每個回答必須有：

---

Document

```text
採購SOP
```

---

Version

```text
v2.0
```

---

Page

```text
3
```

---

Chunk

```text
chunk_003
```

---

Confidence

```text
0.92
```

---

Card Example

```text
Source

採購SOP

Version

v2.0

Page

3

Confidence

92%
```

---

# 11. Related Documents

右側：

顯示：

```text
採購SOP

ERP操作手冊

供應商管理

請購表單
```

---

Click

↓

Preview

---

# 12. Document Preview

Support

---

PDF Viewer

---

Word Viewer

---

Markdown Viewer

---

Image Viewer

---

Audio Player

---

Video Player

---

# 13. Chat History

保存：

---

Title

```text
請購流程
```

---

Last Message

---

Time

---

Favorite

⭐

---

Delete

🗑

---

# 14. Favorite QA

收藏：

```text
常見問題

ERP

請購

驗收

供應商

ISO
```

---

Quick Open

---

# 15. AI Modes

Dropdown

---

Grounded

只根據文件回答

---

Summary

摘要

---

Step By Step

逐步教學

---

Expert

專家模式

---

FAQ

快速回答

---

# 16. Feedback UI

Buttons

👍 Helpful

👎 Wrong

---

Text Area

```text
你覺得哪裡需要改善？
```

---

Submit

---

# 17. Empty State

```text
🤖

Welcome to AI Assistant

Ask anything about:

SOP

FAQ

Documents

Experience

Training

```

---

# 18. No Result

```text
No Knowledge Found

Try:

Another Keyword

Upload Document

Contact Manager
```

---

# 19. Loading State

AI Thinking

---

Searching...

---

Retrieving Documents...

---

Building Context...

---

Generating Answer...

---

# 20. Voice QA (Future)

Button

🎤

---

Workflow

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

---

# 21. Image QA (Future)

Upload

---

Question

```text
這個設備哪裡故障？
```

---

AI

Image Analysis

*

Knowledge Search

↓

Answer

---

# 22. Agent Mode (Future)

Tab

AI Agent

---

Example

```text
客戶急單

↓

Agent

查SOP

查庫存

查供應商

↓

處理建議
```

---

# 23. Mobile UI

Bottom Navigation

```text
Chat

History

Documents

Agent

Profile
```

---

Floating Button

```text
Ask AI
```

---

# 24. Animation

Answer

Fade In

---

Citation

Slide Up

---

Card Hover

Scale

1.02

---

Loading

Pulse

---

# 25. Accessibility

Dark Mode

---

Keyboard Shortcut

---

Screen Reader

---

Responsive

---

# 26. Dashboard Widgets

Questions Today

---

Avg Response Time

---

Top Questions

---

Citation Rate

---

Satisfaction

---

Knowledge Coverage

---

# 27. Future UI

Knowledge Graph

---

Multi Agent

---

Voice Assistant

---

Meeting Summary

---

AI Avatar

---

# 28. Design Keywords

Apple

Japanese SaaS

Minimal

Elegant

Enterprise

AI Copilot

White Space

Premium

Soft Shadow

Knowledge First

---

# 29. Final Goal

這個UI不是：

ChatGPT Clone

而是：

Enterprise AI Copilot

讓員工：

不需要找資料

不需要找SOP

不需要找老師傅

只需要：

Ask AI

↓

Get Trusted Answer

↓

Take Action

成為企業知識的第一入口。
