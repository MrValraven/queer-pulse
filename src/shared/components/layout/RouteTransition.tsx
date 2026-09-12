import { useLocation, type Location } from "react-router-dom";
import {
  AnimatePresence,
  m,
  PresenceContext,
  useIsPresent,
} from "motion/react";
import type { ReactNode } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { mediaMax } from "../../theme/breakpoints";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useNavDirection } from "../../../app/providers/navDirection";
import { RouteTransitionScopeContext } from "./routeTransitionScope";

/** First path segment — the transition identity (so /feed/1 → /feed/2 doesn't slide). */
function topSegment(pathname: string): string {
  return `/${pathname.split("/")[1] ?? ""}`;
}

const DURATION = 0.26; // 260ms, within the 150–400ms window

/**
 * The inside of one plane. Rendered INSIDE the `m.div` so `useIsPresent` reads
 * that plane's own presence: true for the page on screen, false for the ghost
 * AnimatePresence keeps mounted while it fades out.
 *
 * Two things keep a ghost a ghost:
 *
 * - The route is frozen to the one this plane was rendered for (see
 *   routeTransitionScope.ts). The `location` prop is baked into the element
 *   AnimatePresence holds on to, so the ghost keeps showing the page the
 *   member is leaving instead of re-rendering as the one they are arriving
 *   on.
 * - Nothing inside the plane registers with framer's exit bookkeeping. A
 *   `PresenceChild` waits for EVERY motion component under it to finish its
 *   exit, and a component that MOUNTS after the exit began (a card list whose
 *   data lands late, a reveal on scroll, the pull-to-refresh wrapper of the
 *   next page) is created with its presence already "gone", so framer never
 *   fires its exit and never hears it finish: the ghost stays in the DOM for
 *   the rest of the session, one per navigation. Cutting the presence context
 *   here makes the plane's own fade the only thing the removal waits on. The
 *   page's own AnimatePresences (a persona panel, a filter chip) still run
 *   their children's exits; only their participation in the PAGE's exit is
 *   dropped, and the whole plane is fading out anyway.
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

export function RouteTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { pathname } = location;
  const direction = useNavDirection();
  const { reducedMotion } = useMotionPrefs();
  const isMobile = useMediaQuery(mediaMax("mobile"));

  // Desktop = opacity-only polish; reduced-motion = opacity snap; mobile = slide.
  const slide =
    isMobile && !reducedMotion && (direction === "push" || direction === "pop");
  const offset = direction === "pop" ? "-18%" : "18%";

  const variants = {
    initial: reducedMotion
      ? { opacity: 0 }
      : { opacity: 0, x: slide ? offset : 0 },
    animate: { opacity: 1, x: 0 },
    exit: reducedMotion
      ? { opacity: 0 }
      : { opacity: 0, x: slide ? (direction === "pop" ? "18%" : "-18%") : 0 },
  };

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <m.div
        key={topSegment(pathname)}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: reducedMotion ? 0 : DURATION,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ minHeight: "100%" }}
      >
        <RouteTransitionPlane location={location}>
          {children}
        </RouteTransitionPlane>
      </m.div>
    </AnimatePresence>
  );
}
