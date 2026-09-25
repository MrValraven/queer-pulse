import { useId } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { SkeletonLine } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { tokenize } from "./composeText";
import { COMPOSE_EASE } from "./composeMotion";
import { ComposeSimilarCount } from "./ComposeSimilarCount";
import { SimilarSlot, SimilarThreadRow } from "./ComposeSimilarThreadRow";
import type { SimilarThread } from "./useSimilarThreads";
import { useSettledResults } from "./useSimilarThreadsSettle";
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
//
// Results turn over on every debounce, so each state (invitation, loading,
// nothing found, results) grows and folds through a slot, and inside the
// list each thread grows and folds in the flow, carrying what sits below.

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
  /** The title is searchable but its first search has not gone out yet. */
  isAwaitingFirstSearch: boolean;
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
  isAwaitingFirstSearch,
  onReplyInstead,
  className,
}: ComposeSimilarThreadsProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const headingId = useId();
  const hasSearchableTitle =
    tokenize(title).length >= MIN_TITLE_TOKENS_FOR_SEARCH;
  // Until the search hook has taken up a searchable title, its empty list is
  // no answer yet, so the invitation stays up until a real answer lands.
  const isFirstSearchPending = hasSearchableTitle && isAwaitingFirstSearch;
  // A new search empties `threads` for as long as it is in flight. Holding the
  // last answer through that window keeps the list from folding and growing
  // back on every debounce; the swap happens once the new answer lands.
  const visible = useSettledResults(
    { threads, isDuplicate, duplicateTitle },
    isLoading,
  );
  const hasThreads = visible.threads.length > 0;
  const { reducedMotion } = useMotionPrefs();
  const transition = { duration: reducedMotion ? 0 : 0.25, ease: COMPOSE_EASE };

  return (
    <section
      className={[styles.block, className].filter(Boolean).join(" ")}
      aria-labelledby={headingId}
    >
      <h2 className={styles.heading} id={headingId}>
        <span>{t("forum:composePage.similar.heading")}</span>
        <ComposeSimilarCount
          count={visible.threads.length}
          transition={transition}
        />
      </h2>

      <SimilarSlot
        isOpen={!hasSearchableTitle || (isFirstSearchPending && !hasThreads)}
      >
        <p className={styles.note}>{t("forum:composePage.similar.prompt")}</p>
      </SimilarSlot>

      <SimilarSlot
        isOpen={
          hasSearchableTitle &&
          !isFirstSearchPending &&
          isLoading &&
          !hasThreads
        }
      >
        <div className={styles.loading}>
          <SkeletonLine width="72%" />
          <SkeletonLine width="48%" />
        </div>
      </SimilarSlot>

      <SimilarSlot
        isOpen={
          hasSearchableTitle &&
          !isFirstSearchPending &&
          !isLoading &&
          !hasThreads
        }
      >
        <p className={styles.note}>{t("forum:composePage.similar.empty")}</p>
      </SimilarSlot>

      <SimilarSlot isOpen={hasThreads}>
        <ul className={styles.list}>
          <AnimatePresence initial={false}>
            {visible.threads.map((similarThread) => {
              const isTheDuplicate =
                visible.isDuplicate &&
                visible.duplicateTitle === similarThread.title;
              return (
                // The item animates its height and clips while it does; the
                // gap to the row above is its padding, so it folds too.
                <m.li
                  key={similarThread.id}
                  className={styles.item}
                  initial={{ height: 0, opacity: 0, overflow: "hidden" }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                    transitionEnd: { overflow: "visible" },
                  }}
                  exit={{ height: 0, opacity: 0, overflow: "hidden" }}
                  transition={transition}
                >
                  <div
                    className={[
                      styles.row,
                      isTheDuplicate && styles.rowDuplicate,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <SimilarThreadRow
                      thread={similarThread}
                      isTheDuplicate={isTheDuplicate}
                      onReplyInstead={onReplyInstead}
                    />
                  </div>
                </m.li>
              );
            })}
          </AnimatePresence>
        </ul>
        <p className={styles.why}>{t("forum:composePage.similar.why")}</p>
      </SimilarSlot>

      {/* Polite and count-only: the row contents change on every debounce, and
          re-reading three titles into someone's ear mid-sentence is not help. */}
      <p className="visuallyHidden" role="status">
        {hasThreads
          ? t("forum:composePage.similar.announce", {
              count: visible.threads.length,
              formatted: format.number(visible.threads.length),
            })
          : ""}
      </p>
    </section>
  );
}
