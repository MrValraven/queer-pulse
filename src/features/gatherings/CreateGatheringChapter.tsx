import type { MouseEvent, ReactNode } from "react";
import { FiAlertCircle, FiArrowRight, FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import { intlLocale } from "../../shared/i18n/locale";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import {
  chapterBodyId,
  chapterHeadId,
  chapterSectionId,
} from "./createGathering.data";
import {
  replayAnimationClass,
  type ChapterNeed,
} from "./createGatheringChapters";
import styles from "./CreateGatheringShell.module.css";

/** Matches `.shake` in CreateGatheringShell.module.css. */
const SHAKE_DURATION_MS = 400;

export interface CreateGatheringChapterProps {
  /** 0-based. The head shows `chapterIndex + 1`. */
  chapterIndex: number;
  titleKey: string;
  introKey: string;
  /** The collapsed line ("Supper club · Thursday supper club"). */
  summary: string;
  isOpen: boolean;
  /** Continued past once and still complete: the number turns into a jade
   *  check while the chapter is closed. */
  isDone: boolean;
  /** The pill reads "Edit" once the chapter was continued past, "Open"
   *  before. */
  hasBeenContinued: boolean;
  isOptional: boolean;
  /** The last chapter's button reads "Looks good". */
  isLast: boolean;
  /** What the footer lists after a Continue that could not go on. Empty
   *  hides the line. */
  visibleNeeds: ChapterNeed[];
  onToggle: () => void;
  /** Returns whether the chapter moved on. `false` shakes the button. */
  onContinue: () => boolean;
  children: ReactNode;
}

/** One accordion chapter: the head button, and the body with its intro, the
 *  chapter's own fields and the Continue footer. */
export function CreateGatheringChapter({
  chapterIndex,
  titleKey,
  introKey,
  summary,
  isOpen,
  isDone,
  hasBeenContinued,
  isOptional,
  isLast,
  visibleNeeds,
  onToggle,
  onContinue,
  children,
}: CreateGatheringChapterProps) {
  const { t, language } = useTranslation();
  const headId = chapterHeadId(chapterIndex);
  const bodyId = chapterBodyId(chapterIndex);
  const isShowingCheck = isDone && !isOpen;
  const needsText =
    visibleNeeds.length > 0
      ? new Intl.ListFormat(intlLocale(language), {
          type: "conjunction",
        }).format(visibleNeeds.map((need) => t(need.labelKey)))
      : "";

  const handleContinue = (event: MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const hasMovedOn = onContinue();
    if (!hasMovedOn && !prefersReducedMotionNow()) {
      replayAnimationClass(button, styles.shake, SHAKE_DURATION_MS);
    }
  };

  return (
    <section
      id={chapterSectionId(chapterIndex)}
      className={cx(
        styles.chapter,
        isOpen && styles.chapterOpen,
        isShowingCheck && styles.chapterDone,
      )}
    >
      <h2 className={styles.chapterHeading}>
        <button
          id={headId}
          type="button"
          className={styles.chapterHead}
          aria-expanded={isOpen}
          aria-controls={bodyId}
          onClick={onToggle}
        >
          <span className={styles.chapterNumber} aria-hidden>
            {isShowingCheck ? <FiCheck /> : chapterIndex + 1}
          </span>
          {isShowingCheck && (
            <span className="visuallyHidden">
              {t("gatherings:create.v2.chapter.done")}{" "}
            </span>
          )}
          <span className={styles.chapterTitle}>
            <Translation i18nKey={titleKey} components={{ em: <em /> }} />
          </span>
          {!isOpen && (
            <span className={styles.chapterSummary}>
              <span>{summary}</span>
              <span className={styles.chapterPill} aria-hidden>
                {t(
                  hasBeenContinued
                    ? "gatherings:create.v2.chapter.edit"
                    : "gatherings:create.v2.chapter.open",
                )}
              </span>
              {isOptional && (
                <span className={styles.chapterOptional}>
                  {t("gatherings:create.v2.chapter.optional")}
                </span>
              )}
            </span>
          )}
        </button>
      </h2>
      <div
        id={bodyId}
        role="region"
        aria-labelledby={headId}
        className={styles.chapterBody}
        hidden={!isOpen}
      >
        <p className={styles.chapterIntro}>{t(introKey)}</p>
        {children}
        <div className={styles.chapterFoot}>
          <p className={styles.chapterNeed} aria-live="polite">
            {needsText && (
              <>
                <FiAlertCircle aria-hidden />
                {t("gatherings:create.v2.chapter.stillNeeded", {
                  items: needsText,
                })}
              </>
            )}
          </p>
          <Button className={styles.continueButton} onClick={handleContinue}>
            {isLast ? (
              <>
                {t("gatherings:create.v2.chapter.looksGood")}{" "}
                <FiCheck aria-hidden />
              </>
            ) : (
              <>
                {t("gatherings:create.nav.continue")}{" "}
                <FiArrowRight aria-hidden />
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
