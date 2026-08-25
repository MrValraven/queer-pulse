# TypeScript & Accessibility for React

> **QueerPulse anchors & enforcement:**
>
> - **Typed context with a throwing guard:** `authContext.ts` is the repo's real version of Part 1 section 1.8 — `createContext<AuthContextValue | null>(null)` + `useAuth()` that throws outside the provider, so consumers get a non-null value.
> - **Discriminated-union props:** [Button.tsx](../../../../src/shared/components/ui/Button.tsx) (`ButtonAs*` union) is Part 1 section 1.5 in production.
> - **Generic hooks:** `useRequiredFieldValidation<Values, FieldKey extends keyof Values>` and the `[value, setValue] as const` tuple idiom (section 1.6).
> - **Accessibility wiring:** `FormField.tsx` owns `useId` + `htmlFor`/`aria-describedby`/`aria-invalid`/`aria-required` (Part 2 section 2.2); `Tabs.tsx` carries `role="tablist"`/`role="tab"`/`aria-selected` (section 2.3).
> - **Enforced by CI** (see `queerpulse-react-map.md` section 4): `no-explicit-any` is **off** but the `no-unsafe-*` family is **warn** (don't pipe `any` — Part 1 section 1.9); `no-floating-promises`/`no-misused-promises` are **hard errors** (async handlers must be handled); `jsx-a11y` recommended runs at warn (treat as real). Icon-only controls use `react-icons/fi`, never emoji (`no-emoji` error) — the accessible-name rules of Part 2 section 2.7 still apply.
> - **Motion:** the repo already ships `usePrefersReducedMotion()` (Part 2 section 2.8) — use it, don't re-roll `matchMedia`.
>
> This repo has **no headless-a11y library** (Part 2 section 2.10). Build accessible widgets from native elements + the primitives above; if a combobox/menu-grade widget appears, flag it before hand-rolling.

---

# Typing React Components Well & Building Accessible React Components

A dense, cited reference in two linked halves. Part 1 makes your components _correct at the type level_; Part 2 makes them _usable by everyone_. They are linked because the same design instincts — model the real states, don't paper over them — produce both sound types and sound accessibility. A discriminated union that makes an invalid prop combination un-representable (Part 1) is the same move as a component that makes an invalid interaction impossible (Part 2).

Every non-obvious claim carries an inline source URL. Snippets are idiomatic React 19 + TypeScript (strict mode assumed) and are meant to actually compile.

---

# PART 1 — TypeScript with React, in depth

## 1.1 Typing props: `interface` vs `type`

Both work. The React+TypeScript community leans toward `type` for props/state because it composes with unions and intersections, which component props frequently need, while `interface` shines for public, extensible API surfaces because it supports `extends` and declaration merging.

- Use `interface` when you expect consumers to `extends` it, or you're authoring a library's public prop contract.
- Use `type` when the prop shape is a **union** (`type Props = A | B`), an **intersection with native props**, or uses mapped/conditional/template-literal types — things `interface` can't express directly.

Source (React TypeScript Cheatsheet — Types or Interfaces): https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/basic_type_example/ — the cheatsheet's guidance: consider `type` for consistency because it's "more constrained," but either is fine and it's largely convention.

```tsx
// interface — public, extensible contract
interface CardProps {
  title: string;
  footer?: React.ReactNode; // optional
  readonly id: string; // consumer can't reassign on the props object
}

// type — needed the moment you union or intersect
type BannerProps =
  | { variant: "info"; message: string }
  | { variant: "error"; message: string; retry: () => void };
```

### `readonly`, required vs optional, and defaults

- Props are conceptually immutable inside a component; marking fields `readonly` documents that and blocks accidental `props.x = …` mutation. React never expects you to mutate props, so `readonly` costs nothing.
- `?` makes a prop optional at the type level. An optional prop's type is `T | undefined` inside the body — you must handle `undefined`.
- Prefer **default values via destructuring** over `defaultProps` (which is effectively deprecated for function components in React 19 — React logs a warning and it's slated for removal). See react.dev deprecations note: https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-proptypes-and-defaultprops

```tsx
interface ButtonProps {
  label: string;
  variant?: "solid" | "ghost"; // optional...
  disabled?: boolean;
}

function Button({ label, variant = "solid", disabled = false }: ButtonProps) {
  // `variant` is now `"solid" | "ghost"` (not `| undefined`) thanks to the default
  return (
    <button disabled={disabled} data-variant={variant}>
      {label}
    </button>
  );
}
```

A subtlety: a default in destructuring narrows the _local binding_ but not the declared prop type. That's usually what you want. If you want the prop to be **required** but still have a fallback, keep it required and don't default it — a missing required prop is a compile error, which is stronger than a silent default.

## 1.2 Children typing: `ReactNode` vs `ReactElement` vs specific

`React.ReactNode` is the correct type for "anything React can render as children": strings, numbers, elements, arrays, fragments, `null`, `undefined`, booleans. Use it 95% of the time.

- `ReactNode` — the general children type. `children?: React.ReactNode`.
- `ReactElement` — specifically a JSX element (has `type`, `props`, `key`). Use when you need to `cloneElement`, inspect `.props`, or restrict children to _elements only_ (no bare strings).
- `ReactElement<SpecificProps>` or a component-specific type — when you require children to be a particular component (e.g. a `<Tabs>` that only accepts `<Tab>` children). Note this is a soft constraint; TypeScript can't fully guarantee element identity, so also validate at runtime if it matters.

Source (React TypeScript Cheatsheet — useful types): https://react-typescript-cheatsheet.netlify.app/docs/basic/troubleshooting/types/ and react.dev typing children: https://react.dev/learn/typescript#typing-children

```tsx
// General children
interface PanelProps {
  children: React.ReactNode;
}

// Element-only children (a render-prop-ish wrapper needing cloneElement)
interface TooltipProps {
  children: React.ReactElement; // must be a single element with a ref
}
```

### The `import type { ReactNode }` idiom

Prefer importing the type by name and using a **type-only import** so the bundler can erase it. This avoids importing the `React` namespace purely for types and plays well with `verbatimModuleSyntax`.

```tsx
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}
```

`import type` guarantees the import is elided from output (TS handbook — Type-Only Imports): https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export . With the classic JSX transform you no longer need `import React from "react"` just to write JSX (react.dev — new JSX transform): https://react.dev/blog/2020/09/22/introducing-the-new-jsx-transform

> Note: `JSX.Element` is roughly `ReactElement` and is what a component's _return_ is inferred as; you rarely need to annotate return types by hand — let inference do it.

## 1.3 Typing events and refs from React's own types

Never hand-roll event types. React ships precise synthetic event generics parameterized by the element. Reach for them so `event.target`/`currentTarget` are correctly typed.

Source (React TypeScript Cheatsheet — forms & events): https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forms_and_events/

```tsx
function SearchForm() {
  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    console.log(event.currentTarget.value); // string, typed
  }
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }
  function onClick(event: React.MouseEvent<HTMLButtonElement>) {}
  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      /* ... */
    }
  }
  return (
    <form onSubmit={onSubmit}>
      <input onChange={onChange} onKeyDown={onKeyDown} />
      <button onClick={onClick}>Go</button>
    </form>
  );
}
```

Key event types you'll actually use: `React.ChangeEvent<T>`, `React.FormEvent<T>`, `React.MouseEvent<T>`, `React.KeyboardEvent<T>`, `React.FocusEvent<T>`, `React.PointerEvent<T>`, `React.ClipboardEvent<T>`, `React.DragEvent<T>`. There is also `React.ChangeEventHandler<T>` etc. if you want to type the _handler slot_ rather than the event.

Tip: **prefer inlining the handler in JSX** when possible; React infers the event type from the element and you don't annotate anything:

```tsx
<input onChange={(event) => setValue(event.currentTarget.value)} /> // event is inferred
```

### Typing DOM refs with `useRef`

Give `useRef` the element type as its generic. Initialize with `null` for DOM refs.

```tsx
const inputRef = useRef<HTMLInputElement>(null);
// inputRef.current: HTMLInputElement | null  → must null-check before use
useEffect(() => {
  inputRef.current?.focus();
}, []);
```

- DOM ref: `useRef<HTMLDivElement>(null)` → the ref object is `RefObject<HTMLDivElement>` and `.current` is possibly `null` (you don't own assignment; React does).
- Mutable instance value you _do_ write: `useRef<number>(0)` → `.current: number`, writable. (React 19 tightened these overloads; `useRef` now requires an argument.) See react.dev useRef: https://react.dev/reference/react/useRef

### React 19 ref-as-prop typing (the big change)

In React 19, `ref` is a **regular prop** for function components. `forwardRef` is deprecated (still works in 19, will be removed later), and codemods exist to migrate. This means you type `ref` in your own props type like any other prop — no `forwardRef` generic wrapping.

Source (react.dev — forwardRef, deprecation): https://react.dev/reference/react/forwardRef and React 19 blog: https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop . Migration guide overview: https://plainenglish.io/blog/react-19-deprecates-forwardref-a-guide-to-passing-ref-as-a-standard-prop

```tsx
// React 19 — no forwardRef
interface TextInputProps extends React.ComponentPropsWithoutRef<"input"> {
  ref?: React.Ref<HTMLInputElement>;
}

function TextInput({ ref, ...rest }: TextInputProps) {
  return <input ref={ref} {...rest} />;
}

// Consumer:
const ref = useRef<HTMLInputElement>(null);
<TextInput ref={ref} placeholder="Name" />;
```

Even simpler: if you extend `ComponentPropsWithRef<"input">`, the `ref` prop is already included with the right type, so you don't declare it yourself:

```tsx
type TextInputProps = React.ComponentPropsWithRef<"input">;
function TextInput({ ref, ...rest }: TextInputProps) {
  return <input ref={ref} {...rest} />;
}
```

`React.Ref<T>` = `RefCallback<T> | RefObject<T> | null` — accepts both callback refs and object refs. Use it when _you_ declare the `ref` prop. Pre-React-19 codebases still use `React.forwardRef<HTMLInputElement, Props>(...)` where the first generic is the element and the second is the props.

## 1.4 `ComponentProps` family — extending & forwarding native props

Three utilities, from `react`:

- `React.ComponentProps<T>` — all props of `T`, where `T` is an element string (`"button"`) **or** a component. Includes `ref` for host elements.
- `React.ComponentPropsWithoutRef<T>` — same, minus `ref`. **Default choice** for wrappers that don't forward a ref.
- `React.ComponentPropsWithRef<T>` — same, including a correctly-typed `ref`. Use when you _do_ forward the ref (React 19 makes this the natural pick).

Source (React TypeScript Cheatsheet — wrapping/mirroring HTML elements): https://react-typescript-cheatsheet.netlify.app/docs/advanced/patterns_by_usecase/ and DHiWise on `ComponentPropsWithoutRef`: https://www.dhiwise.com/post/understanding-the-role-of-componentpropswithoutref-in-react

### The `Omit` + extend pattern for wrapper components

When you wrap a native element but want to **override** some of its props (change the type of `onChange`, forbid `type`, replace `color`, etc.), intersecting would create an impossible type (two incompatible `onChange`s). Strip the conflicting native props with `Omit`, then add your own.

```tsx
// A Button that adds `variant` and a typed `icon`, forwards everything else to <button>
interface ButtonOwnProps {
  variant?: "solid" | "ghost" | "danger";
  icon?: React.ReactNode;
}

type ButtonProps = ButtonOwnProps &
  Omit<React.ComponentPropsWithoutRef<"button">, keyof ButtonOwnProps>;

function Button({ variant = "solid", icon, children, ...rest }: ButtonProps) {
  return (
    <button data-variant={variant} {...rest}>
      {icon}
      {children}
    </button>
  );
}
```

`Omit<Native, keyof Own>` guarantees your own props win and there's no collision. This is the canonical "extend a native element" recipe. A `Select` wrapping `<select>`, an `Input` wrapping `<input>`, a `Link` wrapping `<a>` all follow it.

For controlled inputs where you narrow `onChange` to give the consumer a `string` instead of an event:

```tsx
interface MoneyInputProps extends Omit<
  React.ComponentPropsWithoutRef<"input">,
  "onChange" | "value"
> {
  value: number;
  onChange: (cents: number) => void;
}
```

## 1.5 Discriminated unions — killing boolean soup

Boolean props multiply into invalid states. `isLoading` + `isError` + `data` can be `true, true, present` — a nonsense combination the types happily allow. A **discriminated union** — a set of object types sharing a literal `kind`/`status` field (the _discriminant_) — makes invalid combinations un-representable and lets TypeScript narrow.

Sources: Total TypeScript (discriminated unions): https://www.totaltypescript.com/discriminated-unions-are-a-devs-best-friend • Developer Way (advanced TS for React — discriminated unions): https://www.developerway.com/posts/advanced-typescript-for-react-developers-discriminated-unions

```tsx
// BAD: boolean soup — 2^3 = 8 representable states, most invalid
interface BadProps {
  isLoading: boolean;
  isError: boolean;
  data?: User[];
}

// GOOD: exactly the 3 real states, each carrying only its valid data
type AsyncState<T> =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "success"; data: T };

function UserList({ state }: { state: AsyncState<User[]> }) {
  switch (state.status) {
    case "loading":
      return <Spinner />;
    case "error":
      return <ErrorBanner message={state.error.message} />; // `error` exists only here
    case "success":
      return (
        <ul>
          {state.data.map((u) => (
            <li key={u.id}>{u.name}</li>
          ))}
        </ul>
      ); // `data` only here
    default:
      return assertNever(state); // exhaustiveness — see below
  }
}
```

Variant props are the other classic use: a `Toast` whose `action` is required only when `variant === "actionable"`:

```tsx
type ToastProps =
  | { variant: "info" | "success"; message: string }
  | {
      variant: "actionable";
      message: string;
      actionLabel: string;
      onAction: () => void;
    };
// Passing actionLabel to an "info" toast is now a compile error.
```

### Exhaustiveness checking with `never`

The `default` branch above uses an `assertNever` helper. In a fully-handled `switch`, the value reaching `default` has type `never`; if you later add a new variant and forget a `case`, that value is no longer `never` and the call **fails to compile** — a compile-time reminder to handle the new case.

Source (exhaustiveness via `never`): TS handbook narrowing / DEV on satisfies+never: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking

```tsx
function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(value)}`);
}
```

### Mutually-exclusive props without a discriminant

Sometimes you want "either `href` (renders `<a>`) or `onClick` (renders `<button>`), never both." Use a union of object shapes, optionally with `never` to forbid the other key:

```tsx
type ClickableProps =
  { href: string; onClick?: never } | { href?: never; onClick: () => void };
```

The `onClick?: never` in the first arm makes passing `onClick` alongside `href` an error. This is the "XOR props" pattern.

## 1.6 Generic components, generic hooks, polymorphic `as`

### Generic components (`<List<T>>`, `<Select<T>>`)

A generic component threads a type parameter from a prop (e.g. `items: T[]`) through to callbacks (`renderItem: (item: T) => ReactNode`), preserving inference so consumers get full type safety with zero annotations.

```tsx
interface ListProps<T> {
  items: readonly T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey: (item: T) => React.Key;
}

function List<T>({ items, renderItem, getKey }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={getKey(item)}>{renderItem(item, i)}</li>
      ))}
    </ul>
  );
}

