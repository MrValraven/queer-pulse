import { Button, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminChip } from "./ui";
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
    <div className={styles.rows}>
      {profiles.map((profile, index) => (
        <FadeIn key={profile.id} delay={Math.min(index, 8) * 50}>
          <div className={styles.row}>
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
            <div className={styles.rowActions}>
              <Button variant="ghost" size="md" onClick={() => onEdit(profile)}>
                {t("community:changemakers.admin.editCta")}
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => onTogglePublish(profile)}
              >
                {profile.status === "published"
                  ? t("community:changemakers.admin.unpublishCta")
                  : t("community:changemakers.admin.publishCta")}
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => onDelete(profile)}
              >
                {t("community:changemakers.admin.deleteCta")}
              </Button>
            </div>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}
