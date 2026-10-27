import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { m } from "motion/react";
import type { ImageSlotTint } from "../../shared/components/ui";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import {
  announceStudioMorphLanded,
  isStudioMorphRunning,
} from "./studioPageMorph";
import { StudioDetailHeroBand } from "./StudioDetailHeroBand";
import { artEntrance, copyEntrance } from "./studioDetailHeroMotion";
import { HeroActionsRow, HeroHeading } from "./studioDetailHeroParts";
import styles from "./studio.module.css";

/** "default" is the cover beside the copy. "full-bleed" fills a band with
 *  the backdrop photo and the copy over its lower part, with the art shrunk
 *  to a small round portrait above the eyebrow while `isBandAvatarShown`. */
export type StudioDetailHeroVariant = "default" | "full-bleed";

interface StudioDetailHeroProps {
  /** The cover/portrait art node, typically an `ImageSlot`. The full-bleed
   *  variant draws it as a small round portrait above the eyebrow, or leaves
   *  it out when `isBandAvatarShown` is false. */
  art: ReactNode;
  /** Optional extra style on the art frame, e.g. a circular crop for artists. */
  artStyle?: CSSProperties;
  /** Small uppercase eyebrow above the title (e.g. "Album · 11 tracks · 42 min"). */
  kind: ReactNode;
  /** Display title; render coral emphasis with an `<em>`. */
  title: ReactNode;
  /** Gives the h1 an id, for a section labelled by it. */
  titleId?: string;
  /** Credit / meta line under the title. */
  by: ReactNode;
  /** Row of hero action controls (play / save / tip / share). */
  actions: ReactNode;
  /** Optional extra class on the action row, e.g. to move its spacing into
   *  content that folds away. */
  actionsClassName?: string;
  /** The phone row: the big play, then round icon buttons. */
  isActionsCompact?: boolean;
  /** The cover's tint, washed softly behind the hero. */
  tint?: ImageSlotTint;
  /** An empty marker at the foot of the hero, for the page's
   *  `StudioStickyHeader` to watch. */
  sentinelRef?: Ref<HTMLDivElement>;
  /** Optional extra class on the hero, e.g. the hidden-track grey. */
  className?: string;
  /** Optional block rendered below the actions, e.g. a pay pill. */
  children?: ReactNode;
  /** How the hero is laid out; see `StudioDetailHeroVariant`. */
  variant?: StudioDetailHeroVariant;
  /** A wide decorative photo, typically an `<img alt="">`, filling the
   *  full-bleed band. The band's own fill stays behind it, so a photo that
   *  never loads leaves the band dark and the copy readable. */
  backdrop?: ReactNode;
  /** The full-bleed band draws the art as a round portrait above the
   *  eyebrow. False leaves the band to the photo and the copy alone. */
  isBandAvatarShown?: boolean;
}

/**
 * The one Studio detail hero, for releases, tracks, artists, scenes,
 * playlists and shows: a large cover beside an eyebrow, the h1, a credit
 * line and the action row, over a soft wash of the cover's tint. The cover
 * settles in with a soft spring and the copy rises after it; reduced motion
 * keeps a short fade. A hero that mounts while a Studio page morph lands
 * (studioPageMorph.ts) skips that entrance, since the morph already carries
 * the page in and its cover moves into place. Each caller supplies its own
 * art, copy and actions. The artist page can fill a wide photo band
 * (full-bleed, drawn by StudioDetailHeroBand.tsx), with or without the
 * portrait shrunk to a small ring above the name.
 */
export function StudioDetailHero({
  art,
  artStyle,
  kind,
  title,
  titleId,
  by,
  actions,
  actionsClassName,
  isActionsCompact = false,
  tint = "default",
  sentinelRef,
  className,
  children,
  variant = "default",
  backdrop,
  isBandAvatarShown = true,
}: StudioDetailHeroProps) {
  const { reducedMotion } = useMotionPrefs();
  // Read once at mount: the morph is done long before any later render.
  const [isLandingInMorph] = useState(isStudioMorphRunning);
  // Tells a waiting morph the destination page is up, so it captures it.
  useEffect(() => {
    announceStudioMorphLanded();
  }, []);
  const isFullBleed = variant === "full-bleed";
  const heading = (
    <HeroHeading kind={kind} title={title} titleId={titleId} by={by} />
  );
  const actionsRow = (
    <HeroActionsRow
      actions={actions}
      actionsClassName={actionsClassName}
      isActionsCompact={isActionsCompact}
    >
      {children}
    </HeroActionsRow>
  );
  return (
    <section
      className={[styles.detailHero, className].filter(Boolean).join(" ")}
      data-tint={tint}
      data-variant={variant === "default" ? undefined : variant}
    >
      <span className={styles.detailWash} aria-hidden="true" />
      {isFullBleed ? (
        <StudioDetailHeroBand
          art={art}
          backdrop={backdrop}
          isBandAvatarShown={isBandAvatarShown}
          heading={heading}
          actionsRow={actionsRow}
          isLandingInMorph={isLandingInMorph}
          isReducedMotion={reducedMotion}
        />
      ) : (
        <>
          <m.div
            className={styles.detailArt}
            style={artStyle}
            {...artEntrance(isLandingInMorph, reducedMotion)}
          >
            {art}
          </m.div>
          <m.div
            className={styles.detailCopy}
            {...copyEntrance(isLandingInMorph, reducedMotion, 0.06)}
          >
            {heading}
            {actionsRow}
          </m.div>
        </>
      )}
      <div
        ref={sentinelRef}
        className={styles.detailSentinel}
        aria-hidden="true"
      />
    </section>
  );
}
