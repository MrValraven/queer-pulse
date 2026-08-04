import type { CSSProperties, ReactNode } from "react";
import { HubBackLink, Reveal } from "../../shared/components/ui";
import styles from "./resources.module.css";

interface ResourceHeroProps {
  /**
   * Surface tone. `"plum"` (default) is the dark hero used by the original
   * consumers (Wellbeing, Trans Hub, Legal, Spoon theory, group-show archive);
   * `"light"` is dark-text-on-cream — never cream-on-cream.
   */
  tone?: "plum" | "light";
  eyebrow: string;
  /**
   * `"dot"` (default) is the coloured-dot + muted-label eyebrow of the original
   * plum hero. `"label"` is a plain bold coloured label (no dot), the style the
   * cream/plum resource pages hand-rolled.
   */
  eyebrowVariant?: "dot" | "label";
  /** Dot colour for the `"dot"` variant. */
  eyebrowDotColor?: string;
  /** Label colour for the `"label"` variant (defaults to coral). */
  eyebrowColor?: string;
  title: ReactNode;
  /** Serif title weight. Defaults to `"regular"` (400) to match existing pages. */
  titleWeight?: "light" | "regular";
  /** Colour of the `<em>` accent inside the title (defaults to coral). */
  titleEmColor?: string;
  /** `"display"` is the oversized glossary-style headline. */
  titleScale?: "default" | "display";
  lead: ReactNode;
  anchors?: { label: string; href: string }[];
  backLink?: { to: string; label: string; tone?: "light" | "dark" };
  /** Bespoke content rendered under the lead (chips, callouts, disclaimers, tabs). */
  extras?: ReactNode;
  /** Removes the bottom padding — use when `extras` sit flush at the hero edge (in-hero tabs). */
  flushBottom?: boolean;
}

/**
 * Shared resource-page hero. Plum (dark) or light (cream) tone, with an
 * optional bespoke `extras` slot rendered under the lead. Used by every
 * /resources landing page so the hero markup + styling live in one place.
 */
export function ResourceHero({
  tone = "plum",
  eyebrow,
  eyebrowVariant = "dot",
  eyebrowDotColor,
  eyebrowColor,
  title,
  titleWeight = "regular",
  titleEmColor,
  titleScale = "default",
  lead,
  anchors,
  backLink,
  extras,
  flushBottom,
}: ResourceHeroProps) {
  const heroClass = [
    styles.hero,
    tone === "light" && styles.heroLight,
    flushBottom && styles.heroFlush,
  ]
    .filter(Boolean)
    .join(" ");

  const titleClass = [
    styles.title,
    titleWeight === "light" && styles.titleLight,
    titleScale === "display" && styles.titleDisplay,
  ]
    .filter(Boolean)
    .join(" ");

  const titleStyle = titleEmColor
    ? ({ "--hero-em": titleEmColor } as CSSProperties)
    : undefined;

  return (
    <header className={heroClass}>
      <div className="wrap">
        {backLink && (
          <HubBackLink
            to={backLink.to}
            label={backLink.label}
            tone={backLink.tone}
          />
        )}
        {eyebrowVariant === "label" ? (
          <Reveal
            className={styles.eyebrowLabel}
            style={eyebrowColor ? { color: eyebrowColor } : undefined}
          >
            {eyebrow}
          </Reveal>
        ) : (
          <Reveal className={styles.eyebrow}>
            <span
              className={styles.eyebrowDot}
              style={{ background: eyebrowDotColor }}
            />
            {eyebrow}
          </Reveal>
        )}
        <Reveal as="h1" className={titleClass} delay={60} style={titleStyle}>
          {title}
        </Reveal>
        <Reveal as="p" className={styles.lead} delay={120}>
          {lead}
        </Reveal>
        {extras && (
          <Reveal className={styles.heroExtras} delay={160}>
            {extras}
          </Reveal>
        )}
        {anchors && anchors.length > 0 && (
          <Reveal className={styles.heroNav} delay={200}>
            {anchors.map((anchor) => (
              <a
                key={anchor.href}
                href={anchor.href}
                className={styles.heroAnchor}
              >
                {anchor.label}
              </a>
            ))}
          </Reveal>
        )}
      </div>
    </header>
  );
}
