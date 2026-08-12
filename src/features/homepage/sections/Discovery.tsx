import { Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { rows, spotlightViews } from "./Discovery.data";
import { FeaturedSpotlightCard } from "./FeaturedSpotlightCard";
import { MemberRow } from "./MemberRow";
import { ExploreMembersCta } from "./ExploreMembersCta";
import styles from "./Discovery.module.css";

export function Discovery() {
  const { t } = useTranslation();

  return (
    <section className={styles.discovery} id="discovery">
      <div className="wrap">
        <Reveal className={styles.eyebrow}>
          <span className={styles.dot} aria-hidden />
          {t("homepage:discovery.eyebrow", { count: 520 })}
        </Reveal>
        <Reveal as="h2" className={styles.display} delay={60}>
          <Translation
            i18nKey="homepage:discovery.title"
            components={{ em: <em /> }}
          />
        </Reveal>
        <Reveal as="p" className={styles.sub} delay={120}>
          {t("homepage:discovery.sub")}
        </Reveal>

        <div className={styles.eGrid}>
          {spotlightViews.length > 0 && (
            <Reveal delay={160} className={styles.featCol}>
              <FeaturedSpotlightCard items={spotlightViews} />
            </Reveal>
          )}
          <div className={styles.stack}>
            {rows.map((member, index) => (
              <Reveal key={member.key} delay={200 + index * 70}>
                <MemberRow member={member} />
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className={styles.frameFoot} delay={280}>
          <ExploreMembersCta />
          <span className={styles.footNote}>
            {t("homepage:discovery.footNote")}
          </span>
        </Reveal>
      </div>
    </section>
  );
}
