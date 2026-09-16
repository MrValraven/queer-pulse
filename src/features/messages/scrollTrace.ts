// TEMPORARY DEBUG INSTRUMENTATION — see the removal note at the bottom of this
// file. Not for production use; inert unless `import.meta.env.DEV` AND the URL
// carries `?scrolltrace`. Added for PHASE 1 EVIDENCE GATHERING of the
// group-chat "lands part-way up the log" scroll bug — produces a structured,
// timestamped runtime trace of every scroll-position write/read so the exact
// failing event can be identified. Delete this file and its call sites once
// the investigation is done (see bottom of file for the exact revert list).
import { useEffect, useState } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";

declare global {
  interface Window {
    __scrollTrace?: ScrollTraceRecord[];
  }
}

export interface ScrollTraceRecord {
  t: number;
  label: string;
  scrollTop?: number;
  scrollHeight?: number;
  clientHeight?: number;
  distanceFromBottom?: number;
  totalSize?: number;
  rowCount?: number;
  atBottomRef?: boolean;
  detail?: Record<string, unknown>;
}

let cachedEnabled: boolean | null = null;

/** True only in a dev build with `?scrolltrace` in the URL. Cached per page
 *  load (the flag doesn't change mid-session) so every call site can check it
 *  cheaply. */
export function isScrollTraceEnabled(): boolean {
  if (cachedEnabled !== null) return cachedEnabled;
  cachedEnabled =
    import.meta.env.DEV &&
    typeof location !== "undefined" &&
    new URLSearchParams(location.search).has("scrolltrace");
  return cachedEnabled;
}

let cachedSimulateEnabled: boolean | null = null;

/** A second, independent flag for the artificial live-timing simulation this
 *  investigation needed (demo mode populates messages/pins synchronously, so
 *  it structurally cannot exercise the live "arrives on a later commit" race
 *  without help) — `?scrolltrace&simulatelive`. Never on by itself; always
 *  implies `isScrollTraceEnabled()` too. Cached like `isScrollTraceEnabled`
 *  (read once, on first call) — the messages feature's own deep-link handler
 *  (`useMessageDeepLinks.ts`, `setSearchParams({}, { replace: true })` after
 *  consuming `?c=`) wipes ALL search params shortly after a `?c=`-based open,
 *  which silently flipped this flag back to `false` mid-session if it were
 *  read fresh from `location.search` on every call — caching it at first read
 *  (before that wipe can run) is what makes the flag survive for the whole
 *  page session, matching `isScrollTraceEnabled`'s existing behaviour. */
export function isScrollTraceLiveSimulationEnabled(): boolean {
  if (cachedSimulateEnabled !== null) return cachedSimulateEnabled;
  cachedSimulateEnabled =
    isScrollTraceEnabled() &&
    new URLSearchParams(location.search).has("simulatelive");
  return cachedSimulateEnabled;
}

function computeGeometry(area: HTMLElement | null) {
  if (!area) return {};
  const { scrollTop, scrollHeight, clientHeight } = area;
  return {
    scrollTop,
    scrollHeight,
    clientHeight,
    distanceFromBottom: scrollHeight - scrollTop - clientHeight,
  };
}

/** Records one labelled trace event with live geometry, pushed to
 *  `window.__scrollTrace` and mirrored to `console.log`. No-op unless
 *  `isScrollTraceEnabled()`. */
export function traceScrollEvent(
  label: string,
  area: HTMLElement | null,
  rowVirtualizer: Virtualizer<HTMLDivElement, Element> | undefined,
  atBottomRef: { current: boolean } | undefined,
  detail?: Record<string, unknown>,
): void {
  if (!isScrollTraceEnabled()) return;
  const record: ScrollTraceRecord = {
    t: performance.now(),
    label,
    ...computeGeometry(area),
    totalSize: rowVirtualizer?.getTotalSize(),
    rowCount: rowVirtualizer?.options.count,
    atBottomRef: atBottomRef?.current,
    detail,
  };
  window.__scrollTrace ??= [];
  window.__scrollTrace.push(record);

  console.log("[scrolltrace]", record);
}

/** Simulates live mode's "history arrives on a later commit than the thread
 *  switch" timing for DEMO mode, which otherwise populates `messageGroups`
 *  synchronously and can never exercise the `isFirstPopulation` code path this
 *  investigation needed. Only active when `?scrolltrace&simulatelive` is set;
 *  a no-op (`ready` starts and stays `true`) otherwise. 450ms is comfortably
 *  past a network round-trip without being tedious to click through in a
 *  15+-open repro loop. TEMPORARY — see the revert list below. */
