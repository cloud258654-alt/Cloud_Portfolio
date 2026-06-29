# Google Flow Director OS

Google Flow Director OS is a local-first PWA for planning, prompting, QA, timeline management, and export preparation for Google Flow video production workflows.

This project does not generate videos directly and does not integrate with Google Flow API, OpenAI API, or any external video generation service.

## Product Positioning

Google Flow Director OS is a production operating system for planning, prompting, and managing Google Flow videos. The v0.5 Alpha release focuses on local project management, storyboard planning, scene workspaces, readiness scoring foundations, and consistent Google Flow-specific information architecture.

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

Recommended next task:

```txt
Task0006_Canon_Studio_Google_Flow_Canon_Engine
```

The next milestone should turn Project Bible into a Canon Studio / memory layer, but it is not included in v0.5 Alpha.
