import { FiMessageSquare, FiX } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { type Thread } from "./forum.data";
import { type ForumSort } from "./api/forum.api";
import { SORT_TABS } from "./forumSort.data";
import { ForumThreadListSkeleton } from "./ForumSkeleton";
import { ForumThreadRow } from "./ForumThreadRow";
import styles from "./ForumPage.module.css";

export function ForumThreadList({
  loading,
  threads,
  pinnedThreads,
  sort,
  setSort,
  headerCount,
  activeTag,
  onClearTag,
  onTagClick,
  onVote,
  filtered,
  onShowAll,
  onCompose,
  canEditThread,
  onEditTitle,
  onDelete,
  onRestore,
  onHistory,
  onTogglePin,
}: {
  loading: boolean;
  threads: Thread[];
  /** The sticky bucket rendered above the regular list — small (capped) and
   *  unpaginated, hidden while filtering by tag/search (see
   *  `useForumPageState`). Defaults to empty for callers/tests that don't pass
   *  it. */
  pinnedThreads?: Thread[];
  sort: ForumSort;
  setSort: (sort: ForumSort) => void;
  headerCount: number;
  activeTag?: string;
  onClearTag: () => void;
  onTagClick: (tag: string) => void;
  onVote: (thread: Thread) => void;
  filtered: boolean;
  onShowAll: () => void;
  onCompose: () => void;
  canEditThread: (thread: Thread) => boolean;
  onEditTitle: (thread: Thread) => void;
  onDelete: (thread: Thread) => void;
  onRestore: (thread: Thread) => void;
  onHistory: (thread: Thread) => void;
  onTogglePin: (thread: Thread) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div>
      <div className={styles.top}>
        <div
          className={styles.sort}
          role="group"
          aria-label={t("forum:threadList.sortAria")}
        >
          {SORT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={sort === tab.id}
              className={[styles.sortBtn, sort === tab.id && styles.sortBtnOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setSort(tab.id)}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
        <span className={styles.count} aria-live="polite">
          {t("forum:threadList.count", {
            count: headerCount,
            formatted: fmt.number(headerCount),
          })}
        </span>
      </div>

      {activeTag && (
        <div className={styles.activeTag}>
          <span className={styles.activeTagLabel}>
            {t("forum:threadList.filteringByTag")}
          </span>
          <span className={styles.activeTagValue}>#{activeTag}</span>
          <button
            type="button"
            className={styles.activeTagClear}
            onClick={onClearTag}
            aria-label={t("forum:threadList.clearTagAria", { tag: activeTag })}
          >
            <FiX aria-hidden /> {t("forum:threadList.clearTag")}
          </button>
        </div>
      )}

      {!!pinnedThreads?.length && (
        <div className={styles.pinnedSection}>
          {pinnedThreads.map((thread, idx) => (
            <ForumThreadRow
              key={thread.slug ?? thread.id}
              thread={thread}
              index={idx}
              onVote={onVote}
              onTagClick={onTagClick}
              canEditThread={canEditThread}
              onEditTitle={onEditTitle}
              onDelete={onDelete}
              onRestore={onRestore}
              onHistory={onHistory}
              onTogglePin={onTogglePin}
            />
          ))}
        </div>
      )}

      <div>
        {loading && <ForumThreadListSkeleton count={5} />}
        {!loading && threads.length === 0 && filtered && (
          <EmptyState
            icon={<FiMessageSquare />}
            title={t("forum:threadList.emptyFiltered.title")}
            description={t("forum:threadList.emptyFiltered.description")}
            action={{
              label: t("forum:threadList.emptyFiltered.action"),
              onClick: onShowAll,
            }}
          />
        )}
        {!loading && threads.length === 0 && !filtered && (
          <EmptyState
            icon={<FiMessageSquare />}
            title={t("forum:threadList.emptyAll.title")}
            description={t("forum:threadList.emptyAll.description")}
            action={{
              label: t("forum:threadList.emptyAll.action"),
              onClick: onCompose,
            }}
          />
        )}
        {!loading &&
          threads.map((thread, idx) => (
            <ForumThreadRow
              key={thread.slug ?? thread.id}
              thread={thread}
              index={idx}
              onVote={onVote}
              onTagClick={onTagClick}
              canEditThread={canEditThread}
              onEditTitle={onEditTitle}
              onDelete={onDelete}
              onRestore={onRestore}
              onHistory={onHistory}
              onTogglePin={onTogglePin}
            />
          ))}
      </div>
    </div>
  );
}
