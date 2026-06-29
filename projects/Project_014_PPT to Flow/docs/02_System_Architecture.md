# System Architecture

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible primitives
- Zustand for UI and working state
- Dexie.js over IndexedDB for local persistence
- PWA manifest for installability

## Data Flow

The app stores projects, scenes, bibles, prompt packages, and export jobs in IndexedDB. Zustand stores manage active selections and in-memory working state for page interactions.