export function useScrollTraceDemoHistoryDelay(
  activeId: string,
  demoMode: boolean,
): boolean {
  const simulate = demoMode && isScrollTraceLiveSimulationEnabled();
  const [ready, setReady] = useState(!simulate);
  useEffect(() => {
    if (!simulate) {
      setReady(true);
      return;
    }
    setReady(false);
    const timeoutId = window.setTimeout(() => setReady(true), 450);
    return () => window.clearTimeout(timeoutId);
  }, [activeId, simulate]);
  return ready;
}

/** Same idea as above, but for the SHARED pinned-messages banner
 *  (`usePinnedMessages`), which in live mode is a query that resolves on its
 *  own later commit — exactly the async-arrival shape H2 needed to test.
 *  Returns a single fake pinned `MessageResponse` after the delay so
 *  `ConversationPinnedBanner` mounts into the flex column above `.area` well
 *  after the thread has already settled at the bottom. TEMPORARY. */
export function useScrollTraceSimulatedPinnedMessages(
  conversationId: string | null,
  demoMode: boolean,
): { id: string; body: string }[] {
  const simulate = demoMode && isScrollTraceLiveSimulationEnabled();
  const [pins, setPins] = useState<{ id: string; body: string }[]>([]);
  useEffect(() => {
    if (!simulate || !conversationId) {
      setPins([]);
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setPins([
        {
          id: "scrolltrace-fake-pin",
          body: "[scrolltrace simulation] The terrace is booked for 11am",
        },
      ]);
    }, 600);
    return () => window.clearTimeout(timeoutId);
  }, [conversationId, simulate]);
  return pins;
}

/** The demo GROUP threads are short (`brunch-crew`, the longest, has 16
 *  messages), too short to reliably overflow the ~700-870px desktop
 *  viewport, so neither H1's reconcile-during-settle window nor H2's
 *  post-shrink stranding can ever become VISIBLE (both need real overflow:
 *  `scrollHeight > clientHeight`) on it as-is. Synthetic filler, injected
 *  only under the simulation flag, ahead of the thread's real tail — long
 *  enough (40 messages, several from each of the group's three other
 *  members) to push `scrollHeight` well past a shrunk `.area`.
 *  TEMPORARY — see the revert list below; never touches the real demo
 *  fixture in data.ts. */
export function buildScrollTraceInflatedMessages(): {
  from: "me" | "them";
  text: string;
  senderName?: string;
  senderHandle?: string;
  senderTint?: "coral" | "jade" | "plum";
}[] {
  const senders = [
    { name: "Anika Kovač", handle: "anika", tint: "coral" as const },
    { name: "Jordan Park", handle: "jordan", tint: "jade" as const },
    { name: "Kai Larsson", handle: "kai", tint: "plum" as const },
  ];
  const items: ReturnType<typeof buildScrollTraceInflatedMessages> = [];
  for (let i = 0; i < 40; i++) {
    if (i % 4 === 3) {
      items.push({
        from: "me",
        text: `[scrolltrace simulation] reply ${i}`,
      });
      continue;
    }
    const sender = senders[i % senders.length]!;
    items.push({
      from: "them",
      text: `[scrolltrace simulation] filler message ${i} to force real overflow`,
      senderName: sender.name,
      senderHandle: sender.handle,
      senderTint: sender.tint,
    });
  }
  return items;
}

/*
 * REVERT INSTRUCTIONS (once the investigation is closed out):
 *  1. Delete this file (src/features/messages/scrollTrace.ts).
 *  2. Remove every `traceScrollEvent(...)` call and its `scrollTrace` import
 *     from useMessageScroll.ts.
 *  3. Remove the trace-only areaRef ResizeObserver effect and its import from
 *     useMessageLogState.ts.
 *  4. Revert the `isScrollTraceLiveSimulationEnabled()` branches (and their
 *     imports) in useMessagesController.ts and
 *     src/features/messages/api/useMessagePinStar.ts, including the
 *     `buildScrollTraceInflatedMessages()` filler-message injection in
 *     useMessagesController.ts.
 *  5. `pnpm build` / `npx tsc -b --noEmit` to confirm nothing else references
 *     `window.__scrollTrace` or these exports.
 */
