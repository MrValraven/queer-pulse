import { useLocation, type Location } from "react-router-dom";
import {
  AnimatePresence,
  m,
  PresenceContext,
  useIsPresent,
  type TargetAndTransition,
  type Transition,
  type Variants,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { mediaMax } from "../../theme/breakpoints";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useNavDirection } from "../../../app/providers/navDirection";
import { RouteTransitionScopeContext } from "./routeTransitionScope";
import styles from "./RouteTransition.module.css";

/**
 * First path segment: the transition identity, so /feed/1 to /feed/2 stays on
 * one plane and neither slides nor fades.
 */
function topSegment(pathname: string): string {
  return `/${pathname.split("/")[1] ?? ""}`;
}

const SLIDE_DURATION = 0.26; // 260ms, inside the 150 to 400ms window

/**
 * The inside of one plane. Rendered INSIDE the `m.div` so `useIsPresent` reads
 * that plane's own presence: true for the page on screen, false for the ghost
 * AnimatePresence keeps mounted while it leaves. On the mobile slide that is
 * the whole 260ms slide; everywhere else the ghost is gone on the next frame.
 *
 * Two things keep a ghost a ghost:
 *
 * - The route is frozen to the one this plane was rendered for (see
 *   routeTransitionScope.ts). The `location` prop is baked into the element
 *   AnimatePresence holds on to, so the ghost keeps showing the page the
 *   member is leaving even though its `AppRoutes` still hears every router
 *   update.
 * - Nothing inside the plane registers with framer's exit bookkeeping. A
 *   `PresenceChild` waits for EVERY motion component under it to finish its
 *   exit, and a component that MOUNTS after the exit began (a card list whose
 *   data lands late, a reveal on scroll, the pull-to-refresh wrapper of the
 *   next page) is created with its presence already "gone", so framer never
 *   fires its exit and never hears it finish: the ghost stays in the DOM for
 *   the rest of the session, one per navigation. Cutting the presence context
 *   here makes the plane's own exit the only thing the removal waits on. The
 *   page's own AnimatePresences (a persona panel, a filter chip) still run
 *   their children's exits; only their participation in the PAGE's exit is
 *   dropped, and the whole plane is leaving anyway.
 */
function RouteTransitionPlane({
  location,
  children,
}: {
  location: Location;
  children: ReactNode;
}) {
  const isPresent = useIsPresent();
  return (
    <RouteTransitionScopeContext.Provider value={{ location, isPresent }}>
      <PresenceContext.Provider value={null}>
        {children}
      </PresenceContext.Provider>
    </RouteTransitionScopeContext.Provider>
  );
}

/**
 * One plane of the transition: the animated `m.div` itself, as a component so
 * it can read its own presence and reach its own DOM node.
 *
 * `popLayout` pins the leaving plane with `position: absolute` at its place in
 * the DOCUMENT, and then ScrollManager scrolls the window for the page that is
 * arriving (to the top, or to a remembered offset on Back). The ghost moved
 * with the document, so a member reading 1500px down the feed saw the TOP of
 * the feed, a part of the page they were not looking at, flash up while it
 * slid away. During its exit the plane now counters every window scroll with
 * an equal `margin-top`, so it leaves from exactly where it sat on screen.
 * Margin, because motion owns this element's `transform` (the mobile slide)
 * and popLayout owns its `top`.
 *
 * `enterClassName` is read once, when the plane mounts: crossing the mobile
 * breakpoint or toggling reduced motion later must never restart the fade on
 * a page the member is already reading. It is dropped once the page's <main>
 * has faded in, so a later page inside the same plane (/feed to a post under
 * /feed) appears without a fade, the same as before.
 *
 * `ref` is PopChild's: it measures the plane the moment it starts to leave.
 */
