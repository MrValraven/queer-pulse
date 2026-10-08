/** Mirrors `--ease` in tokens/effects.css, for the Check-in tab's motion. */
export const EASE = [0.22, 0.68, 0.16, 1] as const;

/**
 * Pass as `onUpdate` to every `m` element in this tab that fades opacity.
 *
 * Motion 11 hands an opacity animation to the browser (WAAPI). When it
 * finishes, Motion cancels the browser animation at once but writes the end
 * value to the element's style only on its next frame, so one painted frame
 * shows the inline opacity from before the animation: a faded-in panel
 * blanks, a faded-out row reappears. Motion keeps any element with an
 * `onUpdate` prop off that path and runs its values on its own frame loop,
 * which writes the last value in the frame the animation ends.
 */
export function keepOnFrameLoop() {
  // The prop's presence is the switch; nothing needs the values.
}

/**
 * Props for an `m.div` that folds open and shut by height. The clip is on
 * only while it moves, so focus rings and a row's hover wash show in full at
 * rest. Reduced motion keeps a short fade.
 */
export function collapseMotion(isReducedMotion: boolean) {
  return isReducedMotion
    ? ({
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.12 },
        onUpdate: keepOnFrameLoop,
      } as const)
    : ({
        onUpdate: keepOnFrameLoop,
        initial: { height: 0, opacity: 0, overflow: "hidden" },
        animate: {
          height: "auto",
          opacity: 1,
          transitionEnd: { overflow: "visible" },
        },
        exit: { height: 0, opacity: 0, overflow: "hidden" },
        transition: { duration: 0.28, ease: EASE },
      } as const);
}
