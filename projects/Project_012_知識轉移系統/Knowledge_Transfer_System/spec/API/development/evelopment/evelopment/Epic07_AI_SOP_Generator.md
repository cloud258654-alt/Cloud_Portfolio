# Sprint 07: Epic07 SOP Generator

AI Knowledge Transfer System

Delivery Model: Epic -> Story -> Task

Epic: Epic07_SOP_Generator

Last Update: 2026-06-25

---

## 1. Delivery Rule

Starting from Sprint 07, development uses:

```text
Epic -> Story -> Task
```

Each Story must complete:

```text
Phase A: Implementation
Phase B: Unit Test
Phase C: Documentation
Phase D: Demo & Seed Data
```

---

## 2. Sprint 07 Structure

```text
Sprint 07
|
+-- Epic07_SOP_Generator
    |
    +-- Story0701 Database Foundation
    |
    +-- Story0702 Backend CRUD API
    |
    +-- Story0703 AI SOP Generator
    |
    +-- Story0704 Mermaid Generator
    |
    +-- Story0705 Review Workflow
    |
    +-- Story0706 Frontend
    |
    +-- Story0707 Export Engine
    |
    +-- Story0708 Integration Testing
    |
    +-- Story0709 Documentation
```

---

## 3. Story Breakdown

### Story0701 Database Foundation

Goal:

```text
Create SOP database foundation for SOP records, versions, steps, reviews, and attachments.
```

Tasks:

```text
Task0701A Design SOP tables
Task0701B Create Alembic migration
Task0701C Update schema_v1.sql
Task0701D Add demo SOP seed data
Task0701E Document database changes
```

Acceptance:

```text
knowledge.sops exists
knowledge.sop_versions exists
knowledge.sop_steps exists
knowledge.sop_reviews exists
knowledge.sop_attachments exists
Demo SOP seed data exists
Database documentation is updated
```

### Story0702 Backend CRUD API

Goal:

```text
Provide core SOP API endpoints for create, read, update, list, review, publish, and export.
```

Tasks:

```text
Task0702A Create SOP schemas
Task0702B Create SOP models/repository
Task0702C Create SOP service
Task0702D Create SOP API routes
Task0702E Document API changes
```

Acceptance:

```text
POST /api/v1/sop/generate works
GET /api/v1/sop works
GET /api/v1/sop/{id} works
PUT /api/v1/sop/{id} works
POST /api/v1/sop/{id}/review works
POST /api/v1/sop/{id}/publish works
GET /api/v1/sop/{id}/export works
API documentation is updated
```

### Story0703 AI SOP Generator

Goal:

```text
Generate SOP drafts from documents, experience records, transcripts, meeting content, and AI QA history.
```

Tasks:

```text
Task0703A Implement generator.py
Task0703B Implement step_detector.py
Task0703C Implement source context builder
Task0703D Generate checklist, warnings, FAQ, and risks
Task0703E Add generator demo data
```

Acceptance:

```text
SOP draft can be generated
Goal, prerequisite, input, output, role, step, decision, warning, and checklist can be extracted
Generated SOP includes source metadata
Demo generation is available
```

### Story0704 Mermaid Generator

Goal:

```text
Generate Mermaid flowcharts from SOP steps and decision points.
```

Tasks:

```text
Task0704A Implement flow_builder.py
Task0704B Implement mermaid_builder.py
Task0704C Validate Mermaid output
Task0704D Add Mermaid example to documentation
```

Acceptance:

```text
Mermaid flowchart is generated
Decision points are represented
Mermaid output is included in SOP detail
Mermaid example is documented
```

### Story0705 Review Workflow

Goal:

```text
Support SOP review lifecycle: draft, review, approved, rejected, published, and revision requested.
```

Tasks:

```text
Task0705A Implement review_service.py
Task0705B Add approve/reject/need revision actions
Task0705C Store review comments
Task0705D Add review demo records
Task0705E Document review workflow
```

Acceptance:

```text
SOP can be submitted for review
Reviewer can approve
Reviewer can reject
Reviewer can request revision
Review comments are stored
Review workflow is documented
```

### Story0706 Frontend

Goal:

```text
Provide SOP list, generator, detail/editor, and review screens.
```

Tasks:

```text
Task0706A Build /sop list page
Task0706B Build /sop/new generator page
Task0706C Build /sop/{id} detail/editor page
Task0706D Build /sop/review page
Task0706E Add demo UI states
```

Acceptance:

```text
SOP list page is available
SOP generation page is available
SOP editor is available
Review screen is available
Demo UI is usable
```

### Story0707 Export Engine

Goal:

```text
Export SOP content to Markdown and HTML, with PDF and Word placeholders.
```

Tasks:

```text
Task0707A Implement exporter.py
Task0707B Add Markdown export
Task0707C Add HTML export
Task0707D Add PDF/Word placeholders
Task0707E Add export sample
```

Acceptance:

```text
Markdown export works
HTML export works
PDF placeholder is returned
Word placeholder is returned
Export sample is documented
```

### Story0708 Integration Testing

Goal:

```text
Validate end-to-end SOP generation, review, publish, export, and frontend flow.
```

Tasks:

```text
Task0708A Add test_sop_generation.py
Task0708B Add test_flow_builder.py
Task0708C Add test_mermaid.py
Task0708D Add test_review.py
Task0708E Add test_export.py
Task0708F Document test limitations
```

Acceptance:

```text
Unit test files exist
Core SOP functions are tested
Review workflow is tested
Export engine is tested
Validation result is reported
```

### Story0709 Documentation

Goal:

```text
Update project documentation for SOP database, API, UI, demo data, and known issues.
```

Tasks:

```text
Task0709A Update API documentation
Task0709B Update database documentation
Task0709C Update UI documentation
Task0709D Update demo data documentation
Task0709E Update PROJECT_PROGRESS.md
```

Acceptance:

```text
API changes are documented
Database changes are documented
UI changes are documented
Demo data is documented
PROJECT_PROGRESS.md is updated
```

---

## 4. Story Status

| Story | Name | Phase A | Phase B | Phase C | Phase D | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Story0701 | Database Foundation | Pending | Pending | Pending | Pending | Planned |
| Story0702 | Backend CRUD API | Pending | Pending | Pending | Pending | Planned |
| Story0703 | AI SOP Generator | Pending | Pending | Pending | Pending | Planned |
| Story0704 | Mermaid Generator | Pending | Pending | Pending | Pending | Planned |
| Story0705 | Review Workflow | Pending | Pending | Pending | Pending | Planned |
| Story0706 | Frontend | Pending | Pending | Pending | Pending | Planned |
| Story0707 | Export Engine | Pending | Pending | Pending | Pending | Planned |
| Story0708 | Integration Testing | Pending | Pending | Pending | Pending | Planned |
| Story0709 | Documentation | Pending | Pending | Pending | Pending | Planned |

---

## 5. Execution Guardrails

Out of scope for Epic07:

```text
Training
AI Agent Workflow
Simulation
```

Epic07 cannot be marked complete until:

```text
All stories are complete
All required tasks are complete
Phase A-D are complete for every story
Validation result is reported
Demo data and demo screens are available
Documentation is updated
```
