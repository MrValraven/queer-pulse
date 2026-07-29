# Architecture (large-codebase maintainability)

> **QueerPulse is already built on most of this.** The repo is **feature-first**
> (`src/features/<domain>/`, ~140 pages), colocates `*.data.ts(x)` + `*.module.css`
> + tests beside components, layers **shared -> features -> app**, uses **React
> Query for server state** and **context for low-frequency DI** (auth/theme/i18n),
> and enforces the **200-line component rule** via `max-lines-per-function`. Read
> this to understand *why* those choices are right and how to extend them. Two
> repo specifics: imports are **relative** (no path aliases — see section 14.2's
> trade-off), and the **demo/live dual-mode** is a hard boundary every data path
> must preserve. The mechanical decomposition sweep (section 16) is the
> `component-decomposition` skill; the measure-first, cross-stack view is
> `performance-and-production-best-practices`.

---

# Architecting Large React Codebases for Maintainability, Readability, and Ease of Change

A dense, cited, opinionated reference. The goal throughout: a codebase that is **easy to build in, easy to read, and stays fast** — and knowing when those three pull against each other. Where practitioners legitimately disagree, that is flagged explicitly.

> The single sentence that organizes everything below: **"Things that change together should be located as close as reasonable."** — Dan Abramov, quoted in Kent C. Dodds, [Colocation](https://kentcdodds.com/blog/colocation).

---

## 1. The master principle: colocation

Every other rule in this document is downstream of one idea. Kent C. Dodds states it as: **"Place code as close to where it's relevant as possible."** ([Colocation](https://kentcdodds.com/blog/colocation)). Dan Abramov's sharper phrasing — *"Things that change together should be located as close as reasonable"* — is the version to memorize, because it contains the escape hatch ("as reasonable") that prevents dogma.

**What to colocate** (from [kentcdodds.com/blog/colocation](https://kentcdodds.com/blog/colocation)):

- **Comments** next to the code they explain (drift is impossible when they share a line).
- **Templates and logic** — this is *why* JSX exists; React deliberately colocated markup with the logic that produces it.
- **Styles** — CSS Modules / CSS-in-JS / colocated `.css` files sit beside the component.
- **Tests** — the unit test lives next to the unit (`Button.tsx` / `Button.test.tsx`).
- **State** — lives in the component that consumes it (see section 6).
- **Utility functions** — near their single point of use, *not* in a distant `utils/` graveyard.
- **Static data / mocks / fixtures / types** — beside the component that owns them. (In QueerPulse: the colocated `*.data.ts(x)` rule.)
- **Assets** — an SVG used by one component belongs beside it.

**Why it works** — three named benefits from the essay:

1. **Maintainability.** Drift and orphaned code become structurally hard. Delete the folder, delete everything related.
2. **Applicability.** When related files sit together, developers *see* the pattern and remember to update the sibling.
3. **Ease of use.** No context-switching across a directory tree to make one change.

**Colocation is also a performance principle.** In [State Colocation Will Make Your React App Faster](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster), Dodds shows that state held high in the tree forces React to invalidate the whole subtree on every update: *"When we manage state higher up in the React component tree, every update to that state results in an invalidation of the entire React tree."* Push the state down to the one component that uses it and the expensive siblings stop re-rendering. *"The best way to make something fast is to do less stuff."*

**When NOT to colocate** (the "as reasonable" clause):

- **End-to-end tests** span multiple systems — they belong at the project root.
- **Integration / system-wide documentation** describing cross-cutting flows.
- Anything that genuinely does **not** change together with the code you'd be putting it next to. Colocation is about *change coupling*, not physical proximity for its own sake.

---

## 2. The promotion ladder: local -> feature -> shared

Colocation gives you a natural default: **everything starts local.** You promote outward only when reality forces you to.

1. **Local** — defined in the component file, or a sibling file in the same folder. One consumer.
2. **Feature** — lives in `features/<x>/` shared across that feature. Multiple consumers *inside one feature*.
3. **Shared / global** — `src/shared/...`. Consumed by *multiple features*.

**Promote up a rung only when there is a second real consumer at the higher scope** — and, per the rule of three (section 5), preferably a third. Promotion is a one-way ratchet that costs you: shared code has more constraints, more reviewers, wider blast radius. The same lift-and-lower motion applies to components, hooks, and types, not just state.

**Demotion is legal and healthy.** If a "shared" helper ends up with one consumer after a refactor, move it back down. Most codebases only ever ratchet upward, which is how `shared/` becomes a junk drawer. (QueerPulse's `useWizardForm` is a good example of an *earned* promotion — it consolidated five hand-rolled wizards.)

---

## 3. Feature-first structure and module boundaries

Organize by **feature/domain, not by file type.** Alex Kondov's Tao of React states the rule flatly: *"Group by Route/Module"* rather than by type ([Tao of React](https://alexkondov.com/tao-of-react/)). A top-level `components/`, `hooks/`, `reducers/`, `utils/` split scatters one feature across five folders — the opposite of colocation.

### 3.1 The bulletproof-react layout

The most widely-cited concrete layout is [bulletproof-react's project-structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md):

```
src/
├── app/          # app layer: routes, providers, router, root App
├── assets/       # global static files
├── components/   # shared components across the app
├── config/       # global config + env
├── features/     # ← the primary unit of organization
├── hooks/        # shared hooks
├── lib/          # preconfigured/reusable libraries (wrapped)
├── stores/       # global client state stores
├── testing/      # test utils + mocks
├── types/        # shared types
└── utils/        # shared utils
```

Each feature is a self-contained mini-app: `api/`, `components/`, `hooks/`, `stores/`, `types/`, `utils/` — only the subfolders it actually needs. (QueerPulse maps `components/hooks/lib/types/utils` under `src/shared/` and each feature under `src/features/<domain>/`.)

### 3.2 The unidirectional dependency rule

bulletproof-react's most important rule: dependencies flow **in one direction only**:

```
shared  ->  features  ->  app
```

- **Shared** may be imported by anyone but imports *nothing* from `features` or `app`.
- **Features** import from shared, but **not from other features** and **not from app**.
- **App** composes features and shared; nothing imports *from* app.

The **no-cross-feature-imports** rule is the one that saves large codebases. The moment `features/checkout` imports from `features/catalog`, you have an invisible coupling that makes both un-deletable and un-movable. If two features genuinely need to share, that shared thing has earned promotion to `shared/`.

### 3.3 Feature-Sliced Design (FSD): the formalized version

[Feature-Sliced Design](https://feature-sliced.design/docs/get-started/overview) turns the above into a strict, named methodology. Its value is **standardization**. FSD defines **Layers** (app, pages, widgets, features, entities, shared — import only from layers strictly below), **Slices** (vertical partitions by business domain; a slice cannot import a sibling slice on the same layer — the generalization of "no cross-feature imports"), and **Segments** (`ui/`, `model/`, `api/`, `lib/`, `config/`).

> Opinion / disagreement: FSD is powerful but heavy. Small and mid teams often find bulletproof-react's lighter "shared / features / app" three-layer model is enough (which is what QueerPulse uses). The disagreement is about *ceremony*, not the underlying dependency-direction rule.

---

## 4. Enforcing boundaries mechanically

Architecture that lives only in a wiki decays. Encode the rules so CI rejects violations.

### 4.1 ESLint `import/no-restricted-paths`

bulletproof-react enforces the unidirectional graph with `eslint-plugin-import`'s `no-restricted-paths`:

```js
'import/no-restricted-paths': ['error', {
  zones: [
    { target: './src/features/auth', from: './src/features', except: ['./auth'] },
    { target: './src/features', from: './src/app' },
    { target: ['./src/components','./src/hooks','./src/lib','./src/types','./src/utils'],
      from: ['./src/features','./src/app'] },
  ],
}]
```

### 4.2 Dedicated boundary tooling

- **[eslint-plugin-boundaries](https://www.npmjs.com/package/eslint-plugin-boundaries)** — classify files by element type and declare allowed dependencies.
- **[Sheriff](https://github.com/softarc-consulting/sheriff)** — zero-dependency module-boundary enforcer.
- **[dependency-cruiser](https://github.com/sverweij/dependency-cruiser)** — best for detecting **circular dependencies**, orphaned modules, and visualizing the graph.
- **[Nx `enforce-module-boundaries`](https://nx.dev/docs/technologies/eslint/eslint-plugin/guides/enforce-module-boundaries)** — for monorepos.

The specific tool matters far less than the fact that **a machine, not a reviewer's memory, rejects a cross-boundary import.** (QueerPulse doesn't run a boundary plugin today — adding `import/no-restricted-paths` would freeze the shared->features->app rule in CI.)

---

## 5. The reuse ladder: AHA and the rule of three

The most expensive mistakes in large React codebases are not duplication — they're **the wrong abstractions**, created too early, that everyone is now afraid to touch.

### 5.1 AHA: Avoid Hasty Abstractions

Kent C. Dodds' [AHA Programming](https://kentcdodds.com/blog/aha-programming) sits between dogmatic DRY and total WET. The governing quote, from Sandi Metz: **"prefer duplication over the wrong abstraction."** ([The Wrong Abstraction](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction).)

Two failure modes: **over-DRY** (abstractions so tangled developers are "terrified" to change them — every one grows a thicket of `if`s serving cases it was never designed for) and **over-WET** (genuine duplication that drifts). The resolution: **optimize for change first.**

### 5.2 The rule of three

**"You can ask yourself 'Haven't I written this before?' two times, but never three."** Duplicate freely the first and second time. On the third occurrence the *real* shape of the abstraction has revealed itself. Why wait? With only two examples you cannot tell which parts are *essential* commonality and which are *coincidental*.

### 5.3 The cost function

The wrong abstraction is expensive because of the *asymmetry of reversal*: un-abstracting duplicated code is trivial and local; un-abstracting a bad shared abstraction is a cross-cutting refactor touching every caller. So the safe bet under uncertainty is duplication.

### 5.4 How to extract a shared component/hook safely

1. **Wait for three concrete uses.**
2. **Extract the intersection, parameterize the difference.** A variation is a prop, not a fork inside the abstraction.
3. **Keep it dumb.** It should not reach into any feature's data layer, router, or global store (section 8).
4. **Watch the boolean-prop / config-object smell.** `isCheckout`, `isProfile` sprouting on a shared component means it's absorbing feature knowledge — the abstraction is wrong.
5. **If it's fighting you, inline it back.** Deleting a premature abstraction is a legitimate, senior move.

---

## 6. State management strategy at scale

Put each kind of state in the right place instead of dumping everything into one global store.

| Kind | Owns the truth | Right home | Wrong home |
|---|---|---|---|
| **Server state** | The backend | React Query cache | Redux, Context, local `useState` |
| **URL state** | The URL | `useSearchParams`, route params | duplicated into component state |
| **Client/UI state** | The UI | local `useState`, colocated | global store |
| **Form state** | The form | React Hook Form / local | global store |
| **Truly-global client state** | The app session | Zustand / Redux / Context — *sparingly* | everything |

### 6.1 Server state is not client state

TkDodo's central argument in [React Query as a State Manager](https://tkdodo.eu/blog/react-query-as-a-state-manager): React Query is an **async state manager**, and server state is fundamentally different because *"you don't own it"* — it's a snapshot that may already be wrong. The two pre-React-Query approaches both fail (put-in-Redux -> stale; fetch-every-mount -> spinners everywhere). React Query dissolves the dilemma with **stale-while-revalidate**; the key knob is **`staleTime`**.

**The anti-pattern to name and ban:** copying server data into Redux/global/`useState`. *"resist the urge to sync server data to a different state manager."* The moment you copy it, you've forked the source of truth. (This is exactly why QueerPulse's live-mode hooks read from the Query cache, not a mirror.)

### 6.2 Why "everything in Redux/global" is an anti-pattern

Performance (global updates invalidate wide swaths), maintainability (no locality — any code can read/write), coupling (a cross-feature import channel that defeats boundaries), and server data doesn't belong there anyway. Kent's decision tree: `useState` -> lift to least-common-ancestor -> Context (kept close to consumers) -> *only truly global* things go in a store.

### 6.3 URL state is state too

Filters, sort, selected tab, pagination, opened modal, search query belong in the **URL** (`useSearchParams`): shareable, survives refresh, back/forward works, one source of truth. Duplicating URL state into `useState` and syncing is a classic sync bug (section 7).

> Opinion: the field has moved from Redux toward lighter tools (Zustand, Jotai, Redux Toolkit, XState). The consensus that solidified: **server state should live in a query cache, not a general-purpose client store.**

---

## 7. Deriving instead of storing

**If a value can be computed from existing state/props, it is not state — compute it during render.** Kent's [Don't Sync State, Derive It](https://kentcdodds.com/blog/dont-sync-state-derive-it): storing derived values means every mutation must update all of them, and some *"may fall out of sync with the true component state."* The fix is to calculate inline every render — no sync, no `useEffect`, no drift. When a derivation is genuinely expensive, *"that's what `useMemo` is for."*

**Rule:** minimize independent `useState` calls; every extra one is another invariant to hand-maintain. (QueerPulse's `useWizardForm.isFirstStep`/`isLastStep` and `useRequiredFieldValidation.missingFields` are derived, not stored.)

---

## 8. Design-system boundary design

A design system scales the whole app only if it stays **dumb**:

```
primitives  ->  composites  ->  feature components  ->  pages
(design system, app-agnostic)      (app-specific)
```

- **Primitives** — `Button`, `Input`, `Text`, `Card`. Take props + callbacks, render, emit events. Know nothing about your domain, router, data layer, or store.
- **Composites** — `Modal`, `FormField`, `DataTable`. Compose primitives; still domain-agnostic.
- **Feature components** — `CheckoutSummary`, `ProfileHeader`. Live in `features/`, may touch the data layer and domain types.

**The rule that keeps the DS reusable: app logic must not leak into it.** The instant `Button` imports `useCurrentUser`, it stops being a design-system component. Practical tests: could it be published to npm and used by a *different* app unchanged? Does it import from `features/`/`app/`? Does it read global state or the router? (QueerPulse's `src/shared/components/ui` primitives pass this — they take data + callbacks; `Button`, `FormField`, `Tabs` know nothing about features.)

**Composition over configuration.** Prefer `<Modal><Modal.Header/>...</Modal>` over a `Modal` with 30 boolean props — see [component-patterns.md](component-patterns.md).

---

## 9. Readability in the small

Distilled from Alex Kondov's [Tao of React](https://alexkondov.com/tao-of-react/):

- **Favor functional components + hooks.**
- **Name every component**; one component per file (tiny coupled children excepted).
- **Keep components short and JSX shallow.** Deeply nested JSX is the readability killer — extract nested chunks into named children.
- **Move lists into their own components** (`<UserList>` renders `<UserRow>`).
- **Guard clauses / early returns** for loading, error, empty, permission states, so the happy path isn't buried:
  ```tsx
  if (isLoading) return <Spinner />;
  if (error)     return <ErrorState error={error} />;
  if (!items.length) return <EmptyState />;
  return <List items={items} />;
  ```
- **Avoid nested render functions** (`const renderRow = () => ...`) — they re-create every render and are really un-named components; make them real components.
- **Avoid nested ternaries** in JSX.
- **Destructure props**, default at destructure, **limit the number of props**.
- **Extract custom hooks** so the component body reads declaratively: *what* it renders, not *how* the data was assembled.
- **Use Error Boundaries** around feature roots.
- **Explicit names, no abbreviations** — `community` not `c`, `index` not `i` (a hard QueerPulse rule).

The through-line: a component reads top-to-bottom as *hooks -> guards -> derived values -> shallow JSX*. Anything else gets extracted (to a hook if logic, to a child if markup).

---

## 10. Effects, side-effects, and the data layer

`useEffect` is the most-overused hook and a primary source of large-codebase bugs.

**Push data-fetching out of components into a data layer.** Components call feature hooks (`useUsers()`) that wrap React Query (`useQuery`) that wrap a typed API client. The component never sees `fetch`, `useEffect`, or loading-flag bookkeeping. TkDodo frames the hooks-based data layer as **dependency injection into components**.

**Most effects you write are unnecessary** (React docs' *You Might Not Need an Effect*): transforming data for render (-> derive), resetting state on prop change (-> `key`), caching expensive computation (-> `useMemo`), responding to events (-> event handlers). Reserve `useEffect` for genuine **synchronization with external systems** — and clean them up. Lint out: effects that set derived state; hand-rolled fetch effects; missing/lying dep arrays (`exhaustive-deps` must be honored); chains of effects. (Full treatment in [rendering-and-hooks.md](rendering-and-hooks.md) Part 3.)

---

## 11. Container/presentational as a soft guideline

The classic container/presentational split is described at [patterns.dev](https://www.patterns.dev/react/presentational-container-pattern/) with a modern caveat: **hooks made it largely unnecessary.** A custom hook achieves the identical separation without the wrapper component. Treat it as a **soft heuristic**: the *value* (separate "how do I get the data" from "how do I display it") is timeless; the *mechanism* is now "extract a custom hook," not "add a container." Reach for an actual split only for a genuine reason (a pure presentational component reused under two data sources; Storybook-driven UI).

---

## 12. TypeScript at scale

(Deep treatment in [typescript-and-a11y.md](typescript-and-a11y.md); the load-bearing points:)

- **`strict: true`, non-negotiable.** Also `noUncheckedIndexedAccess`. (QueerPulse runs strict + type-aware ESLint.)
- **Model state as discriminated unions, not bags of optional booleans** — impossible states become unrepresentable.
- **Use `satisfies`** to validate a value against a type without widening it (config objects, route maps, design tokens).
- **Branded types** for identifiers you must not mix up (`UserId` vs `OrderId`).
- **Colocate types with their feature**; promote to `src/types` only when shared.
- **Validate the server boundary at runtime** (Zod) and *derive* the TS type from the schema.

---

## 13. Consistency and enforcement

**Conventions enforced by machines beat conventions enforced by reviewers.**

Must-have ESLint: `eslint-plugin-react-hooks` (`rules-of-hooks` + `exhaustive-deps`), `eslint-plugin-jsx-a11y`, a module-boundary plugin (section 4), `import/order` + `no-cycle`. **Conventions over configuration** — pick one answer to file naming, folder shape, one-component-per-file, colocated tests/data, and encode it. **Codegen** removes drift (API client + types from OpenAPI/GraphQL). **Make the paved path the easy path** — scaffolding generators. (QueerPulse enforces `react-hooks`, `jsx-a11y`, `max-lines-per-function` 200, `no-floating-promises`, plus local `no-emoji`/`no-literal-string` rules — see `queerpulse-react-map.md` section 4.)

---

## 14. Barrels, path aliases, and imports

### 14.1 Barrels — convenient, and a real cost at scale

Barrels (`index.ts` re-exports) give clean imports but carry documented downsides: **broken tree-shaking / bundle bloat** (importing one symbol can pull the whole set — Atlassian reported ~75% faster builds after removing barrels from Jira's frontend), **slow tests** (Jest doesn't tree-shake), and **circular dependencies**.

**Guidance:** use barrels at the **public edge of a package** (a design-system root — QueerPulse's `src/shared/components/ui/index.ts` is exactly this, a deliberate public API); *inside* an app, prefer **direct imports from the specific file**.

> Opinion: FSD *requires* per-slice `index.ts` public APIs as its encapsulation mechanism — a legitimate trade (bundler friction for strong boundaries). The defensible synthesis: **barrels as an intentional public API = good; barrels as reflexive `index.ts` in every folder = bundle and cycle debt.**

### 14.2 Path aliases vs relative imports

- **Aliases** (`@/features/x`) — stable across moves, no `../../../` chains, make boundary rules legible. Preferred for cross-area imports.
- **Relative imports** — clearer for *within-folder* siblings and signal "this is local."

The pragmatic rule is **relative within a feature/folder, aliases across features/layers**. QueerPulse deliberately uses **relative imports everywhere (no aliases)** — the trade-off is more `../../` on cross-area imports in exchange for zero alias config; match the existing style rather than introducing aliases piecemeal.

---

## 15. Testing that supports refactoring

The point of tests in a codebase you want to *change* is to refactor without fear — which only works if tests assert **behavior, not implementation.** Testing Library's principle: *"The more your tests resemble the way your software is used, the more confidence they can give you."* Query by role/label/text; don't reach for internal state or CSS internals. **Avoid snapshot tests as your primary safety net** (large snapshots get re-blessed without reading and lock in implementation). Colocate tests. (QueerPulse note: **do not run the suites unless explicitly asked** — verify statically per the maintainer's standing rule.)

---

## 16. Taming an existing messy codebase

- **Strangler Fig** ([Fowler](https://martinfowler.com/bliki/StranglerFigApplication.html)) — don't rewrite; *surround and replace*, routing feature-by-feature to the new structure while the app keeps shipping. New features go in the `features/` structure with boundaries; old screens migrate when you're already touching them.
- **Boy-Scout Rule** — leave each file cleaner than you found it. In a hotspot you're already editing, extract the giant component, colocate the stray mock data, add the missing types.
- **Decomposition sweeps** — systematically break oversized components below a line budget and colocate each component's data into its own file. In QueerPulse this is the **`component-decomposition`** skill (highly parallelizable across agents).
- **Codemods / jscodeshift** — for mechanical, repo-wide changes, write an AST codemod rather than editing by hand.
- **Measure hotspots** ([Tornhill, Your Code as a Crime Scene](https://pragprog.com/titles/atcrime/your-code-as-a-crime-scene/)) — overlay **change frequency (churn)** with **complexity**; the dangerous code is both complicated *and* changed constantly. *"1-2% of a codebase accounts for up to 70% of development work."* Spend limited refactoring budget on the top-right quadrant, not on elegant-but-static code.

**Sequencing:** freeze the architecture (boundaries in CI so it can't get *worse*) -> migrate new work onto the paved path -> strangle old screens as you touch them -> spend explicit refactoring budget only on measured hotspots.

---

## 17. Signs of good vs bad architecture

**Good:** a new feature is a new folder (rarely edit shared code to ship it); you can **delete** a feature by deleting its folder; the dependency graph flows one way with no cycles; state lives at the right altitude (server in the query cache, UI local, URL in the URL, minimal global); components read hooks -> guards -> derived -> shallow JSX; the design system is publishable; new engineers find things by guessing; tests survive refactors.

**Bad:** changing one feature requires edits in five type-named folders; a `utils.ts`/`shared/` junk drawer no one dares clean; cross-feature imports; a global store every feature reads/writes; server data copied into Redux and hand-synced; abstractions everyone is *"terrified"* to touch; 800-line components with nested JSX/render-functions/ternaries; types that permit impossible states; barrels everywhere; the same 2% of files in every incident.

---

## 18. The core trade-offs

*"it's all tradeoffs. There is no free lunch."* (TkDodo)

1. **DRY <-> decoupling.** AHA resolves it *toward decoupling under uncertainty*: duplicate until the third occurrence.
2. **Colocation <-> discoverability.** The promotion ladder (section 2) is the settlement.
3. **Structure/ceremony <-> velocity.** Match the ceremony to the stakes (FSD for large teams; lighter for a prototype).
4. **Encapsulation (barrels) <-> bundle/build performance.** Buy encapsulation at the package edge; pay direct-import cost inside the app.
5. **Convenience of global state <-> locality & performance.** Keep state as low as possible.
6. **Flexibility (props/config) <-> simplicity (composition).** Favor composition; add configuration only where genuinely reused.
7. **Type strictness <-> upfront speed.** In a codebase whose purpose is *ease of change*, strictness almost always wins.

The meta-point: "easy to build in," "easy to read," and "performant" mostly *reinforce* each other — colocation, boundaries, right-placed state, and small components serve all three. Where they conflict, **name the trade-off explicitly, decide it deliberately, and encode the decision in tooling** so it survives contact with a large team.

---

## Sources

- Kent C. Dodds — Colocation https://kentcdodds.com/blog/colocation · State Colocation https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster · Don't Sync State, Derive It https://kentcdodds.com/blog/dont-sync-state-derive-it · AHA Programming https://kentcdodds.com/blog/aha-programming
- Sandi Metz — The Wrong Abstraction https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction
- bulletproof-react — Project Structure https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md
- Feature-Sliced Design https://feature-sliced.design/docs/get-started/overview
- eslint-plugin-boundaries https://www.npmjs.com/package/eslint-plugin-boundaries · Sheriff https://github.com/softarc-consulting/sheriff · dependency-cruiser https://github.com/sverweij/dependency-cruiser · Nx enforce-module-boundaries https://nx.dev/docs/technologies/eslint/eslint-plugin/guides/enforce-module-boundaries
- TkDodo — React Query as a State Manager https://tkdodo.eu/blog/react-query-as-a-state-manager · Deriving Client State from Server State https://tkdodo.eu/blog/deriving-client-state-from-server-state
- Alex Kondov — Tao of React https://alexkondov.com/tao-of-react/
- patterns.dev — Container/Presentational https://www.patterns.dev/react/presentational-container-pattern/
- Total TypeScript — https://www.totaltypescript.com/ · Discriminated Unions https://www.totaltypescript.com/discriminated-unions-are-a-devs-best-friend
- Barrel-file costs — https://dev.to/thepassle/a-practical-guide-against-barrel-files-for-library-authors-118c
- Martin Fowler — Strangler Fig https://martinfowler.com/bliki/StranglerFigApplication.html
- Adam Tornhill — Your Code as a Crime Scene https://pragprog.com/titles/atcrime/your-code-as-a-crime-scene/ · CodeScene https://codescene.com/
