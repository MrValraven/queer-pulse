import { Link } from "react-router-dom";
import { FiStar } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { Tab } from "./family.data";
import styles from "./FamilyPage.module.css";

export function FamilyTabContent({ tab }: { tab: Tab }) {
  const { t } = useTranslation();
  // The named clinic/social-worker reviews and the member testimonial are
  // fabricated in the prototype — live has no backend for either yet, so gate
  // both behind demo and show an honest coming-soon state in live mode.
  const { demoMode } = useDemoMode();
  return (
    <div className={styles.tabContent}>
      <div className="wrap">
        <div className={styles.tabHead}>
          <h2>
            <Translation
              i18nKey={`community:${tab.headTitleKey}`}
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t(`community:${tab.headTextKey}`)}</p>
        </div>

        <div className={styles.infoGrid}>
          {tab.cards.map((card) => (
            <div className={styles.infoCard} key={card.titleKey}>
              <div className={styles.icEyebrow}>
                {t(`community:${card.eyebrowKey}`)}
              </div>
              <div className={styles.icTitle}>
                {t(`community:${card.titleKey}`)}
              </div>
              <div className={styles.icBody}>
                {t(`community:${card.bodyKey}`)}
              </div>
              {card.noteKey && (
                <div className={styles.icNote}>
                  {t(`community:${card.noteKey}`)}
                </div>
              )}
              {card.link && (
                <div className={styles.icLink}>
                  <Link to={card.link.href}>
                    {t(`community:${card.link.labelKey}`)}
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {tab.note &&
          (demoMode ? (
            <div className={styles.communityNote}>
              <div className={styles.cnBar} />
              <div className={styles.cnBody}>
                {tab.noteLabelKey && (
                  <strong>{t(`community:${tab.noteLabelKey}`)} </strong>
                )}
                {tab.note.quote} — <strong>{tab.note.attribution}</strong>
              </div>
            </div>
          ) : (
            <EmptyState
              compact
              title={t("community:family.note.liveEmpty.title")}
              description={t("community:family.note.liveEmpty.description")}
            />
          ))}

        {tab.reviewHeadKey && (
          <h2 className={styles.reviewHead}>
            <Translation
              i18nKey={`community:${tab.reviewHeadKey}`}
              components={{ em: <em /> }}
            />
          </h2>
        )}
        {tab.reviews &&
          (demoMode ? (
          <div className={styles.reviewGrid}>
            {tab.reviews.map((r) => (
              <div className={styles.reviewCard} key={r.name}>
                <div className={styles.rvTop}>
                  <div
                    className={styles.rvAv}
                    style={{ background: r.bg, color: r.color }}
                  >
                    {r.initials}
                  </div>
                  <div>
                    <div className={styles.rvName}>{r.name}</div>
                    <div className={styles.rvContext}>{r.context}</div>
                  </div>
                </div>
                <div
                  className={styles.rvStars}
                  aria-label={t("community:family.review.starsAriaLabel", {
                    stars: r.stars,
                  })}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <FiStar
                      key={i}
                      fill={i < r.stars ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <div className={styles.rvQuote}>{r.quote}</div>
              </div>
            ))}
          </div>
          ) : (
            <EmptyState
              icon={<FiStar />}
              title={t("community:family.review.liveEmpty.title")}
              description={t("community:family.review.liveEmpty.description")}
            />
          ))}

        {tab.steps && (
          <div className={styles.processSteps}>
            {tab.steps.map((step, i) => (
              <div className={styles.psStep} key={step.titleKey}>
                <div className={styles.psNum}>{i + 1}</div>
                <div className={styles.psInfo}>
                  <div className={styles.psTitle}>
                    {t(`community:${step.titleKey}`)}
                  </div>
                  <div className={styles.psText}>
                    {t(`community:${step.textKey}`)}
                  </div>
                  {step.timeKey && (
                    <div className={styles.psTime}>
                      {t(`community:${step.timeKey}`)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
