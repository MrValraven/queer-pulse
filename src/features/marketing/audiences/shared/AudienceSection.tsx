import type { ReactNode } from "react";
import styles from "./AudienceSection.module.css";

export type AudienceSectionTone = "paper" | "cream" | "plum" | "wash";

/**
 * One band of an audience page: an optional eyebrow, the `<h2>` that labels
 * the section, an optional lede, then the section's own content. The heading
 * takes focus programmatically (`tabIndex={-1}`), so the hero's "See how it
 * works" link can land a keyboard user on it. Bands meet in hard cuts.
 */
export function AudienceSection({
  sectionId,
  eyebrow,
  title,
  lede,
  tone = "cream",
  isCentered = false,
  className,
  children,
}: {
  sectionId: string;
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  tone?: AudienceSectionTone;
  isCentered?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const headingId = `${sectionId}-heading`;
  return (
    <section
      id={sectionId}
      aria-labelledby={headingId}
      data-tone={tone}
      className={[styles.section, className].filter(Boolean).join(" ")}
    >
      <div className={styles.inner}>
        <header
          className={[styles.head, isCentered && styles.centered]
            .filter(Boolean)
            .join(" ")}
        >
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h2 id={headingId} tabIndex={-1} className={styles.title}>
            {title}
          </h2>
          {lede && <p className={styles.lede}>{lede}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}
