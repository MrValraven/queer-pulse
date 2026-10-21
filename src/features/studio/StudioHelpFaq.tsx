import { Fragment, useId, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { HelpFaqEntry } from "./studioHelp.data";
import { findHelpMatchRanges } from "./studioHelpSearch";
import s from "./StudioHelpPage.module.css";

/** The question with every search hit wrapped in `<mark>`. */
function HighlightedQuestion({
  text,
  terms,
}: {
  text: string;
  terms: readonly string[];
}) {
  const ranges = findHelpMatchRanges(text, terms);
  return (
    <>
      {ranges.map(([start, end], index) => (
        <Fragment key={start}>
          {text.slice(ranges[index - 1]?.[1] ?? 0, start)}
          <mark className={s.match}>{text.slice(start, end)}</mark>
        </Fragment>
      ))}
      {text.slice(ranges[ranges.length - 1]?.[1] ?? 0)}
    </>
  );
}

/**
 * Single-open FAQ accordion (APG): each question is a button inside a
 * heading, its answer a region labelled by it. An answer opens and closes
 * through Collapse, and an entry the search filters out folds away the same
 * way. While a search is on, every matching answer opens and the hits are
 * highlighted, so a match found in an answer is visible at once.
 */
export function StudioHelpFaq({
  items,
  visibleIds,
  searchTerms = [],
}: {
  items: HelpFaqEntry[];
  visibleIds: ReadonlySet<string>;
  /** The folded words being searched; empty when no search is on. */
  searchTerms?: readonly string[];
}) {
  const { t } = useTranslation();
  const idPrefix = useId();
  const [openId, setOpenId] = useState<string | null>(null);
  const isSearching = searchTerms.length > 0;
  // A click while searching collapses (or reopens) one answer. The overrides
  // reset whenever the search words change.
  const termsKey = searchTerms.join(" ");
  const [overrides, setOverrides] = useState<{
    key: string;
    byId: Record<string, boolean>;
  }>({ key: termsKey, byId: {} });
  const overrideById = overrides.key === termsKey ? overrides.byId : {};

  return (
    <div className={s.faq}>
      {items.map((item) => {
        const isOpen =
          overrideById[item.id] ?? (isSearching || openId === item.id);
        const questionId = `${idPrefix}-q-${item.id}`;
        const answerId = `${idPrefix}-a-${item.id}`;
        return (
          <Collapse key={item.id} isOpen={visibleIds.has(item.id)}>
            <div className={s.faqItem}>
              <h3 className={s.faqHeading}>
                <Button
                  variant="quiet"
                  className={s.faqQ}
                  id={questionId}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => {
                    if (isSearching)
                      setOverrides({
                        key: termsKey,
                        byId: { ...overrideById, [item.id]: !isOpen },
                      });
                    else setOpenId(isOpen ? null : item.id);
                  }}
                >
                  <span>
                    <HighlightedQuestion
                      text={t(item.questionKey)}
                      terms={searchTerms}
                    />
                  </span>
                  <span
                    className={[s.faqIcon, isOpen && s.faqIconOpen]
                      .filter(Boolean)
                      .join(" ")}
                    aria-hidden
                  >
                    <FiPlus />
                  </span>
                </Button>
              </h3>
              <div id={answerId} role="region" aria-labelledby={questionId}>
                <Collapse isOpen={isOpen}>
                  <div className={s.faqAInner} data-help-highlight>
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
