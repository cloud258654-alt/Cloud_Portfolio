# System Architecture

## Current Version

Current Version: v0.5 Alpha

Status: Feature Freeze after Task0005 (Stabilization via Task0099)

Next Milestone: Canon Studio (deferred — post-stabilization)

## Completed in v0.5 Alpha

- Task0001 — Project Skeleton
- Task0002 — UI Design System
- Task0003 — Google Flow Focused Architecture
- Task0004 — Flow Workspace Manager
- Task0005 — Flow Storyboard Studio
- Task0099 — Project Stabilization & Release

## Product Boundary

Google Flow Director OS is focused only on Google Flow production planning. It stores structured project, scene, prompt, QA, and export-package data locally. It does not call Google Flow, OpenAI, or external generation services.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible primitives
- Zustand for UI and working state
- Dexie.js over IndexedDB for local persistence
- PWA manifest for installability

## Data Flow

The app stores Workspaces, Flow Projects, Flow Storyboards, and Flow Scenes with full CRUD in IndexedDB via Dexie.js (schema v4). Remaining tables (Project Bible, Flow Prompt Packages, Flow Ready Scores, Flow Export Packages) are defined in the schema but have placeholder implementations only. Zustand stores manage active selections and in-memory working state for page interactions.

## Google Flow Production Pipeline

1. PPT / Idea
2. Story Planner
3. Flow Storyboard
4. Hero Image
5. Google Flow
6. Ending Frame
7. Next Flow Scene
8. Flow Export Package

## Architecture Rule

Every screen, type, and document should use Google Flow-specific vocabulary. Avoid generic generator language and competitor model names.
