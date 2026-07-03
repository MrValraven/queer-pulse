import { useEffect, useState } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function OfflineBanner() {
  const { showToast } = useToast();
  const [offline, setOffline] = useState(
    () => typeof navigator !== "undefined" && !navigator.onLine,
  );

  useEffect(() => {
    const goOnline = () => {
      setOffline(false);
      showToast("Back online — you're all set.", "success");
    };
    const goOffline = () => setOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [showToast]);

  return (
    <div className={cx(s["co-offline"], offline && s.show)} role="status">
      <span className={s["co-off-dot"]} aria-hidden />
      You're offline — your progress is saved. We'll reconnect automatically.
    </div>
  );
}