// Usage — T is inferred as User; `item` in renderItem is User, no annotation needed
<List
  items={users}
  getKey={(user) => user.id}
  renderItem={(user) => <span>{user.name}</span>}
/>;
```

A typed `Select<T>`:

```tsx
interface SelectProps<T> {
  options: readonly T[];
  value: T | null;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string;
}

function Select<T>({
  options,
  value,
  onChange,
  getLabel,
  getValue,
}: SelectProps<T>) {
  return (
    <select
      value={value ? getValue(value) : ""}
      onChange={(e) => {
        const next = options.find((o) => getValue(o) === e.currentTarget.value);
        if (next) onChange(next);
      }}
    >
      {options.map((o) => (
        <option key={getValue(o)} value={getValue(o)}>
          {getLabel(o)}
        </option>
      ))}
    </select>
  );
}
```

Notes on inference: arrow-function components with generics need a trailing comma in `.tsx` (`const List = <T,>(...) => ...`) so the parser doesn't read `<T>` as JSX. Function declarations (`function List<T>()`) don't have this issue — prefer them for generic components. Inference across callback props is a known sharp edge; see TS issue #44596: https://github.com/microsoft/TypeScript/issues/44596

### Generic custom hooks — preserving inference and return-type discipline

```tsx
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initial;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const; // tuple, not (T | Dispatch)[]
}
```

`as const` on the returned array turns it into a **readonly tuple** `[T, Dispatch<SetStateAction<T>>]` so destructuring `const [v, setV] = useLocalStorage(...)` types each slot correctly. Without it you'd get a union-element array. This is the single most important trick for hooks that return tuples.

### Polymorphic `as` components (done correctly)

A polymorphic component renders as different elements via an `as` prop while typing the _rest_ of the props according to that element. The core type merges `{ as?: T }` with `ComponentPropsWithoutRef<T>`, `Omit`-ing your own keys to avoid collisions.

Sources: Ben Ilegbodu (polymorphic components in TS): https://www.benmvp.com/blog/polymorphic-react-components-typescript/ • LogRocket: https://blog.logrocket.com/build-strongly-typed-polymorphic-components-react-typescript/ • Steve Kinney: https://stevekinney.com/courses/react-typescript/polymorphic-components-and-as-prop

```tsx
type PolymorphicProps<E extends React.ElementType, Own> = Own & {
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, "as" | keyof Own>;

interface TextOwnProps {
  weight?: "normal" | "bold";
}

function Text<E extends React.ElementType = "span">({
  as,
  weight = "normal",
  ...rest
}: PolymorphicProps<E, TextOwnProps>) {
  const Component = as ?? "span";
  return <Component data-weight={weight} {...rest} />;
}

// <Text>hi</Text>                       → renders <span>, accepts span props
// <Text as="a" href="/x">link</Text>    → href is required-valid because as="a"
// <Text as="button" onClick={fn} />     → button props typed
// <Text as="a" onClick={fn} bogus />    → `bogus` is a type error
```

Caveat: fully-correct polymorphic components with **ref forwarding** get verbose (you need a `PolymorphicRef<E>` helper). Honestly, for most design systems a small fixed set of `as` targets or just separate components is simpler and more maintainable than a perfectly-generic polymorphic ref type. Reach for a library primitive (Radix `Slot`, React Aria) if you need it at scale — see Part 2 §2.11.

## 1.7 Utility & language features you actually use

Sources: TS handbook utility types: https://www.typescriptlang.org/docs/handbook/utility-types.html • Total TypeScript on `satisfies`: https://www.totaltypescript.com/how-to-use-satisfies-operator

- **`Pick<T, K>`** — subset of props to pass down: `Pick<CardProps, "title" | "id">`.
- **`Omit<T, K>`** — remove keys (the wrapper pattern in §1.4).
- **`Partial<T>`** — all optional, e.g. an `overrides?: Partial<Theme>` prop or an update payload.
- **`Required<T>`** — the inverse; useful after applying defaults to assert nothing's optional anymore.
- **`Record<K, V>`** — dictionaries/lookup maps: `Record<Variant, string>` for a variant→className map (and the compiler forces you to cover every key).
- **`Parameters<typeof fn>` / `ReturnType<typeof fn>`** — derive types from functions instead of duplicating them.

### `ReturnType<typeof useThing>` for hook return types

When a component needs the exact shape a hook returns (e.g. to pass it through context or props), don't re-declare it — derive it:

```tsx
function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const add = (item: CartItem) => setItems((prev) => [...prev, item]);
  const total = items.reduce((sum, i) => sum + i.price, 0);
  return { items, add, total };
}

