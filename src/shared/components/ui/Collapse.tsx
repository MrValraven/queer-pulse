import { type ReactNode } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";

interface CollapseProps {
  /** Whether the content is shown. Flipping it animates height and opacity. */
  isOpen: boolean;
  children: ReactNode;
  /** Applied to the animated wrapper. */
  className?: string;
  /** Skip the height animation on first render, so content that is already
   *  open when the page loads does not grow in. Defaults to true. */
  isInitialSkipped?: boolean;
}

/**
 * Mounts and unmounts its children with a height + fade, in place of a bare
 * `{isOpen && …}` that snaps the layout. The wrapper clips while it moves,
 * so focus rings and shadows inside should sit within the child's bounds.
 * Overflow lives only in the animation targets: a static `style.overflow`
 * would be re-applied on every render and keep clipping focus rings at rest.
 * It is a `flow-root`, so a child's top margin stays inside the wrapper in
 * every state and the measured height always matches what the eye sees.
 * Respects the app's reduced-motion flag (OS setting and in-app toggle).
 */
export function Collapse({
  isOpen,
  children,
  className,
  isInitialSkipped = true,
}: CollapseProps) {
  return (
    <AnimatePresence initial={!isInitialSkipped}>
      {isOpen && (
        <CollapsePanel key="collapse" className={className}>
          {children}
        </CollapsePanel>
      )}
    </AnimatePresence>
  );
}

/** The animated wrapper. While it folds away it is `inert`, so a control on
 *  its way out can no longer be clicked, typed into or tabbed to. */
function CollapsePanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const duration = reducedMotion ? 0 : 0.28;
  const ease = [0.22, 0.68, 0.16, 1] as const;
  return (
    <m.div
      className={className}
      inert={!isPresent}
      style={{ display: "flow-root" }}
      initial={{ height: 0, opacity: 0, overflow: "hidden" }}
      // Overflow opens on its own zero-length step timed to the height's end.
      // `transitionEnd` waits for every value's finish promise, and the
      // opacity one settles over a second late, which kept focus rings
      // clipped long after the panel had stopped moving.
      animate={{ height: "auto", opacity: 1, overflow: "visible" }}
      exit={{
        height: 0,
        opacity: 0,
        overflow: "hidden",
        transition: { duration, ease, overflow: { duration: 0 } },
      }}
      transition={{
        duration,
        ease,
        overflow: { duration: 0, delay: duration },
      }}
    >
      {children}
    </m.div>
  );
}
