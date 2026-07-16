import { sx } from "./myEvents.styles";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyEvents } from "./MyEventsContext";

/** Top banner shown when the browser reports it's offline. */
export function OfflineBanner() {
  const { t } = useTranslation();
  const { offline } = useMyEvents();
  return (
    <div className={`${sx("offline-banner")} ${offline ? sx("show") : ""}`}>
      {t("myevents:offline.banner")}
    </div>
  );
}
