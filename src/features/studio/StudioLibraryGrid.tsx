import { Children, isValidElement, type ReactNode } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import {
  STUDIO_EXIT,
  STUDIO_FADE,
  STUDIO_SPRING,
  studioStaggerDelay,
} from "./studioMotion";
import styles from "./studio.module.css";
import css from "./StudioLibrary.module.css";

const REDUCED_FADE = { duration: 0.12 } as const;

function StudioLibraryGridItem({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  return (
    <m.li
      layout={reducedMotion ? false : "position"}
      inert={!isPresent}
      className={css.gridItem}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          ...(reducedMotion ? REDUCED_FADE : STUDIO_FADE),
          delay: reducedMotion ? 0 : studioStaggerDelay(index),
        },
      }}
      exit={{
        opacity: 0,
        scale: reducedMotion ? 1 : 0.96,
        transition: reducedMotion ? REDUCED_FADE : STUDIO_EXIT,
      }}
      transition={{ layout: STUDIO_SPRING }}
    >
      {children}
    </m.li>
  );
}

/**
 * Library's card grid as a list. The first eight cards arrive in a short
 * stagger; a card that leaves (an unsave, a filter) fades and shrinks while
 * the others glide into its place. Pass each card with a key.
 */
export function StudioLibraryGrid({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <ul className={`${styles.rowGrid} ${css.grid}`} aria-label={label}>
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <StudioLibraryGridItem key={item.key ?? index} index={index}>
            {item}
          </StudioLibraryGridItem>
        ))}
      </AnimatePresence>
    </ul>
  );
}
