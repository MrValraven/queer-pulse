import { OfflineBanner as SharedOfflineBanner } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyEvents } from "./MyEventsContext";

/** Top banner shown when the browser reports it's offline. */
export function OfflineBanner() {
  const { t } = useTranslation();
  const { offline } = useMyEvents();
  return (
    <SharedOfflineBanner
      offline={offline}
      message={t("myevents:offline.banner")}
    />
  );
}
