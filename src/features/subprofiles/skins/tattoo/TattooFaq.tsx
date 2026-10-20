import { useId, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Collapse } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { TattooBlock } from "./TattooBlock";
import type { TattooBlockProps } from "./tattooView";
import styles from "./TattooOut.module.css";

function FaqEntry({
  question,
  answer,
  isInitiallyOpen,
}: {
  question: string;
  answer: string;
  isInitiallyOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  const answerId = useId();
  return (
    <li className={styles.faqItem}>
      <h3 className={styles.rowTitle}>
        <button
          type="button"
          className={styles.question}
          aria-expanded={isOpen}
          aria-controls={answerId}
          onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        >
          <span>{question}</span>
          <FiChevronDown
            aria-hidden
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          />
        </button>
      </h3>
      <div id={answerId}>
        <Collapse isOpen={isOpen}>
          <p className={styles.answer}>{answer}</p>
        </Collapse>
      </div>
    </li>
  );
}

/** Questions people always ask; the first answer starts open. */
export function TattooFaq({ view }: TattooBlockProps) {
  const { t } = useTranslation();
  return (
    <TattooBlock
      blockKey="faq"
      heading={t("subprofiles:tattoo.block.faq.heading")}
      hasContent={view.hasContent.faq}
      emptyBodyKey="subprofiles:tattoo.block.faq.empty"
      emptyActionKey="subprofiles:tattoo.block.faq.action"
    >
      <ul className={styles.list}>
        {view.faq.map((entry, index) => (
          <FaqEntry
            key={`${index}-${entry.question}`}
            question={entry.question}
            answer={entry.answer}
            isInitiallyOpen={index === 0}
          />
        ))}
      </ul>
    </TattooBlock>
  );
}
