import detailStyles from "./studio.module.css";
import "./studioPageMorph.module.css";

/** Where a Studio page morph lands: a release page, where the cover carries
 *  over, or an artist page, where the page crossfades on its own. */
export type StudioMorphDestination = "release" | "artist";

/** The attribute on <html> for the length of one morph, holding the
 *  destination. studioPageMorph.module.css keys the timing off it, and the
 *  shell, the player bar and the phone tab bar take their own view transition
 *  names off it so they hold still above the page. */
const MORPH_ATTRIBUTE = "studioMorph";
/** The one view transition name that moves the release cover between heroes. */
const COVER_NAME = "studio-release-cover";
/** How long the morph waits for the destination hero to mount. The old page
 *  stays frozen on screen meanwhile, so this stays short, and well under the
 *  browser's own update timeout (about four seconds), which would abort the
 *  transition and skip the animation. Past it the morph captures whatever the
 *  destination shows, its loading state included. */
const LANDING_TIMEOUT_MS = 1000;

// The destination hero's announce, waiting to be called. Module level, since
// the page that starts a morph unmounts before the one that ends it mounts.
let settleLandingWaiter: (() => void) | null = null;
// Set from the click until the animation finishes, so a second click while
// one runs is dropped and the route ends where the animation ends.
let isMorphRunning = false;

/** True from the click until the morph finishes. A detail hero that mounts in
 *  that window skips its own entrance, since the morph already carries it in. */
export function isStudioMorphRunning(): boolean {
  return isMorphRunning;
}

/** Called by StudioDetailHero once it mounts, so the morph captures the new
 *  page. With no morph waiting it does nothing. */
export function announceStudioMorphLanded(): void {
  settleLandingWaiter?.();
}

/** Resolves once a destination hero announces it has mounted, or after the
 *  timeout. Created before navigating, so an announce that lands in the same
 *  tick still finds its waiter. Timers only: the browser holds back animation
 *  frames while a view transition waits on its update. */
function waitForLanding(timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    const settle = () => {
      window.clearTimeout(timeoutId);
      if (settleLandingWaiter === settle) settleLandingWaiter = null;
      resolve();
    };
    const timeoutId = window.setTimeout(settle, timeoutMs);
    settleLandingWaiter = settle;
  });
}

/** The detail hero's cover frame, when some of it is on screen. A cover
 *  scrolled away stays unnamed, and the page crossfade carries the change on
 *  its own. */
function findVisibleHeroArt(): HTMLElement | null {
  const artClassName = detailStyles.detailArt;
  if (!artClassName) return null;
  const art = document.querySelector<HTMLElement>(
    `.${CSS.escape(artClassName)}`,
  );
  if (!art) return null;
  const bounds = art.getBoundingClientRect();
  const isOnScreen =
    bounds.width > 0 && bounds.bottom > 0 && bounds.top < window.innerHeight;
  return isOnScreen ? art : null;
}

/** Runs one Studio page morph through a same-document view transition. The
 *  route changes inside the update, which waits for the destination hero to
 *  announce it has mounted: this app's BrowserRouter commits navigation inside
 *  a React transition and the pages are lazy, so a synchronous flush would
 *  capture the old page twice. Into a release page the hero cover moves from
 *  its place on the track page to its place on the release page while the
 *  rest crossfades; into an artist page the whole page crossfades. */
export function runStudioMorph(
  destination: StudioMorphDestination,
  to: string,
  navigateTo: (target: string) => void,
): void {
  if (isMorphRunning) return;
  isMorphRunning = true;

  const namedElements: HTMLElement[] = [];
  const nameCover = (element: HTMLElement) => {
    element.style.setProperty("view-transition-name", COVER_NAME);
    namedElements.push(element);
  };
  const rootDataset = document.documentElement.dataset;
  rootDataset[MORPH_ATTRIBUTE] = destination;
  const sourceArt = destination === "release" ? findVisibleHeroArt() : null;
  if (sourceArt) nameCover(sourceArt);

  const transition = document.startViewTransition(async () => {
    const landing = waitForLanding(LANDING_TIMEOUT_MS);
    navigateTo(to);
    await landing;
    if (!sourceArt) return;
    // Past the timeout the old page can still be up, so the source frame is
    // left alone and keeps the one name it already carries.
    const destinationArt = findVisibleHeroArt();
    if (destinationArt && destinationArt !== sourceArt) {
      nameCover(destinationArt);
    }
  });
  // `ready` rejects when the browser skips the animation (a hidden tab). The
  // route still changes, so this only keeps the rejection out of the console.
  void transition.ready.catch(() => undefined);
  void transition.finished
    .catch(() => undefined)
    .finally(() => {
      isMorphRunning = false;
      delete rootDataset[MORPH_ATTRIBUTE];
      for (const element of namedElements) {
        element.style.removeProperty("view-transition-name");
      }
    });
}