type CartApi = ReturnType<typeof useCart>; // { items: CartItem[]; add: (...)=>void; total: number }
```

This stays in sync automatically as the hook evolves.

### `satisfies` — validate without widening

`satisfies` (TS 4.9+) checks a value against a type **without changing the value's inferred, narrower type**. Perfect for config objects, variant maps, and design tokens where you want both "did I match the contract?" and "keep the literal types for autocomplete."

Source: https://www.totaltypescript.com/how-to-use-satisfies-operator

```tsx
const variantStyles = {
  solid: { bg: "brand.600", fg: "white" },
  ghost: { bg: "transparent", fg: "brand.600" },
} satisfies Record<"solid" | "ghost", { bg: string; fg: string }>;

// Without `satisfies`, annotating `: Record<...>` would widen `bg` to `string`,
// losing the literal. With `satisfies`, variantStyles.solid.bg is the literal "brand.600",
// AND a missing/extra key is a compile error.
```

Rule of thumb (Total TypeScript): use `satisfies` when you want the _narrow_ type of the value but still want to verify it conforms, or when the type is complex enough that you want the check.

### `const` assertions & template-literal types for tokens/variants

```tsx
const SIZES = ["sm", "md", "lg"] as const;
type Size = (typeof SIZES)[number]; // "sm" | "md" | "lg" — single source of truth

