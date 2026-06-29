# Release Notes

## Google Flow Director OS v0.5 Alpha

Release Date: 2026-06-29

Status: Feature Freeze / Stabilization

## Completed Tasks

- Task0001 Project Skeleton
- Task0002 UI Design System
- Task0003 Google Flow Focused Architecture
- Task0004 Flow Workspace Manager
- Task0005 Flow Storyboard Studio
- Task0099 Project Stabilization & Release

## Major Features

- Local-first Google Flow production planning app
- Workspace and Flow Project management
- Google Flow-specific navigation and product vocabulary
- Reusable UI design system
- Flow Storyboard Studio
- Flow Scene CRUD and ordering
- Scene Health Score
- Story Beat, Emotion, and Camera timeline summaries
- Dashboard metrics from local IndexedDB data
- Placeholder routes for future Google Flow production modules

## Stabilization Phase (Task0099)

The v0.5 Alpha stabilization phase focuses on:

- Code cleanup and deduplication
- Dead code removal (10 unused files removed)
- Shared utility extraction (`average`, `countPercent`, `formatLabel`, `coveragePercent`, `getErrorMessage`)
- Shared form components (FormInput, FormSelect, FormTextarea)
- Shared constants extraction (`lib/constants.ts`)
- UI spacing consistency (all feature pages use `space-y-8`)
- Flow timeline page simplified to clean placeholder
- Store error handling unified with shared `getErrorMessage`
- Unused dependency (`@radix-ui/react-slot`) removed
- ESLint configuration updated
- Documentation alignment across all docs

No new features, no schema changes, and no external API integrations are permitted during this phase.

## Validation Results (Post-Stabilization)

Validation target:

```txt
npm run typecheck
npm run lint
npm run build
```

Route target:

```txt
/dashboard
/projects
/storyboard
/scenes
/design-system
/hero-images
/ending-frames
/flow-timeline
/project-bible
/prompts
/qa
/export
```

## Known Limitations

- No direct video generation
- No Google Flow API integration
- No OpenAI API integration
- No external video generation service integration
- No cloud sync
- No login
- No Hero Image upload
- No Ending Frame upload
- No Prompt Builder automation
- No Export Engine implementation

## Next Release Plan

The next feature release (Task0006) is deferred until v0.5 Alpha stabilization is complete.

```txt
Task0006_Canon_Studio_Google_Flow_Canon_Engine (deferred)
```
