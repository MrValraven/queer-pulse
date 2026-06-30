import { Link } from "react-router-dom";
import type { Tab } from "./visas.data";
import styles from "./VisasPage.module.css";

export function VisasTabContent({
  tab,
  onPartnerLink,
}: {
  tab: Tab;
  onPartnerLink: () => void;
}) {
  return (
    <div className={styles.tabContent}>
      <div className="wrap">
        <div className={styles.tabHead}>
          <h2>{tab.headTitle}</h2>
          <p>{tab.headText}</p>
        </div>
        <div className={styles.infoGrid}>
          {tab.cards.map((card) => (
            <div className={styles.infoCard} key={card.title}>
              <div className={styles.icEyebrow}>{card.eyebrow}</div>
              <div className={styles.icTitle}>{card.title}</div>
              <div className={styles.icBody}>{card.body}</div>
              {card.tag && (
                <span
                  className={[
                    styles.icTag,
                    card.tag.kind === "jade"
                      ? styles.tagJade
                      : styles.tagAccent,
                  ].join(" ")}
                >
                  {card.tag.label}
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
                      {card.link.label}
                    </button>
                  ) : (
                    <Link to={card.link.href}>{card.link.label}</Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {tab.steps && (
          <div className={styles.steps}>
            {tab.steps.map((step, i) => (
              <div className={styles.step} key={step.title}>
                <div className={styles.stepNum}>{i + 1}</div>
                <div className={styles.stepInfo}>
                  <div className={styles.stepTitle}>{step.title}</div>
                  <div className={styles.stepText}>{step.text}</div>
                  {step.note && (
                    <div className={styles.stepNote}>{step.note}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab.note && (
          <div className={styles.communityNote}>
            <div className={styles.cnBar} />
            <div className={styles.cnBody}>{tab.note}</div>
          </div>
        )}
      </div>
    </div>
  );
}
