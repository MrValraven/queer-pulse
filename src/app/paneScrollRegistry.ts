/**
 * A lightweight registry for the ONE scroll container an internally-scrolled
 * route owns — today the Messages inbox list (`.threadList`). Those routes
 * (`<AppShell fullHeight>`) scroll inside their own pane, not the window, so
 * `ScrollManager`'s window-side logic is a no-op for them (see
 * `isInternallyScrolledPath`). This closes the other half of that fix: the pane
 * registers its scroll element on mount, and `ScrollManager` drives
 * per-navigation reset/restore + tap-to-top against it, mirroring the window
 * path.
 *
 * Kept as a module singleton (not React context) — like `scrollBus` — because
 * `ScrollManager` is mounted ABOVE the app shells in `App.tsx` and can't read
 * their context. It also decouples timing: `ScrollManager`'s navigation effect
 * fires before the pane (a deeper sibling subtree) has registered on entry, so
 * the requested reset/restore is stashed as `pendingBehavior` and applied the
 * moment a container registers.
 *
 * NOTE / follow-up: this deliberately owns only the inbox list, NOT the message
 * log (`.area`), whose scroll is owned end-to-end by `useMessageScroll`
 * (stick-to-bottom, jump pill, prepend anchoring) and must not be reset from
 * here. If another internally-scrolled route is added later, this single-active-
 * container model is enough (only one such route is ever mounted at a time), but
 * a route with two independently-restorable panes would need per-pane keys.
 */
type PaneBehavior = "reset" | "restore";

let activeContainer: HTMLElement | null = null;
const positions = new Map<string, number>();
let currentKey: string | null = null;
let pendingBehavior: PaneBehavior | null = null;

/** Apply the stashed navigation intent to `container`: restore its remembered
 *  offset (POP) or reset it to the top (any fresh navigation). Consumed once. */
function applyPending(container: HTMLElement): void {
  if (!currentKey || !pendingBehavior) return;
  container.scrollTop =
    pendingBehavior === "restore" ? positions.get(currentKey) ?? 0 : 0;
  pendingBehavior = null;
}

export const paneScrollRegistry = {
  /**
   * `ScrollManager` announces each navigation onto an internally-scrolled route:
   * the scroll-map key (see `scrollKeyForPath`) and whether to restore the
   * remembered offset (browser back/forward) or reset to the top (any fresh
   * navigation). Applied now if a container is already registered, else stashed
   * and applied when one registers.
   */
  onNavigate(key: string, behavior: PaneBehavior): void {
    currentKey = key;
    pendingBehavior = behavior;
    if (activeContainer) applyPending(activeContainer);
  },

  /**
   * The pane's scroll container registers itself on mount. The registry keeps
   * the container's offset recorded (keyed by the current route) and applies any
   * pending reset/restore. Returns a cleanup that records the final offset and
   * detaches — call it from the effect's teardown.
   */
  register(container: HTMLElement): () => void {
    activeContainer = container;
    const record = () => {
      if (currentKey) positions.set(currentKey, container.scrollTop);
    };
    container.addEventListener("scroll", record, { passive: true });
    applyPending(container);
    return () => {
      record();
      container.removeEventListener("scroll", record);
      if (activeContainer === container) activeContainer = null;
    };
  },

  /** Tap-the-active-tab: scroll the registered pane container to the top (the
   *  window can't move on an internally-scrolled route). No-op when nothing is
   *  registered. */
  scrollToTop(smooth: boolean): void {
    activeContainer?.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
  },
};
