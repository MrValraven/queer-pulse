import type { Transition, Variants } from "motion/react";

/** The house decelerate curve (`--ease-out` in tokens/effects.css). */
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** The plum screen fading over the composer, and back out again. */
export function successScreenTransition(isReduced: boolean): Transition {
  return { duration: isReduced ? 0 : 0.25, ease: EASE_OUT };
}

/**
 * How the success panel arrives: the plum ground fades in, the tick springs
 * up, then the title, the sentence, the card and each row of actions rise
 * into place one after another. With reduced motion everything is simply
 * there, with no stagger to wait through.
 */
export function successPanelVariants(isReduced: boolean): {
  sequence: Variants;
  part: Variants;
  mark: Variants;
} {
  return {
    sequence: {
      hidden: {},
      shown: {
        transition: {
          staggerChildren: isReduced ? 0 : 0.06,
          delayChildren: isReduced ? 0 : 0.1,
        },
      },
    },
    part: {
      hidden: { opacity: 0, y: 12 },
      shown: {
        opacity: 1,
        y: 0,
        transition: { duration: isReduced ? 0 : 0.42, ease: EASE_OUT },
      },
    },
    mark: {
      hidden: { opacity: 0, scale: 0.6 },
      shown: {
        opacity: 1,
        scale: 1,
        transition: isReduced
          ? { duration: 0 }
          : { type: "spring", stiffness: 420, damping: 20 },
      },
    },
  };
}
