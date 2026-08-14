import type { ReactNode } from "react";
import styles from "./PageHero.module.css";

interface PageHeroProps {
  /**
   * Optional element rendered above the eyebrow, inside the wrap — typically a
   * `<HubBackLink>` breadcrumb. Brings its own spacing; omit for the common case.
   */
  backLink?: ReactNode;
  /** Small uppercase kicker above the title. */
  eyebrow?: ReactNode;
  /** Display headline. Use an `<em>` for the coral emphasis. */
  title: ReactNode;
  /**
   * Rendered beside the title (e.g. a `<FeatureHelp>` info chip), not inside
   * it — keeps it out of the h1's accessible name and off the title's own
   * wrapping width, so it never drops onto its own line.
   */
  titleAction?: ReactNode;
  /** Supporting line under the title. */
  sub?: ReactNode;
  /**
   * Plum background with cream text and an accent glow (the default for most
   * marketing/content pages). Set `false` for the light hero on cream.
   */
  plum?: boolean;
  /** Extra content rendered under the sub, inside the wrap (filter bars, stats, notes). */
  children?: ReactNode;
  /** Extra class on the `<header>` for one-off overrides. */
  className?: string;
}

/**
 * Standard marketing/content page hero: eyebrow + serif title (with coral
 * `<em>`) + sub, on a plum or light background. Pass any in-hero extras
 * (filters, stats, a status note) as children.
 */
export function PageHero({
  backLink,
  eyebrow,
  title,
  titleAction,
  sub,
  plum = true,
  children,
  className,
}: PageHeroProps) {
  return (
    <header
      className={[styles.hero, plum && styles.plum, className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="wrap">
        {backLink}
        {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
        {titleAction ? (
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{title}</h1>
            {titleAction}
          </div>
        ) : (
          <h1 className={styles.title}>{title}</h1>
        )}
        {sub && <p className={styles.sub}>{sub}</p>}
        {children}
      </div>
    </header>
  );
}
