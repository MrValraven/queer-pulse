# Task 7 review — editable article block components

**Files:** `ArticleBlockEditor.tsx`, `ArticleBlockKindFields.tsx`, `ImageBlockControls.tsx` (+ `.module.css`) under `src/features/magazine/desk/editor/`

**Spec compliance: PASS on the two hardest checks (immutability, RichText re-seed). A few Minor/note items below.**

Line counts: `ArticleBlockEditor.tsx` 178, `ArticleBlockKindFields.tsx` 196, `ImageBlockControls.tsx` 156 (report said 155 — off by one, negligible, still under 200). No `any`. No Unicode glyphs; all icons via `react-icons/fi`.

## (a) Immutability — no findings, verified every write path

- `ArticleBlockEditor.tsx:119,131,142` (paragraph/heading/pullQuote RichText `onChange`) — `onChange({ ...block, html })`. Immutable.
- `ArticleBlockKindFields.tsx:43` (quote html), `:54` (quote cite), `:78` (qa question), `:90` (qa who), `:97` (qa answer html), `:189` (image src) — all `{ ...block, <field> }`. Immutable.
- `StatsBlockFields.updateItem` (`ArticleBlockKindFields.tsx:115-120`) — `block.items.map((item, i) => i === itemIndex ? { ...item, ...patch } : item)`, then `onChange({ ...block, items })`. Both the array and the touched item are new objects; untouched items keep referential identity (cheap for React). Immutable at both levels, exactly what the checklist asks for.
- `removeItem` (`:122-127`) — `items: block.items.filter(...)`. Immutable.
- `addItem` (`:129-131`) — `items: [...block.items, { value: "", label: "" }]`. Immutable.
- `ImageBlockControls.tsx` — every handler (`alt` :64, `tint` :78, `credit` :94, `rights` :101-103, `crop` :122, `focal` :50, `caption` :148) spreads `block`. `focal` in particular constructs a brand-new `{ x, y }` object rather than mutating the existing one. Immutable.

No `.push`, `.splice`, direct index assignment, or in-place mutation of `block`/`items`/`focal` anywhere in the three files. Clean.

One type-variance note, not a bug: `ImageBlockFields` (`ArticleBlockKindFields.tsx:179-196`) has `onChange: (next: ArticleBlock) => void` and passes it straight through to `ImageBlockControls`, whose prop type is `onChange: (next: ArticleImageBlock) => void`. This is safe — a callback that accepts the wider `ArticleBlock` also accepts any narrower member including `ArticleImageBlock` — and tsc accepts it correctly. Flagging only so a future reviewer doesn't mistake it for a hole.

## (b) RichText re-seed / caret loss — no findings

Checked `RichText.tsx:54-62`: the `useLayoutEffect` that writes `element.innerHTML = html` has an empty dependency array (`eslint-disable-next-line react-hooks/exhaustive-deps` is present and intentional, with a component-level doc comment explaining why). It runs once on mount and never again, so a changing `html` prop after mount is inert — confirmed this is that same component, not a fork.

