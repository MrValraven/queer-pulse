import { useId, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Collapse } from "../../../../shared/components/ui/Collapse";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { AudienceFaqItem } from "./audiences.data";
import styles from "./AudienceFaq.module.css";

/** One question: a disclosure button in an `<h3>`, its answer folding open
 *  through the shared `Collapse`. */
function FaqRow({ item }: { item: AudienceFaqItem }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const rowId = useId();
  const buttonId = `${rowId}-question`;
  const panelId = `${rowId}-answer`;
  return (
    <li className={styles.row} data-open={isOpen ? "true" : undefined}>
      <h3 className={styles.question}>
        <button
          type="button"
          id={buttonId}
          className={styles.toggle}
          aria-expanded={isOpen}
          aria-controls={isOpen ? panelId : undefined}
          onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        >
          <span>{t(item.questionKey)}</span>
          <FiChevronDown aria-hidden className={styles.chevron} />
        </button>
      </h3>
      <Collapse isOpen={isOpen}>
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className={styles.answer}
        >
          <Translation
            i18nKey={item.answerKey}
            components={{ b: <b />, em: <em /> }}
          />
        </div>
      </Collapse>
    </li>
  );
}

/** The "Questions" accordion. Every row opens on its own. */
export function AudienceFaq({ items }: { items: readonly AudienceFaqItem[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <FaqRow key={item.faqId} item={item} />
      ))}
    </ul>
  );
}
