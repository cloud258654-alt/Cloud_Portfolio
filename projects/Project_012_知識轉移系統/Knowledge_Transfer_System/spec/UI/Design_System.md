# Design System

System: AI Knowledge Transfer System (KTS)  
Version: v1.0.0  
Owner: UX/UI Architect  
Last Updated: 2026-06-25  
Execution Status: Implemented as frontend design contracts

## 1. Design Vision

KTS uses an Enterprise AI design language:

- Japanese minimal
- Apple inspired
- AI native
- Enterprise SaaS
- Modern dashboard
- Professional, calm, elegant

The interface should feel quiet, precise, trustworthy, and fast for repeated workplace use.

## 2. Principles

- Simple
- Readable
- Consistent
- Accessible
- Fast
- Elegant
- Scalable

## 3. Brand Personality

- Clean
- Warm
- Professional
- Trustworthy
- Friendly
- Intelligent

## 4. Foundations

### Color

| Token | Value | Usage |
|---|---|---|
| `primary` | `#2E7D32` | Primary actions, focus, AI status |
| `secondary` | `#90CAF9` | Secondary highlights |
| `background` | `#FAFAF8` | App background |
| `surface` | `#FFFFFF` | Panels, cards, dialogs |
| `wood` | `#E9DFC9` | Warm accent, subtle section highlight |
| `border` | `#E5E7EB` | Dividers and control borders |
| `text` | `#111827` | Main text |
| `muted` | `#6B7280` | Secondary text |
| `success` | `#4CAF50` | Positive state |
| `warning` | `#F9A825` | Caution state |
| `danger` | `#E53935` | Destructive state |
| `info` | `#42A5F5` | Informational state |

### Typography

Preferred stack:

```text
Inter, Noto Sans TC, SF Pro Text, system-ui, sans-serif
```

Scale:

| Token | Size | Usage |
|---|---:|---|
| `display` | 32px | Page title only |
| `h1` | 28px | Major screen heading |
| `h2` | 24px | Section heading |
| `h3` | 20px | Panel heading |
| `body` | 16px | Primary body |
| `body-sm` | 15px | Dense content |
| `ui` | 14px | Controls and tables |
| `caption` | 12px | Metadata and helper text |

### Spacing

Use an 8pt grid:

```text
4, 8, 16, 24, 32, 40, 48, 64
```

### Radius

Enterprise SaaS surfaces should stay restrained:

| Token | Value | Usage |
|---|---:|---|
| `sm` | 6px | Badges, compact controls |
| `md` | 8px | Cards, tables, repeated items |
| `lg` | 12px | Inputs, menus |
| `xl` | 16px | Dialogs, drawers |
| `full` | 999px | Pills, avatars |

### Shadow

| Token | Value |
|---|---|
| `card` | `0 8px 30px rgba(0, 0, 0, 0.05)` |
| `hover` | `0 12px 40px rgba(0, 0, 0, 0.08)` |
| `focus` | `0 0 0 3px rgba(46, 125, 50, 0.22)` |

### Motion

| Token | Value | Usage |
|---|---:|---|
| `fast` | 150ms | Hover and focus |
| `base` | 250ms | Expand, collapse, drawer |
| `slow` | 300ms | Dialog and page transition |

## 5. Layout

Desktop:

```text
Sidebar -> Topbar -> Content -> Optional Right Panel
```

Mobile:

```text
Topbar -> Content -> Bottom Navigation / Drawer
```

Breakpoints:

- Mobile: `0px`
- Tablet: `768px`
- Desktop: `1024px`
- UltraWide: `1440px`

## 6. Navigation

Primary navigation:

- Dashboard
- Knowledge
- Search
- AI QA
- SOP
- Training
- Agents
- Analytics
- Settings

Navigation must support active state, collapsed sidebar, keyboard navigation, and mobile drawer behavior.

## 7. Components

Foundation components:

- Button
- Icon Button
- Input
- Textarea
- Select
- Checkbox
- Radio
- Date input
- Upload
- Badge
- Avatar
- Card
- Dialog
- Drawer
- Tabs
- Table
- Sidebar
- Timeline

Domain components:

- Chat Bubble
- Citation Card
- Knowledge Card
- SOP Viewer
- Flow Viewer
- Dashboard Card
- Metric Card
- Agent Task Card
- Training Course Card

## 8. Buttons

Variants:

- Primary
- Secondary
- Outline
- Ghost
- Danger
- Loading
- Icon

Requirements:

- Minimum touch target: 40px.
- Focus state uses `shadow.focus`.
- Icons should use Lucide where available.
- Destructive actions must use danger styling and confirmation when high impact.

## 9. Forms

Requirements:

- Rounded inputs with subtle border.
- Green focus state.
- Inline validation.
- Clear disabled, readonly, loading, and error states.
- Upload controls support drag/drop and progress.

## 10. Tables

Requirements:

- Sticky header.
- Sorting.
- Filtering.
- Pagination.
- Row selection.
- Export action.
- Empty state.
- Dense but readable row height.

## 11. AI Chat

Chat supports:

- User message
- Assistant message
- Markdown
- Tables
- Code blocks
- Images
- Citations
- Feedback
- Suggested questions
- Action buttons

Grounded AI answers must visually expose citations.

## 12. Search UI

Search includes:

- Large search box.
- Search mode selector: keyword, semantic, hybrid.
- Filters: category, department, date, permission.
- AI suggested query rewrite.

Result card includes:

- Title
- Summary
- Source
- Version
- Owner
- Citation
- Permission scope

## 13. Module Patterns

### Knowledge Card

Fields:

- Title
- Category
- Owner
- Department
- Version
- Updated date
- AI summary
- Tags

### SOP Viewer

Sections:

- Flowchart
- Steps
- Screenshots
- FAQ
- Related SOP
- Training
- AI mentor

### Training UI

Cards:

- Course
- Lesson
- Quiz
- Certificate

Progress:

- Learning progress
- Completion
- Score

### Agent UI

Agent task card:

- Avatar
- Status
- Task
- Progress
- Memory
- Tool
- Logs

### Analytics UI

Dashboard blocks:

- KPI
- Trend
- Risk
- AI insight
- Knowledge gap
- ROI

## 14. Accessibility

Target: WCAG 2.2 AA

Requirements:

- Keyboard navigation.
- Visible focus ring.
- ARIA labels for icon-only controls.
- Screen reader compatible form errors.
- Color contrast at least AA.
- Reduced motion support.

## 15. Dark Mode

Themes:

- Light
- Dark
- Auto

Dark mode uses neutral gray surfaces, green accent, and soft contrast. It should not become a gaming or cyberpunk visual style.

## 16. Implementation Artifacts

Design tokens:

- `spec/UI/design-tokens.json`
- `spec/UI/design-tokens.css`
- `spec/UI/tailwind.preset.js`

Frontend stack:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide icons
- Framer Motion
- React Query
- Zustand
- React Hook Form

## 17. Figma Structure

Recommended structure:

- Foundations
- Components
- Patterns
- Templates
- Pages
- Icons
- Illustrations

## 18. Illustration Style

Use:

- Flat
- Minimal
- Japanese-inspired
- Friendly
- AI native
- Enterprise appropriate

Avoid:

- Heavy cyberpunk
- Dark gaming
- Overly complex illustration
- Decorative blobs or abstract ornament as primary UI

## 19. Final Goal

The design system provides one Enterprise AI design language for:

- Web
- Mobile
- Dashboard
- AI Chat
- Knowledge
- Training
- Agent
- Analytics

All product UI should use the shared tokens and component contracts before creating bespoke styling.
