import { useCallback, useContext, useEffect, useRef } from "react";
import {
  UNSAFE_NavigationContext,
  parsePath,
  type Path,
} from "react-router-dom";
import { useLeaveConfirm } from "../components/feedback/useLeaveConfirm";

interface UnsavedChangesGuardOptions {
  /** When true, in-app navigation and tab-close are guarded. */
  active: boolean;
  /**
   * Body of the QueerPulse leave dialog (`useLeaveConfirm`) shown on in-app
   * navigation and on a guarded Back press. Tab-close shows the browser's own
   * dialog, whose wording no page can set.
   */
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
  /**
   * Let in-app navigations that keep the current pathname and only change the
   * query or hash through without a prompt. For pages whose draft outlives
   * those moves, such as the persona editor, where `?pane=` switches sections
   * inside one mounted `SubprofileEditorProvider` and leaving a pane loses
   * nothing. Default `false`. Paired with `guardBackButton`, Back between
   * those query entries also passes silently while Back off the page still
   * prompts (see "Query steps" below).
   */
  shouldAllowQueryChanges?: boolean;
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
 * Marker stamped onto every query entry a `shouldAllowQueryChanges` page adds,
 * counting how many same-pathname steps sit below it. Keyed by the pathname
 * itself, so a refresh (or a return visit through Back) still reads the stamps
 * an earlier mount wrote.
 */
const ENTRY_DEPTH_FLAG = "queerpulseUnsavedGuardDepth";

interface EntryDepthStamp {
  /** The pathname the stamp was written on; any other pathname reads as 0. */
  pathname: string;
  /** Same-pathname steps below this entry; 0 is the entry the page opened on. */
  depth: number;
}

/**
 * The shape react-router keeps in `window.history.state` (`{ usr, key, idx }`),
 * narrowed to the fields this hook reads or writes, plus our own markers.
 */
interface GuardedHistoryState {
  /** Caller-supplied `location.state`. */
  usr?: unknown;
  /** react-router's `location.key` for the entry. */
  key?: string;
  /** react-router's history index, which its push/pop arithmetic keys on. */
  idx?: number | null;
  [SENTINEL_STATE_FLAG]?: string;
  [ENTRY_DEPTH_FLAG]?: EntryDepthStamp;
}

function readHistoryState(): GuardedHistoryState | null {
  return window.history.state as GuardedHistoryState | null;
}

/** The depth stamp of the entry the visitor stands on, trusted only on its own pathname. */
function readEntryDepth(): number {
  const stamp = readHistoryState()?.[ENTRY_DEPTH_FLAG];
  if (!stamp || stamp.pathname !== window.location.pathname) return 0;
  return typeof stamp.depth === "number" && stamp.depth > 0 ? stamp.depth : 0;
}

function stampEntryDepth(depth: number): void {
  window.history.replaceState(
    {
      ...readHistoryState(),
      [ENTRY_DEPTH_FLAG]: { pathname: window.location.pathname, depth },
    },
    "",
  );
}

/**
 * Does a navigator target keep the current pathname? `useNavigate` hands the
 * navigator a resolved `Partial<Path>`; a string is parsed the way the router
 * would. No pathname at all means "this pathname". Both sides go through `URL`
 * so an encoded and a decoded spelling of one path compare equal.
 */
function isSamePathnameTarget(target: unknown): boolean {
  let pathname: string | undefined;
  if (typeof target === "string") pathname = parsePath(target).pathname;
  else if (target && typeof target === "object") {
    pathname = (target as Partial<Path>).pathname;
  }
  if (!pathname) return true;
  const destination = new URL(pathname, window.location.href).pathname;
  return destination === window.location.pathname;
}

/**
 * Pushes a sentinel over the current entry. Only react-router's three fields
 * (and our depth stamp) are carried over, rather than the whole state object:
 * other features push markers of their own (the nav drawer's, for one) and
 * inheriting one would make the sentinel read as their entry.
 */
function pushSentinelEntry(sentinelId: string): void {
  const currentState = readHistoryState();
  const currentIndex =
    typeof currentState?.idx === "number" ? currentState.idx : 0;
  window.history.pushState(
    {
      usr: currentState?.usr ?? null,
      key: currentState?.key,
      idx: currentIndex + 1,
      [SENTINEL_STATE_FLAG]: sentinelId,
      [ENTRY_DEPTH_FLAG]: currentState?.[ENTRY_DEPTH_FLAG],
    },
    "",
  );
}

/** One same-pathname navigation, held until the sentinel is out of its way. */
interface QueryStep {
  /** Runs the router's own push or replace, exactly as the caller asked. */
  navigate: () => void;
  isPush: boolean;
}

/** Performs a query step and stamps the entry it lands on with its depth. */
function performStampedStep(step: QueryStep): void {
  const depthBefore = readEntryDepth();
  step.navigate();
  stampEntryDepth(step.isPush ? depthBefore + 1 : depthBefore);
}

/**
 * The leave dialog, guarded against stale answers. Each prompt takes a fresh
 * token; `askToLeave` resolves to `null` once its token is no longer current
 * or the hook has unmounted, and unmounting with a prompt open closes the
 * dialog so it never outlives the page that raised it.
 */
function useStaleSafeLeavePrompt() {
  const { requestLeave, dismissLeave } = useLeaveConfirm();
  // Prompt bookkeeping: an answer only counts while its token is current.
  const promptTokenRef = useRef(0);
  const isPromptOpenRef = useRef(false);
  const isMountedRef = useRef(false);

  /**
   * Opens the leave dialog. Resolves to the visitor's answer, or to `null` when
   * the prompt went stale (superseded, dismissed, or the hook unmounted), in
   * which case the caller must do nothing at all.
   */
  const askToLeave = useCallback(
    async (message: string): Promise<boolean | null> => {
      promptTokenRef.current += 1;
      const promptToken = promptTokenRef.current;
      isPromptOpenRef.current = true;
      const shouldLeave = await requestLeave(message);
      const isStale =
        !isMountedRef.current || promptToken !== promptTokenRef.current;
      if (isStale) return null;
      isPromptOpenRef.current = false;
      return shouldLeave;
    },
    [requestLeave],
  );

  /** Invalidates the open prompt and closes its dialog. */
  const dismissOpenPrompt = useCallback(() => {
    promptTokenRef.current += 1;
    isPromptOpenRef.current = false;
    dismissLeave();
  }, [dismissLeave]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (isPromptOpenRef.current) dismissOpenPrompt();
    };
  }, [dismissOpenPrompt]);

  /** Is a prompt of this hook's still waiting for an answer? */
  const isPromptOpen = useCallback(() => isPromptOpenRef.current, []);

  return { askToLeave, dismissOpenPrompt, isPromptOpen };
}

