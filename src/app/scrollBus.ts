/**
 * A zero-dependency signal for "the user tapped the tab they're already on".
 * The active page's scroll surface subscribes and scrolls to top (+ refreshes);
 * BottomTabBar publishes. Kept out of React context so any surface — window or a
 * nested scroller — can listen without prop threading.
 */
type Listener = () => void;
const listeners = new Set<Listener>();

export const scrollBus = {
  requestScrollToTop() {
    for (const listener of listeners) listener();
  },
  onScrollToTop(cb: Listener): () => void {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
};
