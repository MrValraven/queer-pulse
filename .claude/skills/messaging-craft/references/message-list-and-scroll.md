# Message List, Grouping & Scroll

The message list is the hardest front-end problem in chat. A normal virtual list is **start-anchored** — the top is the stable point and content grows downward. Chat inverts that contract: new content appears at the **bottom**, and older history loads by **prepending at the top**. Getting this wrong produces the two classic bugs — the viewport jumps when you load history, and the view yanks to the bottom while you're reading. This file is how to get it right.

## Virtualize once the thread is long

Keeping hundreds/thousands of message DOM nodes mounted is the reason naive chat UIs jank and leak memory. Production apps virtualize: render only the visible window plus a small overscan. Rocket.Chat migrated its entire message list to a virtualization layer (Virtua's `VList`) for exactly this; GetStream's `VirtualizedMessageList` exists for "high-volume or long-lived channels."

**For QueerPulse:** the current `MessageArea` renders the flattened `useInfiniteQuery` pages directly. That is fine for short threads and simpler to reason about. **Introduce virtualization when** a single conversation regularly exceeds a few hundred rendered messages or you measure scroll jank — not preemptively. If you do, the non-negotiables below still hold; virtualization just changes _how_ you satisfy them.

## The three non-negotiables

### 1. Stable keys — key by message ID, never index

Every row's React key (and every virtualizer item key) must be the **stable message identity**: the server message ID once acked, and the client-generated `localId` while a send is still optimistic (carry `localId` through to the server row so the key is continuous across the ack). Index keys break everything: prepend one older message and every row's index shifts, so React remounts rows, scroll restoration loses its anchor, and in-flight animations/gestures reset. This is the single most important rule in the file.

### 2. End-anchored scroll — loading history must not move the viewport

When you prepend older messages, the browser's default is to keep `scrollTop` constant, which means all the new content pushes the visible messages _down_ — the thread jumps. The fix is to anchor to a stable item:

- **Before** the prepend, record the first currently-visible message's ID and its offset from the viewport top.
- **After** the prepend renders, find that same keyed message and restore its position (adjust `scrollTop` by the delta, or use the virtualizer's `anchorTo: 'end'` which does this for you — it "captures the visible item before a data change, finds the same keyed item after a prepend, and adjusts the scroll offset so the message stays in the same visual position").

Without a virtualizer, the manual pattern in a scroll container:

```ts
// just before fetching/prepending older page
const anchor = firstVisibleMessageEl; // pick a row currently in view
const prevOffsetTop = anchor.offsetTop;
// ...prepend older messages to state, let React commit...
useLayoutEffect(() => {
  const delta = anchor.offsetTop - prevOffsetTop; // height added above the anchor
  scrollContainer.scrollTop += delta; // keep the anchor visually fixed
}, [olderPageJustPrepended]);
```

Do this in `useLayoutEffect` (before paint) so the user never sees the jump.

### 3. Buffer-gated auto-scroll — only follow the bottom when the user is at the bottom

A new incoming message should scroll to the bottom **only if the user is already near the bottom** (within a buffer — MUI X Chat defaults to 150px). If they've scrolled up to read history, do **not** move them; instead surface a **"jump to latest" pill** with an unread count, and clear it when they return to the bottom. This is the difference between "the app respects me" and "the app keeps stealing my place."

QueerPulse already has `useStickToBottom` and a jump-to-latest pill in `useMessageScroll` — extend those, don't fork them.

## Stick-to-bottom must survive resizes, not just new messages

The subtle bug (documented against react-virtuoso's `followOutput`): stick-to-bottom that only triggers on _new messages_ breaks when an _existing_ visible message changes height — a late-loading image, an added reaction chip, an expanded link preview. If you're at the bottom and the last bubble grows, you must stay pinned to the bottom. Observe size changes (ResizeObserver on the content, or the virtualizer's resize handling), not just list-length changes.

## Grouping — consecutive messages breathe

Group consecutive messages from the same author within a time window (~5 minutes is the common default; tune to taste) into a **run**:

- Show the avatar and display name **once**, at the start of the run (or, WhatsApp-style in 1:1s, no avatar at all and just alignment/color).
- Tight vertical spacing _inside_ a run; larger gap _between_ runs and a clear gap when the author changes.
- The delivery-status tick and timestamp live on the **last** bubble of a run (or on hover/press for the rest), not repeated on every line.
- A new run always starts when the author changes, when the time gap exceeds the window, or across a day boundary.

QueerPulse computes this in `messageRuns.ts` and renders it in `MessageRun.tsx`. Match its semantics; if you need to change grouping, change it there so there's one source of truth.

## Date separators

Insert a sticky separator at each day boundary: **"Today"**, **"Yesterday"**, then a localized date ("Mon, 14 Jul" / the EN/PT equivalent). It should stick to the top of the viewport as you scroll through that day's messages (`position: sticky`) so the reader always knows what day they're in. Compute boundaries from the same grouping pass, not a second traversal.

## Unread divider

On opening a thread with unread messages, render a one-time **"New messages"** divider above the first unread message and scroll to it (not to the absolute bottom) so the user starts reading where they left off. It persists for the session view but does not move as new messages arrive. QueerPulse has `useUnreadDivider` — use it.

## Timestamps

- Inside a run: show a single relative/short time, not one per line.
- On hover (desktop) or long-press (touch): reveal the exact time for any individual message.
- Use the user's locale and 12/24h preference; keep it translatable (EN/PT).

## Empty & loading states

- **First load:** the `MessagesSkeleton` (bubble-shaped skeletons), never a spinner on a blank canvas — respect `web-animation-best-practices` for the shimmer and `prefers-reduced-motion`.
- **Empty conversation (no messages yet):** a warm, on-brand invitation to say hello — copy via `queer-community-copywriting`, not "No messages."
- **Empty inbox (no conversations):** `MessagesEmptyPanel` — guide toward starting one.
- **Failed to load history:** an inline retry affordance, not a dead thread.

## Accessibility of the list

- The scroll container is a labeled region; new incoming messages are announced via a **polite** `aria-live` region (not assertive — assertive interrupts and is hostile with rapid messages).
- Each message is reachable and readable by screen reader in order, with author and time available (visually-hidden text is fine for the author on grouped rows that hide the name).
- Date separators and the unread divider are announced as they're reached.
- Keyboard: the list is scrollable and message actions are reachable without a pointer (see composer-interactions-a11y.md).

## Verification for list/scroll work

There is a Vitest + RTL + jsdom harness in this repo, but scroll/virtualization behavior is inherently visual and jsdom has no layout. **Verify these by driving the real app** (per the repo's run/verify skills) on a genuinely long thread:

1. Scroll to the top, trigger load-older — the message you were looking at stays put.
2. Scroll up, have the counterpart send — a jump pill appears with a count; you are not moved.
3. Sit at the bottom, have the last bubble grow (image/reaction) — you stay pinned.
4. Reopen a thread with unreads — you land on the unread divider.
   If you could only verify statically, say so plainly and name what you could not exercise.
