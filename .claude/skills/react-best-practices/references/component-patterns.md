# Component Patterns (reusable & headless architecture)

> **QueerPulse anchors — the repo already demonstrates these patterns:**
>
> - **Discriminated-union + polymorphic component:** [Button.tsx](../../../../src/shared/components/ui/Button.tsx) is `ButtonAsButton | ButtonAsLink | ButtonAsAnchor` — copy its shape (section 8, section 13) for any "renders as different elements" primitive. In new code prefer React 19 `ref`-as-prop over `forwardRef`.
> - **Prop injection / accessibility wiring:** `FormField.tsx` uses `useId` + `cloneElement` to wire a11y props onto a _native_ child only (section 2's `cloneElement` caveats — it deliberately refuses custom children).
> - **Custom hook as the reuse unit + generics:** `useWizardForm.ts` / `useRequiredFieldValidation<Values, FieldKey>` (section 12) — extracted only after the pattern recurred (rule of three, section 14.3).
> - **Provider + hook trio with a throwing guard:** `authContext.ts` (section 10) is exactly `createContext<T | null>(null)` + a `useAuth()` that throws outside its provider.
> - **Controlled component:** `Tabs.tsx` is a controlled `active`/`onChange` component (section 4). QueerPulse has no headless-library dependency (no Radix/React Aria) — build these patterns from the primitives above; reach for a library only if a genuinely hard widget (combobox/menu) appears, and raise it first.
>
> **House rules that shape these patterns here:** named exports (no `Button.Tab = ...` default-export tricks), CSS Modules + tokens (the `className` escape hatch merges, never hardcodes hex), and the 200-line component limit (favor composition, which naturally keeps pieces small). When a component sprouts a boolean prop per variation, that's the section 1 / section 14.1 smell — reach for composition or a `variant` union.

---

# Advanced React Component Design Patterns & Headless Component Architecture

A dense, cited reference on building **reusable, composable, headless** React components in TypeScript. Every pattern below is framed as: _what problem it solves → minimal correct example → when NOT to use it → TypeScript interaction_. Source URLs are inline on non-obvious claims.

The through-line of this whole document is one idea, borrowed from Kent C. Dodds and (upstream) Sandi Metz: **the more a component tries to do for its users, the harder it is to reuse.** The advanced patterns are all techniques for _giving control back to the consumer_ — "inversion of control" — without making the common case verbose. See the map of patterns and the "how much reuse do I actually need" ladder in <https://kentcdodds.com/blog/inversion-of-control>.

---

## Table of contents

1. [Composition over configuration](#1-composition-over-configuration)
2. [Slots & children as the primary extension API](#2-slots--children-as-the-primary-extension-api)
3. [Compound components](#3-compound-components)
4. [Control props: controlled + uncontrolled in one component](#4-control-props-controlled--uncontrolled)
5. [The state reducer pattern](#5-the-state-reducer-pattern)
6. [Render props & function-as-children after hooks](#6-render-props--function-as-children)
7. [Prop getters](#7-prop-getters)
8. [Polymorphic components (the `as` prop)](#8-polymorphic-components)
9. [Headless components / hooks-as-behavior](#9-headless-components--hooks-as-behavior)
10. [Provider pattern & the component+context+hook trio](#10-provider-pattern--the-trio)
11. [HOCs vs custom hooks vs render props today](#11-hocs-vs-hooks-vs-render-props)
12. [Custom hooks as the primary reuse unit](#12-custom-hooks-as-the-primary-reuse-unit)
13. [Prop API design principles](#13-prop-api-design-principles)
14. [Anti-patterns](#14-anti-patterns)
15. [Choosing a pattern: a decision guide](#15-choosing-a-pattern)

---

## 1. Composition over configuration

### The problem

A component that grows by accreting props ("prop explosion" / "boolean soup") becomes a configuration language that only its author understands. Each new use case adds a prop; props interact combinatorially; the component's body becomes a thicket of conditionals. This is _configuration_: the caller describes what they want through a fixed vocabulary the component defines.

**Composition** flips it: the component exposes _holes_ (children, slots), and callers fill them with arbitrary JSX. The component stops predicting use cases and instead provides structure + behavior.

### Configuration (the thing to avoid)

```tsx
// Every new requirement = a new prop. This is a trap.
type DialogProps = {
  title: string;
  description?: string;
  showCloseButton?: boolean;
  closeButtonLabel?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  icon?: React.ReactNode;
  iconColor?: "red" | "green" | "blue";
  hideFooter?: boolean;
  // ...and it never ends
};
```

The moment a caller needs a footer with three buttons, or a form in the body, or a link in the title, you are back editing `DialogProps`.

### Composition (the fix)

```tsx
function Dialog({ children }: { children: React.ReactNode }) {
  return (
    <div role="dialog" aria-modal="true" className="dialog">
      {children}
    </div>
  );
}
Dialog.Title = ({ children }: { children: React.ReactNode }) => (
  <h2 className="dialog__title">{children}</h2>
);
Dialog.Body = ({ children }: { children: React.ReactNode }) => (
  <div className="dialog__body">{children}</div>
);
Dialog.Footer = ({ children }: { children: React.ReactNode }) => (
  <footer className="dialog__footer">{children}</footer>
);

// Caller composes freely — the Dialog never predicted this layout:
<Dialog>
  <Dialog.Title>
    Delete <strong>3 items</strong>?
  </Dialog.Title>
  <Dialog.Body>
    <DeleteImpactSummary />
  </Dialog.Body>
  <Dialog.Footer>
    <Button variant="ghost" onClick={close}>
      Cancel
    </Button>
    <Button variant="danger" onClick={confirm}>
      Delete
    </Button>
  </Dialog.Footer>
</Dialog>;
```

### When NOT to use it

- **Truly closed, uniform UI.** A `<Badge status="error" />` that must look identical everywhere is _better_ as configuration — exposing slots would let callers break the design system. Configuration is a feature when consistency matters more than flexibility.
- **When composition pushes wiring onto every caller.** If nine of ten callers would assemble the exact same children, provide a configured convenience wrapper on top of the composable core (see §15, the "layered API" idea). Radix does exactly this: unstyled primitives underneath, styled kits (shadcn/ui) on top. <https://www.radix-ui.com/primitives/docs/overview/introduction>

### TypeScript interaction

Composition is easy to type because children are `React.ReactNode` — you offload the type-checking of _what goes inside_ to the elements themselves. The `Dialog.Title = ...` static-property assignment types fine, but note: attaching sub-components as static properties can trip up React DevTools display names and some lint rules; give each a `displayName` if you rely on it.

---

## 2. Slots & children as the primary extension API

### The problem

`children` is a single hole. Real components have _several_ named regions (a card has media, header, body, actions). You want multiple, named, type-safe extension points without a prop per region.

### Approaches, best to worst

**(a) Named sub-components (preferred).** This is the compound-component shape from §1: `Card.Media`, `Card.Header`. Order and presence are the caller's choice, discovered by reading JSX rather than prop docs.

**(b) Explicit `ReactNode` slot props.** Fine for a small fixed set:

```tsx
type PageHeaderProps = {
  title: React.ReactNode;
  actions?: React.ReactNode; // slot
  breadcrumb?: React.ReactNode; // slot
};
```

This is honest and simple, but every new region is a new prop — it degrades toward configuration if the set grows.

**(c) The "asChild" / Slot merge pattern (Radix).** Instead of rendering its own element, a component _merges its behavior/props onto the single child you give it_. This solves "I want `<Tooltip.Trigger>` to be MY `<Button>`, not a wrapper `<button>`."

```tsx
<Tooltip.Trigger asChild>
  <Button>Hover me</Button>
</Tooltip.Trigger>
// Trigger merges its ref + aria-* + event handlers onto <Button> instead of
// rendering an extra element around it.
```

Radix implements this with a `<Slot>` component that clones the child and merges props (composing event handlers, merging `className`/`style`, chaining refs). The open architecture of "small parts + `asChild`" is what makes Radix composable. <https://www.radix-ui.com/primitives/docs/overview/introduction>

A minimal `Slot` merge (the essence):

```tsx
import * as React from "react";

function mergeProps(child: Record<string, any>, slot: Record<string, any>) {
  const merged = { ...child };
  for (const key in slot) {
    const slotValue = slot[key];
    const childValue = child[key];
    if (/^on[A-Z]/.test(key)) {
      // compose event handlers: call both
      merged[key] = (...args: unknown[]) => {
        childValue?.(...args);
        slotValue?.(...args);
      };
    } else if (key === "style") {
      merged.style = { ...slotValue, ...childValue };
    } else if (key === "className") {
      merged.className = [slotValue, childValue].filter(Boolean).join(" ");
    } else {
      merged[key] = slotValue ?? childValue;
    }
  }
  return merged;
}

const Slot = React.forwardRef<
  HTMLElement,
  { children: React.ReactElement } & Record<string, any>
>(function Slot({ children, ...slotProps }, forwardedRef) {
  const child = React.Children.only(children);
  return React.cloneElement(child, {
    ...mergeProps(child.props, slotProps),
    ref: forwardedRef, // real Radix chains refs; simplified here
  });
});
```

### When NOT to use it

- **`asChild`/Slot when a plain wrapper element is fine.** It adds cognitive load and ref-merging subtleties (two components fighting over the same DOM node). Only reach for it when the extra wrapper element is genuinely a problem (styling, semantics, or ref access).
- **`React.cloneElement` to inject props into arbitrary children.** It's brittle: it only reaches _direct_ children, silently breaks if a caller wraps the child, and collides on existing props. Prefer context (see §3). <https://www.patterns.dev/react/compound-pattern/>

### TypeScript interaction

`asChild` needs a discriminated approach to typing since the rendered element changes. In practice Radix types `asChild?: boolean` and the child stays `React.ReactElement`. Full polymorphic typing of the merged result is hard; most libraries accept a pragmatic `ReactElement` and rely on the child's own types. For truly typed polymorphism, see §8.

---

## 3. Compound components

### The problem

A `<Tabs>` and its `<Tab>`/`<TabPanel>` children need to share state (which tab is active) — but you don't want the caller to wire `activeIndex`/`onChange` through every child, and you _do_ want the caller to control layout (put a `<Tab>` inside a `<div>`, add arbitrary markup between tabs). Compound components let related components "share implicit state with each other." <https://www.patterns.dev/react/compound-pattern/>

### Minimal correct example (context-based)

```tsx
import * as React from "react";

type TabsContextValue = {
  activeValue: string;
  setActiveValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const context = React.useContext(TabsContext);
  if (context === null) {
    throw new Error(`<${component}> must be rendered inside <Tabs>`);
  }
  return context;
}

type TabsProps = {
  defaultValue: string;
  children: React.ReactNode;
};

function Tabs({ defaultValue, children }: TabsProps) {
  const [activeValue, setActiveValue] = React.useState(defaultValue);
  // Memoize so consumers don't re-render on every Tabs render.
  const value = React.useMemo(
    () => ({ activeValue, setActiveValue }),
    [activeValue],
  );
  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

function TabList({ children }: { children: React.ReactNode }) {
  return <div role="tablist">{children}</div>;
}

function Tab({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const { activeValue, setActiveValue } = useTabsContext("Tab");
  const isActive = activeValue === value;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActiveValue(value)}
    >
      {children}
    </button>
  );
}

function TabPanel({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const { activeValue } = useTabsContext("TabPanel");
  if (activeValue !== value) return null;
  return <div role="tabpanel">{children}</div>;
}

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;
export { Tabs };
```

Usage — note children can be nested arbitrarily deep, unlike `React.Children.map`:

```tsx
<Tabs defaultValue="account">
  <Tabs.List>
    <div className="tab-group">
      <Tabs.Tab value="account">Account</Tabs.Tab>
      <Tabs.Tab value="security">Security</Tabs.Tab>
    </div>
  </Tabs.List>
  <Tabs.Panel value="account">
    <AccountForm />
  </Tabs.Panel>
  <Tabs.Panel value="security">
    <SecurityForm />
  </Tabs.Panel>
</Tabs>
```

### Two implementations — and why context wins

You can implement compound components with **`React.Children.map` + `cloneElement`** or with **context**. `React.Children.map` "can only clone and pass props to immediate children" — wrap a `<Tab>` in any other component and it breaks; it also collides on existing prop names. Context "share[s] any state at any place in the React tree," so nesting is unrestricted. <https://www.patterns.dev/react/compound-pattern/> Prefer context for anything real.

### Pitfalls

- **Context value identity.** If you pass `value={{ activeValue, setActiveValue }}` inline, a new object is created every render and _all_ consumers re-render. Memoize (as above). This is the "the `value` prop should only change when you want consumers to re-render" rule. <https://kentcdodds.com/blog/migrating-to-reacts-new-context-api>
- **Using a sub-component outside its parent.** Throw a helpful error from the context hook (as above) so `<Tab>` used without `<Tabs>` fails loudly, not with a cryptic null read.
- **Over-splitting.** Every part is public API. Ten sub-components is ten things to keep stable forever. Split by the seams callers actually need to reach into.
- **Static-property attachment vs. named exports.** `Tabs.Tab` is ergonomic but can confuse tree-shaking and some tooling; exporting `Tab` separately is friendlier to bundlers. Many libraries (Radix) export namespaced (`Tabs.Root`, `Tabs.List`) _and_ flat.

### When NOT to use it

- When there's no shared implicit state (then it's just §1/§2 slots — simpler).
- When the set of children is fixed and small and you don't need caller-controlled layout — a single configured component is less machinery.

### TypeScript interaction

Type the context value explicitly and default the context to `null` (not `{}` or a fake object) so the "must be inside provider" invariant is enforced at runtime by the guard hook; the `null` union forces you to write that guard. Attaching `Tabs.Tab = Tab` type-checks but you may add `Tabs.Tab.displayName = 'Tabs.Tab'`.

---

## 4. Control props: controlled + uncontrolled

### The problem

There are two ways a component can own a piece of state:

- **Uncontrolled** — the component owns it internally; caller passes `defaultValue` and reads changes via `onChange`. (Like a bare `<input>`.)
- **Controlled** — the caller owns it in their own state, passes `value` + `onChange`, and the component is a pure function of props. (Like `<input value={x} onChange={...} />`.)

Kent C. Dodds calls the mechanism that supports the controlled case **"control props."** <https://sherryhsu.medium.com/usecontrollablestate-hook-b4801ec293e5> A well-designed reusable component supports **both** so simple callers stay terse and advanced callers get full control. The contract mirrors the DOM: `value`/`defaultValue`/`onChange`.

### The contract

- If `value` prop is **`undefined`** → uncontrolled: use internal state, seeded once from `defaultValue`.
- If `value` prop is **defined** → controlled: render `value`, and on every change call `onChange` (the component does NOT keep its own copy).
- **Never switch** between the two across a component's lifetime — React warns about exactly this for inputs. Pick a mode at mount and keep it.

### `useControllableState` — support both cleanly

This is the canonical hook; Radix ships it as `@radix-ui/react-use-controllable-state` (~2kb) and Chakra/shadcn have equivalents. <https://sherryhsu.medium.com/usecontrollablestate-hook-b4801ec293e5>

```tsx
import * as React from "react";

type UseControllableStateParams<T> = {
  /** Controlled value. `undefined` means uncontrolled. */
  value?: T | undefined;
  /** Initial value in uncontrolled mode. */
  defaultValue: T;
  /** Called on every change, in BOTH modes. */
  onChange?: (next: T) => void;
};

export function useControllableState<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>): [T, (next: T) => void] {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState<T>(defaultValue);

  // Keep onChange callable without making setValue's identity depend on it.
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  });

  const value = isControlled ? (controlledValue as T) : uncontrolledValue;

  const setValue = React.useCallback(
    (next: T) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      // Always notify the caller — this is what makes `value` + `onChange`
      // a real controlled contract, and also lets uncontrolled callers observe.
      onChangeRef.current?.(next);
    },
    [isControlled],
  );

  return [value, setValue];
}
```

Consuming it in a `Switch`:

```tsx
type SwitchProps = {
  checked?: boolean; // control prop
  defaultChecked?: boolean; // uncontrolled seed
  onCheckedChange?: (checked: boolean) => void;
};

function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
}: SwitchProps) {
  const [isChecked, setChecked] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  return (
    <button
      role="switch"
      aria-checked={isChecked}
      onClick={() => setChecked(!isChecked)}
    />
  );
}
```

Now `<Switch defaultChecked />` (terse) and `<Switch checked={x} onCheckedChange={setX} />` (controlled) both work.

### Pitfalls

- **`value === undefined` as the mode signal** means `null` is a _valid controlled value_ but `undefined` always means uncontrolled — document this. Compute `isControlled` once from the initial render if you want to hard-lock the mode (Radix reads it live but relies on callers not switching).
- **Referencing `onChange` in `useCallback` deps** would change `setValue`'s identity every render if the caller passes an inline handler; the ref indirection above keeps `setValue` stable. Stable setter identity matters for memoized children and effect deps.
- **Forgetting to call `onChange` in uncontrolled mode.** Uncontrolled callers still often want to _observe_ changes (e.g. analytics). Always call it.

### When NOT to use it

- Internal, single-use components that will never be controlled from outside — just use `useState`. This pattern is overhead you pay for _reusability_; don't pay it speculatively (that's premature abstraction, §14).

### TypeScript interaction

Make the hook generic in `T`. The tuple return `[T, (next: T) => void]` should be a _tuple_, not `T | ((next: T) => void)[]` — TypeScript infers the tuple correctly here because of the explicit return annotation. For the component props, keep `value?` optional and `defaultValue` with a default so both call shapes type-check. Consider a discriminated union if you want to _force_ callers to pass `onChange` whenever they pass `value` (see §13 on modeling controlled-ness with unions).

---

## 5. The state reducer pattern

### The problem

Control props (§4) let a caller own a _value_. But sometimes a caller needs to override the component's **state transition logic itself** — "when the user toggles, don't actually toggle if they've clicked too many times," or "keep the menu open after selection." You can't express that with `value`/`onChange`; you'd have to fork the component. The state reducer pattern is the _most powerful_ form of inversion of control: it lets the consumer intercept and rewrite every state change. It was invented by Kent C. Dodds inside Downshift precisely because users kept requesting one-off behavior tweaks. <https://kentcdodds.com/blog/the-state-reducer-pattern-with-react-hooks>

> "The benefit of the state reducer pattern is that it allows inversion of control … a mechanism for the author of an API to allow the user of the API to control how things work internally." After adding it to Downshift, Kent "stopped receiving as many issues because everybody could solve their own problems." <https://kentcdodds.com/blog/the-state-reducer-pattern-with-react-hooks>

### Minimal correct example

The component uses `useReducer` internally, but accepts an **optional `reducer` prop** and exports its **default reducer** and **action types** so callers can delegate to the default and then tweak. From Kent's canonical example: <https://kentcdodds.com/blog/the-state-reducer-pattern-with-react-hooks>

```tsx
import * as React from "react";

const actionTypes = {
  toggle: "TOGGLE",
  on: "ON",
  off: "OFF",
} as const;

type ToggleState = { on: boolean };
type ToggleAction = { type: (typeof actionTypes)[keyof typeof actionTypes] };
type ToggleReducer = (state: ToggleState, action: ToggleAction) => ToggleState;

function toggleReducer(state: ToggleState, action: ToggleAction): ToggleState {
  switch (action.type) {
    case actionTypes.toggle:
      return { on: !state.on };
    case actionTypes.on:
      return { on: true };
    case actionTypes.off:
      return { on: false };
    default:
      throw new Error(`Unhandled type: ${action.type}`);
  }
}

function useToggle({
  reducer = toggleReducer,
}: { reducer?: ToggleReducer } = {}) {
  const [{ on }, dispatch] = React.useReducer(reducer, { on: false });
  const toggle = () => dispatch({ type: actionTypes.toggle });
  const setOn = () => dispatch({ type: actionTypes.on });
  const setOff = () => dispatch({ type: actionTypes.off });
  return { on, toggle, setOn, setOff };
}

// Expose the pieces consumers need to compose their own reducer:
useToggle.reducer = toggleReducer;
useToggle.actionTypes = actionTypes;
```

Consumer overriding a transition — "no toggling after 4 clicks," delegating to the default for everything else: <https://kentcdodds.com/blog/the-state-reducer-pattern-with-react-hooks>

```tsx
function App() {
  const [clicksSinceReset, setClicks] = React.useState(0);
  const tooManyClicks = clicksSinceReset >= 4;

  const { on, toggle } = useToggle({
    reducer(currentState, action) {
      const changes = toggleReducer(currentState, action); // default logic
      if (tooManyClicks && action.type === actionTypes.toggle) {
        return { ...changes, on: currentState.on }; // veto the toggle
      }
      return changes;
    },
  });

  return (
    <button
      onClick={() => {
        toggle();
        setClicks((count) => count + 1);
      }}
    >
      {on ? "on" : "off"}
    </button>
  );
}
```

The consumer never had to reimplement toggling — they _wrapped_ the default reducer and vetoed one action. That's inversion of control at the transition level.

### Pitfalls

- **You must export the default reducer AND the action-type constants.** Without both, consumers can't delegate ("give me the default changes, I'll adjust") and can't reliably identify actions. String literals must be shared, not re-typed.
- **Action `type` as a stringly value** invites typos; use `as const` + a union so TypeScript checks `action.type` exhaustively.
- **This is a big commitment.** Every action type is now public API; changing your internal transitions can break consumer reducers. Only libraries or truly widely reused components should pay this.

### When NOT to use it

- Application-level components used in a handful of places. It's "the most flexible but also the most complicated" pattern; reach for control props (§4) first, and only escalate to a state reducer when callers demonstrably need to alter _transition logic_, not just values. <https://kentcdodds.com/blog/inversion-of-control>

### TypeScript interaction

Model `actionTypes` with `as const` and derive the action union from it (`typeof actionTypes[keyof typeof actionTypes]`). Type the `reducer` prop as `(state, action) => state` so a consumer's reducer is checked against your state shape. If you have a rich action set, use a **discriminated union** for `ToggleAction` (`{ type: 'toggle' } | { type: 'set'; value: boolean }`) so payloads are type-checked per action.

---

## 6. Render props & function-as-children

### The problem

Before hooks, render props ("a prop whose value is a function that returns React elements") were _the_ way to share stateful/behavioral logic between components — the parent owns state, the child function decides rendering. Hooks replaced most of this. But render props aren't dead. <https://kentcdodds.com/blog/react-hooks-whats-going-to-happen-to-render-props>

### Where render props still earn their place (post-hooks)

Kent's own conclusion: hooks cover _most_ render-prop use cases, but render props remain useful when: <https://kentcdodds.com/blog/react-hooks-whats-going-to-happen-to-render-props>

1. **The consumer needs to control rendering per-item while you control iteration** — e.g. a `<List>` that owns virtualization/selection but lets the caller render each row. A hook can't render _for_ the caller here.
2. **You need to give JSX-level access to internal state at a specific tree position** without exposing a context or forcing a custom hook call — e.g. `<Downshift>{({ getInputProps }) => ...}</Downshift>` in legacy component APIs.
3. **Library ergonomics / non-hook consumers** — class components, or APIs that want a single self-contained element.

### Minimal correct example (function-as-children)

```tsx
type ToggleRenderProps = {
  on: boolean;
  toggle: () => void;
};

function Toggle({
  children,
}: {
  children: (props: ToggleRenderProps) => React.ReactNode;
}) {
  const [on, setOn] = React.useState(false);
  return <>{children({ on, toggle: () => setOn((value) => !value) })}</>;
}

// Consumer fully controls markup:
<Toggle>
  {({ on, toggle }) => (
    <button aria-pressed={on} onClick={toggle}>
      {on ? "On" : "Off"}
    </button>
  )}
</Toggle>;
```

The modern equivalent is almost always a hook (`const { on, toggle } = useToggle()`), which is flatter and avoids the "wrapper element + callback" nesting. Reach for the hook first.

### Pitfalls

- **Inline render-prop functions create new identities each render**, which can defeat `React.memo` on the child. Usually negligible; matters in hot paths.
- **"Wrapper hell"** — nested render props (`<A>{a => <B>{b => ...}</B>}</A>`) is the exact readability problem hooks fixed. Don't rebuild it.

### When NOT to use it

- Any case a custom hook covers. If the logic doesn't _need_ to render, a hook is strictly simpler. <https://kentcdodds.com/blog/react-hooks-whats-going-to-happen-to-render-props>

### TypeScript interaction

Type `children` as a function: `children: (state: RenderState) => React.ReactNode`. This is fully inferable for the consumer. Avoid `React.ReactNode | ((s) => React.ReactNode)` union children unless you truly support both — it complicates every call site.

---

## 7. Prop getters

### The problem

Compound components with implicit context are ergonomic but _opinionated about DOM structure_. Render props give total rendering control but then the consumer must correctly wire a dozen props (`onClick`, `onKeyDown`, `aria-*`, `role`, `id`) — and get accessibility right. **Prop getters** are the middle path: the component hands the consumer a function that _returns the correct props object_ for a given element, which the consumer spreads onto their own JSX. "Prop getters are the key to allowing you to render whatever you like." <https://kentcdodds.com/blog/how-to-give-rendering-control-to-users-with-prop-getters> The name and idea are credited to Jared Forsyth via Downshift. <https://kentcdodds.com/blog/introducing-downshift-for-react>

### Minimal correct example

The crucial detail: a prop getter must **compose** the consumer's own handlers with the component's, not overwrite them. Downshift's rule: `<input {...getInputProps({onBlur: handleBlur})} />`, and the getter calls _both_ its internal `onBlur` and yours. <https://github.com/downshift-js/downshift/blob/master/README.md>

```tsx
type AnyHandler = (event: any) => void;

// Compose N handlers into one; stop if a caller calls preventDefault.
function callAll(...handlers: Array<AnyHandler | undefined>) {
  return (event: any) => {
    handlers.forEach((handler) => handler?.(event));
  };
}

function useToggle() {
  const [on, setOn] = React.useState(false);
  const toggle = () => setOn((value) => !value);

  function getTogglerProps<Props extends { onClick?: AnyHandler }>(
    { onClick, ...rest } = {} as Props,
  ) {
    return {
      "aria-pressed": on,
      onClick: callAll(onClick, toggle), // consumer's onClick runs too
      ...rest,
    };
  }

  return { on, toggle, getTogglerProps };
}

// Consumer renders any element and still gets correct a11y + behavior:
function App() {
  const { on, getTogglerProps } = useToggle();
  return (
    <button {...getTogglerProps({ onClick: () => console.log("also mine") })}>
      {on ? "On" : "Off"}
    </button>
  );
}
```

Prop getters compose _with_ the other patterns: Downshift combines render props + prop getters + state reducers, "each making more opinions until you're left with a simple API." <https://kentcdodds.com/blog/how-to-give-rendering-control-to-users-with-prop-getters>

### Pitfalls

- **Not composing handlers** — the #1 bug. If your getter does `onClick: toggle` and ignores the caller's `onClick`, the caller's handler silently vanishes. Always `callAll`.
- **Not spreading `...rest`** — callers expect to pass `className`, `id`, `data-*` through the getter. Forward everything you don't consume.
- **Order of handler calls** — decide and document whether the consumer's handler runs before or after yours, and whether `event.defaultPrevented` short-circuits.

### When NOT to use it

- When you _don't_ need to give up DOM control — a compound component (§3) is less ceremony. Prop getters shine specifically for headless libraries where the consumer owns all markup.

### TypeScript interaction

Make the getter generic over the incoming props so extra props pass through typed: `getTogglerProps<Props extends {...}>(props?: Props)`. Type the return as an intersection of the getter's known props and the passthrough `Props`. React Aria's hooks are essentially typed prop getters returning `{ buttonProps }`, `{ inputProps }` (see §9).

---

## 8. Polymorphic components

### The problem

A design-system `<Text>` or `<Box>` needs to render as different elements — `<h1>`, `<label>`, `<a>`, `<span>` — depending on context, while (a) forwarding the _right_ element-specific props (`href` only when it's an `<a>`, `htmlFor` only for `<label>`) and (b) forwarding a correctly-typed `ref`. This is the **`as` prop** pattern, and getting the TypeScript right is notoriously fiddly. <https://www.benmvp.com/blog/polymorphic-react-components-typescript/>

### The building-block types

The generic is `C extends React.ElementType`. You intersect your own props with `React.ComponentPropsWithoutRef<C>` (which "grabs all props defined for a component" for that element, minus `ref`), and you must **omit** any of the element's props your own props override (like `as`, `color`). <https://stevekinney.com/courses/react-typescript/mirror-dom-props>

```tsx
import * as React from "react";

// The `as` prop itself.
type AsProp<C extends React.ElementType> = { as?: C };

// Props of C we should NOT let leak through because our own props claim them.
type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

// Our props + the element's props (minus collisions), WITHOUT ref.
type PolymorphicComponentProps<
  C extends React.ElementType,
  Props = {},
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

// The correctly-typed ref for element C.
type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>["ref"];

// Full props including ref.
type PolymorphicComponentPropsWithRef<
  C extends React.ElementType,
  Props = {},
> = PolymorphicComponentProps<C, Props> & { ref?: PolymorphicRef<C> };
```

(These mirror the canonical helper set — `AsProp`, `PropsToOmit`, `PolymorphicRef`, `PolymorphicComponentPropWithRef`. <https://www.benmvp.com/blog/forwarding-refs-polymorphic-react-component-typescript/>)

### The component (with ref forwarding)

The key obstacle: `React.forwardRef` is a _function call_, so there's no place to declare the generic `C`. The fix is to annotate the returned component with a generic call-signature type. <https://www.benmvp.com/blog/forwarding-refs-polymorphic-react-component-typescript/>

```tsx
type TextOwnProps = {
  color?: "default" | "muted" | "danger";
  weight?: "regular" | "bold";
};

type TextProps<C extends React.ElementType> = PolymorphicComponentPropsWithRef<
  C,
  TextOwnProps
>;

// A generic call signature: default element is 'span'.
type TextComponent = <C extends React.ElementType = "span">(
  props: TextProps<C>,
) => React.ReactElement | null;

export const Text: TextComponent = React.forwardRef(
  <C extends React.ElementType = "span">(
    {
      as,
      color = "default",
      weight = "regular",
      children,
      ...rest
    }: TextProps<C>,
    ref?: PolymorphicRef<C>,
  ) => {
    const Component = as || "span";
    return (
      <Component ref={ref} className={`text-${color} text-${weight}`} {...rest}>
        {children}
      </Component>
    );
  },
) as TextComponent;
```

Now these are all type-checked correctly:

```tsx
<Text>plain span</Text>
<Text as="label" htmlFor="email">Email</Text>              {/* htmlFor allowed */}
<Text as="a" href="/home" ref={anchorRef}>Home</Text>       {/* href + HTMLAnchorElement ref */}
<Text as="button" onClick={() => {}} />                     {/* button props */}
{/* @ts-expect-error href is invalid on a span */}
<Text href="/nope" />
```

### React 19 note

In React 19, `ref` is a regular prop and `forwardRef` is being deprecated for many cases — you can accept `ref` directly in props. But for polymorphic components the _typing_ problem (declaring `C` at the call site) is the same; the generic call-signature technique still applies, you just drop the `forwardRef` wrapper and read `ref` from props.

### Pitfalls

- **`ComponentPropsWithoutRef` vs `WithRef`.** Use `WithoutRef` for the base props merge and pull the ref type _separately_ via `PolymorphicRef`; mixing them double-declares `ref`. <https://stevekinney.com/courses/react-typescript/mirror-dom-props>
- **Forgetting `PropsToOmit`.** Without the `Omit`, your `color` prop collides with an element's native `color` and TypeScript unions them into nonsense.
- **Runtime element name from a variable.** `const Component = as || 'span'` — capitalize the local (`Component`) or React treats it as an HTML tag literal.
- **Over-polymorphism.** Making _everything_ an `as`-prop component erodes semantic guarantees and bloats types. Reserve it for genuine layout/typography primitives.

### When NOT to use it

- Components whose element should never change (a `<Card>` that is always a `<div>`). The generic machinery is pure cost there.

### TypeScript interaction

This _is_ the TypeScript-interaction pattern — it exists to make a runtime-flexible component statically safe. Expect elevated type complexity and slower editor inference on deeply nested polymorphic trees; some teams cap it with `as?: 'div' | 'section' | 'article'` (a small union) instead of full `ElementType` when only a few tags are needed — simpler types, fewer footguns.

---

## 9. Headless components / hooks-as-behavior

### The problem

Behavior + accessibility (keyboard nav, focus management, ARIA wiring, selection state) is hard to get right and identical across every design. Presentation (markup, CSS) is where you _want_ full freedom. Coupling them means every restyle risks breaking a11y, and every library imposes its look. **Headless** design separates them: the library provides behavior/state as hooks (or unstyled primitives) and you own 100% of the DOM and styles. This is the philosophy behind React Aria, Radix Primitives, Downshift, TanStack. <https://react-spectrum.adobe.com/react-aria/useToggleButton.html>

React Aria's own framing: it "provides behavior and accessibility through React Hooks … since it does not provide any rendering, you are responsible for defining the DOM structure … and passing the DOM props returned by each hook to the appropriate elements." The payoff is "complete control over the DOM structure" and styling. <https://react-spectrum.adobe.com/react-aria/getting-started.html>

### Two flavors of headless

**(a) Hooks-as-behavior (React Aria, Downshift).** State hook + behavior hook, you render:

```tsx
import { useToggleButton } from "react-aria";
import { useToggleState } from "react-stately";
import * as React from "react";

// State layer (@react-stately/toggle) and behavior layer (react-aria) are split.
function ToggleButton(props: any) {
  const state = useToggleState(props); // data: on/off
  const ref = React.useRef<HTMLButtonElement>(null);
  const { buttonProps } = useToggleButton(props, state, ref); // behavior + aria
  return (
    <button
      {...buttonProps}
      ref={ref}
      style={{ fontWeight: state.isSelected ? "bold" : "normal" }}
    >
      {props.children}
    </button>
  );
}
```

React Aria deliberately splits **state** (`react-stately`, framework-agnostic data logic) from **behavior/ARIA** (`react-aria`, the DOM props). "Selection state … is managed by `useToggleState` … the state object is passed as an option to `useToggleButton`." <https://react-spectrum.adobe.com/react-aria/useToggleButton.html> `buttonProps` is a **prop getter** (§7) in all but name.

**(b) Unstyled primitives (Radix).** Behavior lives in components that render minimal/no styling; you style via `className`/`data-*` and compose via `asChild` (§2). Radix "provides all the functionality, logic, and accessibility features without any default visual styling." <https://www.radix-ui.com/primitives/docs/overview/introduction>

### Why this is the dominant architecture in 2026

The industry converged here because it cleanly composes with every earlier pattern: headless = **custom hooks (§12) + prop getters (§7) + control props (§4) + compound components (§3)**, minus opinions about pixels. shadcn/ui, Base UI, Ark UI, TanStack Table/Query, cmdk, Downshift, React Aria all sit on this axis. <https://dev.to/edriso/shadcn-vs-radix-vs-base-ui-which-one-should-a-junior-pick-in-2026-1jml>

### Pitfalls

- **Re-implementing a11y instead of using the primitive.** The entire point is to _not_ hand-roll focus traps and ARIA. If you're writing `role="dialog"` + focus management from scratch for the tenth time, reach for a headless primitive.
- **Leaking presentation into the "headless" layer.** If your behavior hook starts returning `className` strings or inline colors, it's no longer headless.
- **Forgetting the ref.** Aria hooks need the DOM ref you render, passed back in (`useButton(props, ref)`), to manage focus.

### When NOT to use it

- One-off UI with trivial behavior and no a11y surface (a static banner). The split is overhead. Headless pays off for _interactive, reusable, accessibility-critical_ widgets (menus, comboboxes, dialogs, tabs, sliders).

### TypeScript interaction

Headless hooks are the _best-typed_ pattern in practice: the hook's return object (`{ buttonProps }`, `{ getInputProps }`) is fully typed, so spreading it onto the right element is checked. Your own component just types its public props and forwards. React Aria ships complete types; when authoring your own, type the returned DOM-props object explicitly (e.g. `React.ButtonHTMLAttributes<HTMLButtonElement>`).

---

## 10. Provider pattern & the trio

### The problem

Deeply prop-drilling shared state (theme, current user, a widget's internal state) through many layers is noisy and couples intermediate components to data they only pass along. Context solves distribution; the **provider pattern** packages _state + updater_ into a context, and the **"component + context + hook" trio** makes it safe and ergonomic. <https://kentcdodds.com/blog/how-to-use-react-context-effectively>

### The trio (canonical shape)

Three things ship together: a **Provider component** (owns state, memoizes value), a **private context**, and a **custom hook** that reads it with an invariant guard.

```tsx
import * as React from "react";

type Theme = "light" | "dark";
type ThemeContextValue = { theme: Theme; toggle: () => void };

// 1. Private context — not exported.
const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined,
);

// 2. Provider — owns state, memoizes value so consumers don't over-render.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>("light");
  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")),
    }),
    [theme],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// 3. Hook — the ONLY way to read it; guards the invariant.
export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return context;
}
```

Consumers call `const { theme, toggle } = useTheme()` — they never touch `ThemeContext` directly, so you can refactor the internals freely.

### Splitting state and dispatch contexts

For frequently-changing state, split into two contexts — one for the value, one for the (stable) dispatch — so components that only dispatch don't re-render when the value changes. <https://kentcdodds.com/blog/how-to-use-react-context-effectively>

```tsx
const StateContext = React.createContext<State | undefined>(undefined);
const DispatchContext = React.createContext<React.Dispatch<Action> | undefined>(
  undefined,
);
// Dispatch identity is stable across renders → dispatch-only consumers never re-render.
```

### Avoiding context overuse

Context is not global-state salvation. Kent's guidance: **most state is not global** — colocate it, or lift it only as far as needed; reach for context only when many components across the tree genuinely need the same value. Overusing context makes components hard to reuse (they now require a provider) and can cause broad re-renders. Prefer **composition/children** to solve prop-drilling first: passing an element _down through_ `children` avoids threading props through every layer without any context at all. <https://kentcdodds.com/blog/prop-drilling>

### Pitfalls

- **Unmemoized value.** `value={{ theme, toggle }}` inline re-renders all consumers every render. Memoize. <https://kentcdodds.com/blog/migrating-to-reacts-new-context-api>
- **Default value of a fake object.** Defaulting the context to a dummy `{ theme: 'light', toggle() {} }` _hides_ the "used outside provider" bug. Default to `undefined` and throw in the hook.
- **One giant context.** A single `AppContext` with everything causes every consumer to re-render on any change. Split by concern and update frequency.

### When NOT to use it

- Passing data to a component one or two levels down — just pass props, or use composition/`children`. Context for shallow trees is over-engineering. <https://kentcdodds.com/blog/prop-drilling>

### TypeScript interaction

Type the context as `Value | undefined` and the guard hook narrows `undefined` away, so consumers get a non-optional value — this both enforces the runtime invariant and gives clean types. Never annotate `createContext<Value>(null as any)` to dodge the default; you lose the guard.

---

## 11. HOCs vs hooks vs render props today

### The problem

Three historical mechanisms exist for sharing non-visual logic: Higher-Order Components (`withRouter(Component)`), render props (§6), and custom hooks (§12). Which to use in 2026?

### The modern verdict

- **Custom hooks are the default.** They compose linearly (no wrapper hell), don't touch the tree/DOM, forward refs trivially, and have the best types. Any logic that doesn't _have_ to render should be a hook. <https://kentcdodds.com/blog/react-hooks-whats-going-to-happen-to-render-props>
- **Render props** survive for the narrow cases in §6 (consumer controls per-item rendering while you own iteration/state; single-element library APIs; non-hook consumers).
- **HOCs** are largely legacy. They introduce wrapper nesting ("HOC hell"), prop-name collisions, ref-forwarding ceremony (`forwardRef` + hoisting statics with `hoist-non-react-statics`), and opaque `displayName`s. Almost anything a HOC did is cleaner as a hook.

### HOCs that still earn their place

1. **Cross-cutting wrapping that must own the boundary** — e.g. `withErrorBoundary(Component)` (error boundaries still require a class, so a hook can't fully replace them), or Sentry's `withProfiler`.
2. **Injecting a wrapping element/behavior around any component uniformly** — e.g. `React.memo(Component)` is itself an HOC; `connect()`-style adapters for non-hook contexts.
3. **Enhancing components you don't control / can't add a hook call inside.**

### Side-by-side

```tsx
// HOC — wraps, injects props, needs ref forwarding + static hoisting to be correct.
function withUser<P extends { user: User }>(Component: React.ComponentType<P>) {
  return function WithUser(props: Omit<P, "user">) {
    const user = useCurrentUser();
    return <Component {...(props as P)} user={user} />;
  };
}

// Hook — flat, no wrapper, no injected-prop typing gymnastics.
function useCurrentUser(): User {
  /* ... */
}
function Profile() {
  const user = useCurrentUser();
  return <span>{user.name}</span>;
}
```

### TypeScript interaction

HOCs are the _hardest_ of the three to type: you must subtract the injected props from the public props (`Omit<P, 'user'>`), preserve generics, and re-forward refs — a frequent source of `any` leakage. Hooks return a plainly-typed value with none of this. This typing gap alone is a strong reason to prefer hooks.

---

## 12. Custom hooks as the primary reuse unit

### The problem

Since hooks, _behavioral_ reuse (the logic, not the markup) has a first-class home that composes cleanly. Designing a hook's **API** — its parameters, its return shape, its identity stability — is now a core component-design skill.

### Return tuple vs object

- **Return a tuple** when there are ≤2 values _and_ the caller frequently renames them — mirrors `useState`, enables `const [x, setX] = ...`. <https://tinytip.co/tips/react-hook-tuple/>
- **Return an object** when there are >2 values, or names carry meaning, or values are optional. The React team's guidance: hooks returning more than two values should use objects. <https://oida.dev/typescript-react-typeing-custom-hooks/>

```tsx
// Tuple — order-based, renameable (like useState):
function useToggle(initial = false) {
  const [on, setOn] = React.useState(initial);
  const toggle = React.useCallback(() => setOn((v) => !v), []);
  return [on, toggle] as const; // `as const` → tuple type [boolean, () => void]
}
const [isOpen, toggleOpen] = useToggle();

// Object — named, extensible without breaking call sites:
function useDisclosure(initial = false) {
  const [isOpen, setOpen] = React.useState(initial);
  return {
    isOpen,
    open: React.useCallback(() => setOpen(true), []),
    close: React.useCallback(() => setOpen(false), []),
    toggle: React.useCallback(() => setOpen((v) => !v), []),
  };
}
const { isOpen, open, close } = useDisclosure();
```

### Stable identities

Functions/objects a hook returns should be **referentially stable** (`useCallback`/`useMemo`) when consumers will put them in dependency arrays or pass them to memoized children. Unstable returns silently break `useEffect` deps and `React.memo`. This is a correctness concern, not just perf: an unstable callback in a consumer's `useEffect` dep list causes re-runs every render.

### Designing the parameter API

- Prefer a **single options object** once you exceed ~2 params, so callers pass named args and you can add options without breaking order: `useFetch(url, { retries, enabled })`.
- Give sensible **defaults** so the common call is terse.
- Keep the hook **focused**; compose small hooks rather than build one mega-hook. Hooks compose by _calling each other_ — `useCombobox` internally calls `useControllableState`, `useId`, etc.

### Composition of hooks

```tsx
// Small, focused, composed:
function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function useHasChanged<T>(value: T): boolean {
  const previous = usePrevious(value);
  return previous !== undefined && previous !== value;
}
```

### Pitfalls

- **Returning a fresh object/array literal every render** with no memoization → breaks consumers' memoization.
- **Over-abstracting** — a hook used once isn't reuse, it's indirection (§14, premature abstraction).
- **Hidden effects** — a hook that fires network requests or subscriptions must document lifecycle and clean up; leaky side effects are the worst kind of hook.

### When NOT to use it

- When you actually need to render shared _markup_, not just logic — that's a component (§1–3), not a hook. Hooks are behavior; components are behavior + presentation.

### TypeScript interaction

Use `as const` on tuple returns so TS infers `readonly [boolean, () => void]` rather than `(boolean | (() => void))[]` — otherwise destructured values are widened to the union and unusable. <https://oida.dev/typescript-react-typeing-custom-hooks/> Make hooks generic (`useLocalStorage<T>`) so callers get their type back. Named-tuple labels (`[value, setValue]: readonly [T, (v: T) => void]`) improve editor hints.

---

## 13. Prop API design principles

The public prop surface _is_ the component's UX for developers. Principles:

### Naming

- Mirror the platform: `value`/`defaultValue`/`onChange`, `checked`/`defaultChecked`, `disabled`, `className`. Familiarity beats cleverness.
- Event props: `on<Thing><Event>` — `onValueChange`, `onOpenChange`. Callback names describe _what happened_, not what to do.
- Booleans read as adjectives/states: `isLoading`, `disabled`, `readOnly` — not `loading={false}` ambiguity where possible.

### Boolean-prop soup → discriminated unions / variants

Multiple booleans that are mutually exclusive create _illegal states_ (`isPrimary` + `isDanger` both true). Replace with a single `variant` and, when props differ per variant, a **discriminated union** so TS forbids invalid combinations:

```tsx
// Bad: 2^N illegal combinations, unclear precedence.
type ButtonBad = { isPrimary?: boolean; isDanger?: boolean; isGhost?: boolean };

// Good: one axis, exhaustive, illegal states unrepresentable.
type ButtonGood = { variant?: "primary" | "danger" | "ghost" };

// Discriminated union when props are conditional on a mode:
type Notice =
  | { kind: "inline"; message: string }
  | {
      kind: "toast";
      message: string;
      durationMs: number;
      onDismiss: () => void;
    };
// `durationMs` is required for toast, disallowed for inline — enforced by TS.
```

You can even model controlled-ness (§4) as a union so `onChange` is required exactly when `value` is passed:

```tsx
type ControlledSwitch = {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
};
type UncontrolledSwitch = {
  defaultChecked?: boolean;
  onCheckedChange?: (v: boolean) => void;
};
type SwitchProps = (ControlledSwitch | UncontrolledSwitch) & {
  disabled?: boolean;
};
```

### Sensible defaults

Every optional prop needs a default that makes the _bare_ usage correct and common. `<Button>Save</Button>` should already look right. Defaults are how you avoid prop explosion pressure.

### Forwarding rest props and ref

Reusable leaf components should **spread unknown props** and **forward the ref** to the underlying DOM node, so callers can attach `id`, `data-*`, `aria-*`, event handlers, and measure/focus the node:

```tsx
const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input">
>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={`input ${className ?? ""}`} {...rest} />;
});
```

`React.ComponentPropsWithoutRef<'input'>` gives you _every_ native input prop for free — the honest way to "accept whatever an input accepts." <https://stevekinney.com/courses/react-typescript/mirror-dom-props>

### Escape hatches

- **`className` and `style`** should always be accepted and merged (not overwritten) so callers can adjust without forking. Merge order matters: usually your base classes first, caller's last (so they can override).
- **`data-*` / `aria-*` passthrough** falls out of spreading `...rest` — don't filter it. Headless libraries lean on `data-state="open"` attributes for styling hooks.
- Consider an **`asChild`** escape hatch (§2) or **`as`** (§8) for structural flexibility.

### When NOT to over-apply

Not every component needs ref-forwarding, `as`, and rest-spread. A high-level app screen doesn't. These are _reusable-primitive_ concerns — apply them to your design-system leaves, not to page components.

### TypeScript interaction

- Extend native props: `type Props = React.ComponentPropsWithoutRef<'button'> & { variant?: Variant }`.
- Use discriminated unions to make illegal prop combinations _unrepresentable_ — the compiler becomes your API-misuse linter.
- Type callbacks precisely (`onChange: (value: string) => void`, not `(...args: any) => void`).

---

## 14. Anti-patterns

### 14.1 Giant configuration objects / prop explosion

A component with 25 props (or one `config={{...}}` mega-object) is a private DSL. Symptoms: props that only make sense in combination, `if (props.x && !props.y)` thickets, docs longer than the component. **Fix:** convert configuration into composition (§1–2), or split into focused components. See §1.

### 14.2 Deeply prop-drilled god-components

One component that owns everything and threads dozens of props through many layers. **Fix:** colocate state lower; use composition/`children` to pass elements through without threading; use context (§10) _only_ for genuinely shared state. Prop drilling is not always bad — it's explicit and traceable — but _deep, wide_ drilling signals a missing composition or a missing provider. <https://kentcdodds.com/blog/prop-drilling>

### 14.3 Premature abstraction / the wrong abstraction (AHA)

The single most important anti-pattern to internalize. **AHA — "Avoid Hasty Abstractions"** (Kent C. Dodds), built on **Sandi Metz's "prefer duplication over the wrong abstraction."** <https://kentcdodds.com/blog/aha-programming>

> Sandi Metz: _"duplication is far cheaper than the wrong abstraction."_ The wrong abstraction is worse than duplication because every new requirement bends it further from its original shape until it's an unmaintainable tangle of conditional flags — and un-abstracting it is expensive and scary. <https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction>

Kent's practical rule: **stay WET (write everything twice) until the duplication's use cases are clear; then the commonalities "scream at you for abstraction."** Abstract on the _third_ occurrence, when you understand the real axis of variation — not the first. <https://kentcdodds.com/blog/aha-programming>

Concretely: when two components look 80% alike but you're not sure they'll evolve together, **duplicate**. When you abstract too early, every divergence becomes a `variant` prop / boolean flag bolted onto the shared thing (→ 14.1). Signs you built the wrong abstraction: growing flag parameters, callers passing options that only apply "sometimes," `if (isSpecialCaseForCallerX)`.

### 14.4 Leaky abstractions

An abstraction that forces callers to understand its internals to use it correctly — a `useFetch` that silently requires you to also call `useSomethingElse`, a component whose `className` gets overwritten so your styles mysteriously don't apply, a "headless" hook that actually assumes a specific DOM structure. **Fix:** honor the contract fully (forward refs/props/className, clean up effects, document lifecycle). Prop getters (§7) that _don't compose_ handlers are a classic leak — the caller's `onClick` vanishes.

### 14.5 Context as global-state dumping ground

One `AppContext` holding unrelated state → every consumer re-renders on any change, and every component now requires the provider to render/test. **Fix:** split contexts by concern and update frequency; keep most state colocated (§10). <https://kentcdodds.com/blog/application-state-management-with-react>

### 14.6 `cloneElement`-based prop injection into arbitrary children

Reaches only direct children, breaks on wrapping, collides on prop names, invisible in the type system. **Fix:** context-based compound components (§3). <https://www.patterns.dev/react/compound-pattern/>

### 14.7 Over-memoization / stability theater

Wrapping everything in `useMemo`/`useCallback` "for performance" without measuring adds noise and its own overhead. Memoize where identity _matters_ (context values §10, hook returns consumers depend on §12), not reflexively.

---

## 15. Choosing a pattern

A rough escalation ladder — **use the least powerful pattern that solves your problem** (inversion of control has a complexity cost; spend it only when reuse demands it). <https://kentcdodds.com/blog/inversion-of-control>

| Need                                                        | Reach for                                       |
| ----------------------------------------------------------- | ----------------------------------------------- |
| Caller supplies arbitrary content                           | **children / slots** (§1–2)                     |
| Related parts share implicit state, caller controls layout  | **compound components + context** (§3)          |
| Support both `defaultValue` and `value`/`onChange`          | **control props + `useControllableState`** (§4) |
| Caller must alter _state-transition logic_                  | **state reducer** (§5)                          |
| Caller owns all markup but needs correct props/a11y         | **prop getters** (§7) / **headless hooks** (§9) |
| Caller controls per-item rendering, you own iteration/state | **render props** (§6)                           |
| Same component, different underlying element                | **polymorphic `as`** (§8)                       |
| Share behavior only, no markup                              | **custom hook** (§12)                           |
| Distribute genuinely-shared state across the tree           | **provider + hook trio** (§10)                  |
| Wrap a boundary you can't put a hook inside                 | **HOC** (§11)                                   |

### The layered-API principle

The best libraries offer **multiple layers**: a headless core (max control) _and_ a configured convenience layer on top (min effort), so simple callers stay terse and advanced callers can drop down. Radix Primitives (headless) → shadcn/ui (styled, still composable) is the archetype. Design your own components the same way: build the composable/headless core first, then add opinionated wrappers for the common case — never the reverse. <https://www.radix-ui.com/primitives/docs/overview/introduction>

### Guiding maxims

1. **Composition over configuration** — expose holes, don't predict use cases (§1).
2. **Inversion of control, proportional to reuse** — give callers control (control props → state reducer → prop getters) _only as much as the component's reuse justifies_ (§4–7). <https://kentcdodds.com/blog/inversion-of-control>
3. **Separate behavior/state from presentation** — the headless philosophy; it's why the whole industry converged on it (§9).
4. **Prefer duplication over the wrong abstraction** — stay WET until the pattern screams; abstract on the third instance (§14.3). <https://kentcdodds.com/blog/aha-programming>
5. **Honor the platform contract** — forward refs, spread rest props, merge `className`, pass `aria-*`/`data-*` (§13).

---

## Sources

**Kent C. Dodds (patterns, IoC, AHA):**

- State reducer pattern with hooks — <https://kentcdodds.com/blog/the-state-reducer-pattern-with-react-hooks>
- The state reducer pattern (origin, Downshift) — <https://kentcdodds.com/blog/the-state-reducer-pattern>
- Inversion of control — <https://kentcdodds.com/blog/inversion-of-control>
- Prop getters — <https://kentcdodds.com/blog/how-to-give-rendering-control-to-users-with-prop-getters>
- Introducing Downshift (prop getters credited to Jared Forsyth) — <https://kentcdodds.com/blog/introducing-downshift-for-react>
- React hooks & the future of render props — <https://kentcdodds.com/blog/react-hooks-whats-going-to-happen-to-render-props>
- AHA Programming — <https://kentcdodds.com/blog/aha-programming>
- Prop drilling — <https://kentcdodds.com/blog/prop-drilling>
- How to use React context effectively — <https://kentcdodds.com/blog/how-to-use-react-context-effectively>
- Migrating to React's new context API (memoized value pitfall) — <https://kentcdodds.com/blog/migrating-to-reacts-new-context-api>
- Application state management with React — <https://kentcdodds.com/blog/application-state-management-with-react>

**Sandi Metz:**

- The Wrong Abstraction — <https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction>

**Radix / headless / primitives:**

- Radix Primitives introduction (open architecture, `asChild`, per-part packages) — <https://www.radix-ui.com/primitives/docs/overview/introduction>
- shadcn vs Radix vs Base UI (2026 landscape) — <https://dev.to/edriso/shadcn-vs-radix-vs-base-ui-which-one-should-a-junior-pick-in-2026-1jml>

**React Aria (Adobe):**

- Getting started (behavior via hooks, you own rendering) — <https://react-spectrum.adobe.com/react-aria/getting-started.html>
- `useToggleButton` (state/behavior split, `useToggleState`) — <https://react-spectrum.adobe.com/react-aria/useToggleButton.html>

**Downshift:**

- README (prop getters, composing handlers, state reducer) — <https://github.com/downshift-js/downshift/blob/master/README.md>

**Polymorphic components / TS:**

- Ben Ilegbodu — Polymorphic React components in TS — <https://www.benmvp.com/blog/polymorphic-react-components-typescript/>
- Ben Ilegbodu — Forwarding refs for polymorphic components — <https://www.benmvp.com/blog/forwarding-refs-polymorphic-react-component-typescript/>
- Steve Kinney — Mirroring DOM props with `ComponentPropsWithoutRef` — <https://stevekinney.com/courses/react-typescript/mirror-dom-props>

**Compound / context patterns:**

- patterns.dev — Compound pattern (`Children.map` vs context limitations) — <https://www.patterns.dev/react/compound-pattern/>

**Custom hooks / control props / TS tuples:**

- Control props & `useControllableState` — <https://sherryhsu.medium.com/usecontrollablestate-hook-b4801ec293e5>
- oida.dev — Typing custom hooks with tuple types (`as const`) — <https://oida.dev/typescript-react-typeing-custom-hooks/>
- tinytip — Custom hooks should return named tuples — <https://tinytip.co/tips/react-hook-tuple/>
