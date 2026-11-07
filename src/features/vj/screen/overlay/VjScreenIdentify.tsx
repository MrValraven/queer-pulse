import { useEffect, useState, type JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { VJ_OVERLAY_FADE_SECONDS } from "./vjOverlayStyle";
import styles from "./VjOverlay.module.css";

export interface VjScreenIdentifyRequest {
  /** The screen's number ("Screen 2"). */
  number: number;
  /** How long the number stays up. */
  durationMs: number;
  /** A new key restarts the display, even for the same number. */
  key: number;
}

/**
 * The screen's number over everything (contract 7.8), for `durationMs`: a
 * small "Screen" eyebrow over the numeral, which fills 40% of the height so
 * the far end of the room can tell the screens apart. The page mounts it
 * last, above the stage and outside the flash governor. It is projector
 * only, so its fade keeps its timing whatever the reduced-motion setting,
 * like the rest of the show.
 */
export function VjScreenIdentify({
  identify,
}: {
  identify: VjScreenIdentifyRequest | null;
}): JSX.Element {
  const { t } = useTranslation();
  const [expiredKey, setExpiredKey] = useState<number | null>(null);
  const identifyKey = identify?.key ?? null;
  const durationMs = identify?.durationMs ?? 0;

  useEffect(() => {
    if (identifyKey === null) return undefined;
    const timeoutId = window.setTimeout(
      () => setExpiredKey(identifyKey),
      Math.max(0, durationMs),
    );
    return () => window.clearTimeout(timeoutId);
  }, [identifyKey, durationMs]);

  const isShown = identify !== null && expiredKey !== identify.key;
  return (
    <div
      className={styles.identify}
      data-vj-identify={isShown ? "shown" : "hidden"}
      aria-hidden="true"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isShown ? (
          <m.p
            key={identify.key}
            className={styles.identifyPlate}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: VJ_OVERLAY_FADE_SECONDS, ease: "easeOut" }}
          >
            <span className={styles.identifyEyebrow}>
              {t("vj:screen.identifyEyebrow")}
            </span>
            <span className={styles.identifyNumber} data-vj-identify-number="">
              {identify.number}
            </span>
          </m.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
