import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { reorderLayoutTransition } from "./reorderMotion";

/**
 * Motion props for a topic or line row that glides into its new slot when
 * the list reorders. Position only: the rows hold auto-growing textareas,
 * and a size animation would stretch the text.
 *
 * `layoutDependency` is the editor's move counter, so only a move glides.
 * Adding or removing a line changes every later row's position too, and a
 * glide there would slide rows under the one fading in. The held row snaps
 * (duration 0): the drag engine already carries it under the pointer.
 * Instant under reduced motion.
 */
export function useReorderGlide(isDragging: boolean, moveCount: number) {
  const { reducedMotion } = useMotionPrefs();
  return {
    layout: "position" as const,
    layoutDependency: moveCount,
    transition: {
      layout: reorderLayoutTransition(reducedMotion || isDragging),
    },
  };
}
