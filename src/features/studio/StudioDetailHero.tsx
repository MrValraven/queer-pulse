import type { CSSProperties, ReactNode, Ref } from "react";
import { m } from "motion/react";
import type { ImageSlotTint } from "../../shared/components/ui";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { STUDIO_FADE, STUDIO_SPRING_SOFT } from "./studioMotion";
import styles from "./studio.module.css";

interface StudioDetailHeroProps {
  /** The cover/portrait art node, typically an `ImageSlot`. */
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
}

const REDUCED_FADE = { duration: 0.12 } as const;

/**
 * The one Studio detail hero, for releases, tracks, artists, scenes,
 * playlists and shows: a large cover beside an eyebrow, the h1, a credit
 * line and the action row, over a soft wash of the cover's tint. The cover
 * settles in with a soft spring and the copy rises after it; reduced motion
 * keeps a short fade. Each caller supplies its own art, copy and actions.
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
}: StudioDetailHeroProps) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <section
      className={[styles.detailHero, className].filter(Boolean).join(" ")}
      data-tint={tint}
    >
      <span className={styles.detailWash} aria-hidden="true" />
      <m.div
        className={styles.detailArt}
        style={artStyle}
        initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reducedMotion ? REDUCED_FADE : STUDIO_SPRING_SOFT}
      >
        {art}
      </m.div>
      <m.div
        className={styles.detailCopy}
        initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reducedMotion ? REDUCED_FADE : { ...STUDIO_FADE, delay: 0.06 }
        }
      >
        <div className={styles.kind}>{kind}</div>
        <h1 id={titleId}>{title}</h1>
        <div className={styles.by}>{by}</div>
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
      </m.div>
      <div
        ref={sentinelRef}
        className={styles.detailSentinel}
        aria-hidden="true"
      />
    </section>
  );
}
