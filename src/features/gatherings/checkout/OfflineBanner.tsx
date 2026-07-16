import { useEffect, useState } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function OfflineBanner() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [offline, setOffline] = useState(
    () => typeof navigator !== "undefined" && !navigator.onLine,
  );

  useEffect(() => {
    const goOnline = () => {
      setOffline(false);
      showToast(t("gatherings:checkout.offline.backOnlineToast"), "success");
    };
    const goOffline = () => setOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [showToast, t]);

  return (
    <div className={cx(s["co-offline"], offline && s.show)} role="status">
      <span className={s["co-off-dot"]} aria-hidden />
      {t("gatherings:checkout.offline.bannerText")}
    </div>
  );
}
