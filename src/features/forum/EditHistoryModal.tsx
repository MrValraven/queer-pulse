import { useEffect } from "react";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import styles from "./forumModals.module.css";

/** One normalized revision row the history modal renders. Each feature maps its
 *  own history response into this shape (forum via `ForumEditHistoryModal`,
 *  communities via `CommunityHistoryModal`). `previousTitle` is populated only
 *  for forum OP title edits; body/text edits leave it null. */
export interface PostRevisionEntry {
  id: string;
  authorName: string;
  createdAt: string;
  previousBody: string;
  previousTitle: string | null;
}

export function EditHistoryModal({
  revisions,
  isLoading,
  onClose,
}: {
  revisions: PostRevisionEntry[];
  isLoading: boolean;
  onClose: () => void;
}) {
  useScrollLock();
  const { t } = useTranslation();
  const fmt = useFormat();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="forum-history-title"
      >
        <h2 id="forum-history-title" className={styles.title}>
          {t("forum:history.title")}
        </h2>
        {!isLoading && revisions.length === 0 && (
          <p className={styles.sub}>{t("forum:history.empty")}</p>
        )}
        <ul className={styles.historyList}>
          {revisions.map((revision) => (
            <li key={revision.id} className={styles.historyItem}>
              <div className={styles.historyMeta}>
                <span>{revision.authorName || t("forum:tombstone.author")}</span>
                <span>
                  {fmt.date(new Date(revision.createdAt), {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {revision.previousTitle && (
                <p className={styles.historyTitleChange}>
                  {t("forum:history.titleChange", { title: revision.previousTitle })}
                </p>
              )}
              <p className={styles.historyBody}>{revision.previousBody}</p>
            </li>
          ))}
        </ul>
        <div className={styles.actions}>
          <Button variant="ghost" type="button" onClick={onClose}>
            {t("forum:history.close")}
          </Button>
        </div>
      </div>
    </div>
  );
}
