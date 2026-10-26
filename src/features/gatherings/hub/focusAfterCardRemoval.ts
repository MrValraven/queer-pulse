/** Set on every event cell by `EventCellPresence`, so a card's neighbours can
 *  be found from anywhere inside it. */
export const EVENT_CELL_ATTRIBUTE = "data-event-cell";

/** Set by `EventCommunityMenu` on its wrapper, naming the community it hides.
 *  Every card from that community leaves together, so none of them is a
 *  place to land focus. */
export const EVENT_COMMUNITY_ATTRIBUTE = "data-event-community-id";

/** Set on every Browse month section by `MonthPresence`. A month whose last
 *  card leaves folds away with its heading, so that heading is no place to
 *  land focus either. */
export const EVENT_MONTH_ATTRIBUTE = "data-event-month";

/** Set by `EventCommunityMenu` on the menu of a co-hosted card. A community
 *  the member still sees also runs that event, so the card stays when its
 *  lead is hidden. */
export const EVENT_CO_HOSTED_ATTRIBUTE = "data-event-co-hosted";

/** Set by `markCardsLeaving` on a cell whose card is about to leave, so its
 *  fade starts on the next painted frame (EventCommunityMenu.module.css). */
export const EVENT_LEAVING_ATTRIBUTE = "data-event-leaving";

/** The neighbours' glide into a removed card's gap (220ms), plus a frame. */
const GLIDE_SETTLE_MS = 260;
/** The longest wait for the optimistic removal before measuring anyway. */
const REMOVAL_TIMEOUT_MS = 1000;
/** After this, a marked card still standing (its hide failed and rolled
 *  back) fades back in. */
const LEAVING_RESTORE_MS = 1500;

/** True for a card menu naming the community being hidden, on a card that
 *  leaves with it (a co-hosted card stays). */
function isLeavingMenu(menu: Element, communityId: string | null): boolean {
  return (
    communityId !== null &&
    menu.getAttribute(EVENT_COMMUNITY_ATTRIBUTE) === communityId &&
    !menu.hasAttribute(EVENT_CO_HOSTED_ATTRIBUTE)
  );
}

function isCellLeavingWith(cell: Element, communityId: string | null) {
  return Array.from(
    cell.querySelectorAll(`[${EVENT_COMMUNITY_ATTRIBUTE}]`),
  ).some((menu) => isLeavingMenu(menu, communityId));
}

function communityIdOf(from: Element): string | null {
  return (
    from
      .closest(`[${EVENT_COMMUNITY_ATTRIBUTE}]`)
      ?.getAttribute(EVENT_COMMUNITY_ATTRIBUTE) ?? null
  );
}

function scopeOf(element: Element): Element | Document {
  return element.closest("main") ?? element.ownerDocument;
}

/** A cell that can still hold focus once the hide lands: it is not already
 *  folding away, it does not leave with the hidden community, and it has a
 *  link to land on. */
function landingLinkIn(
  cell: Element,
  leavingCommunityId: string | null,
): HTMLAnchorElement | null {
  if (cell.closest("[inert]")) return null;
  if (isCellLeavingWith(cell, leavingCommunityId)) return null;
  return cell.querySelector<HTMLAnchorElement>("a[href]");
}

/**
 * Starts the fade of every card that leaves with the community `from`'s menu
 * names, before the cache write that removes them. The write re-renders the
 * whole list and holds the main thread for a few frames, so a fade that
 * waited for it would first paint a third of the way through and read as a
 * pop. Motion's exit then carries on from the opacity this reached. A card
 * whose hide fails fades back in after a short while. Skip it under reduced
 * motion.
 */
