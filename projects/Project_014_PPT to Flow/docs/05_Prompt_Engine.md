# Prompt Engine

## Current Version

Current Version: v0.5 Alpha

Status: Feature Freeze after Task0005

Next Milestone: Canon Studio

## Responsibilities

- Build Hero Image prompts from Flow Scene intent and visual bible rules.
- Build Flow Prompts from story beat, emotion, movement, camera, lighting, and transition rules.
- Keep negative prompt and continuity constraints available for every Flow Scene.
- Prepare prompt Markdown for the Flow Export Package.

Prompt engine implementation is deferred until after v0.5 Alpha stabilization.
The current engine layer only includes `lib/engines/sceneHealthEngine.ts`.

## Boundary

The prompt engine prepares text and structure for Google Flow. It does not call an AI API, Google Flow, or any external generation service directly.
