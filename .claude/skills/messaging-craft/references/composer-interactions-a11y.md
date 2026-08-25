# Composer, Interactions, Motion & Accessibility

This is the front-end designer's craft layer — the parts users _feel_. The bar is: it should feel as considered as WhatsApp/Telegram/iMessage, and it should be fully usable by keyboard and screen reader. All motion obeys **web-animation-best-practices** (transform/opacity only, ease-out, 150–400ms, `prefers-reduced-motion`); all styling obeys **design-best-practices** (tokens, never hardcoded hex).

## The composer

The composer is the single most-used control in the feature. It should get out of the way.

**Auto-grow, capped.** Start at one line. Grow with content up to a max height (a handful of lines), then scroll internally — never let it eat the whole screen or push content around unpredictably. Implement by resetting `height:auto` then setting to `scrollHeight` on input, or a hidden mirror element. QueerPulse's `Composer.tsx` already auto-grows — match it.

**Send semantics (platform-correct):**

- **Desktop:** `Enter` sends; `Shift+Enter` inserts a newline. This is the expected convention and QueerPulse already does it.
- **Touch:** `Enter` is a newline; sending is the explicit send button. Never send on Enter on touch — thumb-typers expect a newline key.
- Disable/soften the send affordance when the input is empty or only whitespace; never send an empty message.