// Template-literal types generate token unions from parts
type Space = 1 | 2 | 3 | 4;
type SpaceToken = `space-${Space}`; // "space-1" | "space-2" | "space-3" | "space-4"

type Variant = "primary" | "danger";
type State = "hover" | "active";
type ClassToken = `${Variant}--${State}`; // "primary--hover" | ... (4 combos)
```

`as const` gives you a runtime array _and_ a derived literal union with zero duplication — iterate `SIZES` at runtime, use `Size` at the type level.

## 1.8 Typing context so "used outside provider" is a _type_ error

The default `createContext` value forces a bad choice: give it a real default (masks the missing-provider bug) or give it `undefined` (every consumer must null-check). The idiomatic fix: initialize with `undefined`, then wrap `useContext` in a custom hook that **throws** if the value is `undefined`, and _narrows the return type to non-undefined_. Consumers get a guaranteed-present, fully-typed value; forgetting the provider throws a clear runtime error at the first read.

Sources: Steve Kinney (safer createContext helpers): https://stevekinney.com/courses/react-typescript/safer-createcontext-helpers • Kent C. Dodds (how to use React Context effectively): https://kentcdodds.com/blog/how-to-use-react-context-effectively

```tsx
import { createContext, useContext, useState } from "react";

interface AuthContextValue {
  user: User | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
}

// undefined default → the "no provider" sentinel
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const value: AuthContextValue = {
    user,
    signIn: async (email) => {
      /* ... */
    },
    signOut: () => setUser(null),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook: throws on misuse, and RETURNS AuthContextValue (not | undefined)
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context; // narrowed: TypeScript knows it's defined past the guard
}
```

Because `useAuth` returns `AuthContextValue` (never `undefined`), every consumer uses `user`/`signIn` without a null-check, and the missing-provider case is caught immediately with a readable message instead of a downstream `Cannot read properties of undefined`. Don't export the raw `AuthContext` — export only the provider and the hook so nobody bypasses the guard.

## 1.9 Avoiding `any`; safe narrowing; typing async data; safe casts

**`any` is a hole in the type system** — it disables checking on everything it touches and spreads silently. Reach for `unknown` instead: `unknown` accepts any value but forces you to narrow before use.

```tsx
// eslint: @typescript-eslint/no-explicit-any catches these
async function loadUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  const data: unknown = await res.json(); // NOT any
  return parseUser(data); // validate → typed
}
```

### Validate at the boundary (don't cast network data)

`await res.json()` is `any`. Casting `as User` is a **lie** — nothing checked the shape. Validate with a schema library (Zod, Valibot) so the type and the runtime agree:

```tsx
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});
type User = z.infer<typeof UserSchema>; // type derived FROM the runtime schema

