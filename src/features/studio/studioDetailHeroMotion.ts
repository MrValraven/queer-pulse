/* The Studio detail hero's entrances, shared by its default body and its
   full-bleed band (StudioDetailHeroBand.tsx). */
import { STUDIO_FADE, STUDIO_SPRING_SOFT } from "./studioMotion";

const REDUCED_FADE = { duration: 0.12 } as const;

/** The copy's rise: a short fade under reduced motion, nothing while a
 *  Studio page morph lands (the morph carries the page in). */
export function copyEntrance(
  isLandingInMorph: boolean,
  isReducedMotion: boolean,
  delaySeconds: number,
) {
  return {
    initial: isLandingInMorph
      ? false
      : { opacity: 0, y: isReducedMotion ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    transition: isReducedMotion
      ? REDUCED_FADE
      : { ...STUDIO_FADE, delay: delaySeconds },
  };
}

/** The art settles in with a soft spring: a short fade under reduced
 *  motion, nothing while a Studio page morph lands. */
export function artEntrance(
  isLandingInMorph: boolean,
  isReducedMotion: boolean,
) {
  return {
    initial: isLandingInMorph
      ? false
      : { opacity: 0, scale: isReducedMotion ? 1 : 0.96 },
    animate: { opacity: 1, scale: 1 },
    transition: isReducedMotion ? REDUCED_FADE : STUDIO_SPRING_SOFT,
  };
}

/** The photo layer fades in under the copy. */
export function backdropEntrance(
  isLandingInMorph: boolean,
  isReducedMotion: boolean,
) {
  return {
    initial: isLandingInMorph ? false : { opacity: 0 },
    animate: { opacity: 1 },
    transition: isReducedMotion ? REDUCED_FADE : STUDIO_FADE,
  };
}
