import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { RollingNumber } from "../ui/RollingNumber";

/* The slot opens its width (and swallows the host's flex gap through a
   negative margin) while the badge inside scales in, so the host grows
   smoothly when the first filter lands. Children inherit the variant labels,
   so the exit plays on both before AnimatePresence unmounts them. */
const badgeVariants = {
  hidden: { opacity: 0, scale: 0.4 },
  shown: { opacity: 1, scale: 1 },
};

interface AnimatedCountBadgeProps {
  count: number;
  /** The formatted count (`fmt.number(count)`). */
  label: string;
  /** The width-animated wrapper; it must clip (`overflow: hidden`). */
  slotClassName: string | undefined;
  /** The pill itself. */
  badgeClassName: string | undefined;
  /** The host's flex gap before the badge, in px, swallowed while hidden. */
  hostGap: number;
}

/** A rolling count pill that widens in when `count` turns positive and
 *  folds away at zero. Used by `FiltersToggleButton` and `FilterSection`.
 *  Already-present badges skip the entrance on mount. */
export function AnimatedCountBadge({
  count,
  label,
  slotClassName,
  badgeClassName,
  hostGap,
}: AnimatedCountBadgeProps) {
  const { reducedMotion } = useMotionPrefs();
  const slotVariants = {
    hidden: { width: 0, marginLeft: -hostGap },
    shown: { width: "auto", marginLeft: 0 },
  };
  return (
    <AnimatePresence initial={false}>
      {count > 0 && (
        <m.span
          key="count"
          className={slotClassName}
          variants={slotVariants}
          initial="hidden"
          animate="shown"
          exit="hidden"
          transition={{
            duration: reducedMotion ? 0 : 0.26,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <m.span className={badgeClassName} variants={badgeVariants}>
            <RollingNumber value={label} numericValue={count} />
          </m.span>
        </m.span>
      )}
    </AnimatePresence>
  );
}
