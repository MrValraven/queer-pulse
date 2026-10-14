import { useId, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { HelpFaqEntry } from "./studioHelp.data";
import s from "./StudioHelpPage.module.css";

/**
 * Single-open FAQ accordion (APG): each question is a button inside a
 * heading, its answer a region labelled by it. An answer opens and closes
 * through Collapse, and an entry the search filters out folds away the same
 * way.
 */
export function StudioHelpFaq({
  items,
  visibleIds,
}: {
  items: HelpFaqEntry[];
  visibleIds: ReadonlySet<string>;
}) {
  const { t } = useTranslation();
  const idPrefix = useId();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={s.faq}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        const questionId = `${idPrefix}-q-${item.id}`;
        const answerId = `${idPrefix}-a-${item.id}`;
        return (
          <Collapse key={item.id} isOpen={visibleIds.has(item.id)}>
            <div className={s.faqItem}>
              <h3 className={s.faqHeading}>
                <button
                  type="button"
                  className={s.faqQ}
                  id={questionId}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                >
                  <span>{t(item.questionKey)}</span>
                  <span
                    className={[s.faqIcon, isOpen && s.faqIconOpen]
                      .filter(Boolean)
                      .join(" ")}
                    aria-hidden
                  >
                    <FiPlus />
                  </span>
                </button>
              </h3>
              <div id={answerId} role="region" aria-labelledby={questionId}>
                <Collapse isOpen={isOpen}>
                  <div className={s.faqAInner}>
                    <Translation
                      i18nKey={item.answerKey}
                      components={item.answerComponents}
                    />
                  </div>
                </Collapse>
              </div>
            </div>
          </Collapse>
        );
      })}
    </div>
  );
}
