import { useId, type ReactNode } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { htmlToPlainText } from "../../shared/components/richText/plainText";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import {
  CREATE_GATHERING_CHAPTERS,
  chapterIndexOf,
  type CreateGatheringChapterId,
} from "./createGathering.data";
import styles from "./CreateGatheringReview.module.css";

/**
 * One block of the review recap: a chapter's plain title, an Edit button that
 * opens that chapter, and its rows. The title is an h3 under the review
 * chapter's own h2 head. Edit is named after the chapter's own title
 * ("Edit: Who is it for?"), with the title's `<em>` markup taken out.
 */
export function ReviewGroup({
  title,
  titleId,
  chapterId,
  onEditChapter,
  children,
}: {
  title: string;
  /** Lets a block inside the group (the accessibility answers) name itself
   *  by the group title. A generated id otherwise. */
  titleId?: string;
  /** The chapter this group reads back, which Edit opens. */
  chapterId: CreateGatheringChapterId;
  onEditChapter: (chapterIndex: number) => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const generatedId = useId();
  const headingId = titleId ?? generatedId;
  const chapterIndex = chapterIndexOf(chapterId);
  const chapterTitleKey = CREATE_GATHERING_CHAPTERS[chapterIndex]?.titleKey;
  const chapterTitle = chapterTitleKey
    ? htmlToPlainText(t(chapterTitleKey))
    : title;
  return (
    <div className={styles.group}>
      <div className={styles.groupHead}>
        <h3 id={headingId} className={styles.groupTitle}>
          {title}
        </h3>
        <button
          type="button"
          className={styles.edit}
          aria-label={t("gatherings:create.v2.review.editLabel", {
            section: chapterTitle,
          })}
          onClick={() => onEditChapter(chapterIndex)}
        >
          {t("gatherings:create.v2.review.edit")}
        </button>
      </div>
      {children}
    </div>
  );
}

/** The key and value rows of one group, as a description list. */
export function ReviewRows({ children }: { children: ReactNode }) {
  return <dl className={styles.rows}>{children}</dl>;
}

/**
 * One key and value.
 *
 * An empty optional value reads as a muted "Not added". A required field that
 * publishing still waits on (`onJumpToNeeded`) shows "Needed" as a button to
 * that field, under the value when there is one (a date in the past, say).
 */
export function ReviewRow({
  label,
  value,
  isMultiline = false,
  onJumpToNeeded,
}: {
  label: string;
  value: string;
  /** Keeps the host's own line breaks (the description, the house rules). */
  isMultiline?: boolean;
  /** Set while this required field is unmet: open its chapter at it. */
  onJumpToNeeded?: (() => void) | undefined;
}) {
  const { t } = useTranslation();
  const trimmedValue = value.trim();
  return (
    <div className={styles.row}>
      <dt className={styles.rowLabel}>{label}</dt>
      <dd className={cx(styles.rowValue, isMultiline && styles.rowMultiline)}>
        {trimmedValue ||
          (!onJumpToNeeded && (
            <span className={styles.missing}>
              {t("gatherings:create.v2.review.notAdded")}
            </span>
          ))}
        {onJumpToNeeded && (
          <button
            type="button"
            className={styles.needed}
            onClick={onJumpToNeeded}
          >
            <FiAlertCircle aria-hidden />
            {t("gatherings:create.v2.review.needed")}
            <span className="visuallyHidden">
              {" "}
              {t("gatherings:create.v2.ready.jumpHint")}
            </span>
          </button>
        )}
      </dd>
    </div>
  );
}
