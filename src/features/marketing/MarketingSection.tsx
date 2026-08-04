import { type ReactNode } from "react";
import { Reveal } from "../../shared/components/ui";
import styles from "./MarketingSection.module.css";

/** Background treatment for a marketing section. Never white. */
export type MarketingSectionTone = "cream" | "plum";

interface MarketingSectionProps {
  /** Scroll-anchor id, used by on-page section navs. */
  id?: string;
  /** Small uppercase kicker above the title. */
  eyebrow?: ReactNode;
  /**
   * Serif heading. Pass a `<Translation … components={{ em: <em /> }} />` (or a
   * fragment with an `<em>`) for the coral accent.
   */
  title?: ReactNode;
  /** Optional lead paragraph beneath the title. */
  lead?: ReactNode;
  /** Section background. Cream (default) or plum. */
  tone?: MarketingSectionTone;
  /**
   * Doc-flow layout: no full-bleed `.wrap`, no vertical padding — only section
   * spacing plus a scroll anchor. For sections that live inside a two-column
   * page with a sticky side-nav.
   */
  flow?: boolean;
  /** Collapse the top padding so the section butts against the previous one. */
  flush?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Shared marketing/content section scaffold: a cream (or plum) `<section>` with
 * a `SectionHead`-style stacked header — eyebrow, serif title with a coral
 * `<em>` accent, and a lead paragraph — followed by a content slot. Each header
 * element keeps the staggered scroll-entrance `Reveal` used across the
 * marketing pages so the visual effect is unchanged.
 */
export function MarketingSection({
  id,
  eyebrow,
  title,
  lead,
  tone = "cream",
  flow = false,
  flush = false,
  className,
  children,
}: MarketingSectionProps) {
  const isDark = tone === "plum";
  // Match the pages' original stagger: with an eyebrow present the title lands
  // second (60ms) and the lead third (120ms); without one the title leads.
  const titleDelay = eyebrow ? 60 : 0;
  const leadDelay = eyebrow ? 120 : 60;

  const sectionClassName = [
    flow ? styles.flow : styles.section,
    !flow && styles[tone],
    isDark && styles.dark,
    flush && styles.flush,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const header = (
    <>
      {eyebrow && (
        <Reveal as="div" className={styles.eyebrow}>
          {eyebrow}
        </Reveal>
      )}
      {title && (
        <Reveal as="h2" className={styles.title} delay={titleDelay}>
          {title}
        </Reveal>
      )}
      {lead && (
        <Reveal as="p" className={styles.lead} delay={leadDelay}>
          {lead}
        </Reveal>
      )}
    </>
  );

  if (flow) {
    return (
      <section id={id} className={sectionClassName}>
        {header}
        {children}
      </section>
    );
  }

  return (
    <section id={id} className={sectionClassName}>
      <div className="wrap">
        {header}
        {children}
      </div>
    </section>
  );
}
