import type { RefObject } from "react";
import { MdQrCodeScanner } from "react-icons/md";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { CheckinScanResult, type ShownResult } from "./CheckinScanResult";
import type { useCameraScan } from "./useCameraScan";
import styles from "./CheckinViewfinder.module.css";

const CORNERS_SNAPPED = { scale: 0.94, transition: { duration: 0.12 } };
const CORNERS_PULSING = {
  scale: [1, 1.04, 1],
  transition: { repeat: Infinity, duration: 1.6 },
};
const CORNERS_STATIC = { scale: 1 };
const CORNER_CLASSES = [styles.tl, styles.tr, styles.bl, styles.br];

/** The camera frame with its corners, hint and the sliding result card. */
export function CheckinViewfinder({
  videoRef,
  state,
  isCornersSnapped,
  result,
  onDismiss,
  onUndo,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  state: ReturnType<typeof useCameraScan>["state"];
  isCornersSnapped: boolean;
  result: ShownResult | null;
  onDismiss: () => void;
  onUndo: (memberSlug: string) => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isLive = state === "scanning" || state === "starting";
  const hintKey =
    {
      starting: "gatherings:door.scan.startingHint",
      scanning: "gatherings:door.scan.pointHint",
      denied: "gatherings:door.scan.deniedHint",
      unsupported: "gatherings:door.scan.unsupportedHint",
    }[state as string] ?? "gatherings:door.scan.failedHint";
  const cornersAnimate = reducedMotion
    ? CORNERS_STATIC
    : isCornersSnapped
      ? CORNERS_SNAPPED
      : CORNERS_PULSING;

  return (
    <div
      className={`${styles.viewfinder} ${isLive ? "" : styles.viewfinderOff}`}
    >
      {isLive ? (
        <>
          <m.span className={styles.corners} animate={cornersAnimate}>
            {CORNER_CLASSES.map((cornerClass) => (
              <span
                key={cornerClass}
                className={`${styles.corner} ${cornerClass}`}
              />
            ))}
          </m.span>
          <video
            ref={videoRef}
            className={styles.video}
            muted
            playsInline
            aria-label={t("gatherings:door.scan.viewfinderAria")}
          />
        </>
      ) : null}
      <div
        className={`${styles.vfStack} ${
          !isLive && result ? styles.vfStackCovered : ""
        }`}
      >
        {isLive ? null : (
          <span className={styles.vfIcon}>
            <MdQrCodeScanner />
          </span>
        )}
        <span className={styles.vfHint}>{t(hintKey)}</span>
      </div>
      <div
        className={styles.resultLive}
        aria-live={result?.kind === "refused" ? "assertive" : "polite"}
      >
        <AnimatePresence mode="popLayout">
          {result ? (
            <CheckinScanResult
              key={result.kind}
              outcome={result}
              onDismiss={onDismiss}
              onUndo={onUndo}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
