# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (`pnpm-lock.yaml`).

- `pnpm dev` — Vite dev server with HMR
- `pnpm build` — typecheck then build (`tsc -b && vite build`)
- `pnpm lint` — ESLint over the repo (`eslint .`)
- `pnpm preview` — serve the production build

There is **no test runner** configured (no Vitest/Jest, no `test` script). Don't invent one or reference tests that don't exist.

The maintainer generally runs `dev`/`build` themselves. When you can't run a build, verify changes by reading files, `wc -l`, and the IDE diagnostics that surface after edits — and say plainly that verification was static-only.

## Big picture

A large React **prototype** for QueerPulse (a queer community platform). All data is **mock/static** — there is no backend or data fetching. "Interactivity" is local component state plus toast notifications; forms simulate submission. Stack: Vite + React 19 + react-router-dom v7 + TypeScript, CSS Modules + global design tokens. Imports are relative (no path aliases).

### Feature-first structure

Code lives in `src/features/<domain>/` (e.g. `gatherings`, `magazine`, `cinema`, `studio`, `marketing`, `resources`, `communities`, `members`). There are ~140 page components. A typical page folder contains:

- `XPage.tsx` — the route component (named export, registered in `src/app/routes.tsx`)
- `XPage.module.css` — its styles
- `x.data.ts` / `x.data.tsx` — its mock/static data (`.tsx` when values contain JSX/`ReactNode`)
- extracted presentational sub-components: `XSections.tsx`, `XTabs.tsx`, `XCard.tsx`, `XModal.tsx`, `XSteps.tsx`, `XSidebar.tsx`

**Enforced conventions** (see the `component-decomposition` skill in `.claude/skills/`):
- **No single component exceeds 200 lines.** A file may hold several small components totalling more than 200, but no individual component may.
- **Each component's mock/static data lives in its own colocated `*.data.ts(x)` file** — except a `Record<…>` mapping to `styles.xxx` (CSS-module class map), which stays in the component file because it depends on the CSS module import.

### Routing

`src/app/routes.tsx` eagerly registers every page. Crucially, pages do **not** hardcode paths — they call `linkToPath()` from `src/app/routeMap.ts`, which translates the original design-prototype hrefs (`"QueerPulse Cinema.html"`, `"#discovery"`) into clean router slugs (`/cinema`, `/#discovery`). When adding links between pages, use `linkToPath(...)`.

### Page shells

Every page wraps itself in one of two frames (don't hand-roll nav/footer):

- `PageShell` (`src/shared/components/layout`) — marketing/public frame: `Navbar` + content + plum `Footer`.
- `AppShell` — logged-in frame: floating `AppNav`, no marketing footer (takes optional `unreadCount`).

### App composition

`src/app/App.tsx` nests providers: `ThemeProvider` → `I18nProvider` → `ToastProvider` → `BrowserRouter` → `ScrollManager` → `AppRoutes`.

- Toasts: `useToast()` from `src/shared/components/feedback/useToast` → `const { showToast } = useToast()`.
- i18n: `useTranslation()` (`src/shared/i18n`), strings in `strings.en.ts`.

### Shared layer

`src/shared/`:
- `components/ui` — design-system primitives with a barrel `index.ts` (`Button`, `Card`, `Tag`, `Avatar`, `ImageSlot`, `Eyebrow`, `SectionHead`, `VisibilityBadge`, `Skeleton`, `Reveal`).
- `components/layout` — shells + nav/footer.
- `hooks` — `useScrollLock`, `useScrolled`, `useScrollReveal`, `useCountUp`, `useMediaQuery`, `usePrefersReducedMotion`.

Self-contained modals own their state and call `useScrollLock()` unconditionally (they're only mounted when open). Self-contained tabs/sections own their local state to avoid prop drilling.

## Design files

The design reference lives in **`docs/`**, as markdown:
- `docs/STYLE-RULES.md` — the short, non-negotiable UI checklist
- `docs/design-system.md` — the full design-system reference

The original visual prototype is a set of standalone `QueerPulse <Name>.html` pages — this is what `linkToPath()` href strings refer to (e.g. `linkToPath("QueerPulse Cinema.html")`). These HTML files are **not committed to the repo**.

**Primary source — the Claude Design MCP project (use this first).** The full prototype lives in the design project at:

```
https://claude.ai/design/p/59dc1938-6e1e-4e95-9973-dbf61aef45d1   (name: "Queer Pulse homepage")
```

Read design files with the `claude_design` MCP connector (the `DesignSync` tool): `list_files` to browse, then `get_file` with the path `QueerPulse <Name>.html`. If the connector isn't authorized yet, tell the maintainer to run `/design-login`. This is the source of truth for layout, copy, and which pages were intended.

**Fallback — a local extract** that may also exist on disk at `/private/tmp/design_extract/queer-pulse-homepage/project/` (300+ `QueerPulse *.html` pages plus `screenshots/`). This is a **temp location** and may be cleared between machines/sessions; prefer the MCP project above, which is always current.

To find the file for a route, reverse `linkToPath`: a page named `QueerPulse <Title>.html` slugifies to `/<title-kebab>` (and nested cinema/studio pages route under `/cinema/*`, `/studio/*`). The only `.html` inside the repo itself is `index.html` (the Vite entry point).

## Design system — read before building any UI

`docs/STYLE-RULES.md` (the short non-negotiable checklist) and `docs/design-system.md` (full reference) govern all UI. Tokens are defined in `src/styles/tokens/` and imported once via `src/styles/index.css`. Key rules:

- **Design tokens only** (`var(--plum)`, `--accent`, `--cream`, `--jade`, `--ink`, …) — never hardcode hex.
- **Page/section backgrounds are `--cream`. Never a pure-white page background.** `--paper` (#FFFFFF) is only for small/medium card surfaces on cream, with the standard `1px solid rgba(45,27,61,.09)` border.
- **Success / confirmation surfaces use the plum-panel pattern**: `background: var(--plum)`, cream text, serif title with an italic `<em>` in coral, jade success icon, `ghost-dark` buttons. Never a big empty white card.
- Type: Fraunces serif for display/headings/pull-quotes (italic `<em>` = coral emphasis); DM Sans for body/UI/buttons. No monospace.
- Buttons: always the `<Button>` component (`variant="primary|ghost|ghost-dark|jade"`, `size`, polymorphic via `to`/`href`) — never `class="btn btn-*"` or ad-hoc `<button>`.
- Never nest a `<button>` inside a router `<Link>`; use `<span role="button" tabIndex={0}>` with `onClick` (preventDefault + stopPropagation) + `onKeyDown`.
- Respect `prefers-reduced-motion`; standard easing is `var(--ease)`.
