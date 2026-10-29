import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { studioReasonCopyKey, studioReasonOf } from "../studio/studioReason";

/** A failed console search: the reason it names (offline, a rate limit, our
 *  server, missing staff access) and Try again. The last settled reason holds
 *  while a retry runs, since a retry clears the error. */
export function StudioAdminSearchError({
  error,
  isRetrying,
  onRetry,
  className,
}: {
  error: unknown;
  isRetrying: boolean;
  onRetry: () => void;
  className: string | undefined;
}) {
  const { t } = useTranslation();
  const liveReason = studioReasonOf(error);
  const [settledReason, setSettledReason] = useState(liveReason);
  if (!isRetrying && error !== null && settledReason !== liveReason)
    setSettledReason(liveReason);
  const reason = isRetrying || error === null ? settledReason : liveReason;
  return (
    <div role="alert">
      <p className={className}>{t(studioReasonCopyKey(reason, "load"))}</p>
      <Button variant="ghost" size="sm" onClick={onRetry}>
        {t("admin:studioAdmin.retryCta")}
      </Button>
    </div>
  );
}
