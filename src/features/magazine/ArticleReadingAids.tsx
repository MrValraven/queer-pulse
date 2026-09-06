import { useId, useMemo, useState, type RefObject } from "react";
import { FiChevronDown, FiCornerDownRight, FiList, FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { usePrefersReducedMotion } from "../../shared/hooks";
import type { Article } from "./data/articles";
import {
  buildArticleOutline,
  type ArticleOutlineEntry,
} from "./articleOutline";
import { useArticleReadingPosition } from "./useArticleReadingPosition";

import styles from "./ArticleReadingAids.module.css";

/**
 * PRD-113: the piece's own headings as a jump list, folded away until asked
 * for so a short read is not given a lid it does not need. Jumping is done
 * imperatively rather than through a `#hash` link, because the app's
 * `ScrollManager` reacts to a router location change and would fight it.
 */
function ArticleTableOfContents({
  entries,
}: {
  entries: ArticleOutlineEntry[];
}) {
  const { t } = useTranslation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const listId = useId();

  function jumpTo(anchorId: string) {
    setIsOpen(false);
    document.getElementById(anchorId)?.scrollIntoView({
      block: "start",
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <nav
      className={styles.contents}
      aria-label={t("magazine:reader.contentsAriaLabel")}
    >
      <button
        type="button"
        className={styles.contentsToggle}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        aria-expanded={isOpen}
        aria-controls={listId}
      >
        <FiList aria-hidden />
        <span>{t("magazine:reader.contentsCta")}</span>
        <FiChevronDown
          className={isOpen ? styles.chevronOpen : styles.chevron}
          aria-hidden
        />
      </button>
      <ol id={listId} className={styles.contentsList} hidden={!isOpen}>
        {entries.map((entry) => (
          <li key={entry.anchorId}>
            <button
              type="button"
              className={styles.contentsLink}
              onClick={() => jumpTo(entry.anchorId)}
            >
              {entry.label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * PRD-113: everything a long read needs and had none of: how far through the
 * reader is, what the piece is made of, and where they stopped last time.
 *
 * `bodyRef` points at the article body, so progress measures the text and not
 * the masthead, the related rail or the comments below it. All three aids honour
 * reduced motion: the bar has no transition under it, and both jumps fall back
 * to an instant scroll.
 */
export function ArticleReadingAids({
  article,
  bodyRef,
}: {
  article: Article;
  bodyRef: RefObject<HTMLElement | null>;
}) {
  const { t } = useTranslation();
  const { ratio, resumeRatio, resume, dismissResume } =
    useArticleReadingPosition(article.id, bodyRef);
  const outline = useMemo(() => buildArticleOutline(article), [article]);
  const readPercent = Math.round(ratio * 100);

  return (
    <>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-label={t("magazine:reader.progressAriaLabel")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={readPercent}
      >
        <div
          className={styles.progressFill}
          style={{ transform: `scaleX(${ratio})` }}
        />
      </div>

      {resumeRatio !== null && (
        <div className={styles.resume}>
          <FiCornerDownRight className={styles.resumeIcon} aria-hidden />
          <p className={styles.resumeText}>
            {t("magazine:reader.resumeText", {
              percent: Math.round(resumeRatio * 100),
            })}
          </p>
          <button type="button" className={styles.resumeCta} onClick={resume}>
            {t("magazine:reader.resumeCta")}
          </button>
          <button
            type="button"
            className={styles.resumeDismiss}
            onClick={dismissResume}
            aria-label={t("magazine:reader.resumeDismissAriaLabel")}
          >
            <FiX aria-hidden />
          </button>
        </div>
      )}

      {/* A single heading is a section title, never a table of contents. */}
      {outline.length > 1 && <ArticleTableOfContents entries={outline} />}
    </>
  );
}
