import { useId, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { JsonLd } from "../../../shared/seo";
import {
  STUDIO_LANDING_FAQ,
  type StudioLandingFaqItem,
} from "./studioLanding.data";
import styles from "./StudioLandingFaq.module.css";

/** One question. Its answer folds open in the shared Collapse; the button is
 *  the disclosure and the heading around it keeps the question in the outline. */
function StudioLandingFaqEntry({
  item,
  isOpen,
  onToggle,
}: {
  item: StudioLandingFaqItem;
  isOpen: boolean;
  onToggle: (itemId: string) => void;
}) {
  const { t } = useTranslation();
  const baseId = useId();
  const buttonId = `${baseId}-question`;
  const panelId = `${baseId}-answer`;

  return (
    <div className={styles.entry} data-open={isOpen}>
      <h3 className={styles.question}>
        <button
          type="button"
          id={buttonId}
          className={styles.trigger}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => onToggle(item.itemId)}
        >
          <span className={styles.questionText}>{t(item.questionKey)}</span>
          <FiPlus className={styles.plus} aria-hidden="true" />
        </button>
      </h3>
      <Collapse isOpen={isOpen}>
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className={styles.answer}
        >
          <p>{t(item.answerKey)}</p>
        </div>
      </Collapse>
    </div>
  );
}

/**
 * The schema.org FAQPage for every question and answer, in the current
 * language. Closed answers are unmounted by the Collapse, so this is where
 * search engines read them.
 */
function buildStudioLandingFaqSchema(
  translate: (key: string) => string,
  language: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: language,
    mainEntity: STUDIO_LANDING_FAQ.map((item) => ({
      "@type": "Question",
      name: translate(item.questionKey),
      acceptedAnswer: { "@type": "Answer", text: translate(item.answerKey) },
    })),
  };
}

/**
 * Questions people ask before asking for Studio. Ten items in two columns from
 * 900px (the first five beside the last five, so opening one answer moves only
 * its own column). The items are independent: opening one leaves the rest as
 * they were. Every answer also goes into the FAQPage JSON-LD, open or closed.
 */
export function StudioLandingFaq() {
  const { t, language } = useTranslation();
  const headingId = useId();
  const [openItemIds, setOpenItemIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const toggleItem = (itemId: string) => {
    setOpenItemIds((previous) => {
      const next = new Set(previous);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const splitIndex = Math.ceil(STUDIO_LANDING_FAQ.length / 2);
  const columns = [
    STUDIO_LANDING_FAQ.slice(0, splitIndex),
    STUDIO_LANDING_FAQ.slice(splitIndex),
  ];

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <JsonLd schema={buildStudioLandingFaqSchema(t, language)} />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{t("studio:landing.faq.eyebrow")}</p>
        <h2 id={headingId} className={styles.title}>
          <Translation
            i18nKey="studio:landing.faq.title"
            components={{ em: <em /> }}
          />
        </h2>
        <div className={styles.columns}>
          {columns.map((columnItems) => (
            <div key={columnItems[0]?.itemId} className={styles.column}>
              {columnItems.map((item) => (
                <StudioLandingFaqEntry
                  key={item.itemId}
                  item={item}
                  isOpen={openItemIds.has(item.itemId)}
                  onToggle={toggleItem}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
