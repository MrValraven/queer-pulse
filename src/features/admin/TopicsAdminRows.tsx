import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminChip } from "./ui";
import type { AdminTopicDTO } from "./api/topicsAdmin.api";
import styles from "./TopicsAdminPage.module.css";

/** How much of the description a row shows before it is cut. Long enough to
 *  tell two topics apart, short enough that thirty rows stay scannable. */
const DESCRIPTION_PREVIEW_LENGTH = 160;

/**
 * One row per topic: the tag, its label and description, what it has drawn so
 * far, and the four things staff can do to it.
 *
 * Archive is offered before delete, and delete is the only destructive one.
 * Archiving keeps the posts and the followers, so a topic that stopped earning
 * its place in the directory can come back with its audience intact.
 */
export function TopicsAdminRows({
  topics,
  onEdit,
  onSetArchived,
  onDelete,
}: {
  topics: AdminTopicDTO[];
  onEdit: (topic: AdminTopicDTO) => void;
  onSetArchived: (topic: AdminTopicDTO, isArchived: boolean) => void;
  onDelete: (topic: AdminTopicDTO) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.rows}>
      {topics.map((topic) => {
        const preview =
          topic.description.length > DESCRIPTION_PREVIEW_LENGTH
            ? `${topic.description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trimEnd()}…`
            : topic.description;
        return (
          <div
            key={topic.id}
            className={[styles.row, topic.isArchived && styles.rowArchived]
              .filter(Boolean)
              .join(" ")}
          >
            <div className={styles.rowMain}>
              <div className={styles.rowTop}>
                <span className={styles.rowName}>#{topic.tag}</span>
                <span className={styles.rowLabel}>{topic.label}</span>
                {topic.isCrisisCard && (
                  <AdminChip tone="plum">
                    {t("admin:topics.crisisBadge")}
                  </AdminChip>
                )}
                {topic.isArchived && (
                  <span className={styles.archivedTag}>
                    {t("admin:topics.archivedBadge")}
                  </span>
                )}
              </div>
              <p className={styles.rowBody}>{preview}</p>
              <p className={styles.rowStats}>
                {t("admin:topics.postsCount", { count: topic.totalPosts })}
                {" · "}
                {t("admin:topics.followersCount", {
                  count: topic.followerCount,
                })}
              </p>
            </div>

            <div className={styles.rowActions}>
              <Button variant="ghost" size="md" onClick={() => onEdit(topic)}>
                {t("admin:common.edit")}
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => onSetArchived(topic, !topic.isArchived)}
              >
                {t(
                  topic.isArchived
                    ? "admin:topics.restoreCta"
                    : "admin:topics.archiveCta",
                )}
              </Button>
              <Button variant="ghost" size="md" onClick={() => onDelete(topic)}>
                {t("admin:common.delete")}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
