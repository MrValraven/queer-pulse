import { AdminModal } from "../../ui";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";

/**
 * The Board card's delete-confirm dialog — reuses `BulkBar`'s
 * `bulkBar.confirmDelete.*` copy with `count: 1` rather than inventing a
 * singular-delete key (see `useRoadmapCardActions`'s header comment). Kept
 * out of `RoadmapCard.tsx` purely to keep that file under the line cap.
 */
export function CardDeleteConfirm({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <AdminModal
      title={t("admin:roadmap.bulkBar.confirmDelete.title", { count: 1 })}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {t("admin:common.cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {t("admin:roadmap.bulkBar.confirmDelete.confirmCta")}
          </Button>
        </>
      }
    >
      <p>{t("admin:roadmap.bulkBar.confirmDelete.body", { count: 1 })}</p>
    </AdminModal>
  );
}
