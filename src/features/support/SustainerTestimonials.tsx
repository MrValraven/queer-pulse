import { TESTIMONIALS, type Testimonial } from "./sustainer.data";
import styles from "./sustainer.module.css";

const AV_CLASS: Record<Testimonial["tint"], string> = {
  jade: styles.twAvJade!,
  accent: styles.twAvAccent!,
  plum: styles.twAvPlum!,
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Full-bleed band of member testimonials — "Why members chip in". */
export function SustainerTestimonials() {
  return (
    <section className={styles.testiBand}>
      <div className="wrap">
        <h2 className={styles.secHead}>
          Why members <em>chip in</em>
        </h2>
        <p className={styles.secSub}>In their own words.</p>
        <div className={styles.testiGrid}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className={styles.testiCard}>
              <div className={styles.testiQuote}>&ldquo;{t.quote}&rdquo;</div>
              <div className={styles.testiWho}>
                <div className={`${styles.twAv} ${AV_CLASS[t.tint]}`}>
                  {initials(t.name)}
                </div>
                <div>
                  <div className={styles.twName}>{t.name}</div>
                  <div className={styles.twRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
