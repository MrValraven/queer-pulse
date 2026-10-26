import type { MouseEvent, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { runStudioMorph, type StudioMorphDestination } from "./studioPageMorph";

/** A primary click with no modifier key on a link that opens in place.
 *  Anything else (a new tab, a new window, a download) stays with the
 *  browser and the link's real href. */
function isPlainPrimaryClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.button === 0 &&
    !event.defaultPrevented &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

/** A router link from the track page into its release or its artist that
 *  carries the page over through the Studio page morph (studioPageMorph.ts).
 *  A browser without view transitions, or a member who prefers reduced
 *  motion, gets the link's own plain navigation. */
export function StudioMorphLink({
  to,
  destination,
  className,
  children,
}: {
  to: string;
  destination: StudioMorphDestination;
  className?: string;
  children?: ReactNode;
}) {
  const navigate = useNavigate();
  const shouldReduceMotion = usePrefersReducedMotion();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!isPlainPrimaryClick(event)) return;
    if (
      shouldReduceMotion ||
      typeof document.startViewTransition !== "function"
    ) {
      return;
    }
    event.preventDefault();
    runStudioMorph(destination, to, (target) => void navigate(target));
  }

  return (
    <Link to={to} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
