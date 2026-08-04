import type { ReactNode } from "react";
import { FiArrowRight } from "react-icons/fi";
import { FadeIn, Reveal, SkeletonLine } from "../../shared/components/ui";
import styles from "./resources.module.css";

interface ResourceCardProps {
  name: string;
  /** Supporting line (specialisation / description). */
  spec: ReactNode;
  tags: string[];
  /** Location / availability line in the footer. */
  loc: string;
  ctaLabel: string;
  onCta: () => void;
  /** Stagger delay in ms across a grid. */
  delay?: number;
  /** Serif-name size override (Legal lawyers use 19; default is the token 21). */
  nameSize?: number;
  /**
   * Entrance animation: scroll-reveal (default) or an on-mount fade — the latter
   * for grids that swap in from a loading skeleton.
   */
  animation?: "reveal" | "fade";
}

/**
 * Directory card for a community-vetted contact (therapists, lawyers). A soft
 * card on cream/paper with a serif name, a supporting line, tag chips and a
 * footer row pairing a location with a keyboard-accessible request CTA.
 * Extracted from the near-identical WellbeingSections and LegalPage cards.
 */
export function ResourceCard({
  name,
  spec,
  tags,
  loc,
  ctaLabel,
  onCta,
  delay = 0,
  nameSize,
  animation = "reveal",
}: ResourceCardProps) {
  const Wrapper = animation === "fade" ? FadeIn : Reveal;
  return (
    <Wrapper className={styles.card} delay={delay}>
      <div
        className={styles.cardName}
        style={nameSize ? { fontSize: nameSize } : undefined}
      >
        {name}
      </div>
      <div className={styles.cardSpec}>{spec}</div>
      <div className={styles.tags}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className={styles.cardFoot}>
        <span className={styles.cardLoc}>{loc}</span>
        <span
          role="button"
          tabIndex={0}
          className={styles.cardCta}
          onClick={onCta}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onCta();
            }
          }}
        >
          {ctaLabel}
          {" "}
          <FiArrowRight aria-hidden />
        </span>
      </div>
    </Wrapper>
  );
}

interface CardGridProps {
  children: ReactNode;
  /** Sets `aria-busy` while skeleton placeholders are shown. */
  busy?: boolean;
  /** Extra class on the grid (e.g. a narrower column template). */
  className?: string;
}

/** Responsive auto-fill grid wrapper for {@link ResourceCard}s. */
export function CardGrid({ children, busy, className }: CardGridProps) {
  const cls = [styles.grid, className].filter(Boolean).join(" ");
  return (
    <div className={cls} aria-busy={busy || undefined}>
      {children}
    </div>
  );
}

/** Loading placeholder mirroring {@link ResourceCard}: name, two spec lines, tags, footer row. */
export function ResourceCardSkeleton() {
  return (
    <div className={styles.card}>
      <SkeletonLine width="55%" height={19} />
      <SkeletonLine width="100%" height={13} style={{ marginTop: 8 }} />
      <SkeletonLine width="85%" height={13} style={{ marginTop: 6 }} />
      <div className={styles.tags}>
        <SkeletonLine width={70} height={20} />
        <SkeletonLine width={54} height={20} />
      </div>
      <div className={styles.cardFoot}>
        <SkeletonLine width="30%" height={13} />
        <SkeletonLine width="40%" height={13} />
      </div>
    </div>
  );
}
