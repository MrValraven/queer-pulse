import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminStudioLandingPreviewDTO } from "./api/studioLandingAdmin.api";

/** Confirms taking a preview request off the Studio page, whatever its
 *  status. `target` null keeps the dialog closed. */
export function StudioAdminLandingPreviewRemoveDialog({
  target,
  isPending,
  onClose,
  onConfirm,
}: {
  target: AdminStudioLandingPreviewDTO | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      open={target !== null}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={isPending}
      tone="destructive"
      title={t("admin:studioAdmin.landing.previews.removeConfirm.title", {
        track: target?.track.title ?? "",
      })}
      description={t("admin:studioAdmin.landing.previews.removeConfirm.body")}
      confirmLabel={t("admin:studioAdmin.landing.previews.removeCta")}
      cancelLabel={t("admin:common.cancel")}
    />
  );
}
