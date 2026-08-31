import { useCallback, useContext, useEffect, useRef } from "react";
import { UNSAFE_NavigationContext } from "react-router-dom";

interface UnsavedChangesGuardOptions {
  /** When true, in-app navigation and tab-close are guarded. */
  active: boolean;
  /** Message shown in the window.confirm prompt on in-app navigation. */
  confirmMessage: string;
  /** Called once the user confirms they want to leave (e.g. to clear dirty state). */
  onConfirmLeave?: () => void;
  /**
   * Also guard the browser Back button (`popstate`), which the push/replace
   * monkey-patch below can't see. Opt-in (default `false`) so existing
   * consumers are unaffected: only surfaces that want Back protection turn it
   * on. Uses a history sentinel: the first Back lands on a same-URL sentinel
   * entry where we prompt, then either honour or cancel the navigation.
   */
  guardBackButton?: boolean;
}

/**
 * Marker written into the sentinel entry's `history.state` so we can tell,
 * later and from a cleanup that runs after the fact, whether the sentinel is
 * still the entry the browser is standing on. A fresh id per push means a
 * re-armed sentinel is never confused with the one it replaced.
 */
const SENTINEL_STATE_FLAG = "queerpulseUnsavedGuardSentinel";
let nextSentinelId = 0;

/**
 * The shape react-router keeps in `window.history.state` (`{ usr, key, idx }`),
 * narrowed to the two fields this hook reads or writes, plus our own marker.
 */
interface GuardedHistoryState {
  /** Caller-supplied `location.state`. */
  usr?: unknown;
  /** react-router's `location.key` for the entry. */
  key?: string;
  /** react-router's history index, which its push/pop arithmetic keys on. */
  idx?: number | null;
  [SENTINEL_STATE_FLAG]?: string;
}

function readHistoryState(): GuardedHistoryState | null {
  return window.history.state as GuardedHistoryState | null;
}

/**
 * Warn before losing unsaved edits. The app mounts a plain `<BrowserRouter>`
 * (see `src/app/App.tsx`), so react-router's `useBlocker` is unavailable: it
 * needs a data router. Instead this monkey-patches the history navigator's
 * push/replace to prompt, and adds a beforeunload guard for hard tab-close.
 *
 * ## The Back-button sentinel (`guardBackButton`)
 *
 * A `popstate` fires only after the browser has already left the entry, so the
 * guard needs a decoy to land on. The first time the guard goes active this
 * mount we push a duplicate of the current entry, the "sentinel". Its whole
 * lifecycle:
 *
 * - **Armed** once per mount, by `pushSentinel`, the first render where
 *   `guardBackButton && active`. A ref latch keeps toggling dirty on and off
 *   from stacking up entries.
 * - **Consumed by a Back press** in the `popstate` handler: the browser has
 *   popped the sentinel and is back on the real entry, so we prompt there and
 *   either walk one more step back (honouring the navigation the visitor
 *   actually asked for) or push a fresh sentinel (cancelling it).
 * - **Consumed by an in-app navigation** in the push/replace patch: the visitor
 *   is standing ON the sentinel, so the destination *replaces* it rather than
 *   stacking on it. The browser stack then ends up exactly as it would have
 *   with no sentinel at all, and one Back press from the destination reaches
 *   the page before the editor. Without this the sentinel stayed buried and
 *   Back landed on the editor URL twice.
 * - **Disarmed on unmount**, if neither of those consumed it (the guarded
 *   subtree stopped rendering without any navigation). Removing a history entry
 *   means walking back one step, which is only ever safe while the sentinel is
 *   still the top entry, so the cleanup re-checks the marker before moving. It
 *   is deferred a tick so React's StrictMode remount, which runs the cleanup
 *   and then the arming effect again in the same tick, can cancel it.
 *
 * ## Why the sentinel is pushed raw rather than through react-router
 *
 * Arming it with `navigate(pathname + search)` would keep react-router's own
 * bookkeeping in the loop, but this app reads a same-path, same-query PUSH as a
 * real navigation: `ScrollManager` only spares the visitor's offset when the
 * query string differs (`isSameRouteQueryChange`), so arming would jump the
 * editor to the top of the page on the visitor's first keystroke.
 * `NavHistoryProvider` would likewise record the editor twice and hand the page
 * itself back as `usePreviousLocation()`.
 *
 * So the sentinel stays a raw `pushState`, which is also the honest model: it
 * is not a page anybody visited. What the raw push must not do is corrupt the
 * router's history index, so it carries the current entry's state forward and
 * only bumps `idx`. That keeps `getIndex() + 1` right for the next router push,
 * and makes a pop onto the sentinel resolve to the real entry's `location.key`
 * instead of react-router's `"default"` fallback.
 *
 * One residual desync stays, deliberately: leaving a back-guarded page by an
 * in-app link reaches react-router as a REPLACE (that is how the sentinel is
 * consumed), so `NavHistoryProvider` swaps the editor out of its tail and
 * `usePreviousLocation()` on the destination names the page *before* the
 * editor. Browser Back still lands on the editor, exactly once. Closing that
 * last gap needs a data router and `useBlocker`.
 */
