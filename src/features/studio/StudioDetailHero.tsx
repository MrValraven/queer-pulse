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
import { STUDIO_FADE, STUDIO_SPRING_SOFT } from "./studioMotion";
import {
  announceStudioMorphLanded,
  isStudioMorphRunning,
} from "./studioPageMorph";
import styles from "./studio.module.css";

/** "default" is the cover beside the copy. "full-bleed" drops the cover
 *  frame and fills a band with the backdrop photo, the copy over its lower
 *  part. "avatar-backdrop" keeps the cover beside the copy and spreads the
 *  backdrop photo, dimmed, behind the whole hero. */
export type StudioDetailHeroVariant =
  "default" | "full-bleed" | "avatar-backdrop";

interface StudioDetailHeroProps {
  /** The cover/portrait art node, typically an `ImageSlot`. The full-bleed
   *  variant renders no cover frame, so it ignores this. */
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
  /** A wide decorative photo, typically an `<img alt="">`. Shown by the
   *  full-bleed and avatar-backdrop variants; the tint wash stays behind it,
   *  so a photo that never loads leaves the hero as it was. */
  backdrop?: ReactNode;
}

const REDUCED_FADE = { duration: 0.12 } as const;

/** The copy's rise: a short fade under reduced motion, nothing while a
 *  Studio page morph lands (the morph carries the page in). */
function copyEntrance(
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

/** The photo layer fades in under the copy. */
function backdropEntrance(isLandingInMorph: boolean, isReducedMotion: boolean) {
  return {
    initial: isLandingInMorph ? false : { opacity: 0 },
    animate: { opacity: 1 },
    transition: isReducedMotion ? REDUCED_FADE : STUDIO_FADE,
  };
}

/** The eyebrow, the page's one h1 and the credit line. */
function HeroHeading({
  kind,
  title,
  titleId,
  by,
}: Pick<StudioDetailHeroProps, "kind" | "title" | "titleId" | "by">) {
  return (
    <>
      <div className={styles.kind}>{kind}</div>
      <h1 id={titleId}>{title}</h1>
      <div className={styles.by}>{by}</div>
    </>
  );
}

/** The action row, then the caller's extra block (a pay pill). */
function HeroActionsRow({
  actions,
  actionsClassName,
  isActionsCompact,
  children,
}: Pick<
  StudioDetailHeroProps,
  "actions" | "actionsClassName" | "isActionsCompact" | "children"
>) {
  return (
    <>
      <div
        className={
          actionsClassName
            ? `${styles.heroActions} ${actionsClassName}`
            : styles.heroActions
        }
        data-compact={isActionsCompact || undefined}
      >
        {actions}
      </div>
      {children}
    </>
  );
}

/**
 * The one Studio detail hero, for releases, tracks, artists, scenes,
 * playlists and shows: a large cover beside an eyebrow, the h1, a credit
 * line and the action row, over a soft wash of the cover's tint. The cover
 * settles in with a soft spring and the copy rises after it; reduced motion
 * keeps a short fade. A hero that mounts while a Studio page morph lands
 * (studioPageMorph.ts) skips that entrance, since the morph already carries
 * the page in and its cover moves into place. Each caller supplies its own
 * art, copy and actions. The artist page can trade the cover for a wide
 * photo band (full-bleed) or lay a dimmed photo behind it (avatar-backdrop).
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
}: StudioDetailHeroProps) {
  const { reducedMotion } = useMotionPrefs();
  // Read once at mount: the morph is done long before any later render.
  const [isLandingInMorph] = useState(isStudioMorphRunning);
  // Tells a waiting morph the destination page is up, so it captures it.
  useEffect(() => {
    announceStudioMorphLanded();
  }, []);
  const isFullBleed = variant === "full-bleed";
  const hasBackdropBehindHero = variant === "avatar-backdrop" && !!backdrop;
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
      {hasBackdropBehindHero && (
        <m.div
          className={styles.detailBackdrop}
          aria-hidden="true"
          {...backdropEntrance(isLandingInMorph, reducedMotion)}
        >
          {backdrop}
        </m.div>
      )}
      {isFullBleed ? (
        <>
          <div className={styles.detailBand}>
            {backdrop && (
              <m.div
                className={styles.detailBandPhoto}
                aria-hidden="true"
                {...backdropEntrance(isLandingInMorph, reducedMotion)}
              >
                {backdrop}
              </m.div>
            )}
            <m.div
              className={styles.detailBandCopy}
              {...copyEntrance(isLandingInMorph, reducedMotion, 0.06)}
            >
              {heading}
            </m.div>
          </div>
          <m.div
            className={styles.detailCopy}
            {...copyEntrance(isLandingInMorph, reducedMotion, 0.12)}
          >
            {actionsRow}
          </m.div>
        </>
      ) : (
        <>
          <m.div
            className={styles.detailArt}
            style={artStyle}
            initial={
              isLandingInMorph
                ? false
                : { opacity: 0, scale: reducedMotion ? 1 : 0.96 }
            }
            animate={{ opacity: 1, scale: 1 }}
            transition={reducedMotion ? REDUCED_FADE : STUDIO_SPRING_SOFT}
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
