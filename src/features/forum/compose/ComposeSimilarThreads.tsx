import { useId } from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiCornerUpLeft, FiMessageCircle } from "react-icons/fi";
import { SkeletonLine } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { thread as threadPath } from "../../../app/routeMap";
import { tokenize } from "./composeText";
import type { SimilarThread } from "./useSimilarThreads";
import styles from "./ComposeSimilarThreads.module.css";

// ── "Already discussed?" ────────────────────────────────────────────────────
// The most valuable block in the rail: the cheapest thread to answer is the
// one that already exists, and every repeat question costs somebody the work
// of answering it twice.
//
// So the rows are built to be READ, not just counted. The accepted answer gets
// its own line at full body size rather than a truncated whisper, because a
// member who can see the answer from here never needs to open the thread at
// all, and that is the whole point of the block.

/**
 * How many meaningful words a title needs before a search goes out. Mirrors
 * `MIN_TITLE_TOKENS` in `useSimilarThreads`, which owns the search itself;
 * this copy only decides which of the two empty states to show, so the worst a
 * drift could do is offer the invitation for one word longer than it should.
 */
const MIN_TITLE_TOKENS_FOR_SEARCH = 2;

export interface ComposeSimilarThreadsProps {
  /** The title as typed. Decides between "keep typing" and "nothing found". */
  title: string;
  /** Up to three threads already covering this ground. */
  threads: readonly SimilarThread[];
  /** True when one of them is close enough that publishing is refused. */
  isDuplicate: boolean;
  /** That thread's title, which is how the duplicate row is identified. */
  duplicateTitle: string | null;
  isLoading: boolean;
  /** Opens the "move my text there as a reply" flow. The modal lives
   *  elsewhere; this block only says which thread was picked. */
  onReplyInstead: (thread: SimilarThread) => void;
  className?: string;
}

export function ComposeSimilarThreads({
  title,
  threads,
  isDuplicate,
  duplicateTitle,
  isLoading,
  onReplyInstead,
  className,
}: ComposeSimilarThreadsProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const headingId = useId();
  const hasSearchableTitle =
    tokenize(title).length >= MIN_TITLE_TOKENS_FOR_SEARCH;
  const hasThreads = threads.length > 0;

  return (
    <section
      className={[styles.block, className].filter(Boolean).join(" ")}
      aria-labelledby={headingId}
    >
      <h2 className={styles.heading} id={headingId}>
        <span>{t("forum:composePage.similar.heading")}</span>
        {hasThreads && (
          <span className={styles.count}>
            {t("forum:composePage.similar.count", {
              count: threads.length,
              formatted: format.number(threads.length),
            })}
          </span>
        )}
      </h2>

      {!hasSearchableTitle && (
        <p className={styles.note}>{t("forum:composePage.similar.prompt")}</p>
      )}

      {hasSearchableTitle && isLoading && !hasThreads && (
        <div className={styles.loading}>
          <SkeletonLine width="72%" />
          <SkeletonLine width="48%" />
        </div>
      )}

      {hasSearchableTitle && !isLoading && !hasThreads && (
        <p className={styles.note}>{t("forum:composePage.similar.empty")}</p>
      )}

      {hasThreads && (
        <>
          <ul className={styles.list}>
            {threads.map((similarThread) => (
              <SimilarThreadRow
                key={similarThread.id}
                thread={similarThread}
                isTheDuplicate={
                  isDuplicate && duplicateTitle === similarThread.title
                }
                onReplyInstead={onReplyInstead}
              />
            ))}
          </ul>
          <p className={styles.why}>{t("forum:composePage.similar.why")}</p>
        </>
      )}

      {/* Polite and count-only: the row contents change on every debounce, and
          re-reading three titles into someone's ear mid-sentence is not help. */}
      <p className="visuallyHidden" role="status">
        {hasThreads
          ? t("forum:composePage.similar.announce", {
              count: threads.length,
              formatted: format.number(threads.length),
            })
          : ""}
      </p>
    </section>
  );
}

function SimilarThreadRow({
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
  return (
    <li
      className={[styles.row, isTheDuplicate && styles.rowDuplicate]
        .filter(Boolean)
        .join(" ")}
    >
      {isTheDuplicate && (
        <p className={styles.duplicateFlag}>
          {t("forum:composePage.similar.duplicateFlag")}
        </p>
      )}
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
    </li>
  );
}