function parseUser(data: unknown): User {
  return UserSchema.parse(data); // throws on mismatch; return value is typed User
}
```

`z.infer<typeof Schema>` gives one source of truth: the runtime validator _is_ the type. Zod docs: https://zod.dev/

### Safe narrowing

Use type guards, `in`, `typeof`, `Array.isArray`, and user-defined predicates rather than casts:

```tsx
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "email" in value
  );
}
```

### When a cast is acceptable — and how to make it safe

Casts (`as`) are occasionally justified: (a) narrowing after a runtime check TS can't follow, (b) `as const`, (c) interop with untyped libs, (d) `event.target as HTMLInputElement` when you know the target. Rules:

- Cast to a **more specific** type only when you've _proven_ it (a runtime check nearby).
- Never `as any`; if you must widen, `as unknown as T` at least flags it as deliberate and forces a two-step.
- Prefer a validated `parse` over any cast for external data.

```tsx
// Acceptable: DOM narrowing you can justify
function onInput(event: React.FormEvent<HTMLFormElement>) {
  const input = event.target as HTMLInputElement; // event.target is EventTarget; you know it's an input
  console.log(input.value);
}
```

If you catch yourself writing `as` to silence an error you don't understand, stop — the error is usually right.

---

# PART 2 — Accessibility for React components

Accessibility (a11y) isn't a bolt-on; like sound types, it comes from modeling reality. The through-line from Part 1: **use the platform**. In types, that's `ComponentProps<"button">` instead of re-inventing; in a11y, it's `<button>` instead of `<div role="button">`. The native thing already encodes the correct behavior.

## 2.1 Semantic HTML first; "the first rule of ARIA is don't use ARIA"

The single highest-leverage a11y decision is using the right native element. Native elements come with roles, keyboard behavior, focus, and states **for free** and are the best-supported by assistive tech.

The first rule of ARIA (from the W3C's _Using ARIA_): _"If you can use a native HTML element or attribute with the semantics and behavior you require already built in, instead of re-purposing an element and adding an ARIA role, state or property to make it accessible, then do so."_ Source: https://www.w3.org/TR/using-aria/#firstrule and MDN ARIA overview: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA

"No ARIA is better than bad ARIA": WebAIM's analysis of a million home pages found pages _with_ ARIA averaged significantly more detected errors than pages without — because ARIA is commonly applied incorrectly. Source: https://webaim.org/projects/million/ and CodeMag "First Rule of ARIA": https://www.codemag.com/Article/2411051

Concretely, in React:

```tsx
// DON'T
<div className="btn" onClick={submit}>Save</div>

// DO — free role, focusability, Enter/Space activation, disabled semantics, form submission
<button type="button" onClick={submit}>Save</button>
```

Use `<button>` for actions, `<a href>` for navigation, `<nav> <main> <header> <footer> <aside>` for landmarks, `<ul>/<ol>/<li>` for lists, `<h1>–<h6>` in order for structure, `<label>` for fields, `<table>` for tabular data, `<dialog>` for dialogs. Add ARIA **only** to fill a gap the platform genuinely doesn't cover (e.g. `aria-current`, `aria-live`, a custom widget the DOM has no element for).

## 2.2 Accessible names & form field association

Every interactive/meaningful element needs an **accessible name** — the text assistive tech announces. Name resolution priority (simplified): `aria-labelledby` → `aria-label` → associated `<label>`/content → `title`. Source (accessible name computation, MDN): https://developer.mozilla.org/en-US/docs/Glossary/Accessible_name and W3C accname spec: https://www.w3.org/TR/accname-1.2/

### Form fields: associate a real `<label>`

```tsx
// Best: explicit label association via htmlFor ↔ id (React uses htmlFor)
<label htmlFor="email">Email</label>
<input id="email" type="email" name="email" />

// Also valid: wrapping (implicit association)
<label>
  Email
  <input type="email" name="email" />
