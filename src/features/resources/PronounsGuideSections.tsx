import { useState, type ReactElement, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  NAME_TABLE,
  WHERE_CARDS,
  PRONOUN_FAQS,
  type WhereIcon,
} from "./pronounsGuide.data";
import styles from "./PronounsGuidePage.module.css";

const whereIcons: Record<WhereIcon, ReactNode> = {
  profile: (
    <svg viewBox="0 0 18 18">
      <circle cx="9" cy="6" r="3" />
      <path d="M2 16c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </svg>
  ),
  messages: (
    <svg viewBox="0 0 18 18">
      <path d="M3 3h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6l-4 3V4a1 1 0 0 1 1-1z" />
    </svg>
  ),
  forum: (
    <svg viewBox="0 0 18 18">
      <rect x="2" y="3" width="14" height="12" rx="2" />
      <path d="M2 7h14" />
    </svg>
  ),
  magazine: (
    <svg viewBox="0 0 18 18">
      <path d="M3 3h12v12H3z" />
      <path d="M7 3v12M3 7h12" />
    </svg>
  ),
};

export function NameTable() {
  const { t } = useTranslation();
  return (
    <div className={styles.table}>
      <div className={styles.tHead}>
        <div className={styles.tHeadCell}>
          {t("resources:pronounsGuide.table.head.field")}
        </div>
        <div className={styles.tHeadCell}>
          {t("resources:pronounsGuide.table.head.use")}
        </div>
        <div className={styles.tHeadCell}>
          {t("resources:pronounsGuide.table.head.who")}
        </div>
      </div>
      {NAME_TABLE.map((r) => (
        <div key={r.fieldKey} className={styles.tRow}>
          <div className={`${styles.tCell} ${styles.tCellLabel}`}>
            {t(r.fieldKey)}
          </div>
          <div className={styles.tCell}>{t(r.useKey)}</div>
          <div
            className={`${styles.tCell} ${r.whoVariant === "jade" ? styles.tCellJade : styles.tCellAccent}`}
          >
            {t(r.whoKey)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function WhereGrid() {
  const { t } = useTranslation();
  return (
    <div className={styles.whereGrid}>
      {WHERE_CARDS.map((c) => (
        <div key={c.titleKey} className={styles.whereCard}>
          <div className={`${styles.whereIcon} ${c.jade ? styles.jade : ""}`}>
            {whereIcons[c.icon]}
          </div>
          <div className={styles.whereTitle}>{t(c.titleKey)}</div>
          <div className={styles.whereText}>{t(c.textKey)}</div>
          <div
            className={`${styles.whereTiming} ${c.delay ? styles.delay : ""}`}
          >
            {t(c.timingKey)}
          </div>
        </div>
      ))}
    </div>
  );
}

/** FAQ #2 (deadname) and #6 (legal name data) carry an `<a>` run needing a real link. */
const FAQ_LINK: Record<number, ReactElement> = {
  // eslint-disable-next-line jsx-a11y/anchor-has-content -- element template; <Translation> clones it with the link text at render time.
  1: <a href="mailto:help@queerpulse.pt" />,
  5: <Link to={routes.dataExport} />,
};

export function FaqList() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      {PRONOUN_FAQS.map((faq, faqIndex) => {
        const isOpen = open === faqIndex;
        return (
          <div
            key={faq.qKey}
            className={`${styles.faqItem} ${isOpen ? styles.open : ""}`}
          >
            <button
              type="button"
              className={styles.faqQ}
              aria-expanded={isOpen}
              aria-controls={`pronoun-faq-${faqIndex}`}
              onClick={() => setOpen(isOpen ? null : faqIndex)}
            >
              <span className={styles.faqQText}>{t(faq.qKey)}</span>
              <span className={styles.faqArrow} aria-hidden>
                <FiChevronDown />
              </span>
            </button>
            <div
              id={`pronoun-faq-${faqIndex}`}
              className={styles.faqPanel}
              role="region"
              inert={!isOpen}
            >
              <div className={styles.faqPanelInner}>
                <div className={styles.faqA}>
                  {FAQ_LINK[faqIndex] ? (
                    <Translation
                      i18nKey={faq.aKey}
                      components={{ a: FAQ_LINK[faqIndex] }}
                    />
                  ) : (
                    t(faq.aKey)
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
