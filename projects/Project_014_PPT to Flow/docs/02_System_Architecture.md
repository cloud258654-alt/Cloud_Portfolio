# System Architecture

## Current Version

Current Version: v0.5 Alpha

Status: Feature Freeze after Task0005

Next Milestone: Canon Studio

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

The app stores Flow Projects, Flow Storyboards, Flow Scenes, Project Bibles, Flow Prompt Packages, Flow Ready Scores, and Flow Export Packages in IndexedDB. Zustand stores manage active selections and in-memory working state for page interactions.

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
