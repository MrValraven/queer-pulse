import { OfflineBanner as SharedOfflineBanner } from "../../shared/components/ui";
import { useOnlineStatus } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";

/** Top banner shown when the browser reports it's offline. */
export function OfflineBanner() {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  return (
    <SharedOfflineBanner
      offline={!isOnline}
      message={t("myevents:offline.banner")}
    />
  );
}
