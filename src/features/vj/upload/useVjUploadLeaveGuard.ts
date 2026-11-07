import { useUnsavedChangesGuard } from "../../../shared/hooks/useUnsavedChangesGuard";
import { useTranslation } from "../../../shared/i18n/useTranslation";

/**
 * Asks before the library is left while uploads are queued or running, or
 * while "Make previews" is making previews: leaving unmounts the page, which
 * stops both. A nav click, a tab close, browser Back and Android Back all
 * prompt. A pack switch or a section switch only changes `?pack=` or `?view=`
 * on the same page, so it passes without a prompt and the work carries on.
 * Uploads lose files the admin must add again, so their line wins when both
 * run.
 */
export function useVjUploadLeaveGuard({
  hasPendingUploads,
  isMakingPreviews,
}: {
  hasPendingUploads: boolean;
  isMakingPreviews: boolean;
}): void {
  const { t } = useTranslation();
  useUnsavedChangesGuard({
    active: hasPendingUploads || isMakingPreviews,
    confirmMessage: hasPendingUploads
      ? t("vj:page.leaveWhileUploading.body")
      : t("vj:page.leaveWhileMakingPreviews.body"),
    guardBackButton: true,
    shouldAllowQueryChanges: true,
  });
}
