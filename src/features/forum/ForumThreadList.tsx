import { FiMessageSquare } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { type Thread } from "./forum.data";
import { ForumThreadListSkeleton } from "./ForumSkeleton";
import { ForumThreadRow } from "./ForumThreadRow";
import styles from "./ForumPage.module.css";

export function ForumThreadList({
  loading,
  threads,
  sort,
  setSort,
  voted,
  toggleVote,
  filtered,
  onShowAll,
  onCompose,
  canEditThread,
  onEditTitle,
}: {
  loading: boolean;
  threads: Thread[];
  sort: "top" | "new";
  setSort: (s: "top" | "new") => void;
  voted: Set<number>;
  toggleVote: (id: number) => void;
  filtered: boolean;
  onShowAll: () => void;
  onCompose: () => void;
  canEditThread: (thread: Thread) => boolean;
  onEditTitle: (thread: Thread) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div>
      <div className={styles.top}>
        <div className={styles.sort}>
          <button
            type="button"
            className={[styles.sortBtn, sort === "top" && styles.sortBtnOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setSort("top")}
          >
            {t("forum:threadList.top")}
          </button>
          <button
            type="button"
            className={[styles.sortBtn, sort === "new" && styles.sortBtnOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setSort("new")}
          >
            {t("forum:threadList.new")}
          </button>
        </div>
        <span className={styles.count}>
          {t("forum:threadList.count", {
            count: threads.length,
            formatted: fmt.number(threads.length),
          })}
        </span>
      </div>

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
            key={thread.id}
            thread={thread}
            index={idx}
            voted={voted}
            toggleVote={toggleVote}
            canEditThread={canEditThread}
            onEditTitle={onEditTitle}
          />
        ))}
    </div>
  );
}
