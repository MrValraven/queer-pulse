import { useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import { FAQS } from "./sustainer.data";
import styles from "./sustainer.module.css";

/** Accordion FAQ (own local state) — one item open at a time. */
export function SustainerFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className={styles.faqSection}>
      <div className="wrap">
        <h2 className={styles.secHead}>
          Questions, <em>answered</em>
        </h2>
        <p className={styles.secSub}>
          Everything you might reasonably want to know before chipping in.
        </p>
        <div className={styles.faqGrid}>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className={`${styles.faqItem} ${isOpen ? styles.open : ""}`}
              >
                <button
                  type="button"
                  className={styles.faqQ}
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  {f.q}
                  <span className={styles.faqChevron}>
                    <FiChevronRight aria-hidden />
                  </span>
                </button>
                <div className={styles.faqA}>{f.a}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