</label>
```

Never rely on a placeholder as a label — it vanishes on input and often fails contrast. If a design truly has no visible label, use `aria-label` (but a visible label is better for everyone).

### Required, invalid, and descriptions

- **Required**: use the native `required` attribute; add `aria-required="true"` only if you can't use native validation.
- **Invalid**: set `aria-invalid={hasError}` on the field.
- **Describe** hint/error text with `aria-describedby` pointing at the element(s) that hold it. Multiple ids are space-separated.

```tsx
function EmailField({ error }: { error?: string }) {
  const hintId = "email-hint";
  const errorId = "email-error";
  return (
    <div>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={`${hintId}${error ? ` ${errorId}` : ""}`}
      />
      <p id={hintId}>We'll never share it.</p>
      {error && (
        <p id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

`role="alert"` (an implicit assertive live region) makes the error announced when it appears — see §2.6. Source (MDN aria-describedby): https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby

Use React's `useId()` to generate stable, unique, SSR-safe ids for these associations instead of hardcoding:

```tsx
const id = useId();
const errorId = `${id}-error`;
```

`useId` docs: https://react.dev/reference/react/useId

## 2.3 Keyboard interaction contracts (WAI-ARIA APG)

Every interactive widget has an expected keyboard contract. The WAI-ARIA Authoring Practices Guide (APG) is the reference. Overarching rule (APG — Developing a Keyboard Interface): use **Tab / Shift+Tab to move between widgets**, and **arrow keys to move within a composite widget**; **Enter/Space activate**; **Escape dismisses**. Source: https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/ and patterns index: https://www.w3.org/WAI/ARIA/apg/patterns/

### Button (`<button>`)

- **Enter** and **Space** activate. Native `<button>` does this for free; a `role="button"` element does **not** (see §2.5).
- APG: https://www.w3.org/WAI/ARIA/apg/patterns/button/

### Link (`<a href>`)

- **Enter** activates (links do _not_ activate on Space — that's a button behavior). Another reason not to swap the two.
- Use links for navigation (changes URL/location), buttons for actions.

### Disclosure (show/hide)

- A `<button aria-expanded>` toggles a region. **Enter/Space** toggle. Focus stays on the trigger.
- Requires `aria-expanded={open}` on the trigger and, commonly, `aria-controls` pointing at the region id.
- APG: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/

```tsx
function Disclosure({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <button
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        {title}
      </button>
      <div id={id} hidden={!open}>
        {children}
      </div>
    </>
  );
}
```

### Tabs

- Tab list uses **roving tabindex** (§2.4): only the active tab is in the tab order. **Arrow Left/Right** (horizontal) move between tabs; **Home/End** jump to first/last.
- Activation is either **automatic** (focus a tab → its panel shows) or **manual** (arrow to focus, Enter/Space to activate). Manual is preferable when panels are expensive.
- Roles: `role="tablist"` > `role="tab"` (with `aria-selected`, `aria-controls`) and `role="tabpanel"` (with `aria-labelledby`). **Tab** key moves from the tablist to the active panel.
- APG: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

### Dialog / Modal

- On open: move focus **into** the dialog (first focusable element, or a `tabindex="-1"` heading if the content is long). Trap Tab/Shift+Tab **inside**. **Escape** closes. On close: **restore focus** to the element that opened it.
- Roles/attrs: `role="dialog"` + `aria-modal="true"` + an accessible name via `aria-labelledby` (the title) or `aria-label`.
- APG (Dialog Modal pattern): https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ — note the APG guidance: modal dialogs do not let focus leave without closing, and if content is long, add `tabindex="-1"` to the title and focus it so the top isn't scrolled out of view.
- Prefer the native `<dialog>` element with `.showModal()` — it gives focus trapping, Escape-to-close, backdrop, and top-layer stacking for free. MDN: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog

### Menu (menu button → menu)

- Trigger: `aria-haspopup="menu"` + `aria-expanded`. **Enter/Space/Down** open the menu and focus the first item.
- Inside: **Up/Down** move between `role="menuitem"`s (roving tabindex), **Escape** closes and returns focus to the trigger, **Enter** activates an item. **Home/End** to first/last.
- This is the _application_ menu role — don't use `role="menu"` for a list of links (that's just a `<nav>` with a list). APG: https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/

### Combobox (autocomplete/select)

- Input has `role="combobox"`, `aria-expanded`, `aria-controls` → listbox, and `aria-activedescendant` pointing at the virtually-focused option (focus stays in the input). **Down/Up** move the active option, **Enter** selects, **Escape** closes, typing filters.
- Listbox: `role="listbox"` of `role="option"` (with `aria-selected`).
- This is one of the hardest widgets to get right — strongly consider a library (§2.11). APG: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ and listbox: https://www.w3.org/WAI/ARIA/apg/patterns/listbox/

## 2.4 Focus management

Focus is the keyboard user's cursor. Managing it well is most of custom-widget a11y.

### Focus trapping in modals

While a modal is open, Tab must cycle only through the modal's focusables. Native `<dialog>.showModal()` handles this. If you hand-roll, capture the first/last focusable and loop:

```tsx
function useFocusTrap(
  ref: React.RefObject<HTMLElement | null>,
  active: boolean,
) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const node = ref.current;
    const focusables = node.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    node.addEventListener("keydown", onKeyDown);
    return () => node.removeEventListener("keydown", onKeyDown);
  }, [ref, active]);
}
```

### Restoring focus on close

Save `document.activeElement` before opening; restore it after closing. Without this, keyboard/screen-reader users get dumped at the top of the DOM.

```tsx
function useRestoreFocus(open: boolean) {
  const previous = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (open) {
      previous.current = document.activeElement as HTMLElement | null;
    } else {
      previous.current?.focus();
    }
  }, [open]);
}
```

### Roving tabindex

For composite widgets (tabs, menus, toolbars, radio groups, grids), keep exactly **one** child at `tabIndex={0}` and the rest at `tabIndex={-1}`; arrow keys move the "0" (and programmatic focus) between children. Tab thus enters/leaves the whole widget in one stop, matching desktop behavior. Source (APG keyboard interface — roving tabindex): https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex and Stefan Judis: https://www.stefanjudis.com/today-i-learned/roving-tabindex/

```tsx
function Toolbar({
  actions,
}: {
  actions: { id: string; label: string; run: () => void }[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      const next = (activeIndex + 1) % actions.length;
      setActiveIndex(next);
      refs.current[next]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      const prev = (activeIndex - 1 + actions.length) % actions.length;
      setActiveIndex(prev);
      refs.current[prev]?.focus();
      e.preventDefault();
    }
  }
  return (
    <div role="toolbar" onKeyDown={onKeyDown}>
      {actions.map((a, i) => (
        <button
          key={a.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          tabIndex={i === activeIndex ? 0 : -1} // roving
          onClick={a.run}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
```

### `:focus-visible` — visible focus for keyboard, quiet for mouse

Never remove focus outlines outright (WCAG 2.4.7 Focus Visible). Use `:focus-visible` so a strong ring shows for keyboard/programmatic focus but not on mouse click. Source: MDN https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible • WCAG 2.4.7: https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html . WCAG 2.2 added 2.4.11 _Focus Not Obscured_ — the focused element must not be entirely hidden by sticky headers/footers: https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html

```css
.button:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
/* Do NOT do `:focus { outline: none }` with no replacement */
```

### Skip links

A "Skip to main content" link as the first focusable element lets keyboard users bypass the nav. It's visually hidden until focused (use a class that moves it off-screen, **not** `display:none`, which removes it from the tab order). Source: WebAIM skip nav https://webaim.org/techniques/skipnav/

```tsx
<a href="#main" className="skip-link">
  Skip to main content
</a>;
{
  /* ... */
}
<main id="main" tabIndex={-1}>
  …
</main>;
```

```css
.skip-link {
  position: absolute;
  left: -9999px;
}
.skip-link:focus {
  left: 1rem;
  top: 1rem; /* becomes visible on focus */
}
```

### Managing focus on route change (SPA)

Client-side navigation doesn't move focus or announce the new page the way a full load does. On route change, move focus to the new page's `<h1>` (or a top-of-main `tabIndex={-1}` container) and/or announce the title via a live region, so screen-reader and keyboard users know they navigated. Source (Gatsby/React Router a11y focus patterns): https://www.gatsbyjs.com/blog/2020-02-10-accessible-client-side-routing-techniques/ and general discussion: https://www.smashingmagazine.com/2020/09/accessibility-focus-management-single-page-applications/

```tsx
function usePageFocus(routeKey: string) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [routeKey]);
  return headingRef;
}
// <h1 tabIndex={-1} ref={headingRef}>Page title</h1>
```

## 2.5 Custom interactive elements

If you _must_ build an interactive control from a non-interactive element (rare — prefer native), you owe it the full contract:

1. **`role`** — the widget role (`"button"`, `"tab"`, etc.).
2. **`tabIndex={0}`** — make it focusable.
3. **Key handlers** — replicate the native keyboard behavior.

A `<span role="button">` is _not_ a button until you add Enter **and** Space activation yourself — native buttons respond to both; a span responds to neither. Source (MDN — button role, "must add keyboard event handlers"): https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role

```tsx
// If you truly can't use <button> (you almost always can):
function FakeButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault(); // Space would otherwise scroll the page
          onClick();
        }
      }}
    >
      {children}
    </span>
  );
}
```

This is _more code, worse support, and easy to get wrong_ than `<button onClick={onClick}>`. That's the whole point of §2.1.

### Never nest interactive elements

Don't put a `<button>` inside an `<a>`, an `<a>` inside a `<button>`, or an interactive control inside a `<label>`'s target — nested interactives break keyboard order, screen-reader announcement, and are invalid HTML. Source (HTML spec — interactive content model / `<a>` content restrictions): https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element and MDN: https://developer.mozilla.org/en-US/docs/Web/HTML/Content_categories#interactive_content . If you need "a card that's clickable but has a button inside," use a single primary link (e.g. a stretched-link pattern) plus separate, non-overlapping controls.

## 2.6 Live regions for async / toast / validation updates

When content changes without a focus change (a toast appears, a search returns results, a form field becomes invalid), screen readers won't notice unless the change happens in a **live region**. `aria-live="polite"` waits for the user to be idle (use for almost everything); `aria-live="assertive"` interrupts immediately (use only for urgent, time-critical messages). Source: MDN ARIA live regions https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions and when-to-use guidance: https://rightsaidjames.com/2025/08/aria-live-regions-when-to-use-polite-assertive/

- `role="status"` = polite live region (status messages, "Saved").
- `role="alert"` = assertive live region (errors demanding attention).
- The live region container must **exist in the DOM before** the text is injected — mounting a region and its text simultaneously can miss the announcement. Keep an always-present container and update its children.

```tsx
// A persistent polite announcer you write messages into
function LiveAnnouncer({ message }: { message: string }) {
  return (
    <div aria-live="polite" role="status" className="visually-hidden">
      {message}
    </div>
  );
}
```

For toasts, render the toast region once (empty) high in the tree, then push messages into it. For validation, `role="alert"` on the error `<p>` (as in §2.2) announces it when it renders. Don't make _everything_ assertive — constant interruptions make a UI unusable with a screen reader.

`.visually-hidden` (screen-reader-only) CSS — visible to AT, not to sighted users:

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
```

Source (this exact clip pattern is the canonical "visually hidden"): https://www.a11yproject.com/posts/how-to-hide-content/

## 2.7 Images & icons

Every `<img>` needs an `alt`. The value depends on the image's role:

- **Informative** image: `alt` describes the content/meaning ("Bar chart: sales up 20%").
- **Decorative** image (adds nothing semantic): `alt=""` (empty, but present) so screen readers skip it. Never omit `alt` entirely — that makes some readers announce the filename.
- **Functional** image (inside a link/button): `alt` describes the _action/destination_, not the picture.

Source: MDN img alt / W3C alt decision tree https://www.w3.org/WAI/tutorials/images/decision-tree/ and MDN: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#authoring_meaningful_alternate_descriptions

### Icons

- **Decorative inline SVG/icon** next to visible text: hide it from AT with `aria-hidden="true"` so it isn't announced redundantly.
- **Icon-only control** (a button whose only content is an icon): the control needs an accessible name via `aria-label`, and the icon itself is `aria-hidden`.

```tsx
// Icon-only button — the BUTTON gets the name; the icon is hidden
function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button aria-label={label} onClick={onClick}>
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

// <IconButton label="Close dialog" onClick={close}><CloseIcon /></IconButton>
```

Source (icon-only accessible names): https://www.sarasoueidan.com/blog/accessible-icon-buttons/

## 2.8 `prefers-reduced-motion` at the code level

Users who get motion sickness or vestibular disorders set "reduce motion" at the OS level. Respect it (WCAG 2.3.3 Animation from Interactions). The default should be _no_ large motion unless the user has expressed no preference. Source: MDN https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion and WCAG 2.3.3: https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html

CSS approach (opt _in_ to motion):

```css
/* Motion only when the user hasn't asked to reduce it */
@media (prefers-reduced-motion: no-preference) {
  .card {
    transition: transform 200ms ease-out;
  }
  .card:hover {
    transform: translateY(-4px);
  }
}
/* Or globally neutralize animations for those who reduce */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

JS/React approach (when animation is driven in code, e.g. a spring lib or `scrollIntoView`):

```tsx
function usePrefersReducedMotion() {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

// const reduced = usePrefersReducedMotion();
// element.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
```

Source (Josh Comeau — accessible animations / respecting reduced motion): https://www.joshwcomeau.com/react/prefers-reduced-motion/

## 2.9 Color: contrast & never meaning-by-color-alone

- **Contrast** (WCAG 1.4.3, AA): normal text needs **4.5:1** against its background; large text (≥24px, or ≥18.66px bold) needs **3:1**. Non-text UI (icons, input borders, focus rings, control boundaries) needs **3:1** (WCAG 1.4.11 Non-text Contrast). Sources: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html and https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html
- **Don't convey meaning by color alone** (WCAG 1.4.1 Use of Color): a red border for an error must be paired with an icon and/or text; a "required" field shown only in a color, a chart series distinguished only by hue, a "you are here" nav item marked only by color — all fail for color-blind and low-vision users. Add a text label, icon, underline, pattern, or shape. Source: https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html

```tsx
// Error state conveyed by MORE than color: icon + text + aria-invalid, not just a red ring
{
  error && (
    <p role="alert" className="field-error">
      <WarningIcon aria-hidden="true" /> {error}
    </p>
  );
}
```

## 2.10 Reach for a headless a11y library when hand-rolling is a trap

Some widgets (combobox/autocomplete, date picker, menu, listbox, complex dialog with nested focus scopes, drag-and-drop) are genuinely hard to make accessible by hand — the APG contracts are long and subtly device/screen-reader-dependent. Use a **headless (unstyled) accessible primitive** library: it provides behavior, ARIA, keyboard, and focus management, and you supply the styles.

- **React Aria (Adobe)** — hook-first (and now component) primitives; deepest coverage of focus management, keyboard, and internationalized/collection interactions; maximum control over markup. Best when accessibility/i18n is the priority. https://react-spectrum.adobe.com/react-aria/
- **Radix Primitives** — component-first, mature, well-documented, easy to drop into app code or a design system. Popularized headless components. https://www.radix-ui.com/primitives
- **Headless UI**, **Ark UI**, **Base UI** — other solid options.

Guidance (LogRocket / GreatFrontend comparisons): use **Radix** for a mature design system you assemble quickly; use **React Aria** when you need advanced accessibility behavior, complex collections, or internationalized interactions. Sources: https://blog.logrocket.com/headless-ui-alternatives/ and https://www.greatfrontend.com/blog/top-headless-ui-libraries-for-react-in-2026

These libraries are also a _typing_ win: their props are fully typed, they use the polymorphic/`asChild` (Radix `Slot`) patterns from §1.6 correctly, and they save you from re-deriving the hard generics.

Don't reach for a library for a plain button, link, disclosure, or a native `<dialog>` — those are cheap to do right natively. Reach for one when the APG pattern is a combobox, menu, listbox, or a modal with intricate focus scopes.

## 2.11 A worked example tying both halves together

A `<Modal>` that is _both_ well-typed (discriminated-ish props, native props forwarded, ref-as-prop) and accessible (native `<dialog>`, labelled, Escape/focus handled by the platform, focus restored):

```tsx
import { useEffect, useId, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string; // required → guarantees an accessible name
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      openerRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal(); // native: focus trap + top layer + Esc-to-close
    } else if (!open && dialog.open) {
      dialog.close();
      openerRef.current?.focus(); // restore focus on close
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId} // accessible name from the title
      onClose={onClose} // fires on Escape / dialog.close()
      onClick={(event) => {
        // click-outside (backdrop) closes
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <h2 id={titleId}>{title}</h2>
      {children}
      <button type="button" onClick={onClose}>
        Close
      </button>
    </dialog>
  );
}
```

Why it's good on both axes: the `title` prop is **required**, so an unlabelled dialog is a _compile_ error; the native `<dialog>.showModal()` gives focus trapping, Escape handling, and top-layer stacking without hand-rolled traps; focus is restored on close; the heading provides the `aria-labelledby` name; and every prop is precisely typed. That's the whole thesis — model reality in the types, use the platform for behavior, and correctness and accessibility fall out together.

---

## Quick reference — do / avoid

| Concern                     | Do                                                      | Avoid                               |
| --------------------------- | ------------------------------------------------------- | ----------------------------------- |
| Prop shape with unions      | `type`                                                  | forcing it into `interface`         |
| Extend a native element     | `Own & Omit<ComponentPropsWithoutRef<"el">, keyof Own>` | intersecting and colliding props    |
| Ref (React 19)              | `ref?: React.Ref<T>` as a normal prop                   | `forwardRef` in new code            |
| Variant/mode props          | discriminated union + `assertNever`                     | `isX`/`isY` boolean soup            |
| Tuple-returning hook        | `return [...] as const`                                 | letting it widen to a union array   |
| External/async data         | validate (`unknown` → `schema.parse`)                   | `as SomeType` on `res.json()`       |
| Context misuse              | `undefined` default + throwing hook                     | real default that hides the bug     |
| Any interactive control     | native `<button>`/`<a>`/`<dialog>`                      | `<div role="button">`               |
| Custom widget               | role + `tabIndex` + key handlers + APG contract         | focusable div with only `onClick`   |
| Dynamic status/errors       | `role="status"` / `role="alert"` live region            | silently updating the DOM           |
| Icon-only button            | `aria-label` on button, `aria-hidden` on icon           | naked icon with no name             |
| Motion                      | gate on `prefers-reduced-motion`                        | unconditional large animation       |
| Focus outline               | `:focus-visible` ring                                   | `outline: none` with no replacement |
| Hard widget (combobox/menu) | React Aria / Radix                                      | hand-rolling the ARIA + keyboard    |

## Source index (primary references)

TypeScript / React typing:

- React TypeScript Cheatsheet — https://react-typescript-cheatsheet.netlify.app/
- react.dev TypeScript — https://react.dev/learn/typescript ; useRef — https://react.dev/reference/react/useRef ; forwardRef (deprecation) — https://react.dev/reference/react/forwardRef ; React 19 (ref as prop) — https://react.dev/blog/2024/12/05/react-19 ; useId — https://react.dev/reference/react/useId
- Total TypeScript (Matt Pocock) — discriminated unions https://www.totaltypescript.com/discriminated-unions-are-a-devs-best-friend ; satisfies https://www.totaltypescript.com/how-to-use-satisfies-operator
- TS Handbook — utility types https://www.typescriptlang.org/docs/handbook/utility-types.html ; narrowing/exhaustiveness https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- Polymorphic components — Ben Ilegbodu https://www.benmvp.com/blog/polymorphic-react-components-typescript/ ; LogRocket https://blog.logrocket.com/build-strongly-typed-polymorphic-components-react-typescript/
- Zod — https://zod.dev/

Accessibility:

- WAI-ARIA APG patterns — https://www.w3.org/WAI/ARIA/apg/patterns/ ; keyboard interface https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/ ; dialog https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ ; tabs https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ ; combobox https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ ; menu button https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/ ; disclosure https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
- First rule of ARIA — https://www.w3.org/TR/using-aria/#firstrule ; MDN ARIA https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
- MDN live regions — https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions
- WCAG — 1.4.1 use of color https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html ; 1.4.3 contrast https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html ; 1.4.11 non-text contrast https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html ; 2.3.3 animation https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html ; 2.4.7 focus visible https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html
- Josh Comeau — prefers-reduced-motion https://www.joshwcomeau.com/react/prefers-reduced-motion/
- Sara Soueidan — accessible icon buttons https://www.sarasoueidan.com/blog/accessible-icon-buttons/
- WebAIM — skip nav https://webaim.org/techniques/skipnav/ ; Million study https://webaim.org/projects/million/
- React Aria — https://react-spectrum.adobe.com/react-aria/ ; Radix Primitives — https://www.radix-ui.com/primitives
