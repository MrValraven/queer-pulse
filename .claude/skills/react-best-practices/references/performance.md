# React Performance (rendering-level)

> **Scope split:** this file owns *React-rendering* performance — re-renders,
> memoization, context churn, list virtualization, concurrent features, the
> React Compiler, and React-Query-level subscription narrowing. For anything
> **past rendering** — Vite bundle size at the app level, NestJS/TypeORM/Postgres,
> hosting cost, the measure-first cross-stack framework — defer to the
> **`performance-and-production-best-practices`** skill. They agree on the core
> discipline: **no optimization without a measurement.**
>
> In QueerPulse specifically: heavy routes/deps (`maplibre-gl`, `visx`, Studio/
> Cinema) are already meant to be `React.lazy`-split off the ~2.77 MB entry chunk
> (see the mobile-engineer notes); the design system already does structural
> sharing via React Query. Reach for the levers below only against a *measured*
> symptom.

---

# React Performance Optimization in Production: A Cited, Myth-Busting Reference

> **The one-sentence version:** Most React "performance work" is misdirected. Before you memoize anything, *measure*, then **fix slow renders before you fix re-renders**, and let composition (not `useMemo`/`useCallback`) do most of the work. With React Compiler 1.0 (shipped Oct 2025) auto-memoizing your components, manual memoization is increasingly a legacy escape hatch — but it is *not* fully dead.

