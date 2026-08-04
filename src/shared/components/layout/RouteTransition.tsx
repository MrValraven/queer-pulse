import { useLocation } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import type { ReactNode } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useMotionPrefs } from "../../../app/providers/MotionProvider";
import { useNavDirection } from "../../../app/providers/NavDirectionProvider";

/** First path segment — the transition identity (so /feed/1 → /feed/2 doesn't slide). */
function topSegment(pathname: string): string {
  return `/${pathname.split("/")[1] ?? ""}`;
}

const DURATION = 0.26; // 260ms, within the 150–400ms window

export function RouteTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const direction = useNavDirection();
  const { reducedMotion } = useMotionPrefs();
  const isMobile = useMediaQuery("(max-width: 860px)");

  // Desktop = opacity-only polish; reduced-motion = opacity snap; mobile = slide.
  const slide = isMobile && !reducedMotion && (direction === "push" || direction === "pop");
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
        transition={{ duration: reducedMotion ? 0 : DURATION, ease: [0.22, 1, 0.36, 1] }}
        style={{ minHeight: "100%" }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
