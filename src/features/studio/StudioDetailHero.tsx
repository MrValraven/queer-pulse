import type { CSSProperties, ReactNode } from "react";
import styles from "./studio.module.css";

interface StudioDetailHeroProps {
  /** The cover/portrait art node — typically an `ImageSlot`. */
  art: ReactNode;
  /** Optional extra style on the art frame, e.g. a circular crop for artists. */
  artStyle?: CSSProperties;
  /** Small uppercase eyebrow above the title (e.g. "Album · 11 tracks · 42 min"). */
  kind: ReactNode;
  /** Display title; render coral emphasis with an `<em>`. */
  title: ReactNode;
  /** Credit / meta line under the title. */
  by: ReactNode;
  /** Row of hero action controls (play / save / tip / share). */
  actions: ReactNode;
  /** Optional block rendered below the actions, e.g. a pay pill. */
  children?: ReactNode;
}

/**
 * Shared "detail hero" scaffold for studio release/artist pages: a large cover
 * beside an eyebrow → title → credit → action row. Extracted from the
 * near-identical `StudioArtistHero` and `StudioAlbumHero` so the layout lives in
 * one place; each caller supplies its own art, copy, and action buttons.
 */
export function StudioDetailHero({
  art,
  artStyle,
  kind,
  title,
  by,
  actions,
  children,
}: StudioDetailHeroProps) {
  return (
    <section className={styles.detailHero}>
      <div className={styles.detailArt} style={artStyle}>
        {art}
      </div>
      <div>
        <div className={styles.kind}>{kind}</div>
        <h1>{title}</h1>
        <div className={styles.by}>{by}</div>
        <div className={styles.heroActions}>{actions}</div>
        {children}
      </div>
    </section>
  );
}
