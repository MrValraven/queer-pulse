import { useLayoutEffect, useState } from "react";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowClientState } from "../realtime/quizshowClientStore";
import { QuizshowScreenStage } from "../screen/QuizshowScreenStage";
import styles from "./QuizshowRemote.module.css";

/** The stage is laid out at this size, then scaled to fit the 16:9 frame. */
const CANVAS_WIDTH_PX = 1280;

/** The scale that fits the fixed-width canvas into the frame; the callback ref re-measures every time the frame mounts. */
function useCanvasScale() {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    if (frame === null) return undefined;
    const measure = () => {
      if (frame.clientWidth > 0) setScale(frame.clientWidth / CANVAS_WIDTH_PX);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [frame]);
  return { frameRef: setFrame, scale };
}

/** Demo only: what the big screen shows right now, small and 16:9, above the controls. Null live. */
export function QuizshowRemotePreview({
  state,
  clockOffsetMs,
}: {
  state: QuizshowClientState | null;
  clockOffsetMs: number;
}) {
  const { t } = useTranslation();
  const { frameRef, scale } = useCanvasScale();
  return (
    <Collapse isOpen={state !== null}>
      <section aria-label={t("quizshow:remote.preview")}>
        {/* The big screen defaults to its dark theme, so the preview does too.
            Hidden from assistive tech: the remote already speaks the phase and
            the countdown, so the stage's own live regions would say them twice. */}
        <div
          ref={frameRef}
          className={styles.previewFrame}
          data-theme="dark"
          aria-hidden="true"
        >
          <div
            data-testid="remote-preview-canvas"
            className={styles.previewCanvas}
            style={{ transform: `scale(${scale})` }}
          >
            {state !== null && (
              <QuizshowScreenStage
                state={state}
                clockOffsetMs={clockOffsetMs}
                size="screen"
                isFixedCanvas
              />
            )}
          </div>
        </div>
      </section>
    </Collapse>
  );
}
