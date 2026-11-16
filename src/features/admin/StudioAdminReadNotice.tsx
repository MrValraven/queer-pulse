import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isStudioAdminForbidden } from "./studioAdmin.model";
import { AdminNotice } from "./ui";

/** A Shelves or Scenes read that never loaded. A 403 names the missing staff
 *  access and offers no Retry; any other failure keeps Retry beside it. */
export function StudioAdminReadNotice({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const isForbidden = isStudioAdminForbidden(error);
  return (
    <AdminNotice
      tone="error"
      action={
        isForbidden ? undefined : (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            {t("admin:studioAdmin.retryCta")}
          </Button>
        )
      }
    >
      {isForbidden
        ? t("admin:studioAdmin.forbidden")
        : t("admin:studioAdmin.loadError")}
    </AdminNotice>
  );
}
