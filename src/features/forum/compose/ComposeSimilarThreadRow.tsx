import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiCornerUpLeft, FiMessageCircle } from "react-icons/fi";
import { Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { thread as threadPath } from "../../../app/routeMap";
import type { SimilarThread } from "./useSimilarThreads";
import styles from "./ComposeSimilarThreads.module.css";

// ── One thread that already covers this ground ──────────────────────────────
// Split out of `ComposeSimilarThreads`, which owns the list and its motion.

/**
 * A part of the block that comes and goes. The block and each row space their
 * children with `gap`, which cannot animate, so the slot cancels its own gap
 * and carries the same space inside the height that grows and folds (see
 * `.slot` in the CSS).
 */
export function SimilarSlot({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: ReactNode;
}) {
  return (
    <Collapse isOpen={isOpen} className={styles.slot}>
      <div className={styles.slotInner}>{children}</div>
    </Collapse>
  );
}

export function SimilarThreadRow({
  thread,
  isTheDuplicate,
  onReplyInstead,
}: {
  thread: SimilarThread;
  isTheDuplicate: boolean;
  onReplyInstead: (thread: SimilarThread) => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  // The animated <li> and the card box live in `ComposeSimilarThreads`;
  // this is what sits inside them.
  return (
    <>
      <SimilarSlot isOpen={isTheDuplicate}>
        <p className={styles.duplicateFlag}>
          {t("forum:composePage.similar.duplicateFlag")}
        </p>
      </SimilarSlot>
      <Link
        to={threadPath(thread.slug ?? thread.id)}
        className={styles.rowTitle}
      >
        {thread.title}
      </Link>
      <p className={styles.rowMeta}>
        <FiMessageCircle aria-hidden="true" />
        <span>
          {t("forum:repliesCount", {
            count: thread.replyCount,
            formatted: format.number(thread.replyCount),
          })}
        </span>
        <span className={styles.metaDot} aria-hidden="true" />
        <span>{thread.postedLabel}</span>
      </p>
      {thread.hasAcceptedAnswer && (
        <p className={styles.answer}>
          <span className={styles.answerLabel}>
            <FiCheckCircle aria-hidden="true" />
            {t("forum:replies.acceptedBadge")}
          </span>
          {thread.acceptedAnswerExcerpt && (
            <span className={styles.answerText}>
              {thread.acceptedAnswerExcerpt}
            </span>
          )}
        </p>
      )}
      <button
        type="button"
        className={styles.replyInstead}
        onClick={() => onReplyInstead(thread)}
      >
        <FiCornerUpLeft aria-hidden="true" />
        {t("forum:composePage.similar.replyInstead")}
        <span className="visuallyHidden">
          {t("forum:composePage.similar.replyInsteadContext", {
            title: thread.title,
          })}
        </span>
      </button>
    </>
  );
}
