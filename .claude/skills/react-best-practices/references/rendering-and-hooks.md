# Rendering & Hooks (the reactivity model + React 19)

> **QueerPulse context:** this repo is a **Vite client-only SPA** on **React 19.2**.
> Everything in Parts 1-7 applies directly. Part 8 lists React 19 features that
> are Server-Component/SSR-only — **ignore those here** (there's no server). The
> repo does **not** currently enable the React Compiler, so the manual-memoization
> discipline in Part 5 is fully in force. The enforced lint rules
> (`react-hooks` recommended, `exhaustive-deps`, `no-floating-promises`) are the
> automated half of this file — see `queerpulse-react-map.md` section 4.

---

# Modern React: Rendering, Reactivity & React 19 — A Cited Reference

A dense, source-backed reference on how React renders and re-renders, how hooks behave and misbehave, and what React 19 (Dec 2024) plus the React Compiler add. Every non-obvious claim links to an authoritative source (mostly `react.dev`, plus TkDodo). Written for a **Vite client-only SPA** audience, so Server-Component-only features are explicitly flagged as _not applicable_.

> Version context: **React 19.0** shipped **December 5, 2024** ([React 19 blog](https://react.dev/blog/2024/12/05/react-19)). The **React Compiler reached a stable 1.0** in 2025 ([React Compiler intro](https://react.dev/learn/react-compiler/introduction)). Where advice changed between versions, it is flagged inline.

---

## Part 1 — The rendering model

### 1.1 Trigger -> Render -> Commit -> Paint

React puts UI on screen in three ordered steps, then the browser paints ([Render and Commit](https://react.dev/learn/render-and-commit)):

1. **Trigger** a render. There are exactly two triggers:
   - **Initial render** — `createRoot(domNode).render(<App />)`.
   - **A state update** — calling a `set` function queues a re-render. "When a component's state (or an ancestor's state) changes, React automatically queues a re-render." ([Render and Commit](https://react.dev/learn/render-and-commit))
2. **Render** — React _calls your components_ to figure out what to display. On initial render it calls the root; on re-render it calls the component whose state changed. Rendering is **recursive**: if a component returns another component, React renders that next, all the way down ([Render and Commit](https://react.dev/learn/render-and-commit)).
3. **Commit** — React mutates the DOM. On initial render it uses `appendChild()` for everything; on re-render it applies **only the minimal changes** needed to match the latest render output. "React only changes the DOM nodes if there's a difference between renders." ([Render and Commit](https://react.dev/learn/render-and-commit))
4. **Paint** — after the commit, the browser repaints.

Key mental model consequence: **"Rendering" is React calling your function, not the browser drawing pixels.** A component can render many times without any DOM change if its output is identical.

### 1.2 Render purity — the non-negotiable rule

> "Rendering must always be a pure calculation." ([Render and Commit](https://react.dev/learn/render-and-commit)) / ([Keeping Components Pure](https://react.dev/learn/keeping-components-pure))

Purity means two things:

- **Same inputs -> same output.** Given the same props, state, and context, a component returns the same JSX.
- **It minds its own business.** It must not mutate any object or variable that existed _before_ rendering (props, state, module-level values). Compute new values; never mutate inputs.

React runs component functions (and `useState`/`useMemo`/`useReducer` initializers and updaters) **twice in development Strict Mode** specifically to surface impurity ([Keeping Components Pure](https://react.dev/learn/keeping-components-pure), [useState caveats](https://react.dev/reference/react/useState)). If double-invocation changes behavior, the function is impure.

What _is_ allowed: mutating objects you created **during this render** ("local mutation"), and side effects triggered by user interaction (in event handlers) or by the component being displayed (in Effects) — not during render itself.

### 1.3 What actually triggers a re-render

A component re-renders when any of the following happens:

1. **Its own state changes** via a `set`/`dispatch` function — _unless_ the new value is `Object.is`-equal to the current one, in which case "React will skip re-rendering the component and its children." ([useState](https://react.dev/reference/react/useState))
2. **Its parent re-renders.** By default a parent re-render re-renders _all_ descendants, regardless of whether their props changed. This is the default and is usually fine; `React.memo` is the opt-out (see section 5.3).
3. **A context it consumes changes.** Any component reading a context via `useContext`/`use(Context)` re-renders when the nearest matching provider's `value` changes by `Object.is` — even if `React.memo` sits in between (context "punches through" memo).
4. **A subscribed external store changes** (via `useSyncExternalStore`, see section 7.3).

> Common misconception correction: **props changing does not, by itself, trigger a render.** Props change _because the parent re-rendered_; it is the parent's render that cascades down. `React.memo` breaks that cascade by comparing props.

### 1.4 Reconciliation and how keys drive it

When React re-renders, it **diffs the new element tree against the previous one** to decide what to keep, update, or throw away. The matching is by **position in the tree and element type** — _not_ by JSX source location.

- **Same component type at the same tree position -> state is preserved.** "React keeps the state around for as long as you render the same component at the same position in the tree." ([Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state))
- **Different type at the same position -> the subtree (and its state) is destroyed and rebuilt.**
- "It's the position in the UI tree — not in the JSX markup — that matters to React." Two different `if`/`else` branches that both render `<Counter />` as the first child of the same `<div>` are the _same position_, so state persists across the toggle ([Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)).

**Keys override position-based identity.** A `key` tells React "this is the same logical instance" (in lists) or "this is a _different_ instance, reset it" (for a single element):

```tsx
// Lists: stable identity across reorders/insertions
{
  contacts.map((contact) => <Contact key={contact.id} contact={contact} />);
}

// Single element: force a full state reset when the identity changes
<Chat key={selectedContact.id} contact={selectedContact} />;
```

Same component + **different key** at the same position = **state reset** ([Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)). This is the idiomatic way to "reset a form when the selected item changes" (see section 4.3).

Key rules:

- Keys must be **unique among siblings** and **stable across renders**.
- **Do not use array index as key** for lists that can reorder/insert/delete — it ties state to position rather than to the item, causing state to attach to the wrong row.
- Do not generate keys during render (`key={Math.random()}`) — it destroys and recreates every item every render.

**Anti-pattern that silently resets state:** defining a component _inside_ another component. "Every render creates a new function," so React sees a different type each time and resets state ([Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)). Define components at module top level.

---

## Part 2 — Hooks correctness

### 2.1 The Rules of Hooks, and _why_

Two rules ([Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)):

1. **Only call hooks at the top level.** Never inside conditions, loops, nested functions, `try/catch/finally`, or after an early `return`.
2. **Only call hooks from React functions** — function components or custom hooks — never from plain JS functions, class components, or event handlers.

**Why:** React does not identify hooks by name. It identifies them by **call order (index) within the component**. On every render, the 1st `useState` maps to state slot 0, the 2nd to slot 1, and so on. If a hook is called conditionally, the order shifts between renders and React associates state with the wrong slot, corrupting it. "React relies on the call order of Hooks to associate hook state with the correct component instance." ([Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks))

The `eslint-plugin-react-hooks` `rules-of-hooks` and `exhaustive-deps` lints enforce this. Treat lint errors as correctness bugs, not style noise.

### 2.2 `useState` vs `useReducer`

Both hold local state and both trigger re-renders. Choose by **how the next state is computed**:

- `useState` — independent values, simple transitions.
- `useReducer` — when the next state depends on multiple sub-values, when many event handlers update the same state in related ways, or when you want update logic centralized and testable as a pure `(state, action) => state` function.

Both accept **functional/updater forms** and both support **lazy initialization**.

### 2.3 Functional updates — why they matter

`set` functions **batch** within an event handler; React updates the screen only after all handlers run ([useState — batching](https://react.dev/reference/react/useState)). Passing a _value_ captures the value at render time, so multiple updates in one handler clobber each other. Passing an _updater function_ queues transformations that each receive the latest queued state:

```tsx
// BAD: age ends at 43 - each call reads the same render-time `age`
setAge(age + 1);
setAge(age + 1);
setAge(age + 1);

// GOOD: age ends at 45 - each updater gets the previous queued result
setAge((prev) => prev + 1);
setAge((prev) => prev + 1);
setAge((prev) => prev + 1);
```

([useState](https://react.dev/reference/react/useState)). Updaters must be **pure**; Strict Mode calls them twice in dev to catch impurity ([useState caveats](https://react.dev/reference/react/useState)). A practical bonus: an updater `(prev) => ...` reads current state _without_ needing that state in a dependency array — useful for effects/callbacks (see section 2.7). (This is exactly how `useChipSet`'s `toggle` works in this repo.)

### 2.4 Lazy initialization

The initial argument to `useState` is only used on the **first** render, but any expression you write there still _executes every render_. Pass an **initializer function** to defer the work:

```tsx
// BAD: createInitialTodos() runs on every render (result ignored after first)
const [todos, setTodos] = useState(createInitialTodos());

// GOOD: Function is called only on the first render
const [todos, setTodos] = useState(createInitialTodos);
```

"React saves the initial state once and ignores it on the next renders." In Strict Mode the initializer runs twice in dev to check purity ([useState](https://react.dev/reference/react/useState)). Same pattern applies to `useReducer`'s third `init` argument. (See `useChipSet`: `useState<Set<string>>(() => new Set(initial))`.)

### 2.5 `useRef` — mutable box that doesn't render

`useRef(initial)` returns a stable object `{ current }` that **persists across renders and whose mutation does _not_ trigger a re-render** ([useRef](https://react.dev/reference/react/useRef)).

Two canonical uses:

- **Values that shouldn't cause renders** — timer/interval IDs, previous values, "has this run" flags, latest-callback boxes.
- **DOM access** — `<input ref={inputRef} />`, then `inputRef.current.focus()` in a handler.

Caveat: **don't read or write `ref.current` during render** (except lazy init). "Do not write _or read_ `ref.current` during rendering, except for initialization. This makes your component's behavior unpredictable." ([useRef](https://react.dev/reference/react/useRef)) Reads/writes belong in event handlers and effects. Rule of thumb: **state = data that should be on screen; ref = everything else you need to remember but that shouldn't drive the UI.**

### 2.6 `useEffect` vs `useLayoutEffect`

- **`useEffect`** runs **after** the browser paints. Default choice for synchronizing with external systems (subscriptions, network, non-React widgets, logging).
- **`useLayoutEffect`** runs **synchronously after DOM mutations but _before_ paint**. Use it only to **measure layout and re-render before the user sees anything** (e.g., tooltip that must flip above/below based on measured height). "The code inside `useLayoutEffect` and all state updates scheduled from it block the browser from repainting the screen. When used excessively, this makes your app slow. When possible, prefer `useEffect`." ([useLayoutEffect](https://react.dev/reference/react/useLayoutEffect))

```tsx
useLayoutEffect(() => {
  const { height } = ref.current!.getBoundingClientRect();
  setTooltipHeight(height); // re-render before paint -> no flicker
}, []);
```

### 2.7 The effect dependency model & stale closures

An Effect closes over the props/state from the render that created it. If dependencies are wrong, it captures **stale** values.

The dependency array must contain **every reactive value the effect reads** — props, state, and anything derived from them ([Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects)). The `exhaustive-deps` lint computes this for you.

**Think of an Effect as start/stop synchronization, not mount/unmount.** "An Effect describes how to synchronize an external system to the current props and state." Each dependency change = _stop the old sync (cleanup), start a new one_:

```tsx
function ChatRoom({ roomId }: { roomId: string }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect(); // start syncing
    return () => connection.disconnect(); // stop syncing
  }, [roomId]); // re-sync whenever roomId changes
}
```

"Always focus on a single start/stop cycle at a time. It shouldn't matter whether a component is mounting, updating, or unmounting." ([Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects))

### 2.8 Breaking dependency loops — correctly (never lie to the linter)

Suppressing `exhaustive-deps` hides real bugs. Fix the _reason_ a dependency changes instead ([Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects)):

1. **Move non-reactive values _into_ the Effect.** A `const serverUrl = '...'` created inside the effect body isn't a dependency.
2. **Move constants _outside_ the component.** Module-level values never change, so they're not reactive.
3. **Use functional state updates** to avoid depending on current state: `setCount(c => c + 1)` instead of `setCount(count + 1)` removes `count` from deps.
4. **Split unrelated effects.** One effect per independent synchronization concern.
5. **Memoize objects/functions** that you genuinely must depend on (or hoist them), so their identity is stable. (This is why `useWizardForm` wraps its navigation callbacks in `useCallback` — they're consumed as stable deps.)
6. **Extract non-reactive logic into an Effect Event** (section 2.9) when the effect must _read_ the latest value but must _not_ re-run when it changes.

The one thing you must not do: add `// eslint-disable-next-line react-hooks/exhaustive-deps` to make an empty `[]` "work." That guarantees stale closures.

### 2.9 Effect Events (`useEffectEvent`) — experimental

Sometimes an effect needs the _latest_ value of a reactive prop without re-running when it changes. Example: on socket `connected`, show a toast using the current `theme` — but you don't want to reconnect when `theme` changes.

```tsx
import {
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
} from "react";

function ChatRoom({ roomId, theme }: { roomId: string; theme: string }) {
  const onConnected = useEffectEvent(() => {
    showNotification("Connected!", theme); // reads latest theme, non-reactive
  });

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on("connected", () => onConnected());
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // theme is NOT a dependency
}
```

"Logic inside Effects is reactive... Logic inside event handlers is not reactive." Effect Events give you a non-reactive escape hatch that still reads fresh values ([Separating Events from Effects](https://react.dev/learn/separating-events-from-effects)).

**Stability & restrictions:** `useEffectEvent` is **experimental** — the real export is `experimental_useEffectEvent` (not stable in React 19.0; do not rely on it in production without pinning). Rules: only call Effect Events **from inside Effects**, declare them next to the effect that uses them, and **never pass them to other components or hooks** ([Separating Events from Effects](https://react.dev/learn/separating-events-from-effects)).

---

## Part 3 — "You Might Not Need an Effect"

The single highest-leverage correctness idea in modern React. **Effects are an escape hatch for synchronizing with external systems — not a general reaction mechanism.** Two headline rules ([You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)):

> **"You don't need Effects to transform data for rendering."**
> **"You don't need Effects to handle user events."**

Guiding question: _why does this code need to run?_ If it runs **because the component was displayed**, an Effect is right. If it runs **because the user did something**, it belongs in an event handler ([You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)).

### 3.1 Derive, don't sync

Anything computable from existing props/state should be **calculated during render**, not stored in state and synced by an effect:

```tsx
// BAD: redundant state + effect (extra cascading render)
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(firstName + " " + lastName);
}, [firstName, lastName]);

// GOOD: derive during render
const fullName = firstName + " " + lastName;
```

"When something can be calculated from the existing props or state, don't put it in state. Instead, calculate it during rendering." ([You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)) (In this repo, `useWizardForm`'s `isFirstStep`/`isLastStep` and `useRequiredFieldValidation`'s `missingFields`/`isValid` are derived every render, not stored.)

### 3.2 Cache expensive derivations with `useMemo` (not an effect)

```tsx
const visibleTodos = useMemo(
  () => getFilteredTodos(todos, filter),
  [todos, filter],
);
```

Don't recompute-and-`setState` in an effect ([You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)).

### 3.3 Reset state with a `key`, not an effect

```tsx
// BAD: clears comment in an effect after userId changes (stale render first)
useEffect(() => {
  setComment("");
}, [userId]);

// GOOD: remount the subtree so ALL its state resets, before paint
<Profile userId={userId} key={userId} />;
```

Passing `userId` as `key` makes React treat different users as different components that "should not share any state." ([You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect))

### 3.4 Adjust _some_ state on prop change — during render, not an effect

When you can't reset everything, the escape hatch is **calling `setState` during render** (inside a guard), which React re-renders immediately without an intermediate paint:

```tsx
function List({ items }: { items: Item[] }) {
  const [selection, setSelection] = useState<Item | null>(null);
  const [prevItems, setPrevItems] = useState(items);
  if (items !== prevItems) {
    // guard prevents infinite loop
    setPrevItems(items);
    setSelection(null);
  }
  // ...
}
```

But **preferred**: avoid the stored state entirely and derive it:

```tsx
const [selectedId, setSelectedId] = useState<string | null>(null);
const selection = items.find((item) => item.id === selectedId) ?? null;
```

"Always check whether you can reset all state with a key or calculate everything during rendering instead." ([You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect))

### 3.5 Share logic between handlers — extract a function, don't route through an effect

```tsx
// BAD: toast fires on any render where isInCart is true (e.g. page reload)
useEffect(() => { if (product.isInCart) showNotification(...); }, [product]);

// GOOD: shared function called from each handler
function buyProduct() { addToCart(product); showNotification(`Added ${product.name}`); }
function handleBuyClick() { buyProduct(); }
function handleCheckoutClick() { buyProduct(); navigateTo('/checkout'); }
```

### 3.6 Events, chains, and initialization

- **POST requests / mutations from user actions -> event handlers.** Only "because displayed" work (analytics `visit` on mount) belongs in effects.
- **Avoid chains of effects** that each `setState` to trigger the next effect — compute the whole next state in one event handler.
- **Don't notify parents from an effect** (`useEffect(() => onChange(value), [value])`) — update parent and child in the same event, or lift state up (controlled component).
- **App-once initialization** — a module-level guard or top-level module code, not an effect (effects run twice in dev Strict Mode) ([You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)).

### 3.7 The two legit effect cases

1. **Subscribing to an external store** — prefer `useSyncExternalStore` over a hand-rolled subscribe/setState effect (section 7.3).
2. **Data fetching** — if you must fetch in an effect, **guard against race conditions with a cleanup flag**:

```tsx
useEffect(() => {
  let ignore = false;
  fetchResults(query).then((json) => {
    if (!ignore) setResults(json);
  });
  return () => {
    ignore = true;
  };
}, [query]);
```

"Modern frameworks provide more efficient built-in data fetching mechanisms than writing Effects directly." In this Vite SPA, that role is filled by **TanStack Query** (already the repo's data layer), which handles caching, dedup, and races for you ([You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)).

---

## Part 4 — React 19 features (usable in this SPA)

React 19 shipped Dec 5, 2024. Everything below is **stable** unless flagged otherwise ([React 19 blog](https://react.dev/blog/2024/12/05/react-19)).

### 4.1 The `use()` API — read promises and context in render

`use(resource)` reads a **Promise** (suspends until it resolves) or a **context** value ([use](https://react.dev/reference/react/use)). Its superpower: **it can be called conditionally and inside loops**, unlike every other hook.

```tsx
import { use } from "react";

function Comments({
  commentsPromise,
}: {
  commentsPromise: Promise<Comment[]>;
}) {
  const comments = use(commentsPromise); // suspends until resolved
  return (
    <>
      {comments.map((c) => (
        <p key={c.id}>{c.text}</p>
      ))}
    </>
  );
}

function ThemedButton({ show }: { show: boolean }) {
  if (show) {
    const theme = use(ThemeContext); // conditional context read - legal with use()
    return <button className={theme} />;
  }
  return null;
}
```

Critical caveats ([use](https://react.dev/reference/react/use)):

- **Do not create the promise in render.** A `use(fetch('/x'))` makes a new promise every render, re-triggering the Suspense fallback forever. Cache the promise (a module `Map`, or state, or a Suspense-enabled library).
- **Error/loading handled by boundaries, not try/catch.** Wrap the component in an **Error Boundary** for rejection and **`<Suspense>`** for pending.
- `use(context)` searches **upward** for the nearest provider — like `useContext`.

> **SPA note:** `use()` for promises works in a client-only Vite app **as long as you cache the promise** (the ergonomic path is TanStack Query's `useSuspenseQuery`, which owns the cache). What's **not** available client-only is the RSC pattern of a Server Component creating the promise.

### 4.2 Actions & `useActionState`

An **Action** is an async function passed to a transition or a form's `action` prop; React automatically manages **pending state, errors, optimistic updates, and sequential ordering** ([React 19 blog](https://react.dev/blog/2024/12/05/react-19)).

`useActionState(action, initialState, permalink?)` returns `[state, formAction, isPending]` ([useActionState](https://react.dev/reference/react/useActionState)):

```tsx
import { useActionState } from "react";

const [error, submitAction, isPending] = useActionState(
  async (previousState: string | null, formData: FormData) => {
    const error = await updateName(formData.get("name") as string);
    if (error) return error; // becomes the next `state`
    redirect("/profile");
    return null;
  },
  null,
);

return (
  <form action={submitAction}>
    <input name="name" />
    <button disabled={isPending}>Update</button>
    {error && <p>{error}</p>}
  </form>
);
```

Caveats ([useActionState](https://react.dev/reference/react/useActionState)): top-level hook only; the action `(previousState, payload) => nextState` is called **sequentially**; dispatch must run inside an Action/transition (a form `action` does this automatically); if the action throws, React surfaces the nearest Error Boundary; the action is **not** double-invoked in Strict Mode. `permalink` is a Server-Component progressive-enhancement feature — _N/A to a client-only SPA_. Naming history: `useActionState` was `useFormState` pre-19 and moved from `react-dom` to `react`.

### 4.3 `useFormStatus`

Read the enclosing form's submission status **without prop-drilling** — for reusable submit buttons/spinners ([useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus)). Returns `{ pending, data, method, action }`.

```tsx
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "Saving..." : "Save"}</button>;
}
```

**Placement caveat (the common mistake):** it only reads a **parent** `<form>`. "`useFormStatus` will not return status information for a `<form>` rendered in the same component." `SubmitButton` must be a child _inside_ the `<form>`.

### 4.4 `useOptimistic`

Show a temporary value while an Action is in flight; it **auto-reverts/converges** when the action completes ([useOptimistic](https://react.dev/reference/react/useOptimistic)).

```tsx
import { useOptimistic, startTransition } from "react";

function LikeButton({ liked, toggleLike, setLiked }: Props) {
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(liked);

  function handleClick() {
    startTransition(async () => {
      setOptimisticLiked(!optimisticLiked); // instant UI
      const next = await toggleLike(!optimisticLiked);
      setLiked(next); // real state; optimistic converges
    });
  }
  return (
    <button onClick={handleClick} aria-pressed={optimisticLiked}>
      Like
    </button>
  );
}
```

Semantics: optimistic state is shown **only while an Action is pending**; "there's no extra render to 'clear' the optimistic state. The optimistic and real state converge in the same render when the Transition completes." The `set` function **must** be called inside an Action/transition.

### 4.5 `useTransition` / `startTransition` & deferred values

A **Transition** marks state updates as **non-blocking and interruptible** ([useTransition](https://react.dev/reference/react/useTransition)).

```tsx
const [isPending, startTransition] = useTransition();
function selectTab(next: string) {
  startTransition(() => setTab(next)); // tab switch won't block typing elsewhere
}
```

Caveats: updates must be triggered **synchronously inside** the callback; **async transitions** — state updates _after_ an `await` are **not** automatically part of the transition, so wrap them in another `startTransition`; **transitions can't control text inputs** — keep the input's own state synchronous and defer the expensive downstream work.

**`useDeferredValue(value, initialValue?)`** defers re-rendering a part of the UI that depends on a value you _receive_ ([useDeferredValue](https://react.dev/reference/react/useDeferredValue)):

```tsx
const deferredQuery = useDeferredValue(query);
// <input> uses `query` (instant); the heavy <Results> uses `deferredQuery` (lags on slow devices)
```

Unlike debounce/throttle there's **no fixed delay** and deferred renders are **interruptible**. The React 19 `initialValue` gives a value to show on the **first** render. `useTransition` vs `useDeferredValue`: use `useTransition` when **you own the `set` function**; use `useDeferredValue` when you only **receive the value**.

### 4.6 `ref` as a prop — `forwardRef` no longer needed

Function components now accept `ref` as a **normal prop** ([React 19 blog](https://react.dev/blog/2024/12/05/react-19)):

```tsx
function MyInput({
  placeholder,
  ref,
}: {
  placeholder?: string;
  ref?: React.Ref<HTMLInputElement>;
}) {
  return <input placeholder={placeholder} ref={ref} />;
}
// usage: <MyInput ref={inputRef} />
```

`forwardRef` still works but is **deprecated**. (Prefer the plain-prop form in new QueerPulse primitives.)

### 4.7 Ref **cleanup functions**

A ref callback may now **return a cleanup function**, called when the element unmounts. When a cleanup is returned, React **no longer calls the callback with `null`** on unmount ([React 19 blog](https://react.dev/blog/2024/12/05/react-19)):

```tsx
<input
  ref={(node) => {
    // node attached
    return () => {
      // node detached - clean up (observers, listeners)
    };
  }}
/>
```

TypeScript note: **implicit returns in ref callbacks are now type-errors** (e.g. `ref={(node) => (myRef.current = node)}` must become a block body).

### 4.8 `<Context>` as a provider

Render the context object directly instead of `<Context.Provider>` ([React 19 blog](https://react.dev/blog/2024/12/05/react-19)):

```tsx
const ThemeContext = createContext("light");
// React 19:
<ThemeContext value="dark">{children}</ThemeContext>;
// (was: <ThemeContext.Provider value="dark">)
```

`<Context.Provider>` still works but will be deprecated.

### 4.9 Document metadata hoisting

Render `<title>`, `<meta>`, and `<link>` anywhere in the tree; React **hoists them into `<head>`** automatically ([React 19 blog](https://react.dev/blog/2024/12/05/react-19)). **Works client-side** in a Vite app — removes the need for a `react-helmet`-style library for basic per-page metadata. (It does _not_ give SSR'd metadata for JS-less crawlers; that still needs prerendering.)

### 4.10 Preloading APIs (client-side)

```tsx
import { prefetchDNS, preconnect, preload, preinit } from "react-dom";

prefetchDNS("https://example.com");
preconnect("https://example.com");
preload("https://.../font.woff2", { as: "font" });
preinit("https://.../analytics.js", { as: "script" });
```

Stylesheets with a `precedence` prop are ordered by React; async scripts are de-duplicated across components.

### 4.11 Error-handling & hydration improvements

Hydration mismatches log a **single message with a diff**; unexpected third-party tags in `<head>`/`<body>` are **skipped** during hydration; `createRoot`/`hydrateRoot` accept `onCaughtError`/`onUncaughtError`/`onRecoverableError`; full **Custom Elements** support ([React 19 blog](https://react.dev/blog/2024/12/05/react-19)).

---

## Part 5 — Re-render control & memoization

(Deep treatment in [performance.md](performance.md); the essentials:)

- **`useMemo`** caches the **result** of a pure calculation; use for genuinely expensive computation and for **stabilizing object/array identity** passed to memoized children or effect deps.
- **`useCallback`** caches a **function identity** — the callback equivalent of `useMemo`.
- **`React.memo`** skips re-rendering when props are shallow-equal — the tool that breaks the "parent re-render cascades to all children" default (1.3).

**Why manual memoization is fragile (TkDodo):** **"Memo is too easy to break."** An inline `style={{...}}` or passing `children` (JSX is a new object each render) silently defeats a memoized child. And consumers "don't necessarily know that it is memoized," so later edits quietly break it ([TkDodo — The Uphill Battle of Memoization](https://tkdodo.eu/blog/the-uphill-battle-of-memoization)). Prefer **move-state-down / composition** to shrink render scope; reach for memo only at a measured boundary.

---

## Part 6 — The React Compiler

**What it is:** a **build-time** Babel plugin (Vite supported) that **auto-memoizes** components and hooks — the equivalent of inserting optimal `useMemo`/`useCallback`/`React.memo`, with **no code changes** ([React Compiler intro](https://react.dev/learn/react-compiler/introduction)). It optimizes (1) cascading re-renders and (2) expensive in-render calculations. It does **not** memoize non-React functions, share memoization across components, or remove `useMemo` as an effect-dependency escape hatch. **Requires** your code follow the Rules of React (purity, Rules of Hooks); `eslint-plugin-react-compiler` flags unsafe code. **Stable (1.0)**, supports React 17/18/19.

> **QueerPulse stance:** the Compiler is **not enabled here today**. Write correct, pure components and honest effects (Parts 1-3) so it _could_ be turned on — and keep the manual-memoization discipline of Part 5 in force until it is. Don't rip out existing memo blindly if it ever lands (removal "can change compilation output").

---

## Part 7 — Concurrent rendering

### 7.1 Transitions & interruptibility

Concurrent React can **prepare a new render in the background and interrupt/abandon it** if a higher-priority update arrives. Transitions (4.5) are the public API: "if you... start typing into an input while the chart is in the middle of a re-render, React will restart the rendering work on the chart component after handling the input update." ([useTransition](https://react.dev/reference/react/useTransition))

### 7.2 Suspense — for data and for code

`<Suspense fallback={...}>` shows a fallback until its children finish loading ([Suspense](https://react.dev/reference/react/Suspense)). What can suspend: **lazy code** via `React.lazy()` (the everyday SPA use — code-splitting); **data** read with `use()` from a **cached promise** or a Suspense-enabled library.

Critical limitation for SPAs: **Suspense does not detect data fetched in Effects or event handlers.** The promise must be **created during render and read with `use()`**, and **cached**:

```tsx
// NOT detected by Suspense
useEffect(() => {
  fetchData().then(setData);
}, []);
// detected
const data = use(fetchData()); // fetchData returns a cached promise
```

Behavior: children under one boundary **reveal together** (nest for progressive reveal); during a **Transition** or with `useDeferredValue`, React **keeps existing content visible** instead of flashing the fallback — the key to non-janky navigation. In practice, most SPA teams get Suspense-for-data through **TanStack Query's `useSuspenseQuery`**; Suspense-for-code via `React.lazy` needs nothing extra.

### 7.3 Tearing & `useSyncExternalStore`

**Tearing** is a concurrent-rendering hazard: if an external mutable store changes _while React is mid-render_, different components could read different versions in the same commit. `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)` is the **correct, tear-free** way to subscribe to any store outside React ([useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)):

```tsx
function useOnlineStatus() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener("online", callback);
      window.addEventListener("offline", callback);
      return () => {
        window.removeEventListener("online", callback);
        window.removeEventListener("offline", callback);
      };
    },
    () => navigator.onLine, // client snapshot
    () => true, // server snapshot (SSR/hydration)
  );
}
```

Caveats: **`getSnapshot` must return an immutable, cached snapshot** — returning a _new object each call_ causes an **infinite render loop** (React compares with `Object.is`). Keep `subscribe` **stable** (module scope or `useCallback`). This is what Redux/Zustand/Jotai use internally, and why "just read a mutable global in render" is unsafe under concurrent rendering.

---

## Part 8 — What to IGNORE in a Vite client-only SPA

These React 19 items are **Server-Component / SSR-framework only** and do **not** apply to QueerPulse. There's no server to run them.

| Feature                                                         | Why it's N/A                                                                                              |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **React Server Components** (`'use client'` boundaries)         | Require an RSC-capable framework (Next.js App Router). Implementation APIs are not semver-stable in 19.x. |
| **Server Actions / `'use server'`**                             | Server functions callable from the client — need a server runtime.                                        |
| **`useActionState`'s `permalink` argument**                     | Progressive-enhancement fallback URL (RSC/SSR). The rest of `useActionState` **is** usable client-side.   |
| **Form-action progressive enhancement (works before JS loads)** | A no-JS submission only works with server rendering. Client-side, form actions still work once JS runs.   |
| **`prerender` / `prerenderToNodeStream` static APIs**           | Server-side HTML generation.                                                                              |
| **Streaming SSR / server-hoisted metadata for crawlers**        | No server = no streamed HTML.                                                                             |

**Fully usable in this SPA:** `use()` (cached promises + Suspense + Error Boundary), Actions via `useActionState`/`useOptimistic`/`useFormStatus`, `useTransition`/`useDeferredValue`, `ref` as prop, ref cleanup, `<Context>` provider, document-metadata hoisting, preloading APIs, `React.lazy` + Suspense, `useSyncExternalStore`, and (if enabled) the React Compiler.

---

## Part 9 — Advice that changed between versions

- **`useFormState` -> `useActionState`** (moved `react-dom` -> `react`, gained `isPending`).
- **`forwardRef` deprecated** — `ref` is now a plain prop.
- **`<Context.Provider>` -> `<Context>`** (provider shorthand; `.Provider` on the deprecation path).
- **Manual-memoization advice inverted by the Compiler** — with it enabled, manual memo is an escape hatch, not the norm. Don't rip out existing memo blindly.
- **`useEffectEvent` still experimental in 19.0** — the shipped export is `experimental_useEffectEvent`; the durable lesson (extract non-reactive logic instead of suppressing `exhaustive-deps`) holds regardless.
- **Suspense-for-data is still not "wrap any promise"** — React 19 added the _primitive_ (`use()`), not a fetching library; arbitrary `fetch` in `useEffect` never triggers Suspense.

---

## Appendix — Correctness checklist

- Components are **pure**: same inputs -> same JSX, no mutation of pre-existing values.
- **Derive, don't sync.** Anything computable from props/state is computed in render.
- **Effects only for external synchronization**, written as start/stop with cleanup; deps honest and complete.
- **Never suppress `exhaustive-deps`** — fix identity with functional updates, hoisting, `useMemo`, split effects, or an Effect Event.
- **Reset with `key`**, not a reset-in-effect.
- **Functional updates** when new state depends on old; **lazy init** for expensive initial state.
- **Stable, unique keys** in lists; never array index for reorderable lists.
- **`useSyncExternalStore`** for external stores; snapshot must be cached/immutable.
- **Cache promises** passed to `use()`; wrap in `<Suspense>` + Error Boundary.
- Keep components pure so the Compiler _could_ optimize them.

### Primary sources

- React 19 release: https://react.dev/blog/2024/12/05/react-19
- Render and Commit: https://react.dev/learn/render-and-commit
- Keeping Components Pure: https://react.dev/learn/keeping-components-pure
- Preserving and Resetting State: https://react.dev/learn/preserving-and-resetting-state
- Rules of Hooks: https://react.dev/reference/rules/rules-of-hooks
- You Might Not Need an Effect: https://react.dev/learn/you-might-not-need-an-effect
- Lifecycle of Reactive Effects: https://react.dev/learn/lifecycle-of-reactive-effects
- Separating Events from Effects: https://react.dev/learn/separating-events-from-effects
- useState: https://react.dev/reference/react/useState · useRef: https://react.dev/reference/react/useRef · useLayoutEffect: https://react.dev/reference/react/useLayoutEffect
- use: https://react.dev/reference/react/use · useActionState: https://react.dev/reference/react/useActionState · useOptimistic: https://react.dev/reference/react/useOptimistic · useFormStatus: https://react.dev/reference/react-dom/hooks/useFormStatus
- useTransition: https://react.dev/reference/react/useTransition · useDeferredValue: https://react.dev/reference/react/useDeferredValue · Suspense: https://react.dev/reference/react/Suspense · useSyncExternalStore: https://react.dev/reference/react/useSyncExternalStore
- React Compiler: https://react.dev/learn/react-compiler/introduction · TkDodo, Uphill Battle of Memoization: https://tkdodo.eu/blog/the-uphill-battle-of-memoization
