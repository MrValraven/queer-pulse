import { Button, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  AdminChip,
  AdminPanel,
  AdminRowActions,
  adminRowActionClasses,
  adminTableClasses,
} from "./ui";
import type { ChangemakerDTO } from "../community/api/changemakers.api";
import styles from "./AdminChangemakersPage.module.css";

/** Presentational list of directory profiles with per-row admin actions. */
export function AdminChangemakerRows({
  profiles,
  onEdit,
  onTogglePublish,
  onDelete,
}: {
  profiles: ChangemakerDTO[];
  onEdit: (profile: ChangemakerDTO) => void;
  onTogglePublish: (profile: ChangemakerDTO) => void;
  onDelete: (profile: ChangemakerDTO) => void;
}) {
  const { t } = useTranslation();
  return (
    <AdminPanel padding="flush">
      <ul className={styles.rows}>
        {profiles.map((profile, index) => (
          <FadeIn
            key={profile.id}
            as="li"
            delay={Math.min(index, 8) * 50}
            className={`${adminTableClasses.row} ${styles.row}`}
          >
            <div className={styles.rowMain}>
              <div className={styles.rowTop}>
                <span className={styles.rowName}>{profile.name}</span>
                <AdminChip
                  tone={profile.status === "published" ? "jade" : "ghost"}
                  dot
                >
                  {profile.status === "published"
                    ? t("community:changemakers.admin.statusPublished")
                    : t("community:changemakers.admin.statusDraft")}
                </AdminChip>
                {profile.isFeatured && (
                  <AdminChip tone="coral">
                    {t("community:changemakers.admin.featuredBadge")}
                  </AdminChip>
                )}
              </div>
              <div className={styles.rowMeta}>{profile.cause}</div>
            </div>
            <AdminRowActions className={styles.rowActions}>
              <Button variant="ghost" size="sm" onClick={() => onEdit(profile)}>
                {t("community:changemakers.admin.editCta")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTogglePublish(profile)}
              >
                {profile.status === "published"
                  ? t("community:changemakers.admin.unpublishCta")
                  : t("community:changemakers.admin.publishCta")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={adminRowActionClasses.danger}
                onClick={() => onDelete(profile)}
              >
                {t("community:changemakers.admin.deleteCta")}
              </Button>
            </AdminRowActions>
          </FadeIn>
        ))}
      </ul>
    </AdminPanel>
  );
}
