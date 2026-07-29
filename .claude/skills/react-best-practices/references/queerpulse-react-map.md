# QueerPulse React Map

The lay of the land: what already exists, what to reuse, and what the repo
actually enforces. **Read this before writing or reviewing React here** — most
"new" work is really *reuse* of a primitive that already ships. Building a second
version of something in this list is a bug, not a feature.

Stack: **React 19.2**, **TypeScript ~6.0** (strict, type-aware ESLint),
**react-router-dom 7**, **@tanstack/react-query 5**, Vite, CSS Modules + global
design tokens. Imports are **relative** (no path aliases). Demo/live **dual-mode**
everywhere (`if (demoMode) return mock else callApi()`).

---

## 1. The shared UI primitives — `src/shared/components/ui/` (barrel: `index.ts`)

Import from the barrel: `import { Button, Card, FormField } from "../../shared/components/ui"`.

| Primitive | What it is | Reuse it for |
| --- | --- | --- |
| `Button` | Polymorphic pill (`<button>`/`<Link>`/`<a>`) via a discriminated union; `variant`, `size` | **Every** action/pill. Never style a bare `<button>` to look like one. |
| `Card`, `CardDivider` | Paper surface on cream, standard border | Any card container |
| `FormField` | Label + control + helper/error scaffold that **auto-wires `id`/`htmlFor`/`aria-describedby`/`aria-invalid`/`aria-required`** onto a native child via `cloneElement`+`useId` | Every form field with a native `<input>/<textarea>/<select>` |
| `Modal`, `ModalSheet` | Dialog + bottom-sheet; own their scroll lock | Any overlay |
| `SuccessPanel` | The plum-panel success pattern (cream text, coral `<em>`, jade icon, `ghost-dark` buttons) | Confirmation screens — never a big empty white card |
| `Tabs` (`type Tab`) | **Controlled** tab row (`active`/`onChange`), `role="tablist"`, pill/underline variants, count badges | Tab switching |
| `ChipSelect`, `FilterChips`, `useChipSet` | Multi-select chips; `useChipSet` holds the `Set<string>` selection | Chip/tag pickers, filters |
| `SegmentedControl`, `Toggle`, `CheckLine` | Segmented + switch + checkbox-row controls | Settings, filters |
| `SearchInput` | Search box (pair with `useDebouncedValue`) | Any search field |
| `Avatar`, `AvatarStack` | Member avatars (resolve via `photoOf()` — real pic over static registry) | People |
| `Tag`, `TagRow`, `KindChip`, `Badge`, `StaffBadge`, `VisibilityBadge`, `CategoryLabel` | Labels/badges | Status, roles, categories |
| `EmptyState` | Empty/zero-state scaffold | **Live-mode empty results** (never leak mock data) |
| `Skeleton*` (`SkeletonLine/Avatar/Card`), `Spinner`, `Sending` | Loading affordances | Loading/pending |
| `Reveal`, `FadeIn`, `Outro` | Motion primitives (reduced-motion aware) | Entrance/scroll motion |
| `ImageSlot` | Aspect-ratio image placeholder | Media |
| `Eyebrow`, `SectionHead`, `StatTile`/`StatGrid`, `Stepper`, `SubpageIndex`, `HubBackLink`, `Tooltip`, `CopyLinkRow`, `ComingSoon` | Layout/section furniture | Page structure |

**Two model files to imitate:**

- `Button.tsx` — the canonical **discriminated-union polymorphic** component. `ButtonAsButton | ButtonAsLink | ButtonAsAnchor`, each carrying its native attributes via `Omit<…HTMLAttributes, keyof BaseProps>`, so `to` / `href` / neither picks the element AND its correct prop set. Copy this shape for any "renders as different elements" primitive. See [component-patterns.md](component-patterns.md) → Polymorphic components, and [typescript-and-a11y.md](typescript-and-a11y.md) → Discriminated unions.
- `FormField.tsx` — the canonical **accessibility-wiring / prop-injection** primitive: `useId` for stable ids, `cloneElement` to inject a11y props into a *native* child only (it deliberately refuses to inject into a custom component, because nothing guarantees it forwards the props). Copy this discipline whenever a wrapper must own labelling.

## 2. Shared hooks — `src/shared/hooks/` (barrel: `index.ts`)

Reach for these before writing an effect. Building a second scroll-lock / media-query / debounce is the classic duplicate.

| Hook | Purpose |
| --- | --- |
| `useScrollLock` | Lock body scroll while a modal/sheet is open (call unconditionally — the modal only mounts when open) |
| `useScrolled` / `useScrollReveal` | Scroll position / reveal-on-scroll |
| `useMediaQuery` / `usePrefersReducedMotion` | Responsive + reduced-motion gates |
| `useDebouncedValue` | Debounce a value (search) |
| `useLocalStorage` | Persisted state (demo overrides) |
| `useCountUp` / `useSimulatedLoad` | Animated counters / simulated demo loading |
| `useIncrementalList` (`IncrementalList`) | "Load more" pagination over an array |
| `useFocusOnMount` | Move focus to an element on mount (dialogs, step changes) |
| `useUnsavedChangesGuard` | Dirty-form navigation guard (edit flows) |
| `useSwipe` | Pointer-event swipe (touch-only, axis-guarded) |
| `useVisualViewportKeyboard` | Keep an input above the on-screen keyboard |
| `useInstallPrompt` / `detectPlatform` | PWA install |
| `useSubmitFlow` (`FlowStatus`) | `idle → sending → done` submit lifecycle |
| `useWizardForm`, `useStepGate`, `useRequiredFieldValidation` | **Multi-step form primitives** — the model for "custom hook as the reuse unit" |