Sources are cited inline. Primary references: React docs (react.dev), Kent C. Dodds ([fix the slow render](https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render)), TkDodo ([tkdodo.eu](https://tkdodo.eu)), Nadia Makarevich ([advanced-react.com](https://www.advanced-react.com/)), and the React Compiler docs.

---

## 0. The correct order of operations (read this first)

The single biggest mistake in React performance is **optimizing re-renders before you've established that re-renders are even the problem.** The correct sequence:

1. **Reproduce and measure** the actual janky interaction with the browser Performance panel and the React Profiler. No number, no optimization.
2. **Fix slow renders** — a single render that takes 40ms is the enemy, regardless of how many times it happens. ([kentcdodds.com](https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render))
3. **Fix slow *commits*** — reflow/layout thrash in the DOM, huge trees being reconciled.
4. **Reduce re-render *count*** — and even here, prefer *architectural* fixes (move state down, pass children) over `memo`.
5. **Only then** reach for `React.memo` / `useMemo` / `useCallback` — surgically, at a measured boundary.
6. **Bundle/load**: code-split, lazy-load heavy deps, kill barrel bloat.
7. **Data layer**: caching, `staleTime`, `select`, kill waterfalls.

Everything below expands these in priority order.

---

## 1. What actually causes performance problems

### 1.1 Two totally different failure modes

React people conflate two unrelated problems under the word "performance":

| | **Slow render** | **Too many re-renders** |
|---|---|---|
| **Symptom** | One interaction is janky/laggy every time | Death by a thousand cuts; profiler is "busy" |
| **Cause** | Expensive work *inside* one render (big loop, heavy layout, sync DOM read) | A component re-runs far more often than needed |
| **Fix** | Make the work cheaper (memoize the *calculation*, defer it, virtualize, move work out of render) | Change *architecture* so the re-render doesn't reach the expensive subtree |
| **Priority** | **FIRST** | Second |

Kent C. Dodds' [Fix the slow render before you fix the re-render](https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render) is the canonical statement: *"if you have a render that's slow, then eventually your render function does need to be called... Always focus on figuring out why your render is slow and optimize that."* His metaphor: reducing re-renders of a slow component without fixing the slowness is "punching yourself in the face every time you blink" instead of not punching yourself.

### 1.2 Render vs reconciliation vs commit

The pipeline is `render -> reconciliation -> commit`:

- **Render** = React *calls your component function* to produce React elements (plain objects). This is usually cheap JS.
- **Reconciliation** = React diffs the new element tree against the old.
- **Commit** = React applies the minimal set of DOM mutations. Layout/paint happens here.

Crucial and widely misunderstood: **a re-render does NOT necessarily touch the DOM.** ([kentcdodds.com](https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render)) If a component re-renders but produces the same output, the commit phase does *nothing* to the DOM. This is why "eliminate re-renders" is so often a waste — you're paying engineers to prevent React from doing cheap object allocation and a diff that produces no DOM work.

### 1.3 Where the time actually goes

Slow renders almost always come from one of:

- **Genuinely expensive computation in render** — sorting/filtering/transforming thousands of items, parsing, formatting dates in a loop, syntax highlighting.
- **Forced synchronous layout ("layout thrashing")** — reading `offsetHeight`/`getBoundingClientRect` and then writing styles in a loop; this is a *commit-phase* cost the Profiler attributes to your component.
- **Rendering too many DOM nodes at once** — a 5,000-row table. The fix is virtualization (section 6), not memoization.
- **Deep, wide trees re-reconciling** — often solved by moving state down (section 4).

Memoization solves *none* of these directly. It only helps if the expensive thing is **repeated unnecessarily**.

---

## 2. The real cost model of re-renders

### 2.1 Re-renders are usually cheap

React was designed so that re-rendering is fast: calling a function, creating objects, and diffing. For a typical component tree, a re-render is sub-millisecond. This is why the React team, TkDodo, and Kent Dodds all push back on reflexive memoization. The official `useMemo` docs state plainly: *"unless you're creating or looping over thousands of objects, it's probably not expensive."* ([react.dev/reference/react/useMemo](https://react.dev/reference/react/useMemo))

### 2.2 What actually triggers a re-render

A component re-renders when:

1. **Its own state changes** (`setState`).
2. **Its parent re-renders** — by default, *all* children re-render when a parent does, regardless of whether props changed. This is the big one people forget.
3. **A context it consumes changes value** (section 5).
4. *(Not a real cause)* — "props changed" is a **myth** as a trigger. A child re-renders because its *parent* re-rendered, not because props changed. Props changing is what `React.memo` *checks* to decide whether to *skip*. Without `memo`, a child re-renders even if every prop is identical. ([Nadia Makarevich, re-renders guide](https://adevnadia.medium.com/react-re-renders-guide-why-react-components-re-render-a4efab132c10))

> **Myth to kill:** "I passed a new object/callback as a prop, so the child re-rendered." False. The child re-rendered because the parent did. The new object only matters if the child is wrapped in `React.memo` — otherwise the reference is irrelevant.

### 2.3 When re-renders actually matter

Re-render *count* becomes a real problem only when:

- A re-render reaches a **genuinely expensive subtree** (big list, heavy chart, complex form) — but then the right fix is usually to *stop the re-render from reaching it* (section 4), not to make the subtree cheaper.
- Re-renders happen at **high frequency** (per keystroke, per scroll pixel, per mousemove, per animation frame) — here even cheap renders add up, and the fixes are `useDeferredValue`/`useTransition` (section 7), state colocation, or moving high-frequency state out of React.
- You're re-rendering a **very large tree** (thousands of components) on every update.

If none of those apply, leave it alone.

---

## 3. `React.memo`, `useMemo`, `useCallback`: exact semantics and the cargo cult

### 3.1 What each one actually does

- **`React.memo(Component)`** — wraps a component so React **skips re-rendering it** when its parent re-renders, *provided all props are referentially equal* (shallow `Object.is` comparison). It does nothing else. It is the only one of the three that stops a re-render.
- **`useMemo(fn, deps)`** — caches the **return value** of `fn` between renders; recomputes only when a dep changes (`Object.is`). Two jobs: (a) skip an expensive recalculation, (b) preserve a stable object/array **reference** so a downstream `memo`/effect/`useMemo` dependency doesn't invalidate.
- **`useCallback(fn, deps)`** — identical to `useMemo(() => fn, deps)`; caches a **function reference**. Its *only* purpose is referential stability.

### 3.2 The referential-equality mental model

`useMemo`/`useCallback` produce nothing observable *by themselves*. Memoizing a value is pointless **unless something downstream compares that reference with `Object.is`**. Only two things do that:

1. **A `React.memo`-wrapped component** receiving the value as a prop.
2. **A dependency array** (`useEffect`, `useMemo`, `useCallback`) that uses the value.

TkDodo's [The Useless useCallback](https://tkdodo.eu/blog/the-useless-use-callback) nails it: *"React compares the props of a memoized component with `Object.is` to check if it can skip rendering that sub-tree."* If the receiving component is **not** memoized, `useCallback`/`useMemo` on the prop is **pure waste** — you pay the caching cost and gain nothing, because the child re-renders anyway (section 2.2).

> **Cargo-cult pattern #1:** Wrapping every inline handler in `useCallback` "for performance." If it's passed to a plain `<button onClick={...}>` or any non-memoized component, it does *nothing but add overhead and a dependency array to maintain*. ([tkdodo.eu](https://tkdodo.eu/blog/the-useless-use-callback))

> **Cargo-cult pattern #2:** `useMemo(() => 5 + 3, [])` or memoizing primitives / trivially cheap values. The cache bookkeeping costs more than the recompute.

### 3.3 The "all-or-nothing" memoization chain

`React.memo` is shallow. **One unstable prop breaks it entirely.** If you memoize a component but pass it *one* fresh object/array/function per render, `memo` compares, sees a difference, and re-renders — you've paid for `memo` *and* the failed comparison for zero benefit. To make `memo` work you must memoize **every** non-primitive prop, and every prop *those* depend on — a fragile chain TkDodo describes as memoization "breaking all the downstream memoizations." This is why manual memoization at scale is so error-prone, and why the Compiler exists.

### 3.4 Correct, non-cargo-cult usage

`useMemo` — official legitimate cases ([react.dev](https://react.dev/reference/react/useMemo)):

```tsx
// (1) The calculation is genuinely expensive AND deps rarely change.
const visibleTodos = useMemo(() => filterTodos(todos, tab), [todos, tab]);
// Measure it first:
console.time('filter'); filterTodos(todos, tab); console.timeEnd('filter'); // >1ms? maybe worth it
```

```tsx
// (2) The value is a prop to a memo() child - stable reference lets memo skip.
const List = memo(function List({ items }: { items: Todo[] }) { /* expensive */ });
function Parent({ todos, tab }: Props) {
  const items = useMemo(() => filterTodos(todos, tab), [todos, tab]); // stable ref
  return <List items={items} />;
}
```

```tsx
// (3) The value feeds another Hook's dependency array.
const options = useMemo(() => ({ a, b }), [a, b]);
useEffect(() => { subscribe(options); }, [options]); // won't re-fire every render
```

`useCallback` — legitimate only when the function is (a) a prop to a `memo` child, (b) an effect dependency, or (c) passed to a custom hook that depends on it. **The `select` in TanStack Query is a genuine `useCallback` win** (see section 8) — TkDodo, author of "The Useless useCallback," explicitly endorses it there.

**Critical caveats from the docs:**
- `useMemo` **never makes the first render faster** — it only skips work on *updates*. ([react.dev](https://react.dev/reference/react/useMemo))
- Measure with **CPU throttling on** (dev measurements lie; StrictMode double-invokes). ([react.dev](https://react.dev/reference/react/useMemo))
- Memoization is a **performance optimization, not a correctness guarantee**. React may throw away the cache (e.g., for off-screen content). If your code breaks without `useMemo`, you have a bug, not a perf issue. ([react.dev](https://react.dev/reference/react/useMemo))

### 3.5 How React Compiler changes the calculus

**React Compiler 1.0 shipped October 2025.** It is a build-time (Babel-based) tool that automatically memoizes components and hooks by analyzing your code and inserting the equivalent of `useMemo`/`useCallback`/`React.memo` where they'd help — no code changes required, provided you follow the [Rules of React](https://react.dev/reference/rules). ([react.dev/learn/react-compiler/introduction](https://react.dev/learn/react-compiler/introduction))

What it auto-memoizes ([react.dev](https://react.dev/learn/react-compiler/introduction)):
1. **Cascading re-renders** — skips re-rendering children when a parent's state change didn't affect them.
2. **Expensive calculations** inside components and hooks.

**Official guidance — what to STILL do manually** (quoted, [react.dev](https://react.dev/learn/react-compiler/introduction)):
> *"For new code, we recommend relying on the compiler for memoization and using `useMemo`/`useCallback` where needed to achieve precise control. For existing code, we recommend either leaving existing memoization in place... or carefully testing before removing."*

So, with the Compiler on, you **still manually memoize** for:

- **Non-component, non-hook functions.** The compiler *only* memoizes React components and hooks. A standalone `expensivelyProcessArray(items)` called at module scope is **not** touched. ([react.dev](https://react.dev/learn/react-compiler/introduction))
- **Interop with external/non-React code** — stable references for effect deps that talk to imperative APIs, subscriptions, `useSyncExternalStore` snapshots, third-party libs.
- **Precise control** where you've measured the compiler's granularity isn't enough.

**Do NOT** reflexively strip existing `useMemo`/`useCallback` when adopting the Compiler — removing them can change compilation output; the Compiler checks whether your manual memo matches its inferred memo and **bails out of optimizing a component if they conflict**. ([react.dev](https://react.dev/learn/react-compiler/introduction))

> **Net:** the Compiler kills *cargo-cult* memoization (the 90% that was noise) and makes `memo`/`useMemo`/`useCallback` mostly obsolete for in-component prop/child stability. It does **not** eliminate the need to think about architecture, external stores, non-hook heavy functions, or the slow-render-first ordering. (QueerPulse note: the Compiler is **not** enabled in this repo today — treat manual memoization discipline as fully in force.)

---

## 4. Composition as a performance tool (usually better than `memo`)

This is the most underused and highest-leverage technique, and it needs **zero memoization**. From Nadia Makarevich's [preventing re-renders guide](https://adevnadia.medium.com/react-re-renders-guide-preventing-unnecessary-re-renders-8a3d2acbdba3).

### 4.1 Move state down (colocate)

If state is used by only a small part of a big tree, **push the state into a small child** so its updates don't re-render siblings.

```tsx
// BAD: Modal open/close state at the top re-renders <VeryExpensiveDashboard/> on every toggle
function Page() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open</button>
      {isOpen && <Modal onClose={() => setIsOpen(false)} />}
      <VeryExpensiveDashboard /> {/* re-renders every toggle for no reason */}
    </>
  );
}

// GOOD: Isolate the state in a tiny component. Dashboard never sees the toggle.
function OpenModalButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open</button>
      {isOpen && <Modal onClose={() => setIsOpen(false)} />}
    </>
  );
}
function Page() {
  return (
    <>
      <OpenModalButton />
      <VeryExpensiveDashboard /> {/* untouched by modal state */}
    </>
  );
}
```

The mental model: **state changes re-render the component that owns the state and everything below it.** Shrink the "everything below it." ([adevnadia](https://adevnadia.medium.com/react-re-renders-guide-preventing-unnecessary-re-renders-8a3d2acbdba3))

### 4.2 Children as props / "lift content up"

When state must live high (e.g. an `onMouseMove` on a wrapper that updates fast-changing state), **pass the expensive tree as `children`** so it's created *outside* the re-rendering component and is not re-created by the state change.

```tsx
// BAD: Every mousemove re-renders <ExpensiveTree/> - it's in the same render as the state.
function MovingContainer() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <div onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
         style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
      <ExpensiveTree /> {/* re-renders on every pixel */}
    </div>
  );
}

// GOOD: State lives in a wrapper; the expensive tree is a *prop* (children), created by the parent ONCE.
function MovingContainer({ children }: { children: React.ReactNode }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <div onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
         style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
      {children}
    </div>
  );
}
function App() {
  return (
    <MovingContainer>
      <ExpensiveTree /> {/* created in App, which doesn't re-render -> element identity stable -> skipped */}
    </MovingContainer>
  );
}
```

Why it works: `children` is just a prop holding an already-created React element **object**. When `MovingContainer` re-renders from `setPos`, it does *not* re-create that object — it reuses the same one it received. React sees the same element reference and bails on re-rendering that subtree. This is `React.memo`-grade skipping with **no `memo`, no `useMemo`, no deps to maintain.** ([adevnadia](https://adevnadia.medium.com/react-re-renders-guide-preventing-unnecessary-re-renders-8a3d2acbdba3))

### 4.3 The related bug: never define components inside components

```tsx
// BAD: New component identity every render -> React unmounts + remounts -> state loss + churn.
function Parent() {
  function Row() { return <div/>; } // new function each render
  return <Row />;
}
```

Defining a component in render creates a *new type* each render, forcing full remount (and destroying subtree state). Hoist it to module scope. ([adevnadia](https://adevnadia.medium.com/react-re-renders-guide-preventing-unnecessary-re-renders-8a3d2acbdba3))

---

## 5. Context performance

### 5.1 Why context causes wide re-renders

**Every component consuming a context re-renders whenever the context *value* changes** — via `Object.is` on the value — regardless of whether that component reads the part that changed. `React.memo` does **not** stop a context-driven re-render; a memoized component still re-renders if a context it consumes updates. This is context's fundamental limitation as a state-distribution mechanism. ([marmelab](https://marmelab.com/blog/2024/10/16/usecontextselector-a-faster-usecontext-for-react.html))

### 5.2 The classic bug: unstable provider value

```tsx
// BAD: New object every render -> ALL consumers re-render every time Provider's parent renders.
<UserContext.Provider value={{ user, setUser }}>

// GOOD: Memoize the value.
const value = useMemo(() => ({ user, setUser }), [user]);
<UserContext.Provider value={value}>
```

If the provider passes a fresh object literal, `Object.is` is always false and every consumer re-renders on every provider render. Memoize the value (this is a *legitimate* `useMemo`; the Compiler also handles it). Still — memoizing the value only prevents *extra* re-renders; consumers still re-render whenever the value *genuinely* changes.

### 5.3 Split contexts: state vs dispatch

`dispatch` from `useReducer` (and `setState` from `useState`) is **guaranteed stable** across renders. Split it into its own context so components that only dispatch never re-render on state changes:

```tsx
const StateContext = createContext<State>(null!);
const DispatchContext = createContext<React.Dispatch<Action>>(null!);

function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
}
// A button that only dispatches consumes DispatchContext -> never re-renders on state change.
```

You can also **split state by domain** (a `TodosContext` and a `ProfileContext`) so a todos update doesn't re-render profile consumers. ([nielskrijger](https://www.nielskrijger.com/posts/2021-02-16/use-reducer-and-use-context/))

### 5.4 Selector patterns (context can't do this natively)

Native `useContext` has **no selector** — you get the whole value or nothing. Options:

- **`use-context-selector`** (Daishi Kato) — `useContextSelector(ctx, v => v.user.name)` re-renders only when the *selected slice* changes. ([marmelab](https://marmelab.com/blog/2024/10/16/usecontextselector-a-faster-usecontext-for-react.html))
- **`useSyncExternalStore`** roll-your-own — hold state in a mutable ref + subscription set; expose a `useStore(selector)` that re-renders only when the selected snapshot changes (section 5.5).

### 5.5 `useSyncExternalStore` — the selector-context primitive

`useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)` is React's official bridge to state stored *outside* React ([react.dev](https://react.dev/reference/react/useSyncExternalStore)). It's what Zustand, Redux, Jotai, and Valtio use under the hood.

- `subscribe(cb)` — registers `cb`, returns an unsubscribe. **Define it at module scope** (or `useCallback`) so it doesn't resubscribe every render.
- `getSnapshot()` — returns the current value; **must return a referentially-stable value (`Object.is`) when nothing changed**, or you get an infinite render loop. Never return a fresh object from `getSnapshot`. ([react.dev](https://react.dev/reference/react/useSyncExternalStore))

This is how you build a selector store: `getSnapshot` returns `selector(store.state)`, and a component only re-renders when *its* selected slice changes.

### 5.6 When to reach for an external store (Zustand / Jotai / Redux Toolkit)

Reach for an external store when **any** of these is true:

- You have **frequent updates** to shared state consumed by many components, and context's "every consumer re-renders" cost shows up in the Profiler. Selector-based stores re-render only the ~handful of components whose selected slice changed. ([adamhinckley](https://www.adamhinckley.com/articles/zustand-vs-context))
- You need **selector subscriptions** without ceremony.
- State updates originate **outside the React tree** (websockets, event emitters, `localStorage`, imperative SDKs).

Pick:
- **Zustand** — minimal, selector-first, `useStore(s => s.slice)`, no provider needed. Best default for "context is re-rendering too much."
- **Jotai** — atomic model; great when state is naturally decomposed into independent atoms.
- **Redux Toolkit** — when you need devtools time-travel, middleware, strict action/reducer discipline, large-team conventions.

**Keep context for** low-frequency, wide-distribution values: theme, locale, current user, auth — things that change rarely. Context is a *dependency-injection* tool, not a high-frequency state-management tool. (This is exactly how QueerPulse uses it — see `useAuth`/`useTheme`/`useTranslation` in the map.)

> **Myth to kill:** "Context is a state manager." Context *distributes* a value; it has no update-batching or selector story. For hot state, that's the wrong tool.

---

## 6. List performance

### 6.1 Stable keys (correctness *and* performance)

- Use a **stable, unique** key (an ID), never the array **index** for lists that reorder/insert/delete. Index keys make React reuse the wrong DOM node -> wrong state on wrong row, plus extra work. Index keys are fine only for static, append-only, never-reordered lists.
- Never use `Math.random()`/`Date.now()` as keys — a new key every render forces full remount of every row.
- Keys are scoped to siblings; they don't need to be globally unique.

### 6.2 Windowing / virtualization

Rendering thousands of rows creates thousands of DOM nodes -> slow commit, huge memory, janky scroll. **Virtualization renders only the visible window** (+ small overscan) and absolutely-positions them inside a full-height spacer. ([TanStack Virtual](https://tanstack.com/virtual/latest/docs/introduction))

**TanStack Virtual** (headless, framework-agnostic, no markup imposed):

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function Rows({ rows }: { rows: Row[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,   // estimated row height in px
    overscan: 8,              // render a few extra above/below for smooth scroll
  });

  return (
    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((item) => (
          <div
            key={rows[item.index].id}
            ref={virtualizer.measureElement}   // dynamic measurement for variable heights
            data-index={item.index}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%',
                     transform: `translateY(${item.start}px)` }}
          >
            {rows[item.index].label}
          </div>
        ))}
      </div>
    </div>
  );
}
```

Key APIs: `estimateSize` (initial guess), `measureElement` (real measurement for variable-height rows), `overscan` (buffer rows to avoid blank flashes on fast scroll). ([tanstack.com/virtual](https://tanstack.com/virtual/latest/docs/introduction)) `react-window` is the lighter, more opinionated alternative.

### 6.3 When virtualization is (and isn't) worth it

**Worth it when:** hundreds-thousands of rows, or rich rows (each row is expensive), or a long scrollable feed. The win is fewer DOM nodes -> faster commit + lower memory.

**Not worth it / actively harmful when:**
- Small lists (~50-100 simple rows). The virtualizer's scroll math and absolute positioning add complexity and can *hurt*.
- You need the whole list in the DOM for **Ctrl-F / find-in-page, SEO, or accessibility tree** completeness. Mitigate with proper ARIA and SSR of a non-virtualized first page.
- Complex variable heights with images loading async -> measurement jank; needs care with `measureElement` + `ResizeObserver`.

### 6.4 Pagination / infinite scroll

For very large data sets, don't fetch everything. Use **`useInfiniteQuery`** (TanStack Query) for cursor/offset paging, and **combine with virtualization** for the best result: page the network *and* window the DOM.

---

## 7. Concurrent features for responsiveness

These don't make work *faster* — they keep the UI *responsive* by prioritizing/deferring work. React 18+.

### 7.1 `useTransition` — mark updates as non-urgent

```tsx
const [isPending, startTransition] = useTransition();

function onChange(e: React.ChangeEvent<HTMLInputElement>) {
  setQuery(e.target.value);              // urgent: input stays responsive
  startTransition(() => {
    setResults(expensiveFilter(e.target.value)); // non-urgent, interruptible
  });
}
// isPending -> show a subtle spinner without blocking typing.
```

Updates inside `startTransition` are **interruptible**: if the user types again, React abandons the in-progress render and restarts with the newest input. Use it for tab switches, filtering, expensive state updates driven by user input.

### 7.2 `useDeferredValue` — defer a *value*

```tsx
function App() {
  const [text, setText] = useState('');
  const deferredText = useDeferredValue(text);
  return (
    <>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <SlowList text={deferredText} />
    </>
  );
}
const SlowList = memo(function SlowList({ text }: { text: string }) { /* heavy */ });
```

`useDeferredValue` renders once immediately with the *old* value (keeping input snappy), then re-renders in the background with the new value; a newer update abandons the in-flight background render. ([react.dev](https://react.dev/reference/react/useDeferredValue))

**Two non-negotiable caveats** ([react.dev](https://react.dev/reference/react/useDeferredValue)):
1. **The deferred child MUST be wrapped in `memo`** (or otherwise skip re-render). Otherwise the parent's immediate re-render re-renders the child anyway and you gain nothing.
2. Pass **primitives or objects created outside render** as the deferred value.

**`useDeferredValue` vs debounce/throttle** — deferred is **device-aware** and **interruptible**, with **no fixed delay**. Debounce imposes a fixed wait for everyone. Deferred is for *rendering*; debounce/throttle is still right for *network requests* (QueerPulse has `useDebouncedValue` for exactly that). ([react.dev](https://react.dev/reference/react/useDeferredValue))

**`useTransition` vs `useDeferredValue`:** use `useTransition` when *you own the state setter*; use `useDeferredValue` when the value comes *from props/above* and you can't wrap the setter. ([react.dev](https://react.dev/reference/react/useDeferredValue))

### 7.3 Suspense for loading orchestration

`<Suspense fallback={...}>` lets you show fallbacks declaratively, coordinate multiple loading boundaries, avoid layout-shift "popcorn," and — with `useDeferredValue` — keep **stale content visible** instead of flashing a spinner. Place boundaries thoughtfully: too high = whole page blanks; too low = spinner confetti.

---

## 8. Data-layer performance with TanStack Query

### 8.1 Caching + `staleTime` — the biggest real-world win

The default `staleTime: 0` marks data stale immediately, so Query refetches on mount/focus/reconnect. For data that doesn't change every second, **raise `staleTime`** to serve from cache and eliminate redundant network round-trips:

```tsx
useQuery({ queryKey: ['user', id], queryFn, staleTime: 5 * 60_000 }); // fresh for 5 min -> no refetch
```

`gcTime` (formerly `cacheTime`) controls how long *unused* data stays in cache. `staleTime` is your primary knob for "stop refetching things that haven't changed."

### 8.2 Avoiding waterfalls

Sequential dependent queries create request waterfalls. Fixes:
- **Parallelize independent queries** with `useQueries` or just multiple `useQuery` calls (they run concurrently).
- **Prefetch** on hover/route-intent with `queryClient.prefetchQuery`.
- **Hoist queries** so a child's query isn't gated behind a parent's finished render.

### 8.3 `select` — narrow re-renders at the data layer

`select` transforms/narrows query data so a component **re-renders only when the selected slice changes**, even if the rest of the response updates ([tkdodo.eu/blog/react-query-selectors-supercharged](https://tkdodo.eu/blog/react-query-selectors-supercharged)):

```tsx
function ProductTitle({ id }: { id: string }) {
  const { data: title } = useQuery({
    ...productOptions(id),
    select: (data) => data.title, // re-renders only when title changes
  });
  return <h1>{title}</h1>;
}
```

`select` runs on **every render** because an inline function has a new identity each time. If the transform is **expensive**, stabilize it — TkDodo (author of "The Useless useCallback"!) explicitly endorses `useCallback` here, one of its best legitimate uses:

```tsx
const { data } = useQuery({
  ...productListOptions(filters),
  select: useCallback(
    (data: Product[]) => expensiveTransform(data, minRating),
    [minRating],
  ),
});
```

### 8.4 Structural sharing

TanStack Query does **structural sharing** by default: after a refetch, unchanged parts of the response keep their **previous references**. So a component reading `data.user.name` won't re-render if only `data.posts` changed. ([tkdodo.eu](https://tkdodo.eu/blog/react-query-selectors-supercharged)) You rarely need to fight referential stability manually with Query.

---

## 9. Bundle & load performance

Render perf is moot if the user waits 8 seconds for a 3 MB JS bundle. On real devices, **bundle size and parse/execute time often dominate LCP, INP, TTI.** (For the app-level bundle budget and hosting-cost view, this is where `performance-and-production-best-practices` takes over.)

### 9.1 Route-based code splitting with `React.lazy` + Suspense

```tsx
import { lazy, Suspense } from 'react';
const Dashboard = lazy(() => import('./routes/Dashboard'));   // module scope, NOT inside a component

<Routes>
  <Route path="/dashboard" element={
    <Suspense fallback={<PageSkeleton />}><Dashboard /></Suspense>
  } />
</Routes>
```

**Declare `lazy` components at module scope** — defining them inside a component creates a new lazy type each render, remounting and losing state. ([react.dev/reference/react/lazy](https://react.dev/reference/react/lazy)) Route boundaries are the highest-ROI split points.

### 9.2 Dynamic import of heavy dependencies

Maps (MapLibre/Mapbox/Leaflet), charts (Recharts/D3/visx), rich-text/code editors, PDF viewers — hundreds of KB each. **Never** ship them in the entry chunk. Lazy-load the *component that uses them*. (QueerPulse already does this for `maplibre-gl`/`visx`/Studio/Cinema — keep new heavy deps off the entry chunk the same way.)

### 9.3 Preloading (hide the latency)

Start the import on hover/focus/route-intent, before the click:

```tsx
const load = () => import('./routes/Dashboard');
const Dashboard = lazy(load);
<Link to="/dashboard" onMouseEnter={() => load()} onFocus={() => load()}>Dashboard</Link>
// import() is cached, so the click's lazy render reuses the in-flight/finished promise.
```

React 19 adds `preload`/`preinit` resource APIs.

### 9.4 Tree-shaking and the barrel-file trap

- **Barrel files** (`index.ts` re-exporting an entire folder) are a top cause of bundle bloat and slow dev/build: importing one symbol can drag in the whole barrel's graph. Import from the **specific file** in hot paths; mark packages `"sideEffects": false` where true. (QueerPulse's `shared/components/ui/index.ts` is a deliberate public-API barrel — fine at the edge; don't add reflexive `index.ts` to every feature folder.)
- Prefer **named ESM imports** from tree-shakeable libraries. Import icons individually.

### 9.5 Analyze before you cut

Use **`rollup-plugin-visualizer`** (Vite) to see actual chunk composition. Optimize the biggest boxes first — same measure-first discipline as render perf.

---

## 10. Measurement: diagnose before you optimize

**No optimization without a measurement.**

### 10.1 React DevTools Profiler

- Record an interaction; read the **flamegraph** and the **ranked chart** (slowest components). ([kentcdodds.com](https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render))
- **"Why did this render?"** — enable *Record why each component rendered*: it tells you if a render was due to props, state, hooks, or parent.
- Enable **"Highlight updates when components render"** to *see* which components re-render on each interaction.

### 10.2 The `<Profiler>` component (programmatic)

```tsx
<Profiler id="Sidebar" onRender={(id, phase, actualDuration, baseDuration) => {
  if (actualDuration > 16) logSlowRender(id, phase, actualDuration);
}}>
  <Sidebar />
</Profiler>
```

`actualDuration` vs `baseDuration` tells you how much memoization is *actually* saving.

### 10.3 Chrome Performance panel

Ground truth for the whole picture: JS execution, **long tasks**, **layout thrash**, paint. **Always profile with CPU throttling (4-6x) and Network throttling on** — your laptop lies about real users' phones. ([kentcdodds.com](https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render))

### 10.4 `why-did-you-render`

Dev-only; console-logs exactly why a component re-rendered, including deeply-equal-but-referentially-different props (the classic unnecessary-re-render signature). Strip in prod.

### 10.5 Real-user metrics

Track **INP** (interaction responsiveness), **LCP**, **CLS** via `web-vitals` / RUM. INP regressions map directly to slow renders and blocking updates that section 7's concurrent features address.

---

## 11. The prioritized decision framework: "before you memoize, do X, Y, Z"

Follow in order. Do not skip ahead.

**Step 0 — Reproduce & measure.** No symptom, no problem. Profile it (throttled).

**Step 1 — Slow render or slow commit?** One interaction always janky -> **slow render/commit.** Make the computation cheaper, move it out of render, memoize the *calculation* (not the component), fix layout thrash, or virtualize a huge list. **80% of real wins are here.**

**Step 2 — Is it a load problem, not a render problem?** If the pain is initial load / route transitions, go to section 9: code-split routes, lazy-load heavy deps, analyze the bundle.

**Step 3 — Fix re-renders architecturally, without memoization.** Move state down (4.1); pass expensive trees as `children` (4.2); colocate; fix unstable context values and split context (5); kill index/random keys (6.1).

**Step 4 — Fix the data layer.** Raise `staleTime`, add `select`, parallelize/prefetch (8).

**Step 5 — Reach for concurrency** where the UI must stay responsive during expensive updates: `useTransition`/`useDeferredValue` (7).

**Step 6 — NOW consider `React.memo` / `useMemo` / `useCallback`.** Only at a **measured** boundary. Remember: to make `memo` work you must stabilize **every** non-primitive prop (3.3). Measure again to confirm it helped.

**Step 7 — Adopt the React Compiler** (when the repo turns it on) so you stop hand-writing Step-6 memoization. Keep manual memo only for non-hook heavy functions, external-store interop, and measured precision (3.5).

### Cargo-cult advice to actively reject

- "Wrap every callback in `useCallback` and every value in `useMemo`." — Waste unless it feeds a `memo` child or a dep array.
- "`React.memo` every component." — Comparison cost, breaks on one unstable prop, doesn't stop context/state re-renders. Blind = net negative.
- "Re-renders are bugs / must be eliminated." — Most are cheap and produce **no DOM work**.
- "Props changed, so the child re-rendered." — No; the *parent* re-rendered.
- "Context is our state manager." — Fine for low-frequency DI; wrong for hot state.
- "`useMemo` makes the first render faster." — It never does; updates only.
- "Virtualize every list." — Overhead + breaks find-in-page/SEO/a11y on small lists.
- "Optimize based on dev-mode timings." — Dev double-renders and skips prod minification.

---

## 12. TL;DR mental models

1. **Slow render != too many re-renders.** Fix slow renders first; most re-renders are cheap and do no DOM work.
2. **A child re-renders because its parent did**, not because props changed. Props only matter at a `memo` boundary.
3. **`useMemo`/`useCallback` are inert unless a `memo` child or a dependency array compares the reference.**
4. **Composition beats memoization**: move state down; pass expensive trees as `children`. Zero deps to maintain.
5. **Context re-renders every consumer**; split state/dispatch, memoize the value, or use a selector store.
6. **`useDeferredValue`/`useTransition`** keep the UI responsive; the deferred child must be `memo`.
7. **`staleTime` + `select` + structural sharing** in TanStack Query remove more re-renders and requests than any memo.
8. **Bundle/load perf often dominates.** Route-split, lazy-load heavy deps, analyze, preload on intent.
9. **React Compiler 1.0 auto-memoizes** components/hooks — keep manual memo only for non-hook functions, external interop, measured precision.
10. **Measure before and after, throttled.** No number, no optimization.

---

### Primary sources

- Kent C. Dodds — *Fix the slow render before you fix the re-render*: https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render
- Nadia Makarevich — *why components re-render*: https://adevnadia.medium.com/react-re-renders-guide-why-react-components-re-render-a4efab132c10 · *preventing unnecessary re-renders*: https://adevnadia.medium.com/react-re-renders-guide-preventing-unnecessary-re-renders-8a3d2acbdba3
- TkDodo — *The Useless useCallback*: https://tkdodo.eu/blog/the-useless-use-callback · *React Query Selectors, Supercharged*: https://tkdodo.eu/blog/react-query-selectors-supercharged
- React docs — *React Compiler*: https://react.dev/learn/react-compiler/introduction · *useMemo*: https://react.dev/reference/react/useMemo · *useDeferredValue*: https://react.dev/reference/react/useDeferredValue · *useSyncExternalStore*: https://react.dev/reference/react/useSyncExternalStore · *lazy*: https://react.dev/reference/react/lazy
- TanStack Virtual: https://tanstack.com/virtual/latest/docs/introduction
- Context selector — Marmelab: https://marmelab.com/blog/2024/10/16/usecontextselector-a-faster-usecontext-for-react.html · Niels Krijger: https://www.nielskrijger.com/posts/2021-02-16/use-reducer-and-use-context/
- Zustand vs Context: https://www.adamhinckley.com/articles/zustand-vs-context
