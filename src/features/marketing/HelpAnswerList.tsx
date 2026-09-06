import { type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiChevronRight } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { findMatchRanges } from "./helpSearch";
import type { HelpQuestion } from "./help.data";
import s from "./HelpPage.module.css";

export interface HelpAnswerEntry {
  question: HelpQuestion;
  /** Resolved category name, shown as a chip when the list mixes categories. */
  categoryLabel?: string;
  /** A window of the answer around the term that matched it. */
  answerExcerpt?: string;
}

interface HelpAnswerListProps {
  entries: HelpAnswerEntry[];
  openQuestionId: string | null;
  onToggle: (questionId: string) => void;
  /** Folded search terms to mark inside question and excerpt text. */
  highlightTerms?: string[];
}

/** Wraps every occurrence of a search term in a `<mark>`, accents included. */
function HighlightedText({
  text,
  terms,
}: {
  text: string;
  terms: string[];
}): ReactNode {
  const ranges = findMatchRanges(text, terms);
  if (ranges.length === 0) return text;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start > cursor) nodes.push(text.slice(cursor, range.start));
    nodes.push(
      <mark key={`${range.start}-${range.end}`} className={s.hit}>
        {text.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

/**
 * The help accordion, shared by browsing a category and reading search results.
 * A search entry additionally carries the category it belongs to and an excerpt
 * showing why it matched, so a hit from a tab the reader never opened still
 * explains itself.
 */
export function HelpAnswerList({
  entries,
  openQuestionId,
  onToggle,
  highlightTerms = [],
}: HelpAnswerListProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();

  return (
    <div className={s.accordion}>
      {entries.map(({ question, categoryLabel, answerExcerpt }) => {
        const isOpen = openQuestionId === question.id;
        const questionText = t(question.questionKey);
        return (
          <div key={question.id} className={s.accItem}>
            {categoryLabel && (
              <p className={s.resultCategory}>
                <span className="visuallyHidden">
                  {t("marketing:help.search.inCategory")}{" "}
                </span>
                {categoryLabel}
              </p>
            )}
            <button
              type="button"
              className={s.accQ}
              aria-expanded={isOpen}
              onClick={() => onToggle(question.id)}
            >
              <span>
                <HighlightedText text={questionText} terms={highlightTerms} />
              </span>
              <span
                className={[s.chevron, isOpen && s.chevronOpen]
                  .filter(Boolean)
                  .join(" ")}
              >
                <FiChevronRight aria-hidden />
              </span>
            </button>
            {answerExcerpt && !isOpen && (
              <p className={s.resultExcerpt}>
                <HighlightedText text={answerExcerpt} terms={highlightTerms} />
              </p>
            )}
            <AnimatePresence initial={false}>
              {isOpen && (
                <m.div
                  key="answer"
                  className={s.accReveal}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.24,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className={s.accA}>
                    <Translation
                      i18nKey={question.answerKey}
                      components={question.answerComponents}
                    />
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