export function markCardsLeaving(from: HTMLElement | null): void {
  if (!from) return;
  const communityId = communityIdOf(from);
  const leavingCells = Array.from(
    scopeOf(from).querySelectorAll(`[${EVENT_CELL_ATTRIBUTE}]`),
  ).filter(
    (cell) => !cell.closest("[inert]") && isCellLeavingWith(cell, communityId),
  );
  for (const cell of leavingCells) {
    cell.setAttribute(EVENT_LEAVING_ATTRIBUTE, "true");
  }
  window.setTimeout(() => {
    for (const cell of leavingCells) {
      if (cell.isConnected && !cell.closest("[inert]")) {
        cell.removeAttribute(EVENT_LEAVING_ATTRIBUTE);
      }
    }
  }, LEAVING_RESTORE_MS);
}

/** Calls `onGone` once `isGone` holds, checked on every DOM change under
 *  `watched`, or after `REMOVAL_TIMEOUT_MS` at the latest (a hide that fails
 *  never removes anything). */
function whenGone(
  isGone: () => boolean,
  watched: Node,
  onGone: () => void,
): void {
  if (isGone()) {
    onGone();
    return;
  }
  let isDone = false;
  let timeoutId = 0;
  const observer = new MutationObserver(() => {
    if (isGone()) finish();
  });
  function finish() {
    if (isDone) return;
    isDone = true;
    observer.disconnect();
    window.clearTimeout(timeoutId);
    onGone();
  }
  observer.observe(watched, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  timeoutId = window.setTimeout(finish, REMOVAL_TIMEOUT_MS);
}

/** True when the OS or the in-app toggle asks for reduced motion, for a
 *  caller that has no `useMotionPrefs` value to pass. */
function prefersReducedMotion(): boolean {
  return (
    document.documentElement.dataset.reduceMotion === "true" ||
    // jsdom has no matchMedia, and a test that hides a card should not throw.
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  );
}

/** Scrolls the focused target's box into view when it sits outside the
 *  viewport or under its bars. The box is the target's event cell, whose
 *  scroll margins clear the sticky top bar and the phone tab bar. */
function revealIfOutsideViewport(
  target: HTMLElement,
  isReducedMotion: boolean,
): void {
  if (!target.isConnected || document.activeElement !== target) return;
  const box = target.closest(`[${EVENT_CELL_ATTRIBUTE}]`) ?? target;
  const rect = box.getBoundingClientRect();
  const boxStyle = window.getComputedStyle(box);
  const topClearance = parseFloat(boxStyle.scrollMarginTop) || 0;
  const bottomClearance = parseFloat(boxStyle.scrollMarginBottom) || 0;
  const isOutsideViewport =
    rect.top < topClearance ||
    rect.bottom > window.innerHeight - bottomClearance;
  if (!isOutsideViewport) return;
  box.scrollIntoView({
    block: "nearest",
    behavior: isReducedMotion ? "auto" : "smooth",
  });
}

/**
 * Focuses `target` where it stands, without scrolling, and brings it into
 * view only once the leaving card is gone (`isGone`) and the list has
 * settled, and only when it then sits outside the viewport. Measuring any
 * earlier reads the target in its old row, before the removal pulls it up
 * the page, and scrolls the reader far from where they were.
 */
function focusAndRevealWhenSettled(
  target: HTMLElement,
  isReducedMotion: boolean,
  isGone: () => boolean,
  watched: Node,
): void {
  target.focus({ preventScroll: true });
  whenGone(isGone, watched, () => {
    const reveal = () => revealIfOutsideViewport(target, isReducedMotion);
    if (isReducedMotion) {
      window.requestAnimationFrame(() => window.requestAnimationFrame(reveal));
    } else {
      window.setTimeout(reveal, GLIDE_SETTLE_MS);
    }
  });
}

/** Makes a heading focusable from script, clears the sticky top bar when it
 *  is scrolled to, and focuses it, so a screen reader announces where the
 *  reader now is. */
function focusHeading(
  heading: HTMLElement,
  isReducedMotion: boolean,
  isGone: () => boolean,
  watched: Node,
): void {
  if (!heading.hasAttribute("tabindex")) heading.tabIndex = -1;
  if (!heading.style.scrollMarginBlockStart) {
    heading.style.scrollMarginBlockStart = "var(--sticky-top, 0px)";
  }
  focusAndRevealWhenSettled(heading, isReducedMotion, isGone, watched);
}

/** The last `h1` or `h2` before the anchor that stays on the page: outside
 *  anything already inert and outside every month section. This runs only
 *  once no other card can take focus, so every month on the page is about to
 *  fold away, and the heading found is the view's own (Browse's "heading"
 *  above the filter bar). */
function persistentHeadingBefore(
  anchor: Element,
  scope: ParentNode,
): HTMLElement | null {
  const headings = Array.from(
    scope.querySelectorAll<HTMLElement>("h1, h2"),
  ).filter(
    (heading) =>
      (anchor.compareDocumentPosition(heading) &
        Node.DOCUMENT_POSITION_PRECEDING) !==
        0 &&
      !heading.closest("[inert]") &&
      !heading.closest(`[${EVENT_MONTH_ATTRIBUTE}]`),
  );
  return headings.at(-1) ?? null;
}

/**
 * Moves focus off a card that is about to leave the list, before it leaves.
 *
 * Without this, hiding a community from the card's own menu unmounts the
 * element holding focus and the browser drops it on `body`, so a keyboard or
 * screen reader user is thrown back to the top of the page. Focus lands on the
 * next card's link in reading order, else the previous card's, else the
 * last heading before the card that stays on the page. Cards leaving with
 * the same community are skipped; a co-hosted one stays and can take focus.
 * The focus move never scrolls: once the removal has landed and the list has
 * settled, the new focus is scrolled into view only when it sits off screen.
 *
 * A menu outside any cell sits on the Highlights hero. The hero persists
 * while its lead changes, and the grid card next in line is the very event
 * that becomes the new lead (its cell leaves the grid), so focus goes to the
 * hero's own title, which then names the new lead.
 *
 * `isReducedMotion` is the caller's `useMotionPrefs` value; left out, the
 * OS setting and the in-app toggle are read from the page.
 */
export function focusAfterCardRemoval(
  from: HTMLElement | null,
  options?: { isReducedMotion?: boolean },
): void {
  if (!from) return;
  const isReducedMotion = options?.isReducedMotion ?? prefersReducedMotion();
  const ownCell = from.closest(`[${EVENT_CELL_ATTRIBUTE}]`);
  const heroTitle = ownCell
    ? null
    : from.closest("article")?.querySelector<HTMLElement>("h2");
  if (heroTitle) {
    // The hero stays; the hide lands when its title names the next lead.
    const leadTitle = heroTitle.textContent;
    focusHeading(
      heroTitle,
      isReducedMotion,
      () => !heroTitle.isConnected || heroTitle.textContent !== leadTitle,
      scopeOf(heroTitle),
    );
    return;
  }
  const anchor = ownCell ?? from;
  const leavingCommunityId = communityIdOf(from);
  const scope = scopeOf(anchor);
  const isAnchorGone = () => !anchor.isConnected;
  const cells = Array.from(
    scope.querySelectorAll(`[${EVENT_CELL_ATTRIBUTE}]`),
  ).filter((cell) => !cell.contains(anchor) && !anchor.contains(cell));

  const isAfterAnchor = (cell: Element) =>
    (anchor.compareDocumentPosition(cell) &
      Node.DOCUMENT_POSITION_FOLLOWING) !==
    0;
  const following = cells.filter(isAfterAnchor);
  const preceding = cells.filter((cell) => !isAfterAnchor(cell)).reverse();

  for (const cell of [...following, ...preceding]) {
    const link = landingLinkIn(cell, leavingCommunityId);
    if (link) {
      focusAndRevealWhenSettled(link, isReducedMotion, isAnchorGone, scope);
      return;
    }
  }

  const heading = persistentHeadingBefore(anchor, scope);
  if (heading) focusHeading(heading, isReducedMotion, isAnchorGone, scope);
}
