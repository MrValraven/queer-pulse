import { useCallback, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { usePrefersReducedMotion } from "../../shared/hooks";
import "./simulationMorph.module.css";

/** The attribute on <html> for the length of one morph (simulationMorph.module.css
 *  keys the timing and corners off it, SimulationPlayer.module.css names the
 *  player off it). "enter" while a card grows into the player, "exit" while
 *  the player shrinks back into its card, "exit-unmatched" when no card is on
 *  screen to shrink into and the player simply fades. */
const MORPH_ATTRIBUTE = "simulationMorph";
/** The one view transition name that moves between the card and the player. */
const SURFACE_NAME = "simulation-surface";
/** How long a morph waits on each step: the destination chunk (past it the
 *  click navigates plainly) and then the page's mount. It stays well under the
 *  browser's own update timeout (about four seconds), which would abort the
 *  transition and skip the animation. */
const WAIT_TIMEOUT_MS = 1500;

// The destination page's announce, waiting to be called. Module level, since
// the page that starts a morph unmounts before the one that ends it mounts.
let settleSurfaceWaiter: (() => void) | null = null;
// Set from the click until the animation finishes, so a second click or
// Escape while one runs is dropped and the route ends where the animation ends.
let isMorphRunning = false;

/** Resolves once the destination page announces it has mounted, or after the
 *  timeout. Created before navigating, so an announce that lands in the same
 *  tick still finds its waiter. */
function waitForSurfaceReady(timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    const settle = () => {
      window.clearTimeout(timeoutId);
      if (settleSurfaceWaiter === settle) settleSurfaceWaiter = null;
      resolve();
    };
    const timeoutId = window.setTimeout(settle, timeoutMs);
    settleSurfaceWaiter = settle;
  });
}

/** True once `load` succeeds, false when it fails or outlasts the timeout. */
function loadWithin(load: () => Promise<unknown>, timeoutMs: number) {
  return new Promise<boolean>((resolve) => {
    const timeoutId = window.setTimeout(() => resolve(false), timeoutMs);
    load()
      .then(
        () => resolve(true),
        () => resolve(false),
      )
      .finally(() => window.clearTimeout(timeoutId));
  });
}

/** Called by the gallery and the player once they have mounted (the gallery
 *  after restoring its scroll offset), so the morph captures its new state.
 *  With no morph waiting it does nothing. */
export function announceSurfaceReady(): void {
  settleSurfaceWaiter?.();
}

/** Warms the player chunk on card hover and focus (routes.tsx's specifier). */
export function preloadSimulationPlayer(): void {
  void import("./SimulationPlayer").catch(() => undefined);
}

/** A primary click with no modifier key. Anything else (a new tab, a new
 *  window, a download) stays with the browser and the link's real href. */
export function isPlainPrimaryClick(event: MouseEvent<HTMLElement>): boolean {
  return (
    event.button === 0 &&
    !event.defaultPrevented &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

interface MorphPlan {
  direction: "enter" | "exit";
  destination: string;
  /** Loads the destination route's chunk, so its first render has nothing to
   *  suspend on and the frozen frame stays short. */
  preloadDestination: () => Promise<unknown>;
  /** The card named before the old state is captured (enter). */
  cardBeforeCapture?: HTMLElement;
  /** Finds the card to name once the destination has mounted (exit). */
  findCardAfterUpdate?: () => HTMLElement | null;
}

/** Runs one morph through a same-document view transition. The route changes
 *  inside the update, which waits for the destination page to announce it has
 *  mounted: this app's BrowserRouter commits navigation inside a React
 *  transition and both pages are lazy, so a synchronous flush would capture the
 *  old page twice. */
async function runMorph(plan: MorphPlan, navigateTo: (to: string) => void) {
  if (isMorphRunning) return;
  isMorphRunning = true;
  if (!(await loadWithin(plan.preloadDestination, WAIT_TIMEOUT_MS))) {
    // The route's own lazy import retries or reports the failure.
    isMorphRunning = false;
    navigateTo(plan.destination);
    return;
  }

  const namedCards: HTMLElement[] = [];
  const nameSurface = (card: HTMLElement) => {
    card.style.setProperty("view-transition-name", SURFACE_NAME);
    namedCards.push(card);
  };
  const rootDataset = document.documentElement.dataset;
  rootDataset[MORPH_ATTRIBUTE] = plan.direction;
  if (plan.cardBeforeCapture) nameSurface(plan.cardBeforeCapture);

  const transition = document.startViewTransition(async () => {
    const surfaceReady = waitForSurfaceReady(WAIT_TIMEOUT_MS);
    navigateTo(plan.destination);
    await surfaceReady;
    if (!plan.findCardAfterUpdate) return;
    const card = plan.findCardAfterUpdate();
    if (card) nameSurface(card);
    // Nothing to shrink into: the CSS fades the player out over the gallery.
    else rootDataset[MORPH_ATTRIBUTE] = "exit-unmatched";
  });
  // `ready` rejects when the browser skips the animation (a hidden tab). The
  // route still changes, so this only keeps the rejection out of the console.
  void transition.ready.catch(() => undefined);
  void transition.finished
    .catch(() => undefined)
    .finally(() => {
      isMorphRunning = false;
      delete rootDataset[MORPH_ATTRIBUTE];
      for (const card of namedCards) {
        card.style.removeProperty("view-transition-name");
      }
    });
}

/** The gallery card for a flow, when some of it is on screen. A card scrolled
 *  away or filtered out stays unnamed, and the page crossfade carries the
 *  change on its own. */
function findVisibleGalleryCard(flowId: string): HTMLElement | null {
  const card = document.querySelector<HTMLElement>(
    `[data-simulation-id="${CSS.escape(flowId)}"]`,
  );
  if (!card) return null;
  const bounds = card.getBoundingClientRect();
  const isOnScreen = bounds.bottom > 0 && bounds.top < window.innerHeight;
  return isOnScreen ? card : null;
}

/** The card to player morph for the simulations gallery. Opening a card grows
 *  it into the full window player; leaving the player (Back, Escape, or Escape
 *  inside the frame) shrinks the player back into that card's place. A browser
 *  without view transitions, or a member who prefers reduced motion, gets the
 *  same navigation with no animation. */
export function useSimulationMorph() {
  const navigate = useNavigate();
  const shouldReduceMotion = usePrefersReducedMotion();
  const navigateTo = useCallback((to: string) => void navigate(to), [navigate]);
  const canMorph =
    !shouldReduceMotion && typeof document.startViewTransition === "function";

  const morph = useCallback(
    (plan: MorphPlan) => {
      if (canMorph) void runMorph(plan, navigateTo);
      else navigateTo(plan.destination);
    },
    [canMorph, navigateTo],
  );

  const enterSimulation = useCallback(
    (cardElement: HTMLElement, to: string) =>
      morph({
        direction: "enter",
        destination: to,
        preloadDestination: () => import("./SimulationPlayer"),
        cardBeforeCapture: cardElement,
      }),
    [morph],
  );

  const exitToGallery = useCallback(
    (flowId: string | undefined) =>
      morph({
        direction: "exit",
        destination: routes.simulations,
        preloadDestination: () => import("./SimulationsHome"),
        findCardAfterUpdate: () =>
          flowId === undefined ? null : findVisibleGalleryCard(flowId),
      }),
    [morph],
  );

  return { enterSimulation, exitToGallery };
}
