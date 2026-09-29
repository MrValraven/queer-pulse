import { useMotionPrefs } from "../../../app/providers/motionPrefs";

/** The `--ease` spring, as a cubic-bezier motion can read. Exported for
 *  motion that moves with the chips, such as the work picker's view swap. */
export const CHIP_EASE = [0.22, 0.68, 0.16, 1] as const;

/**
 * The one chip motion every add/remove chip row shares: a chip pops in and
 * out (scale 0.85 and a fade) and glides to its new place (`layout`).
 * `transition` alone is for siblings that only glide, such as the input.
 * Reduced motion (the OS setting or the in-app toggle) makes it instant.
 */
export function useChipMotion() {
  const { reducedMotion } = useMotionPrefs();
  const transition = { duration: reducedMotion ? 0 : 0.2, ease: CHIP_EASE };
  return {
    transition,
    chip: {
      layout: "position" as const,
      initial: { opacity: 0, scale: 0.85 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.85 },
      transition,
    },
  };
}