function RoutePlane({
  ref,
  variants,
  transition,
  enterClassName,
  children,
}: {
  ref?: Ref<HTMLDivElement>;
  variants: Variants;
  transition: Transition;
  enterClassName?: string;
  children: ReactNode;
}) {
  const isPresent = useIsPresent();
  const [mountEnterClassName] = useState(enterClassName);
  const [isEnterPending, setIsEnterPending] = useState(
    mountEnterClassName !== undefined,
  );
  const planeRef = useRef<HTMLDivElement | null>(null);
  const attachPlane = useCallback(
    (node: HTMLDivElement | null) => {
      planeRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  // Native listeners: motion's props have no `onAnimationCancel`, and a page
  // unmounted mid-fade (a quick second navigation inside the plane) ends its
  // animation with `animationcancel`, never `animationend`.
  useEffect(() => {
    const plane = planeRef.current;
    if (!isEnterPending || !plane) return;
    const settleEnter = (event: Event) => {
      const isPageMain =
        event.target instanceof HTMLElement &&
        event.target.hasAttribute("data-page-main");
      if (isPageMain) setIsEnterPending(false);
    };
    plane.addEventListener("animationend", settleEnter);
    plane.addEventListener("animationcancel", settleEnter);
    return () => {
      plane.removeEventListener("animationend", settleEnter);
      plane.removeEventListener("animationcancel", settleEnter);
    };
  }, [isEnterPending]);

  useLayoutEffect(() => {
    const plane = planeRef.current;
    if (isPresent || !plane) return;
    // Read in the layout phase of the commit that starts the exit, before
    // ScrollManager's passive effect moves the window for the new page.
    const exitScrollY = window.scrollY;
    const holdInPlace = () => {
      plane.style.marginTop = `${window.scrollY - exitScrollY}px`;
    };
    window.addEventListener("scroll", holdInPlace, { passive: true });
    return () => window.removeEventListener("scroll", holdInPlace);
  }, [isPresent]);

  return (
    <m.div
      ref={attachPlane}
      className={isEnterPending ? mountEnterClassName : undefined}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      style={{ minHeight: "100%" }}
    >
      {children}
    </m.div>
  );
}

/**
 * Whether the member has left the plane the app booted on. The boot plane
 * appears as it is, to match `initial={false}`; every plane a navigation
 * mounts after that fades in, the boot route included when they come back to
 * it.
 */
function useHasNavigated(planeKey: string): boolean {
  const [bootPlaneKey] = useState(planeKey);
  const [hasNavigated, setHasNavigated] = useState(false);
  const hasLeftBootPlane = hasNavigated || planeKey !== bootPlaneKey;
  if (hasLeftBootPlane && !hasNavigated) setHasNavigated(true);
  return hasLeftBootPlane;
}

/**
 * Mobile push and pop slide both planes, with the leaving one kept as a ghost
 * for the length of the slide. Everything else (desktop, a mobile tab switch
 * or replace, reduced motion) swaps planes with no overlap: the leaving plane
 * drops to opacity 0 at once, with a zero-length transition, so motion runs no
 * animation for it and it is removed on the next frame. The arriving page then
 * fades in through the CSS `enter` class, which targets the page's own <main>
 * (`data-page-main`): a route chunk still loading shows its spinner at once,
 * and the fade starts when the real page mounts. A motion fade of the whole
 * arriving plane started after the long commit that mounts a page, so its
 * first painted frame was already far into the fade, and a cross-fade showed
 * the old page over the new page's spinner and skeletons. The nav stays up
 * across the gap because the route fallback holds the previous page's shell
 * frame (see RouteFallback.tsx).
 *
 * The exit travels as AnimatePresence's `custom`: a leaving plane keeps the
 * element from the render before the navigation, so its own `variants` still
 * describe the PREVIOUS navigation. `custom` carries the current one.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const planeKey = topSegment(location.pathname);
  const direction = useNavDirection();
  const { reducedMotion } = useMotionPrefs();
  const isMobile = useMediaQuery(mediaMax("mobile"));
  const hasNavigated = useHasNavigated(planeKey);

  const isSliding =
    isMobile && !reducedMotion && (direction === "push" || direction === "pop");
  const enterOffset = direction === "pop" ? "-18%" : "18%";
  const exitOffset = direction === "pop" ? "18%" : "-18%";
  const exitTarget: TargetAndTransition = isSliding
    ? { opacity: 0, x: exitOffset }
    : { opacity: 0, transition: { duration: 0 } };
  const shouldFadeIn = hasNavigated && !isSliding && !reducedMotion;

  const variants: Variants = {
    initial: isSliding ? { opacity: 0, x: enterOffset } : { opacity: 1, x: 0 },
    animate: { opacity: 1, x: 0 },
    exit: (currentExit: TargetAndTransition) => currentExit,
  };

  return (
    <AnimatePresence mode="popLayout" initial={false} custom={exitTarget}>
      <RoutePlane
        key={planeKey}
        variants={variants}
        transition={{
          duration: reducedMotion ? 0 : SLIDE_DURATION,
          ease: [0.22, 1, 0.36, 1],
        }}
        enterClassName={shouldFadeIn ? styles.enter : undefined}
      >
        <RouteTransitionPlane location={location}>
          {children}
        </RouteTransitionPlane>
      </RoutePlane>
    </AnimatePresence>
  );
}
