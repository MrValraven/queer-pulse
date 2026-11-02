import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import { IconButton } from "../ui/IconButton";
import {
  measureViewport,
  type ViewportDebugRow,
} from "./viewportDebugMeasurements";
import styles from "./ViewportDebugReadout.module.css";

// How often the readout resamples while visible, on top of the event-driven
// samples, so values that change without an event (an iOS keyboard animation
// settling, a custom property written by another hook) still show up.
const SAMPLE_INTERVAL_MS = 500;

/**
 * Subscribes to every event that can move the viewport and resamples once per
 * animation frame at most. Returns the latest rows.
 */
function useViewportSamples(
  fixedProbeRef: RefObject<HTMLDivElement | null>,
  safeAreaProbeRef: RefObject<HTMLDivElement | null>,
): ViewportDebugRow[] {
  const [rows, setRows] = useState<ViewportDebugRow[]>([]);

  useEffect(() => {
    let pendingFrameId = 0;
    function scheduleSample() {
      if (pendingFrameId !== 0) return;
      pendingFrameId = window.requestAnimationFrame(() => {
        pendingFrameId = 0;
        setRows(
          measureViewport({
            fixedProbe: fixedProbeRef.current,
            safeAreaProbe: safeAreaProbeRef.current,
          }),
        );
      });
    }

    const visualViewport = window.visualViewport;
    const passiveListener = { passive: true } as const;
    visualViewport?.addEventListener("resize", scheduleSample);
    visualViewport?.addEventListener("scroll", scheduleSample, passiveListener);
    window.addEventListener("resize", scheduleSample);
    window.addEventListener("scroll", scheduleSample, passiveListener);
    document.addEventListener("focusin", scheduleSample);
    document.addEventListener("focusout", scheduleSample);
    const intervalId = window.setInterval(scheduleSample, SAMPLE_INTERVAL_MS);
    scheduleSample();

    return () => {
      visualViewport?.removeEventListener("resize", scheduleSample);
      visualViewport?.removeEventListener("scroll", scheduleSample);
      window.removeEventListener("resize", scheduleSample);
      window.removeEventListener("scroll", scheduleSample);
      document.removeEventListener("focusin", scheduleSample);
      document.removeEventListener("focusout", scheduleSample);
      window.clearInterval(intervalId);
      if (pendingFrameId !== 0) window.cancelAnimationFrame(pendingFrameId);
    };
  }, [fixedProbeRef, safeAreaProbeRef]);

  return rows;
}

/**
 * Hidden on-device viewport readout: a small translucent panel at the top of
 * the screen listing live viewport, keyboard and layout measurements, so a
 * member can screenshot the real numbers with the keyboard closed and open.
 * Turned on with `?viewport-debug=1` (see ViewportDebugGate.tsx). Reads only;
 * nothing is recorded or sent.
 */
export function ViewportDebugReadout({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const fixedProbeRef = useRef<HTMLDivElement>(null);
  const safeAreaProbeRef = useRef<HTMLDivElement>(null);
  const rows = useViewportSamples(fixedProbeRef, safeAreaProbeRef);

  // Portalled to <body> so the probes and the panel sit outside every app
  // wrapper and anchor to the viewport itself.
  return createPortal(
    <>
      <div ref={fixedProbeRef} className={styles.fixedProbe} aria-hidden />
      <div
        ref={safeAreaProbeRef}
        className={styles.safeAreaProbe}
        aria-hidden
      />
      <aside className={styles.panel} aria-label="viewport-debug">
        <IconButton
          aria-label={t("shared:modal.close")}
          tone="dark"
          size="sm"
          className={styles.closeButton}
          onClick={onClose}
        >
          <FiX aria-hidden />
        </IconButton>
        <dl className={styles.rows}>
          {rows.map((row) => (
            <div key={row.label} className={styles.row}>
              <dt className={styles.label}>{row.label}</dt>
              <dd className={styles.value}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </>,
    document.body,
  );
}
