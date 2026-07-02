import { FEATURED } from "./creatives.data";
import { badgeClass } from "./creativesBadge";
import styles from "./CreativesPage.module.css";

export function CreativesHero({
  featuredIdx,
  setFeaturedIdx,
}: {
  featuredIdx: number;
  setFeaturedIdx: (i: number) => void;
}) {
  const f = FEATURED[featuredIdx]!;
  return (
    <header className={styles.hero}>
      <div className={styles.heroBg} />
      <div className={styles.heroOverlay} />
      <div className={`${styles.heroContent} wrap`}>
        <div className={styles.eyebrow}>Featured this week</div>
        <h1 className={styles.heroName}>
          {f.nameMain}
          <em>{f.nameEm}</em>
        </h1>
        <div className={styles.heroDiscipline}>{f.discipline}</div>
        <p className={styles.heroQuote}>“{f.quote}”</p>
        <div className={styles.heroBadges}>
          {f.badges.map((b) => (
            <span key={b} className={`${styles.badge} ${badgeClass(b)}`}>
              {b}
            </span>
          ))}
        </div>
        <div className={styles.heroNav}>
          {FEATURED.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Featured ${i + 1}`}
              className={[
                styles.heroDot,
                i === featuredIdx && styles.heroDotActive,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setFeaturedIdx(i)}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