**Optimistic send is instantaneous.** On send: generate the client message ID, clear the input, and render the pending bubble **in the same frame** — do not wait for the server round-trip. Restore the text into the composer if the send ultimately fails (so the user doesn't lose what they typed). See realtime-delivery-and-reliability.md for the outbox mechanics.

**Draft preservation.** Keep the draft while the reply-preview banner is open or the user switches focus within the thread. Consider persisting per-conversation drafts across reloads (a known gap — WhatsApp/Telegram keep drafts; QueerPulse currently loses them on reload). If you add draft persistence, key by conversation ID and honor dual-mode.

**Severed states.** For official/announcement threads or blocked counterparts, the composer is replaced by a clear notice bar (already handled) — the user should understand _why_ they can't type, in EN/PT.

**Attachments (a current gap).** QueerPulse messaging is text-only today. When media is added, the composer grows an attach affordance; picked media shows as removable previews _above_ the input before send; each attachment sends as its own message part with its own delivery state; uploads show progress and are cancelable and retryable. Reuse the repo's existing storage/upload paths (S3/Mux exist elsewhere) rather than inventing a messaging-only uploader — coordinate with **nestjs-expert** for the backend slice.

## Reactions

QueerPulse has six fixed reaction keys (love/laugh/like/wow/sad/thanks), idempotent, live. Craft rules:

- The picker opens from the long-press/right-click overlay and on a dedicated affordance; it's keyboard-navigable (arrow keys between reactions, Enter to toggle) and each reaction has an accessible name.
- Reactions render as **chips** below the bubble, aggregated by key with a count; your own reaction is visually distinct; tapping a chip toggles your reaction.
- Toggling is **optimistic** and idempotent — the server enforces one-per-(message,user,key). A double-tap or a re-sent frame must not double-count.
- Reaction changes are their own realtime events (WhatsApp/Signal even ack reactions and treat _removing_ a reaction as a silent event). Keep them cheap; don't refetch the whole thread to reflect one reaction if you can patch the cache.

## Reply / quote

- Swipe-to-reply on touch (short horizontal swipe on a bubble arms a reply to it) and a Reply action in the overlay on desktop — both set the reply target and open the reply-preview banner in the composer.
- The banner shows a compact quote (author + snippet) and a clear dismiss.
- The sent message renders the quoted parent as a tappable chip; **tapping it scrolls to and briefly highlights the original** (a short flash, respecting reduced-motion).
- Server resolves the quote snippet (already done via `buildReplyTo`); a reply to a since-deleted message shows a graceful "original was deleted" quote rather than a broken reference.

## Edit & delete

- Both live in the overlay, gated by the DTO's `canEdit` / `canDelete` flags (mirror the server; never compute client-only — see the skill checklist).
- **Edit:** author-only, inside the 15-min window (server-enforced). In-place edit field; on save the bubble shows an unobtrusive **"edited"** marker. An expired window simply doesn't offer edit.
- **Delete:** soft tombstone that **keeps its slot** — "This message was deleted" in place, not a hole. Reactions/quotes to it degrade gracefully. Author-or-staff per the server rule.
- Both propagate as realtime events so the counterpart's view updates live.

## The long-press / context overlay

QueerPulse's `MessageActionOverlay` is a WhatsApp-style full-screen overlay: a lifted clone of the pressed bubble, a reaction row, and a permission-gated action menu (Reply/Edit/Copy/Delete/Report). Craft standard for it:

- **Touch + desktop parity:** long-press (via `useLongPress`) on touch, right-click/context-menu and a hover affordance on desktop — same actions either way.
- **Portal + scroll-lock + Escape:** it portals to `body`, locks background scroll, and closes on Escape and on backdrop tap. Already implemented — preserve these.
- **Focus management:** on open, move focus into the overlay; on close, return focus to the triggering bubble. Trap focus while open. This is what makes it usable by keyboard and screen-reader users.
- **Motion:** the bubble lifts and the menu fades/scales in over 150–250ms ease-out; reduced-motion collapses to a plain fade. Transform/opacity only.

## Gestures & haptics

- **Swipe-to-reply** (touch): a short drag reveals a reply icon and arms the reply on release past a threshold; spring back if under threshold.
- **Long-press** to open the overlay; a subtle scale on the pressed bubble signals the press is registering.
- **Haptics** (where the platform supports `navigator.vibrate` / the Vibration API, i.e. Android/Chrome; iOS Safari does not): a light tick on long-press-armed, swipe-threshold-crossed, and send. Keep haptics _subtle and optional_ — always feature-detect, never assume, and never make them load-bearing for understanding state.

## Micro-animations (timing)

- New own message: bubble scales/fades up from the composer, 150–200ms ease-out.
- New incoming message: gentle fade/slide in; if the user is at the bottom, it pushes up smoothly.
- Reaction added: chip pops in (small scale) ~150ms.
- Typing indicator: three-dot loop, calm, not frantic.
- Deleted message: cross-fades to the tombstone rather than vanishing.
- All of the above are collapsed to instant/fade under `prefers-reduced-motion`. Prefer the repo's `Reveal`/`FadeIn` primitives and `var(--ease)` over hand-rolled keyframes.

## Accessibility (the non-optional layer)

- **New-message announcement:** a **polite** `aria-live` region announces incoming messages (author + text). Assertive would interrupt the screen reader on every message — hostile in a fast chat. Do not over-announce your own sends.
- **Keyboard reachability:** every action available by pointer (react, reply, edit, delete, copy, report, jump-to-latest, load-older) is reachable by keyboard. The overlay is fully operable without a mouse.
- **Focus order & return:** opening the overlay moves focus in and traps it; closing returns focus to the origin bubble. The composer is a logical, predictable tab stop.
- **Labels:** icon-only buttons (send, attach, react, overlay actions) have accessible names; delivery-status ticks have text alternatives ("Sent", "Read"); reaction chips announce key + count.
- **Contrast & targets:** bubbles and controls meet WCAG contrast on both `--cream`/`--paper`; touch targets are comfortably large.
- **Copy:** every string EN/PT via `useTranslation()`; empty/error/system strings via **queer-community-copywriting**.

## Verification for interaction work

Drive the real app; jsdom can't exercise gestures, focus, or motion faithfully. Manually confirm: Enter vs Shift+Enter behavior; overlay opens on long-press _and_ right-click; focus returns on close; screen-reader announces a new message once (polite); reduced-motion collapses the animations. If you could only check statically, say so and name what you couldn't drive.
