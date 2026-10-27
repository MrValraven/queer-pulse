import type { ReactNode } from "react";
import { m } from "motion/react";
import {
  artEntrance,
  backdropEntrance,
  copyEntrance,
} from "./studioDetailHeroMotion";
import styles from "./studio.module.css";

/**
 * The full-bleed body of `StudioDetailHero`: a band filled with the
 * backdrop photo and the heading over its lower part, with the art shrunk
 * to a small round portrait above the eyebrow while `isBandAvatarShown`,
 * then the action row under the band. The hero owns the morph handling and
 * passes `isLandingInMorph` down, so the entrances match the default body.
 */
export function StudioDetailHeroBand({
  art,
  backdrop,
  isBandAvatarShown,
  heading,
  actionsRow,
  isLandingInMorph,
  isReducedMotion,
}: {
  /** The portrait art, drawn small and round above the eyebrow. */
  art: ReactNode;
  /** The wide decorative photo filling the band. */
  backdrop?: ReactNode;
  /** False leaves the band to the photo and the copy alone. */
  isBandAvatarShown: boolean;
  /** The eyebrow, h1 and credit line. */
  heading: ReactNode;
  /** The action row and the caller's extra block. */
  actionsRow: ReactNode;
  /** The hero mounted while a Studio page morph lands, so it skips entrances. */
  isLandingInMorph: boolean;
  isReducedMotion: boolean;
}) {
  return (
    <>
      <div className={styles.detailBand}>
        {backdrop && (
          <m.div
            className={styles.detailBandPhoto}
            aria-hidden="true"
            {...backdropEntrance(isLandingInMorph, isReducedMotion)}
          >
            {backdrop}
          </m.div>
        )}
        <m.div
          className={styles.detailBandCopy}
          {...copyEntrance(isLandingInMorph, isReducedMotion, 0.06)}
        >
          {isBandAvatarShown && (
            <m.div
              className={styles.detailBandAvatar}
              aria-hidden="true"
              {...artEntrance(isLandingInMorph, isReducedMotion)}
            >
              {art}
            </m.div>
          )}
          {heading}
        </m.div>
      </div>
      <m.div
        className={styles.detailCopy}
        {...copyEntrance(isLandingInMorph, isReducedMotion, 0.12)}
      >
        {actionsRow}
      </m.div>
    </>
  );
}
