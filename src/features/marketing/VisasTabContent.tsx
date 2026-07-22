import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import type { Tab } from "./visas.data";
import styles from "./VisasPage.module.css";

export function VisasTabContent({
  tab,
  onPartnerLink,
}: {
  tab: Tab;
  onPartnerLink: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.tabContent}>
      <div className="wrap">
        <div className={styles.tabHead}>
          <h2>
            <Translation
              i18nKey={tab.headTitleKey}
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t(tab.headTextKey)}</p>
        </div>
        <div className={styles.infoGrid}>
          {tab.cards.map((card) => (
            <div className={styles.infoCard} key={card.titleKey}>
              <div className={styles.icEyebrow}>{t(card.eyebrowKey)}</div>
              <div className={styles.icTitle}>{t(card.titleKey)}</div>
              <div className={styles.icBody}>{t(card.bodyKey)}</div>
              {card.tag && (
                <span
                  className={[
                    styles.icTag,
                    card.tag.kind === "jade"
                      ? styles.tagJade
                      : styles.tagAccent,
                  ].join(" ")}
                >
                  {t(card.tag.labelKey)}
                </span>
              )}
              {card.link && (
                <div className={styles.icLink}>
                  {card.link.href === "#" ? (
                    <button
                      type="button"
                      onClick={onPartnerLink}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        font: "inherit",
                        color: "inherit",
                        textDecoration: "underline",
                      }}
                    >
                      {t(card.link.labelKey)}
                    </button>
                  ) : (
                    <Link to={card.link.href}>{t(card.link.labelKey)}</Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {tab.steps && (
          <div className={styles.steps}>
            {tab.steps.map((step, index) => (
              <div className={styles.step} key={step.titleKey}>
                <div className={styles.stepNum}>{index + 1}</div>
                <div className={styles.stepInfo}>
                  <div className={styles.stepTitle}>{t(step.titleKey)}</div>
                  <div className={styles.stepText}>{t(step.textKey)}</div>
                  {step.noteKey && (
                    <div className={styles.stepNote}>{t(step.noteKey)}</div>
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
