---
name: react-best-practices
description: Use when writing, reviewing, or refactoring any React/TSX in QueerPulse — building a page, component, modal, hook, or data file — to keep code correct, accessible, performant, and consistent with this repo's conventions. Covers component structure, the design-system contract (Button, tokens), hooks/effects/keys correctness, TypeScript prop typing, and accessibility. Use BEFORE writing the code, not only after.
user-invocable: true
---

# React Best Practices (QueerPulse)

The standard for React/TSX in this repo. It layers general React 19 + TypeScript
correctness on top of QueerPulse's own conventions. **Read this before writing
React, not only when reviewing it** — most violations are cheap to avoid up front
and expensive to retrofit. For an after-the-fact audit of a diff, dispatch the
`react-reviewer` agent.

Two companions, don't duplicate them:
- **`component-decomposition` skill** owns the 200-line rule and data-file extraction mechanics.
- **`docs/STYLE-RULES.md` / `docs/design-system.md`** own the visual/token rules. This skill enforces the *code* side of that contract.

## The checklist

Create a todo per section when applying this to real work.

### 1. Structure & files
- **Named exports only.** `export function FooPage()` — never `export default`. Routes and barrels rely on named imports.
- **CSS Modules always.** `import styles from './Foo.module.css'`. No global class strings, no `className="btn btn-primary"`.
- **Colocate static data** in `<camelCaseName>.data.ts` (`.data.tsx` if values hold JSX/`ReactNode`). The one thing that stays in the component file: a `Record<…, styles.xxx>` class map, because it depends on the CSS-module import.
- **Decompose by role** into sibling files — `FooSections.tsx`, `FooCard.tsx`, `FooModal.tsx`, `FooSteps.tsx`, `FooTabs.tsx`, `FooSidebar.tsx` — not a nested `components/` folder.
- **No component over 200 lines** (a file may hold several small ones). Defer to `component-decomposition`.
- **Wrap in the right shell:** `PageShell` for marketing/public, `AppShell` for logged-in. Never hand-roll nav/footer.

### 2. The design-system contract (code side)
- **Use `<Button>` for any pill/action button** — `variant="primary|ghost|ghost-dark|jade"`, `size`, polymorphic via `to` (router Link) / `href` (`<a>`) / neither (`<button>`). Never style a bare `<button>` to look like a pill, and never `class="btn btn-*"`.
  - A bare `<button>` is only acceptable for genuinely non-pill controls (icon button, toggle row, list-row trigger). When you use one it **must** have `type="button"`, a real accessible label, and visible focus styles. If it's a primary/secondary action, it should be `<Button>`. (See the real offenders in `src/features/settings/*` and `CreateGatheringSteps.tsx:15` — those are the pattern to *avoid*.)
- **Never hardcode hex in TSX or CSS.** Use tokens: `var(--plum) --accent --cream --paper --jade --ink --ink-60 …`. The only sanctioned exception is third-party brand colors (OAuth provider icons) — comment them as such.
- **Build links with `linkToPath(...)`** from `src/app/routeMap.ts`; don't hardcode router paths.
- **Never nest `<button>` inside a router `<Link>`** (invalid HTML). Use `<span role="button" tabIndex={0}>` with `onClick` (preventDefault + stopPropagation) + `onKeyDown` for Enter/Space.

### 3. Hooks & rendering correctness
- **Stable list keys.** Use a stable id from the data, never the array index when the list can reorder/filter/insert. Index keys (e.g. `DeleteAccountSection.tsx:75`) cause state to leak between rows — give data items real ids.
- **Complete effect dependency arrays.** Every value an effect reads goes in the deps. If that loops, the fix is `useCallback`/`useMemo` or moving the value, not lying about deps.
- **Clean up effects** that subscribe, set timers, or add listeners — return a teardown. (Reach for the shared hooks first: `useScrollLock`, `useScrolled`, `useScrollReveal`, `useMediaQuery`, `useCountUp`, `usePrefersReducedMotion`.)
- **Don't call hooks conditionally** or inside loops/callbacks — top level only.
- **Derive, don't sync.** Compute values during render instead of mirroring props into state via an effect. Reserve state for genuinely independent values.
- **Memoize only with cause.** Add `useMemo`/`useCallback`/`memo` for expensive work or to stabilize a dependency/`memo` boundary — not reflexively.

### 4. State placement
- **Local state for local concerns** (modal open, active tab, filter, form fields). Self-contained modals/tabs own their own state — they're only mounted when open.
- **Context for cross-cutting state** already provided: `useAuth`, `useTheme`, `useTranslation`, `useToast`, `useSaved`, plus feature providers (Social, WorkProfile). Consume the existing provider; don't spin up a parallel one.
- **Lift state only when two siblings genuinely share it.** Prefer a `use<Name>Form` custom hook (returning `{...state, ...setters, helpers}`, typed via `ReturnType<typeof use<Name>Form>`) over threading many props. If you're passing a prop more than ~3 levels, lift or use context.

### 5. TypeScript
- **Type every prop boundary** with an explicit `interface`/`type`. No implicit `any`, no untyped `props`.
- **Type event handlers and refs** from React's types; avoid casting away to `any`.
- **Discriminated unions over boolean soup** for variant/mode props (mirror `Button`'s `to`/`href` union).
- **Match the file's existing `ReactNode` idiom** (`import { type ReactNode }` vs `React.ReactNode`) — don't churn untouched files.

### 6. Accessibility & motion
- **Interactive = focusable + labeled.** Buttons/links get real text or `aria-label`; custom `role="button"` gets `tabIndex` and key handling.
- **Images carry alt** (decorative → `alt=""`); icon-only controls carry an accessible name.
- **Gate decorative motion behind `usePrefersReducedMotion()`**; standard easing is `var(--ease)`.
- **Forms:** mark required fields, and disable the submit until valid (dimmed + `not-allowed`, no hover color flip).

## Quick reference

| Smell | Fix |
|---|---|
| `export default function` | Named export |
| `className="btn btn-primary"` / styled bare `<button>` for an action | `<Button variant=…>` |
| Hardcoded `#fff` / hex | `var(--paper)` / token (brand-color exception → comment) |
| `to="/cinema"` hardcoded path | `linkToPath("QueerPulse Cinema.html")` |
| `key={i}` on a mutable list | stable id from data |
| Effect missing a dep | add it; break loops with `useMemo`/`useCallback` |
| Prop drilled 3+ levels | lift to a `use*Form` hook or context |
| Mirroring props into state via effect | derive during render |
| `<Link><button>…</button></Link>` | `<span role="button" tabIndex={0} onClick onKeyDown>` |
| Component > 200 lines | run `component-decomposition` |

## Common mistakes

- **"It's just a small button, bare `<button>` is fine."** If it's an action, it's `<Button>`. Bare buttons are for non-pill controls only, and still need `type="button"` + focus + label.
- **"Index keys are fine, the list never changes."** Filters/sorts/inserts make it change. Use a real id.
- **"I'll add the data file later."** Colocate it now; retrofitting means touching the component again.
- **"One inline `style={{color:'#...'}}` won't hurt."** It breaks theming and the token contract. Tokens or nothing (dynamic values from data are the only inline-style case).

## Verification

There's no test runner; `pnpm build` (`tsc -b && vite build`) and `pnpm lint` are the checks — the maintainer usually runs them. When you can't, verify statically (read the file, `wc -l`, IDE diagnostics) and **say plainly that verification was static-only.** To audit a set of changed files against this checklist, dispatch the `react-reviewer` agent.