**Model file to imitate:** `useWizardForm.ts` — extracted the *identical* step-index / gate / submit-lifecycle logic out of five hand-rolled wizards, leaving each feature only its bespoke bits. `useRequiredFieldValidation<Values, FieldKey extends keyof Values>` is the repo's real **generic hook**. This is AHA/"rule of three" done right — see [architecture.md](architecture.md) → The reuse ladder.

## 3. Contexts / providers — `src/app/providers/`

The pattern here is **`createContext<T | null>(null)` + a `useX()` that throws when used outside its provider** (compile-time-shaped, runtime-guarded). Copy `authContext.ts` exactly for any new cross-cutting context. Providers colocate the `useX` hook in the same file (which trips `react-refresh/only-export-components` → warn, accepted here).

Already provided — **consume these, never spin up a parallel one:**
`useAuth`, `useTheme`, `useTranslation` (i18n), `useToast`, `useSaved`, `useProfile`,
`useSocial`, `useConnections`, `useVouch`, `useCommunityMembership`, `useDrafts`,
`useConsent`, `useWorkProfile`, `useDisplayMode`, `useNavDrawer`, `useNavMode`,
`useAccessibility`, `useDemoMode`, plus feature contexts (`MyEventsContext`,
checkout, trust graph). App composition order in `App.tsx`:
`ThemeProvider → I18nProvider → ToastProvider → BrowserRouter → ScrollManager → AppRoutes`
(note: `AuthProvider` sits above `I18nProvider`, so it can't call `t()` — see the
`AuthErrorToast` pattern for deferring i18n out of a high provider).

## 4. What the linters actually enforce — `eslint.config.js`

Know the real gates; the skill's rules mirror them. Type-aware linting is on
(`recommendedTypeChecked`, `projectService`).

**Hard errors (block CI):**
- `@typescript-eslint/no-floating-promises` + `no-misused-promises` — **the big one.** A floating promise in a handler swallows rejections; an `async` function passed to `onClick`/a form handler where a `void`-returning one is expected is the same bug. Handlers that call async work must handle it (`void`, `.catch`, or a mutation).
- `local/no-emoji` — use `react-icons/fi`, not emoji glyphs (narrow per-file exemptions exist).
- `@typescript-eslint/no-unused-vars` — `^_`-prefixed args/vars/catches are intentional throwaways.
- `react-hooks` recommended set (rules-of-hooks, exhaustive-deps as configured).

**Warnings (surfaced, not gated — but don't add new ones):**
- `max-lines-per-function` max **200** (the component-size rule; `routes.tsx` exempt).
- `jsx-a11y` recommended (all forced to warn; tail is small — treat as real).
- `react-hooks/set-state-in-effect` (only intentional guarded timer/animation patterns remain).
- `no-explicit-any` is **off**, but the `no-unsafe-*` family (access/call/assign/return/argument through an `any`) is **warn** — don't pipe `any` through.
- `react-refresh/only-export-components` (fires on the provider+hook convention — accepted).
- `local/no-literal-string` — user-facing JSX text should resolve through `t()`; can never reach zero (content vs chrome), so it's a *prompt to ask "chrome or content?"*, not a gate.
- `no-restricted-syntax` — no hardcoded hex in inline `style`.

## 5. Non-negotiable house conventions (from CLAUDE.md + STYLE-RULES.md)

- **Named exports only.** No `export default`.
- **CSS Modules** (`import styles from "./X.module.css"`). No global class strings, no `class="btn btn-*"`.
- **Design tokens only** — `var(--plum) --accent --cream --paper --jade --ink --ink-60 …`. Page/section bg is `--cream`, never pure white; `--paper` is card-only. No hardcoded hex (brand-color exception → comment).
- **`<Button>` for every action;** `linkToPath()` for every route (never hardcode a path); never nest `<button>` in a router `<Link>` (use `<span role="button" tabIndex={0}>` + `onClick`/`onKeyDown`).
- **Colocate static/mock data** in `*.data.ts(x)` (`.tsx` when values hold JSX). The one thing that stays in the component: a `Record<…, styles.xxx>` CSS-module class map.
- **No component over 200 lines** (a file may hold several small ones). Defer the split to `component-decomposition`.
- **Preserve demo/live dual-mode** — every live path keeps its colocated `*.data.ts` demo fallback. Live-mode components branch on `demoMode` and must never read the mock registry or the demo persona (`"tiago"`).
- **Every user-facing string bilingual EN/PT** via `useTranslation()`; strings in the catalogs, not inline.
- **Explicit variable names** — no single letters or abbreviations (`communityIndex`, not `i`).
- **`PageShell`** for marketing/public, **`AppShell`** for logged-in. Never hand-roll nav/footer.

## 6. Companion skills — defer, don't duplicate

- **`component-decomposition`** — owns the 200-line rule + `*.data.ts` extraction mechanics + the multi-agent sweep.
- **`performance-and-production-best-practices`** — owns the cross-stack, **measure-first** performance framework (Vite bundle, NestJS/TypeORM/Postgres, hosting cost). This skill's [performance.md](performance.md) covers React-*rendering* optimization specifically; for anything beyond rendering (bundle size, data layer at scale, backend), defer there.
- **`design-best-practices`** / `docs/STYLE-RULES.md` / `docs/design-system.md` — own tokens, layout, spacing, hierarchy.
- **`web-animation-best-practices`** — owns motion (animate transform/opacity, ease-out, 150–400ms, reduced-motion).
- **`mobile-interface-best-practices`** — owns phone/PWA behavior.
- **`queer-community-copywriting`** — owns voice for any copy you add.
