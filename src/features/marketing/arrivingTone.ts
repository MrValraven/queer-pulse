import type { ArrivingTone } from "./arrivingPage.data";
import styles from "./ArrivingPage.module.css";

/**
 * Tone → CSS-module class for the arriving page's coloured accents.
 *
 * A class map normally lives in its component file, because it depends on that
 * file's CSS-module import. This one is shared by three sibling components, so
 * it gets its own module: keeping it in one of them would make the other two
 * import a component file for a constant, and would cost that file its
 * fast-refresh boundary.
 */
export const TONE_CLASS: Record<ArrivingTone, string> = {
  coral: styles.toneCoral!,
  jade: styles.toneJade!,
  violet: styles.toneViolet!,
  neutral: styles.toneNeutral!,
};
