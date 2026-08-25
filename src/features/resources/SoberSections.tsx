import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STATS, VENUES, VOICES, RECOVERY_OPTS } from "./soberPage.data";
import styles from "./SoberPage.module.css";

interface SoberHonestSectionProps {
  children?: never;
}

export function SoberHonestSection(_props: SoberHonestSectionProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.honest}>
      <div className="wrap">
        <div className={styles.honestInner}>
          <div>
            <h2>
              <Translation
                i18nKey="resources:sober.honest.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p>{t("resources:sober.honest.p1")}</p>
            <p>{t("resources:sober.honest.p2")}</p>
            <p>{t("resources:sober.honest.p3")}</p>
          </div>
          <div className={styles.stats}>
            {STATS.map((s) => (
              <div className={styles.stat} key={s.numberKey}>
                <div className={styles.n}>{t(s.numberKey)}</div>
                <div className={styles.l}>{t(s.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SoberVenuesSectionProps {
  safeSpacesPath: string;
}

export function SoberVenuesSection({
  safeSpacesPath,
}: SoberVenuesSectionProps) {
  const { t } = useTranslation();
  return (
    <div className={`${styles.sec} ${styles.secCream}`}>
      <div className="wrap">
        <h2 className={styles.h}>
          <Translation
            i18nKey="resources:sober.venues.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.sub}>{t("resources:sober.venues.lead")}</p>
        <div className={styles.venueGrid}>
          {VENUES.map((v) => (
            <div className={styles.venueCard} key={v.name}>
              <div className={styles.vcHood}>{v.neighbourhood}</div>
              <div className={styles.vcName}>{v.name}</div>
              <div className={styles.vcDesc}>{v.description}</div>
              <div className={styles.vcTags}>
                {v.tags.map((t) => (
                  <span key={t} className={styles.vcTag}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.seeAll}>
          <Link to={safeSpacesPath} className={styles.seeAllLink}>
            {t("resources:sober.venues.seeAllCta")} <FiArrowRight aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SoberVoicesSection() {
  const { t } = useTranslation();
  return (
    <div className={styles.sec}>
      <div className="wrap">
        <h2 className={styles.h}>
          <Translation
            i18nKey="resources:sober.voices.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.sub}>{t("resources:sober.voices.lead")}</p>
        <div className={styles.voicesGrid}>
          {VOICES.map((v) => (
            <div className={styles.voiceCard} key={v.name}>
              <div className={styles.voiceQuote}>{v.quote}</div>
              <div className={styles.voiceWho}>
                <div
                  className={styles.voiceAv}
                  style={{
                    background: v.avatarBackground,
                    color: v.avatarColor,
                  }}
                >
                  {v.avatar}
                </div>
                <div>
                  <div className={styles.voiceName}>{v.name}</div>
                  <div className={styles.voiceRole}>{v.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SoberRecoverySectionProps {
  linkMap: Record<string, string>;
}

export function SoberRecoverySection({ linkMap }: SoberRecoverySectionProps) {
  const { t } = useTranslation();
  return (
    <div className={`${styles.sec} ${styles.secCream}`}>
      <div className="wrap">
        <div className={styles.recoveryBox}>
          <h3>
            <Translation
              i18nKey="resources:sober.recovery.title"
              components={{ em: <em /> }}
            />
          </h3>
          <p>{t("resources:sober.recovery.body")}</p>
          <div className={styles.recoveryOpts}>
            {RECOVERY_OPTS.map((o) => (
              <div className={styles.recOpt} key={o.titleKey}>
                <div className={styles.recTitle}>{t(o.titleKey)}</div>
                <div className={styles.recDesc}>{t(o.descriptionKey)}</div>
                <Link to={linkMap[o.linkKey]!} className={styles.recLink}>
                  {t(o.linkLabelKey)} <FiArrowRight aria-hidden />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