export function useUnsavedChangesGuard({
  active,
  confirmMessage,
  onConfirmLeave,
  guardBackButton = false,
}: UnsavedChangesGuardOptions): void {
  const { navigator } = useContext(UNSAFE_NavigationContext);

  // Whether this mount's sentinel is still sitting in the history stack. Every
  // path that consumes it clears this, so it doubles as "is the sentinel still
  // ours to clean up?" for the unmount cleanup.
  const armedRef = useRef(false);
  const sentinelIdRef = useRef("");
  const disarmTimeoutRef = useRef(0);

  const pushSentinel = useCallback(() => {
    const currentState = readHistoryState();
    const currentIndex =
      typeof currentState?.idx === "number" ? currentState.idx : 0;
    sentinelIdRef.current = `unsaved-guard-${(nextSentinelId += 1)}`;
    // Only react-router's three fields are carried over, rather than the whole
    // state object: other features push markers of their own (the nav drawer's,
    // for one) and inheriting one would make the sentinel read as their entry.
    window.history.pushState(
      {
        usr: currentState?.usr ?? null,
        key: currentState?.key,
        idx: currentIndex + 1,
        [SENTINEL_STATE_FLAG]: sentinelIdRef.current,
      },
      "",
    );
  }, []);

  /** Is the entry the browser is standing on this mount's sentinel? */
  const isSentinelOnTop = useCallback(() => {
    if (!sentinelIdRef.current) return false;
    return readHistoryState()?.[SENTINEL_STATE_FLAG] === sentinelIdRef.current;
  }, []);

  // Monkey-patching the router's navigator IS the mechanism here (a plain
  // <BrowserRouter> exposes no blocker to hook), so the immutability rule is
  // disabled for the whole effect. It reports at the effect boundary now that
  // the patched functions close over `leave` below, which the narrower
  // disable/enable pair around the two assignments cannot cover.
  /* eslint-disable react-hooks/immutability */
  useEffect(() => {
    // Patched whenever there is something to do: prompt while `active`, and
    // consume the sentinel on the way out for as long as Back is guarded (the
    // sentinel outlives `active` going false, e.g. after a save).
    if (!active && !guardBackButton) return;
    const historyNavigator = navigator as unknown as {
      push: (...args: unknown[]) => void;
      replace: (...args: unknown[]) => void;
    };
    const originalPush = historyNavigator.push;
    const originalReplace = historyNavigator.replace;
    const confirmLeave = () => {
      if (!window.confirm(confirmMessage)) return false;
      onConfirmLeave?.();
      return true;
    };
    // One in-app navigation away from the guarded page. `requestedMethod` is
    // what the caller asked for; standing on the sentinel we overwrite it with
    // the destination instead, which leaves the stack the caller would have got
    // had the sentinel never existed.
    const leave = (
      requestedMethod: (...args: unknown[]) => void,
      args: unknown[],
    ) => {
      if (active && !confirmLeave()) return;
      if (armedRef.current && isSentinelOnTop()) {
        armedRef.current = false;
        originalReplace.apply(historyNavigator, args);
        return;
      }
      requestedMethod.apply(historyNavigator, args);
    };
    historyNavigator.push = (...args) => leave(originalPush, args);
    historyNavigator.replace = (...args) => leave(originalReplace, args);
    return () => {
      historyNavigator.push = originalPush;
      historyNavigator.replace = originalReplace;
    };
  }, [
    active,
    guardBackButton,
    navigator,
    confirmMessage,
    onConfirmLeave,
    isSentinelOnTop,
  ]);
  /* eslint-enable react-hooks/immutability */

  useEffect(() => {
    if (!active) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [active]);

  // Latest-value refs so the popstate listener (registered once, keyed only on
  // `guardBackButton`) always reads the current dirty state / message / callback
  // without re-registering. Re-registering would re-push sentinels and stack
  // up dead history entries. Synced in an effect (not during render) so a ref
  // write never happens mid-render.
  const activeRef = useRef(active);
  const confirmMessageRef = useRef(confirmMessage);
  const onConfirmLeaveRef = useRef(onConfirmLeave);
  useEffect(() => {
    activeRef.current = active;
    confirmMessageRef.current = confirmMessage;
    onConfirmLeaveRef.current = onConfirmLeave;
  });

  // Arm the sentinel the FIRST time the guard goes active this mount, so a Back
  // press pops onto a same-URL entry we can intercept. Armed at most once (the
  // ref latch) so toggling dirty on and off never accumulates entries.
  useEffect(() => {
    // A StrictMode remount runs this straight after the disarm cleanup below,
    // in the same tick. Cancelling here is what tells that simulated unmount
    // apart from a real one.
    window.clearTimeout(disarmTimeoutRef.current);
    if (!guardBackButton || !active || armedRef.current) return;
    armedRef.current = true;
    pushSentinel();
  }, [guardBackButton, active, pushSentinel]);

  // Leaving without either consumer having eaten the sentinel would strand it
  // in the stack, and Back would then land on this page's URL a second time.
  // Deferred by a tick: a StrictMode remount cancels it above, and any
  // navigation that caused this unmount has settled by the time it runs, so the
  // marker check below can tell "the sentinel is still under us" (safe to walk
  // back over it) from "we already navigated past it" (walking back would undo
  // the navigation the visitor asked for).
  useEffect(() => {
    return () => {
      if (!armedRef.current) return;
      disarmTimeoutRef.current = window.setTimeout(() => {
        const shouldRemoveSentinel = armedRef.current && isSentinelOnTop();
        armedRef.current = false;
        if (shouldRemoveSentinel) window.history.back();
      }, 0);
    };
  }, [isSentinelOnTop]);

  useEffect(() => {
    if (!guardBackButton) return;
    const onPopState = () => {
      // A Back press already popped the sentinel. If there's nothing to guard
      // anymore, honour the Back (one more `back()` clears the sentinel we ate).
      if (!activeRef.current) {
        if (armedRef.current) {
          armedRef.current = false;
          window.removeEventListener("popstate", onPopState);
          window.history.back();
        }
        return;
      }
      if (window.confirm(confirmMessageRef.current)) {
        onConfirmLeaveRef.current?.();
        armedRef.current = false;
        window.removeEventListener("popstate", onPopState);
        // Consume the actual navigation the user asked for (past the sentinel).
        window.history.back();
      } else {
        // Cancel: re-arm so the next Back is caught too.
        pushSentinel();
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [guardBackButton, pushSentinel]);
}
