import { useId } from "react";
import { LogoConceptCard } from "./LogoConceptCard";
import type { LogoConcept } from "./logoConcepts.data";
import styles from "./LogoConcepts.module.css";

/**
 * One family of logo variants under its own heading and sub, then a grid of
 * concept cards. The card titles sit one level below the section heading, so
 * the heading order stays right wherever the section is placed on the page.
 */
export function LogoVariantsSection({
  title,
  sub,
  concepts,
}: {
  title: string;
  sub: string;
  concepts: readonly LogoConcept[];
}) {
  const headingId = useId();

  return (
    <section className={styles.variants} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.variantsTitle}>
        {title}
      </h2>
      <p className={styles.variantsSub}>{sub}</p>
      <div className={styles.grid}>
        {concepts.map((concept) => (
          <LogoConceptCard
            key={concept.id}
            concept={concept}
            headingLevel={3}
          />
        ))}
      </div>
    </section>
  );
}
