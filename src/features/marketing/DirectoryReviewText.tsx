import { useLayoutEffect, useRef, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./DirectorySpacePage.module.css";

interface Props {
  text: string;
}

/**
 * A review's words: the member's own line breaks kept (the block is
 * `white-space: pre-line`, so the paragraphs they typed survive), clamped to a
 * few lines with a Read more / Show less toggle beneath.
 *
 * The clamp lives in CSS on `[data-clamped]`, so the block is always clamped
 * while collapsed. That is what makes the overflow measurable: an unclamped
 * block reports `scrollHeight === clientHeight` and would never ask for the
 * toggle.
 */
export function DirectoryReviewText({ text }: Props) {
  const { t } = useTranslation();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Re-measured on every resize of the block: the same words reflow onto more
  // lines in a narrow column, so a review that fits on desktop can overflow on
  // a phone. Measuring is skipped while expanded (nothing is clipped then, and
  // the toggle must stay put so "Show less" does not vanish under the reader).
  useLayoutEffect(() => {
    const node = bodyRef.current;
    if (!node || isExpanded) return;
    const measure = () => {
      setIsOverflowing(node.scrollHeight - node.clientHeight > 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [text, isExpanded]);

  return (
    <>
      <div
        ref={bodyRef}
        className={s.revText}
        data-clamped={isExpanded ? undefined : ""}
      >
        {text}
      </div>
      {isOverflowing && (
        <button
          type="button"
          className={s.revMore}
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((wasExpanded) => !wasExpanded)}
        >
          {isExpanded
            ? t("marketing:directory.detail.reviews.showLess")
            : t("marketing:directory.detail.reviews.readMore")}
          {isExpanded ? <FiChevronUp aria-hidden /> : <FiChevronDown aria-hidden />}
        </button>
      )}
    </>
  );
}
