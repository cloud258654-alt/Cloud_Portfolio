# Google Flow Director OS

**[v0.5 Alpha]** — **Status:** Feature Freeze / Stabilization

Google Flow Director OS is a local-first PWA for planning, prompting, QA, timeline management, and export preparation for Google Flow video production workflows.

This project does not generate videos directly and does not integrate with Google Flow API, OpenAI API, or any external video generation service.

## Product Positioning

Google Flow Director OS is a production operating system for planning, prompting, and managing Google Flow videos. The v0.5 Alpha release focuses on local project management, storyboard planning, scene workspaces, readiness scoring foundations, and consistent Google Flow-specific information architecture.

## Completed Tasks (v0.5 Alpha)

- Task0001 — Project Skeleton
- Task0002 — UI Design System
- Task0003 — Google Flow Focused Architecture
- Task0004 — Flow Workspace Manager
- Task0005 — Flow Storyboard Studio
- Task0099 — Project Stabilization & Release

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible primitives
- Zustand
- Dexie.js / IndexedDB
- PWA manifest
- ESLint / Prettier

## Current Features

- App Shell with Sidebar and Topbar
- Reusable UI design system
- Local Workspace management
- Local Flow Project management
- Flow Storyboard Studio
- Flow Scene CRUD
- Scene ordering
- Scene Health Score
- Story Beat, Emotion, and Camera timelines
- Dashboard scene-level progress
- Placeholder routes for future Google Flow production modules

## Live Demo

🚀 **Run it locally in seconds:**

```bash
git clone https://github.com/cloud258654-alt/Cloud_Portfolio.git
cd Cloud_Portfolio/projects/Project_014_PPT\ to\ Flow
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> Live hosted demo coming soon. Deploy instantly with [Vercel](https://vercel.com/new) or [Netlify](https://www.netlify.com/).

## Local Setup

```bash
npm install
npm run dev
```

Local development URL:

```txt
http://localhost:3000
```

## Available Routes

- `/dashboard`
- `/projects`
- `/storyboard`
- `/scenes`
- `/project-bible`
- `/characters`
- `/vehicles`
- `/environments`
- `/hero-images`
- `/ending-frames`
- `/prompts`
- `/voice`
- `/subtitles`
- `/flow-timeline`
- `/qa`
- `/export`
- `/design-system`
- `/settings`

## Development Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Known Limitations

- No Google Flow API integration
- No OpenAI API integration
- No external video generation service integration
- No cloud sync
- No login
- No Supabase or Firebase
- No Hero Image upload
- No Ending Frame upload
- No Prompt Builder automation
- No actual export package generation
- Project Bible is still a placeholder in v0.5 Alpha

## Next Milestone

Task0006 is deferred until after v0.5 Alpha stabilization. The current focus is bug fixes, documentation alignment, and validation hardening only.

```txt
Task0006_Canon_Studio_Google_Flow_Canon_Engine (deferred)
```

## Stabilization

The v0.5 Alpha stabilization phase (Task0099) addresses code cleanup, UI consistency, shared utility extraction, dead code removal, and documentation alignment. No new features, no schema changes, and no external API integrations are permitted during this phase.
