import { useEffect, useRef } from "react";
import { OfflineBanner as SharedOfflineBanner } from "../../../shared/components/ui";
import { useOnlineStatus } from "../../../shared/hooks";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";

export function OfflineBanner() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const offline = !useOnlineStatus();

  // Announce reconnection once, on the offline → online transition only.
  const wasOffline = useRef(offline);
  useEffect(() => {
    if (wasOffline.current && !offline) {
      showToast(t("gatherings:checkout.offline.backOnlineToast"), "success");
    }
    wasOffline.current = offline;
  }, [offline, showToast, t]);

  return (
    <SharedOfflineBanner
      offline={offline}
      message={t("gatherings:checkout.offline.bannerText")}
      showDot
      role="status"
    />
  );
}
