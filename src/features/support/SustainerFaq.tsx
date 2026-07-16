import { useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FAQS } from "./sustainer.data";
import styles from "./sustainer.module.css";

/** Accordion FAQ (own local state) — one item open at a time. */
export function SustainerFaq() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className={styles.faqSection}>
      <div className="wrap">
        <h2 className={styles.secHead}>
          <Translation
            i18nKey="support:faq.heading"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.secSub}>{t("support:faq.sub")}</p>
        <div className={styles.faqGrid}>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.qKey}
                className={`${styles.faqItem} ${isOpen ? styles.open : ""}`}
              >
                <button
                  type="button"
                  className={styles.faqQ}
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  {t(f.qKey)}
                  <span className={styles.faqChevron}>
                    <FiChevronRight aria-hidden />
                  </span>
                </button>
                <div className={styles.faqA}>{t(f.aKey)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