Grepped all three block files: no call site passes `key={block.html}` or any per-keystroke-changing value as `key` on a `RichText` instance (`ArticleBlockEditor.tsx:115,127,138`; `ArticleBlockKindFields.tsx:40,75,94,144` [caption in `ImageBlockControls.tsx:144`]). None of the `RichText` elements sit inside a `.map()` in these three files either (the outer block list `.map()`, if any, lives in the not-yet-built parent — Task 7's own components render at most one `RichText` per fixed JSX position per kind), so there's no index-based remount risk from this layer. `onChange={(html) => onChange({ ...block, html })}` only writes into the block-list state; it is never fed back into the same `RichText`'s `html` prop in a way that would force a remount (the prop is only read by the mount-only effect). Confirmed clean.

Note for whoever wires the parent block-list next: `ArticleBlock` variants all carry a stable `id: string` (`pieces.api.ts`) — the future `blocks.map(...)` must key on `block.id`, not array index, so reordering (move up/down) doesn't remount a `RichText` mid-edit. Out of scope for Task 7's own files but worth flagging now since `onMove` exists here.

## All 7 kinds — present and correct

paragraph/heading/pullQuote (`ArticleBlockEditor.tsx` `BlockContent`), quote/qa (`ArticleBlockKindFields.tsx`), stats (`ArticleBlockKindFields.tsx`), image (`ArticleBlockKindFields.tsx` + `ImageBlockControls.tsx`) — all 7 `ArticleBlockKind` members are switched on with a `never` exhaustiveness guard (`ArticleBlockEditor.tsx:171-176`), so an 8th kind added later would fail to compile here. Image uses `ImageUrlField` + `ImageSlot`-backed preview (`ArticleBlockKindFields.tsx:186-192`, confirmed `ImageUrlField.tsx` has no fake upload/progress affordance — just a URL input + validation). Alt and credit are both `FormField required` with a live "Required…" error string shown whenever the trimmed value is empty (`ImageBlockControls.tsx:35-36,58-59,89`) — that's the visual empty-flag the checklist wants.

## Block chrome

`ArticleBlockEditor.tsx:64-80` — move-up `disabled={index === 0}`, move-down `disabled={index === total - 1}`, remove unconditional; `onMove("up"|"down")` and `onRemove()` take no arguments themselves (the index is closed over by the parent, which the caller wires via `index`/`total` props) — correct given the documented contract that the parent knows which block is being moved from where it's rendered. Type label via `KIND_LABEL[block.kind]` (`:93`). `selected` toggles `.sel` (`:54`).

## a11y

- Move up / move down / remove: all have `aria-label` (`:66,74,78`), icons `aria-hidden`. Good.
- Stats per-item remove: `aria-label={`Remove stat ${itemIndex + 1}`}` (`ArticleBlockKindFields.tsx:159`). Good. "Add stat" button (`:165-167`) has visible text, no icon — no label needed.
- Image tint swatches: icon-only (a colored circle, no icon glyph) but each has `aria-label={`Tint: ${capitalize(tint)}`}` and `aria-pressed` (`ImageBlockControls.tsx:76-77`). Good.
- Crop buttons: visible text content ("16:9" etc.) serves as the accessible name; `aria-pressed` set (`:121`). No separate `aria-label` needed since it's not icon-only.
- Focal-point button: icon-only (a positioned dot), has a computed `aria-label` with the current x/y percentage (`:132-134`), dot itself `aria-hidden` (`:139`). Good — and it's a genuinely useful label since it also communicates current state, not just "Focal point".
- The grip handle (`ArticleBlockEditor.tsx:59-61`) is a `<span aria-hidden>`, not a button — correctly excluded from the tab order/AT tree since it isn't wired to any actual drag behavior (reordering is done only via the up/down buttons). Not a violation, but worth knowing: this affordance visually promises drag-and-drop that doesn't exist yet. If that's intentionally deferred to a later task, fine; if not, it's a UX gap outside this review's checklist.
- RichText instances get their accessible name from `aria-label={placeholder}` inside `RichText.tsx` itself (already reviewed/built, not part of this diff) — every call site in these three files supplies a distinct, meaningful `placeholder` ("Write, or press / for a block", "Section heading", "Pull quote", "Quoted speech", "Question", "Answer", "Caption"). Good.
- `FormField` (shared primitive) wires `id`/`htmlFor`/`aria-describedby`/`aria-invalid`/`aria-required` automatically for the alt/credit `<input>`s since they're single native children — confirmed in `FormField.tsx:96-105`. No manual wiring needed or missing here.

No unlabeled icon-only buttons found in these three files.

## Minor

- `StatsBlockFields` keys its item rows on array index (`ArticleBlockKindFields.tsx:136`, `key={itemIndex}`), and `ArticleStatsItem` (`pieces.api.ts`) has no `id` field to key on instead. Because the value/label inputs are plain controlled `<input>`s (not `contentEditable`), removing a middle item won't corrupt data or steal a caret the way it would with `RichText` — React will just re-render the shifted rows with correct `value`s — but DOM focus can visually "stay" on the same row position (now holding a different item) after a mid-list `removeItem`. Cosmetic, not data-corrupting. Would need an `id` on `ArticleStatsItem` upstream to fix properly; flagging for awareness only, not blocking.
- `onRemove` (block-level) fires immediately with no confirmation step — a single misclick deletes a block with no undo shown in these files. May be handled by a caller-level undo/confirm not yet built; out of scope for this checklist but worth a note since it's a destructive action.
- i18n: every user-facing string in these three files (button labels, placeholders, "Add stat", "Required for screen readers and captions.", rights option labels, etc.) is a hardcoded English literal, not run through `t(...)`. Per the task framing this is expected/deferred to Task 10 — not flagged as a defect.

## ⚠️ Runtime-only (can't confirm statically)

- Actual caret behavior while typing across a re-render triggered by a *sibling* block's state change (e.g. does selecting/hovering another block ever cause this block's `RichText` to remount via a parent key change) — depends entirely on the not-yet-built parent list, which doesn't exist in this tree yet (confirmed via repo-wide grep: no consumer imports `ArticleBlockEditor` anywhere).
- Whether `ImageSlot`'s violet→default tint fallback (`ArticleBlockKindFields.tsx:191`, deliberate per its own comment) looks acceptable visually rather than just compiling — needs a browser check.
- Focal-point click math (`ImageBlockControls.tsx:38-51`) against a real pointer event vs. the keyboard-activation (`detail === 0`) fallback — logic reads correct but only a real click/keydown in a browser confirms it.
