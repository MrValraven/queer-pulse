import { useState, type ReactNode } from "react";
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
  return (
    <div className={styles.table}>
      <div className={styles.tHead}>
        <div className={styles.tHeadCell}>Field</div>
        <div className={styles.tHeadCell}>What it's used for</div>
        <div className={styles.tHeadCell}>Who sees it</div>
      </div>
      {NAME_TABLE.map((r) => (
        <div key={r.field} className={styles.tRow}>
          <div className={`${styles.tCell} ${styles.tCellLabel}`}>
            {r.field}
          </div>
          <div className={styles.tCell}>{r.use}</div>
          <div
            className={`${styles.tCell} ${r.whoVariant === "jade" ? styles.tCellJade : styles.tCellAccent}`}
          >
            {r.who}
          </div>
        </div>
      ))}
    </div>
  );
}

export function WhereGrid() {
  return (
    <div className={styles.whereGrid}>
      {WHERE_CARDS.map((c) => (
        <div key={c.title} className={styles.whereCard}>
          <div className={`${styles.whereIcon} ${c.jade ? styles.jade : ""}`}>
            {whereIcons[c.icon]}
          </div>
          <div className={styles.whereTitle}>{c.title}</div>
          <div className={styles.whereText}>{c.text}</div>
          <div
            className={`${styles.whereTiming} ${c.delay ? styles.delay : ""}`}
          >
            {c.timing}
          </div>
        </div>
      ))}
    </div>
  );
}

export function FaqList() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      {PRONOUN_FAQS.map((f, i) => (
        <div
          key={f.q}
          className={`${styles.faqItem} ${open === i ? styles.open : ""}`}
        >
          <button
            className={styles.faqQ}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className={styles.faqQText}>{f.q}</span>
            <span className={styles.faqArrow}>▼</span>
          </button>
          {open === i && <div className={styles.faqA}>{f.a}</div>}
        </div>
      ))}
    </div>
  );
}
