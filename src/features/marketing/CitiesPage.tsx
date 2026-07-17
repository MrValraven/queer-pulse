import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad, useCountUp } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  GroundworkSection,
  HowSection,
  WaitlistSection,
} from "./CitiesSections";
import { CitiesLiveGrid } from "./CitiesLiveCards";
import styles from "./CitiesPage.module.css";

export function CitiesPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const loading = useSimulatedLoad();

  // Count-up targets — Lisbon
  const lBonusCount = useCountUp(612, { active: !loading, durationMs: 1200 });
  const lGatherings = useCountUp(284, { active: !loading, durationMs: 1200 });
  const lSafeSpaces = useCountUp(42, { active: !loading, durationMs: 1200 });
  const lMagIssues = useCountUp(9, { active: !loading, durationMs: 1200 });

  // Count-up targets — Porto
  const pMembers = useCountUp(84, { active: !loading, durationMs: 1200 });
  const pGatherings = useCountUp(12, { active: !loading, durationMs: 1200 });
  const pSafeSpaces = useCountUp(7, { active: !loading, durationMs: 1200 });
  const pPartners = useCountUp(2, { active: !loading, durationMs: 1200 });

  const counts = {
    lBonusCount,
    lGatherings,
    lSafeSpaces,
    lMagIssues,
    pMembers,
    pGatherings,
    pSafeSpaces,
    pPartners,
  };

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>
            {t("marketing:cities.hero.eyebrow")}
          </div>
          <h1 className={styles.h1}>
            <Translation
              i18nKey="marketing:cities.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.dek}>
            <Translation
              i18nKey="marketing:cities.hero.dek"
              components={{ b: <b />, em: <em /> }}
            />
          </p>
          <div className={styles.current}>
            <div className={styles.currentIc}>
              <svg viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className={styles.currentText}>
              <b>{t("marketing:cities.hero.browsingAs")}</b>
              <span>Lisbon, Portugal</span>
            </div>
            <button
              type="button"
              className={styles.currentBtn}
              onClick={() =>
                showToast(t("marketing:cities.hero.changeToast"), "info")
              }
            >
              {t("marketing:cities.hero.changeCta")}
            </button>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        <section>
          <div className={styles.secH}>
            <h2>
              <Translation
                i18nKey="marketing:cities.live.heading"
                components={{ em: <em /> }}
              />
            </h2>
            <span className={styles.meta}>
              {t("marketing:cities.live.meta")}
            </span>
          </div>
          <CitiesLiveGrid
            loading={loading}
            counts={counts}
            showToast={showToast}
          />
        </section>

        <GroundworkSection />
        <WaitlistSection />
      </div>

      <HowSection />
    </PageShell>
  );
}
