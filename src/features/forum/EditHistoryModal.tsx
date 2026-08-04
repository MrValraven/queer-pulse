import { Button, Modal } from "../../shared/components/ui";
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
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <Modal
      title={t("forum:history.title")}
      onClose={onClose}
      footer={
        <Button variant="ghost" type="button" onClick={onClose}>
          {t("forum:history.close")}
        </Button>
      }
    >
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
    </Modal>
  );
}
