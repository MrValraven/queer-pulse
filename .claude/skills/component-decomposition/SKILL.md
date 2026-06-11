---
name: component-decomposition
description: Refactor large React/UI components so every individual component is under a line limit (default 200) and each component's mock/static data lives in its own colocated file. Use when the user asks to split up oversized components, make components smaller/more readable/reusable/maintainable, enforce a max-lines rule, extract mock data into its own file, or sweep many pages at once. Includes a parallel multi-agent fan-out for large sweeps.
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
  - Agent
---

# Component Decomposition

Split oversized UI components into small, focused, reusable pieces and move their
mock/static data into colocated data files — without changing public APIs.

## The two rules

1. **Per-component line limit (default 200).** Every *individual* component must be
   under the limit. A single file MAY hold several small cohesive components whose
   *total* exceeds the limit, as long as no single component does. Confirm the
   intended interpretation with the user if unstated — "per component" vs "per file"
   changes the work substantially.
2. **Data in its own file.** Inline mock/static data (arrays, lookup tables, config
   objects) moves to a colocated `<camelCaseName>.data.ts`. If any value contains
   JSX/`ReactNode`, name it `.data.tsx`.

## Before you start

- **Establish scope honestly.** Count the real component files in violation. Exclude
  data modules, route/config files, and existing multi-component files that already
  satisfy rule 1. Tell the user the real number.
- **Ask only what changes the work:** the line limit, the per-component-vs-per-file
  interpretation, and pacing (one-by-one vs. parallel fan-out — see below).
- **Respect the project's verification constraints.** If the repo forbids running the
  build/dev/lint (some do), verify only by reading files, `wc -l`, and the IDE
  diagnostics that fire automatically after each edit. Never assume; check the repo's
  CLAUDE.md / memory.

## Per-file procedure (repeatable)

1. **Read the whole file.** Don't refactor what you haven't read end to end.
2. **Skip if already compliant** (main component under the limit AND its data already
   extracted). Report it and move on.
3. **Extract data** → `<name>.data.ts` (or `.data.tsx` for JSX-bearing values).
   Export typed consts. **Exception:** a `Record<…>` whose values are CSS-module
   class names (`styles.xxx`) must STAY in the component file — it depends on the CSS
   module import. Only plain strings/numbers/tokens/JSX move to the data file.
4. **De-anti-pattern JSX-in-data.** If arrays hold raw `ReactNode`, prefer converting
   to serializable descriptors (e.g. `{ label, href }`) rendered by a presentational
   component. Keep `.data.tsx` only where the JSX is genuinely content (prose with
   `<em>`/`<strong>`), not structure.
5. **Split oversized JSX** into focused sibling components, named by role:
   - `<Name>Card.tsx`, `<Name>Sections.tsx`, `<Name>Tabs.tsx`, `<Name>Modal.tsx`,
     `<Name>Steps.tsx`, `<Name>Sidebar.tsx`.
   - **Self-contained modals** own their own open/submit state and call the scroll-lock
     hook unconditionally — they're only mounted when open.
   - **Self-contained tabs/sections** own their local state (active filter, open index,
     form fields) to minimize prop drilling. Lift state to the page only when two
     siblings genuinely share it.
   - For complex shared form state, a custom hook (`use<Name>Form`) returning
     `{...state, ...setters, helpers}` typed via `ReturnType<typeof use<Name>Form>`.
6. **Keep the page's exported component name and props identical** so routes/imports
   never break.
7. **Verify** with `wc -l` and confirm every component is under the limit. If the page
   is still over, extract one more section/footer/hero component.

## Conventions to match (don't invent)

- Reuse the repo's shared primitives (Button, Avatar, layout shells, toast/scroll-lock
  hooks, link helpers). Grep for an existing refactored page and copy its import style
  and `../` depth.
- Match the surrounding code's idiom, comment density, and naming.
- In this codebase's JSX transform, `import { type ReactNode } from 'react'` works and
  so does `React.ReactNode` in pre-existing files — match the file you're editing;
  don't churn untouched files.
- Never nest a `<button>` inside a router `<Link>` (invalid HTML). Use
  `<span role="button" tabIndex={0}>` with `onClick` (preventDefault + stopPropagation)
  + `onKeyDown`.

## Parallel fan-out for large sweeps

When many independent files need the same treatment, **parallelize** — each page lives
in its own folder with no shared edits, so agents don't conflict.

- **Do the first few yourself** to lock in the pattern and a reference example.
- **Dispatch N general-purpose agents** (sonnet is a good fit — mechanical work), each
  owning a **disjoint batch** of ~6-8 pages. Give every agent the SAME spec:
  the two rules, the per-file procedure, the verification constraints, the repo import
  conventions, and a pointer to one completed reference page. Tell them to skip
  already-compliant pages and report a before→after table.
- **Disjointness is the safety property.** Each agent only creates new colocated files
  and edits its own page files. Never assign the same page (or a shared data module) to
  two agents.
- **Agents can crash mid-run** (socket drops). They are NOT resumable without a
  send-message capability. After a batch returns an error, **assess on-disk state**
  (`wc -l` each assigned page + check for the expected sibling `.data`/`Sections`
  files) to see what completed, then dispatch a fresh agent for only the leftovers —
  telling it which data files already exist so it reuses rather than recreates them.

## Final verification sweep

After everything, prove no single component exceeds the limit anywhere. This awk finds
the largest inter-declaration span per file (handles multi-component files correctly):

```bash
for f in $(find src -name "*.tsx" | sort); do
  awk -v F="$f" -v LIMIT=200 '
    /^(export )?(default )?function [A-Z]/ || /^(export )?const [A-Z][A-Za-z0-9]* = \(/ {
      if (prev>0){span=NR-prev; if(span>max)max=span} prev=NR
    }
    END { if(prev>0){span=NR-prev+1; if(span>max)max=span}
          if(max>=LIMIT) printf "!!! %-60s maxComponent=%s\n", F, max }
  ' "$f"
done
# No "!!!" lines => every individual component is under the limit.
```

Also grep for leftovers: empty files, broken sibling imports, and any anti-patterns you
were removing. If the repo allows it, finish with a real typecheck/build; if not, say
plainly that verification was static-only and recommend the user run the build.

## Reporting

Give a concise before→after table (page file line counts + new files created), call out
any files left at the limit-with-inline-data that were out of scope, and state the
verification method honestly (including whether a build was run).
