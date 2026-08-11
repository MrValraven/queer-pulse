import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminMediaReferenceList } from "./AdminMediaReferences";
import { AdminModal } from "./ui";
import type { MediaReference } from "../../shared/media/mediaReferences";
import styles from "./AdminMediaPage.module.css";

/**
 * Pre-delete confirmation for one stored object. Deletion stays available
 * whether or not the object is still referenced — this only changes what the
 * admin is told before they commit: a plain confirmation when nothing points
 * at it, or a warning plus the full "where it's used" list when something
 * does, so deleting an in-use file is a deliberate choice, not a surprise.
 */
export function AdminMediaDeleteConfirm({
  references,
  degraded,
  isPending,
  onCancel,
  onConfirm,
}: {
  references: MediaReference[];
  /** When true, some reference checks failed, so an empty set is UNVERIFIED —
   *  the "no references found" reassurance is replaced with a caution. */
  degraded: boolean;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  const isReferenced = references.length > 0;

  return (
    <AdminModal
      eyebrow={t("admin:media.delete.eyebrow")}
      title={t("admin:media.delete.confirmTitle")}
      onClose={() => (isPending ? undefined : onCancel())}
      footer={
        <>
          <Button
            variant="ghost"
            type="button"
            disabled={isPending}
            onClick={onCancel}
          >
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="danger"
            type="button"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending
              ? t("admin:media.delete.pending")
              : t("admin:media.delete.confirm")}
          </Button>
        </>
      }
    >
      {isReferenced ? (
        <>
          <p className={styles.referenceWarning}>
            <FiAlertTriangle aria-hidden />
            {t("admin:media.delete.confirmBodyInUse", {
              count: references.length,
            })}
          </p>
          <AdminMediaReferenceList references={references} />
        </>
      ) : degraded ? (
        <p className={styles.referenceWarning}>
          <FiAlertTriangle aria-hidden />
          {t("admin:media.references.unverified")}
        </p>
      ) : (
        <p>{t("admin:media.delete.confirmBody")}</p>
      )}
    </AdminModal>
  );
}
