---
name: react-best-practices
description: Use when writing, reviewing, or refactoring any React/TSX in QueerPulse — building or decomposing a page, component, modal, hook, provider, or data file; designing a reusable component or its prop API; fixing a re-render/effect/keys/state bug; or optimizing rendering — to keep code correct, reusable, readable, performant, accessible, and consistent with this repo's conventions. The master standard behind the react-engineer (builder) and react-reviewer (auditor) agents. Covers React 19 rendering & hooks, advanced component/headless patterns, performance, large-codebase architecture, TypeScript, and accessibility, grounded in this repo's real primitives. Use BEFORE you write the code, not only after.
user-invocable: true
---

# React Best Practices (QueerPulse)

The standard for React/TSX in this repo. It layers general **React 19 + TypeScript**
mastery — rendering model, hooks correctness, advanced composition/headless
patterns, performance, architecture, accessibility — on top of QueerPulse's own
conventions. **Read this before writing React, not only when reviewing it** —
most violations are cheap to avoid up front and expensive to retrofit.

- To **build/fix/refactor** React here, dispatch the **`react-engineer`** agent (it edits code).
- For an after-the-fact **read-only audit** of a diff, dispatch the **`react-reviewer`** agent.

This SKILL.md is the scannable index + checklist. The deep knowledge lives in
`references/` — **open the one that matches your task** (they're substantial and
cited; don't reinvent from memory).

## Reference library — read the one your task touches

| File                                                                         | Read it when you're…                                                                                                                                                                          |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[references/queerpulse-react-map.md](references/queerpulse-react-map.md)** | **Always first.** What primitives/hooks/providers already exist, and exactly what the linters enforce. Reuse before building.                                                                 |
| **[references/rendering-and-hooks.md](references/rendering-and-hooks.md)**   | Touching state, effects, refs, keys, context, or React 19 features (`use`, Actions, `useOptimistic`, transitions, the Compiler). The render model + "You Might Not Need an Effect."           |
| **[references/component-patterns.md](references/component-patterns.md)**     | Designing or extracting a reusable component or custom hook — composition, compound components, control props, state reducer, headless, polymorphic `as`, prop getters, prop-API design, AHA. |
| **[references/performance.md](references/performance.md)**                   | A re-render problem, a slow/long list, context churn, a heavy route. Measure-first; memo/Compiler; virtualization; React-Query narrowing.                                                     |
| **[references/architecture.md](references/architecture.md)**                 | Decomposing, placing state, drawing module boundaries, or a multi-file refactor — colocation, feature-first, the reuse ladder, readability.                                                   |
| **[references/typescript-and-a11y.md](references/typescript-and-a11y.md)**   | Prop typing, generics, discriminated unions, `satisfies`; or any interactive/keyboard/focus/label/live-region work.                                                                           |

## Companions — defer, don't duplicate

- **`component-decomposition` skill** owns the 200-line rule + data-file extraction mechanics + the multi-agent sweep.
- **`performance-and-production-best-practices` skill** owns the cross-stack, **measure-first** perf framework (bundle, NestJS/TypeORM/Postgres, hosting cost). This skill's `performance.md` covers React _rendering_ specifically; anything beyond rendering defers there.
- **`docs/STYLE-RULES.md` / `docs/design-system.md`** + **`design-best-practices` skill** own the visual/token rules. This skill enforces the _code_ side.
- **`web-animation-best-practices`** owns motion; **`queer-community-copywriting`** owns any copy you add.

## The checklist

Create a todo per section when applying this to real work.

### 1. Structure & files

- **Named exports only.** `export function FooPage()` — never `export default`. Routes and barrels rely on named imports.
- **CSS Modules always.** `import styles from './Foo.module.css'`. No global class strings, no `className="btn btn-primary"`.
- **Colocate static data** in `<camelCaseName>.data.ts` (`.tsx` if values hold JSX/`ReactNode`). The one thing that stays in the component file: a `Record<…, styles.xxx>` class map (it depends on the CSS-module import).
- **Decompose by role** into sibling files — `FooSections.tsx`, `FooCard.tsx`, `FooModal.tsx`, `FooSteps.tsx` — not a nested `components/` folder.
- **No component over 200 lines** (`max-lines-per-function` enforces this; a file may hold several small ones). Defer the split to `component-decomposition`.
- **Wrap in the right shell:** `PageShell` (marketing/public) or `AppShell` (logged-in). Never hand-roll nav/footer.

### 2. The design-system contract (code side)

- **Reuse before building.** Check `references/queerpulse-react-map.md` — a second `<Button>`, scroll-lock, wizard-step hook, or media-query is a bug. `<Button>` for any pill/action (`variant`, `size`, polymorphic via `to`/`href`/neither); never style a bare `<button>` to look like a pill, never `class="btn btn-*"`. A bare `<button>` is only for genuinely non-pill controls, and then **must** have `type="button"` + accessible label + focus styles.
- **Never hardcode hex** in TSX or CSS. Use tokens (`var(--plum) --accent --cream --paper --jade --ink --ink-60 …`). Brand colors (OAuth icons) are the only exception — comment them.
- **Build links with `linkToPath(...)`** from `src/app/routeMap.ts`; don't hardcode paths.
- **Never nest `<button>` inside a router `<Link>`.** Use `<span role="button" tabIndex={0}>` with `onClick` (preventDefault + stopPropagation) + `onKeyDown` for Enter/Space.
- **No emoji glyphs** — use `react-icons/fi` (`local/no-emoji` is a hard error).

### 3. Hooks & rendering correctness → `references/rendering-and-hooks.md`

- **Stable list keys** from real ids, never the array index on a list that can reorder/filter/insert (index keys leak state between rows). Never `key={Math.random()}`.
- **Derive, don't sync.** Compute values during render instead of mirroring props into state via an effect. Most effects you're tempted to write are the wrong tool — "You Might Not Need an Effect."
- **Effects only for external synchronization**, written start/stop with cleanup. **Complete, honest dependency arrays** — break loops with functional updates / `useMemo` / `useCallback` / hoisting, **never** by suppressing `exhaustive-deps`.
- **Reset state with a `key`**, not a reset-in-effect. **Functional updates** when new state depends on old; **lazy init** for expensive initial state.
- **Hooks at top level only** — never conditional, in loops, or after an early return.
- **`no-floating-promises`/`no-misused-promises` are hard errors:** async work in a handler must be handled (`void`, `.catch`, or a mutation) — never a bare `async onClick`.
- **Memoize only with cause** (expensive work, or stabilizing a `memo`/dependency boundary) — not reflexively. See `performance.md`.

### 4. State placement → `references/architecture.md`

- **Server state lives in the React Query cache** — never mirror it into `useState`/context/a store. **URL state** (filters, tab, pagination) lives in the URL.
- **Local state for local concerns** (modal open, active tab, form fields). Self-contained modals/tabs own their own state.
- **Context for cross-cutting, low-frequency DI** already provided (`useAuth`, `useTheme`, `useTranslation`, `useToast`, `useSaved`, feature providers). Consume the existing provider; don't spin up a parallel one. New context: `createContext<T | null>(null)` + a `useX()` that throws outside its provider (copy `authContext.ts`).
- **Lift state only when two siblings genuinely share it.** Prefer a `use<Name>Form` hook (typed via `ReturnType<typeof use<Name>Form>`) over threading many props. Drilling a prop 3+ levels → lift or use `children` composition or context.

### 5. Reusable components & patterns → `references/component-patterns.md`

- **Compose, don't configure.** When a component sprouts a boolean prop per variation (`isX`/`showY`), reach for `children`/slots, a discriminated `variant` union, or compound components — not another flag.
- **Design the prop API for intent:** sensible defaults, forward `ref` (React 19 plain-prop, not `forwardRef` in new code) and rest props, a merging `className` escape hatch, `data-*`/`aria-*` passthrough.
- **Controlled vs uncontrolled:** support both cleanly for form controls (the `value`/`defaultValue`/`onChange` contract).
- **Custom hooks are the reuse unit for behavior** (return a tuple `as const` for ≤2 values, an object otherwise; keep returned callbacks stable). Extract only on the **rule of three** — **prefer duplication over the wrong abstraction (AHA)**.
- **Model reusable primitives on the repo's own:** `Button.tsx` (discriminated-union polymorphism), `FormField.tsx` (a11y prop-injection), `useWizardForm.ts` (generic hooks).

### 6. Performance → `references/performance.md`

- **Measure first; fix slow renders before re-renders.** No number, no optimization.
- **A child re-renders because its parent did**, not because props changed — `useMemo`/`useCallback` are inert unless a `memo` child or a dep array compares the reference.
- **Composition beats memoization:** move state down; pass expensive subtrees as `children`.
- **Split/memoize context values**; virtualize genuinely long lists; `React.lazy`-split heavy routes/deps (`maplibre-gl`, `visx`, Studio/Cinema) off the entry chunk; narrow React-Query re-renders with `select`.

### 7. TypeScript → `references/typescript-and-a11y.md`

- **Type every prop boundary** with an explicit `interface`/`type`. `no-explicit-any` is off but **don't pipe `any`** (the `no-unsafe-*` family warns). Type events/refs from React's types.
- **Discriminated unions over boolean soup** for variant/mode props (mirror `Button`'s `to`/`href` union); exhaustiveness-check with `never`.
- **Extend native props** via `Own & Omit<ComponentPropsWithoutRef<'el'>, keyof Own>`. **Generics preserve inference** (`List<T>`, `useLocalStorage<T>`). Type context so "used outside provider" is a type error. Validate the server boundary at runtime (Zod) rather than casting `res.json()`.
- **Match the file's existing `ReactNode` idiom** — don't churn untouched files.

### 8. Accessibility & motion → `references/typescript-and-a11y.md` (Part 2)

- **Semantic HTML first** — native `<button>`/`<a href>`/`<dialog>` over `<div role>`; the first rule of ARIA is don't use ARIA. Never nest interactive elements.
- **Interactive = focusable + labeled.** Custom `role="button"` gets `tabIndex` + Enter/Space. Icon-only controls get an accessible name (`aria-label`), the icon `aria-hidden`.
- **Forms:** associate a real `<label>` (`FormField` wires `id`/`aria-describedby`/`aria-invalid`); disable submit until valid. **Async/toast/validation updates** go through a live region (`role="status"`/`role="alert"`).
- **Manage focus** in overlays (trap, then restore on close); **`:focus-visible`** for the ring. **Gate decorative motion** behind `usePrefersReducedMotion()`; easing `var(--ease)`.
- Images carry `alt` (decorative → `alt=""`). Don't convey meaning by color alone.

### 9. Dual-mode & i18n (house)

- **Preserve demo/live dual-mode** — every live path keeps its colocated `*.data.ts` demo fallback; live components branch on `demoMode` and never read the mock registry or the demo persona (`"tiago"`).
- **Every user-facing string bilingual EN/PT** via `useTranslation()`; success surfaces use the plum-panel `SuccessPanel`, not an empty white card.
- **Explicit variable names** — no single letters/abbreviations (`communityIndex`, not `i`).

## Quick reference

| Smell                                                                | Fix                                                                        |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `export default function`                                            | Named export                                                               |
| `className="btn btn-primary"` / styled bare `<button>` for an action | `<Button variant=…>`                                                       |
| Hardcoded `#fff` / hex                                               | `var(--paper)` / token (brand-color exception → comment)                   |
| `to="/cinema"` hardcoded path                                        | `linkToPath("QueerPulse Cinema.html")`                                     |
| `key={i}` on a mutable list                                          | stable id from data                                                        |
| Effect missing/lying deps                                            | complete them; break loops with `useMemo`/`useCallback`/functional updates |
| Mirroring props into state via effect                                | derive during render                                                       |
| Reset-in-effect on prop change                                       | `key` prop                                                                 |
| `async` handler passed to `onClick`                                  | wrap in `void`/`.catch`/a mutation (`no-misused-promises`)                 |
| Server data copied into `useState`/context                           | read from the React Query cache                                            |
| Boolean-prop soup (`isX`+`isY`)                                      | discriminated `variant` union                                              |
| Component sprouting a flag per variation                             | composition / compound components                                          |
| `useMemo`/`useCallback` with no `memo`/dep consumer                  | delete it (inert)                                                          |
| `<div role="button" onClick>` with no keys                           | native `<button>`, or add `tabIndex`+Enter/Space                           |
| `createContext<T>(null as any)`                                      | `createContext<T \| null>(null)` + throwing `useX()`                       |
| Component > 200 lines                                                | run `component-decomposition`                                              |

## Common mistakes

- **"It's just a small button, bare `<button>` is fine."** If it's an action, it's `<Button>`. Bare buttons are non-pill controls only, and still need `type="button"` + focus + label.
- **"Index keys are fine, the list never changes."** Filters/sorts/inserts make it change. Use a real id.
- **"I'll add the data file later."** Colocate it now; retrofitting means touching the component again.
- **"I'll memoize everything to be safe."** A child re-renders because its parent did; memo is inert without a `memo` child or dep-array consumer, and one unstable prop breaks it. Measure first; prefer composition.
- **"An effect will keep this in sync."** Derive it during render, reset it with a `key`, or do it in the event handler. Most effects are the wrong tool.
- **"One more boolean prop won't hurt."** That's how a component becomes a private config language. Compose instead.
- **"I'll abstract this now to be DRY."** Prefer duplication over the wrong abstraction; extract on the third occurrence.

## Verification

There **is** a test runner (Vitest), but **don't run tests unless explicitly asked** — verify statically (read the file, `wc -l`, IDE diagnostics) and **say plainly that verification was static-only.** The maintainer usually runs `pnpm build` (`tsc -b && vite build`) and `pnpm lint`. To audit a set of changed files against this checklist, dispatch the `react-reviewer` agent; to build/fix, dispatch `react-engineer`.
