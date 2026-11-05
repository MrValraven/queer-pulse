import { useUnsavedChangesGuard } from "../../../shared/hooks/useUnsavedChangesGuard";
import { useTranslation } from "../../../shared/i18n/useTranslation";

/**
 * Asks before the library is left while uploads are queued or running:
 * leaving unmounts the queue, which stops every upload. A nav click, a tab
 * close, browser Back and Android Back all prompt. A pack switch only changes
 * `?pack=` on the same page, so it passes without a prompt.
 */
export function useVjUploadLeaveGuard(hasPendingUploads: boolean): void {
  const { t } = useTranslation();
  useUnsavedChangesGuard({
    active: hasPendingUploads,
    confirmMessage: t("vj:page.leaveWhileUploading.body"),
    guardBackButton: true,
    shouldAllowQueryChanges: true,
  });
}
