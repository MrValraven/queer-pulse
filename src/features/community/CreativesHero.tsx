import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { BADGE_LABEL_KEYS, FEATURED } from "./creatives.data";
import { badgeClass } from "./creativesBadge";
import styles from "./CreativesPage.module.css";

export function CreativesHero({
  featuredIdx,
  setFeaturedIdx,
  demoMode,
}: {
  featuredIdx: number;
  setFeaturedIdx: (i: number) => void;
  demoMode: boolean;
}) {
  const { t } = useTranslation();

  // Live mode has no backend of featured creatives yet — the cycling artist
  // spotlight is demo-only fiction. Keep the hero framing (eyebrow + heading)
  // but drop the fabricated name, quote, discipline and badges.
  if (!demoMode) {
    return (
      <header className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroContent} wrap`}>
          <div className={styles.eyebrow}>
            {t("community:creatives.hero.eyebrow")}
          </div>
          <h1 className={styles.heroName}>
            <Translation
              i18nKey="community:creatives.hero.liveTitle"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.heroQuote}>
            {t("community:creatives.hero.liveSub")}
          </p>
        </div>
      </header>
    );
  }

  const f = FEATURED[featuredIdx]!;
  return (
    <header className={styles.hero}>
      <div className={styles.heroBg} />
      <div className={styles.heroOverlay} />
      <div className={`${styles.heroContent} wrap`}>
        <div className={styles.eyebrow}>
          {t("community:creatives.hero.eyebrow")}
        </div>
        <h1 className={styles.heroName}>
          {f.nameMain}
          <em>{f.nameEm}</em>
        </h1>
        <div className={styles.heroDiscipline}>{f.discipline}</div>
        <p className={styles.heroQuote}>“{f.quote}”</p>
        <div className={styles.heroBadges}>
          {f.badges.map((b) => (
            <span key={b} className={`${styles.badge} ${badgeClass(b)}`}>
              {BADGE_LABEL_KEYS[b] ? t(BADGE_LABEL_KEYS[b]!) : b}
            </span>
          ))}
        </div>
        <div className={styles.heroNav}>
          {FEATURED.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={t("community:creatives.hero.dotAriaLabel", {
                index: i + 1,
              })}
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