/**
 * Warn before losing unsaved edits. The app mounts a plain `<BrowserRouter>`
 * (see `src/app/App.tsx`), so react-router's `useBlocker` is unavailable: it
 * needs a data router. Instead this monkey-patches the history navigator's
 * push/replace to hold the navigation while the QueerPulse leave dialog
 * (`useLeaveConfirm().requestLeave`) asks, and adds a beforeunload guard for
 * hard tab-close, where browsers only allow their own native dialog.
 *
 * ## An asked question can go stale
 *
 * The dialog answers asynchronously, so the world can move while it is open.
 * Every prompt takes a fresh token and an answer only acts while its token is
 * still current and the hook is still mounted. A `popstate` that arrives with
 * a prompt open means the visitor travelled through history underneath the
 * dialog: that prompt is invalidated and the dialog closed (`dismissLeave`).
 * Unmounting with a prompt open does the same, so the app-wide dialog never
 * outlives the page that raised it.
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
 * ## Query steps (`shouldAllowQueryChanges` with `guardBackButton`)
 *
 * The persona editor keeps its section in `?pane=` and its picker sheet in
 * `?panes=1`, all on one pathname and all inside one mounted draft. Moving
 * between those entries loses nothing, so neither the rail nor Back may
 * prompt there, while Back off the editor still must. Three rules do it:
 *
 * - **Depth stamps.** Each same-pathname navigation through the patch stamps
 *   the entry it lands on with its depth (`ENTRY_DEPTH_FLAG`): a push is one
 *   deeper than the entry it left, a replace keeps that entry's depth. The
 *   sentinel copies the stamp of the entry under it. Depth 0 is the entry the
 *   editor opened on.
 * - **Stepping over the sentinel.** A query step taken while standing on the
 *   armed sentinel steps off it first, keeping the picker's own replace and
 *   the Back protection intact. The patch queues the step and walks back off
 *   the sentinel; the `popstate` that follows performs the step exactly as
 *   asked and re-arms on top of it.
 * - **Back by depth.** A Back press that pops the sentinel onto an entry of
 *   depth 1 or more is a step to an earlier pane: we walk one more entry back
 *   with no prompt and re-arm there. Depth 0 means the next Back leaves the
 *   editor, so that one prompts as usual.
 *
 * The stacks this produces (`S` is the sentinel, the digit is the depth
 * stamp, `prev` is the page before the editor, the last entry is current):
 *
 * - Rail click A to B: `[prev, A0, S0]`, queue push B and walk back onto A0,
 *   push B and stamp it, re-arm: `[prev, A0, B1, S1]`.
 * - Picker open, then pick C: opening queues push `?panes=1` the same way,
 *   giving `[prev, A0, P1, S1]`. Picking queues a replace, walks back onto
 *   P1, replaces it with C (depth kept) and re-arms: `[prev, A0, C1, S1]`.
 * - Picker closed by Back (or by `closePicker`, whose `navigate(-1)` is a
 *   plain `go(-1)`): `[prev, A0, P1, S1]`, the pop lands on P1, depth 1 steps
 *   back onto A0 and re-arms there: `[prev, A0, S0]`, sheet closed.
 * - Back from B to A: `[prev, A0, B1, S1]`, the pop lands on B1, depth 1
 *   steps back onto A0 and re-arms: `[prev, A0, S0]`, with no prompt.
 * - Back from A out of the editor: `[prev, A0, S0]`, the pop lands on A0,
 *   depth 0 prompts. Keep editing re-arms: `[prev, A0, S0]`. Leave walks one
 *   more entry back: `[prev]` (A0 and S0 left as forward entries).
 *
 * Once the draft is saved (armed, no longer `active`) a depth-0 pop still
 * takes the one extra step that clears the eaten sentinel. A deeper pop steps
 * back silently and leaves the guard disarmed; the next dirty edit re-arms it
 * through the arming effect, since the latch is clear again.
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
  shouldAllowQueryChanges = false,
}: UnsavedChangesGuardOptions): void {
  const { navigator } = useContext(UNSAFE_NavigationContext);
  const { askToLeave, dismissOpenPrompt, isPromptOpen } =
    useStaleSafeLeavePrompt();

  // Whether this mount's sentinel is still sitting in the history stack. Every
  // path that consumes it clears this, so it doubles as "is the sentinel still
  // ours to clean up?" for the unmount cleanup.
  const armedRef = useRef(false);
  const sentinelIdRef = useRef("");
  const disarmTimeoutRef = useRef(0);

  // The query step waiting for our own walk back off the sentinel to land.
  const pendingStepRef = useRef<QueryStep | null>(null);
  // Set while our own extra `back()` for a Back between panes is in flight.
  const isSteppingBackRef = useRef(false);

  const pushSentinel = useCallback(() => {
    sentinelIdRef.current = `unsaved-guard-${(nextSentinelId += 1)}`;
    pushSentinelEntry(sentinelIdRef.current);
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
    const originalMethods = { push: originalPush, replace: originalReplace };
    const shouldTrackDepth = shouldAllowQueryChanges && guardBackButton;
    // One in-app navigation away from the guarded page. `requestedMethod` is
    // what the caller asked for; standing on the sentinel we overwrite it with
    // the destination instead, which leaves the stack the caller would have got
    // had the sentinel never existed.
    const leave = (
      requestedMethod: (...args: unknown[]) => void,
      args: unknown[],
    ) => {
      if (armedRef.current && isSentinelOnTop()) {
        armedRef.current = false;
        originalReplace.apply(historyNavigator, args);
        return;
      }
      requestedMethod.apply(historyNavigator, args);
    };
    // A same-pathname move on a `shouldAllowQueryChanges` page: no prompt. On
    // the armed sentinel it waits for our walk back off it (see "Query steps").
    // A second step asked for before that walk lands takes the queued slot
    // (the latest request wins) and reuses the walk already in flight.
    const stepWithinPage = (
      methodName: "push" | "replace",
      args: unknown[],
    ) => {
      const step: QueryStep = {
        navigate: () =>
          originalMethods[methodName].apply(historyNavigator, args),
        isPush: methodName === "push",
      };
      if (!shouldTrackDepth) {
        step.navigate();
        return;
      }
      if (armedRef.current && isSentinelOnTop()) {
        const isWalkAlreadyQueued = pendingStepRef.current !== null;
        pendingStepRef.current = step;
        if (!isWalkAlreadyQueued) window.history.back();
        return;
      }
      performStampedStep(step);
    };
    const navigateGuarded = (
      methodName: "push" | "replace",
      args: unknown[],
    ) => {
      if (shouldAllowQueryChanges && isSamePathnameTarget(args[0])) {
        stepWithinPage(methodName, args);
        return;
      }
      if (!active) {
        leave(originalMethods[methodName], args);
        return;
      }
      void askToLeave(confirmMessage).then((shouldLeave) => {
        if (!shouldLeave) return;
        onConfirmLeave?.();
        leave(originalMethods[methodName], args);
      });
    };
    historyNavigator.push = (...args) => navigateGuarded("push", args);
    historyNavigator.replace = (...args) => navigateGuarded("replace", args);
    return () => {
      historyNavigator.push = originalPush;
      historyNavigator.replace = originalReplace;
    };
  }, [
    active,
    guardBackButton,
    shouldAllowQueryChanges,
    navigator,
    confirmMessage,
    onConfirmLeave,
    isSentinelOnTop,
    askToLeave,
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
  // the options that shape it) always reads the current dirty state / message /
  // callback without re-registering. Synced in an effect (not during render)
  // so a ref write never happens mid-render.
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
      // Our own walk back off the sentinel for a queued query step: perform
      // the step as asked, then re-arm on top of it.
      const pendingStep = pendingStepRef.current;
      if (pendingStep) {
        pendingStepRef.current = null;
        performStampedStep(pendingStep);
        pushSentinel();
        return;
      }
      // Our own extra step for a Back between panes has landed.
      if (isSteppingBackRef.current) {
        isSteppingBackRef.current = false;
        if (armedRef.current) pushSentinel();
        return;
      }
      // The visitor moved through history underneath an open dialog: that
      // question no longer describes where they are, so close it and treat
      // this pop like any other. A Back that ate the sentinel then asks about
      // leaving by Back, and the guard stays armed for the dirty draft.
      if (isPromptOpen()) dismissOpenPrompt();
      // Anything else only concerns us when it popped our armed sentinel.
      if (!armedRef.current || isSentinelOnTop()) return;
      // Back between query entries of one page: step to the earlier one with
      // no prompt, and re-arm there once it lands (only while still dirty).
      const landingDepth = shouldAllowQueryChanges ? readEntryDepth() : 0;
      if (landingDepth > 0) {
        if (!activeRef.current) armedRef.current = false;
        isSteppingBackRef.current = true;
        window.history.back();
        return;
      }
      // A Back press already popped the sentinel. If there's nothing to guard
      // anymore, honour the Back (one more `back()` clears the sentinel we ate).
      if (!activeRef.current) {
        armedRef.current = false;
        window.removeEventListener("popstate", onPopState);
        window.history.back();
        return;
      }
      void askToLeave(confirmMessageRef.current).then((shouldLeave) => {
        if (shouldLeave === null) return;
        if (shouldLeave) {
          onConfirmLeaveRef.current?.();
          armedRef.current = false;
          window.removeEventListener("popstate", onPopState);
          // Consume the actual navigation the user asked for (past the sentinel).
          window.history.back();
        } else {
          // Cancel: re-arm so the next Back is caught too.
          pushSentinel();
        }
      });
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [
    guardBackButton,
    shouldAllowQueryChanges,
    pushSentinel,
    isSentinelOnTop,
    askToLeave,
    dismissOpenPrompt,
    isPromptOpen,
  ]);
}
