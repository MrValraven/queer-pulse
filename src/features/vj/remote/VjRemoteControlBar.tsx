import {
  useEffect,
  useId,
  useRef,
  useState,
  type JSX,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "motion/react";
import { FiMoon, FiShuffle, FiSliders, FiType } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import {
  VJ_LIMITS,
  type VjStageState,
  type VjTransitionMode,
} from "../../../shared/contracts/vj";
import { Button } from "../../../shared/components/ui/Button";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { VjCommandOutcome } from "../live/useVjStage";
import { VJ_FADE_SLIDER_THROTTLE_MS } from "../vj.constants";
import type { VjCommandName, useVjCommandRunner } from "./useVjCommandRunner";
import styles from "./VjRemote.module.css";

type VjRun = ReturnType<typeof useVjCommandRunner>["run"];

export type VjRemoteSheet = "effects" | "text" | "shuffle";

const FADE_SLIDER_STEP_MS = 100;
const BAR_FADE_SECONDS = 0.25;

/** Reports an element's border-box height whenever it changes, and 0 once it is gone. */
function useReportedHeight(
  onHeightChange: (heightPx: number) => void,
): (element: HTMLDivElement | null) => void {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (element === null || typeof ResizeObserver === "undefined") {
      onHeightChange(0);
      return undefined;
    }
    const observer = new ResizeObserver(() => {
      onHeightChange(element.getBoundingClientRect().height);
    });
    observer.observe(element);
    onHeightChange(element.getBoundingClientRect().height);
    return () => {
      observer.disconnect();
      onHeightChange(0);
    };
  }, [element, onHeightChange]);
  return setElement;
}

interface VjFadeSend {
  fadeMs: number;
  outcome: Promise<VjCommandOutcome>;
}

/**
 * The fade length slider: while dragging it sends `setTransition({ fadeMs })`
 * at most once per VJ_FADE_SLIDER_THROTTLE_MS, and once more on release with
 * the final value. The dragged value shows until the stage reaches the
 * revision of that last send, so the thumb never jumps back.
 */
function useVjFadeSlider(state: VjStageState | null, run: VjRun) {
  const [draftFadeMs, setDraftFadeMs] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [awaitedRevision, setAwaitedRevision] = useState<number | null>(null);
  const lastSentAtRef = useRef(Number.NEGATIVE_INFINITY);
  const lastSendRef = useRef<VjFadeSend | null>(null);
  const stageRevision = state?.revision ?? null;

  if (
    !isDragging &&
    awaitedRevision !== null &&
    stageRevision !== null &&
    stageRevision >= awaitedRevision
  ) {
    setAwaitedRevision(null);
    setDraftFadeMs(null);
  }

  const send = (fadeMs: number): Promise<VjCommandOutcome> => {
    lastSentAtRef.current = Date.now();
    const outcome = run("setTransition", { fadeMs });
    lastSendRef.current = { fadeMs, outcome };
    return outcome;
  };

  const change = (fadeMs: number) => {
    setIsDragging(true);
    setDraftFadeMs(fadeMs);
    if (Date.now() - lastSentAtRef.current >= VJ_FADE_SLIDER_THROTTLE_MS) {
      void send(fadeMs);
    }
  };

  const release = () => {
    if (!isDragging || draftFadeMs === null) return;
    setIsDragging(false);
    const lastSend = lastSendRef.current;
    const outcome =
      lastSend !== null && lastSend.fadeMs === draftFadeMs
        ? lastSend.outcome
        : send(draftFadeMs);
    void outcome.then((result) => {
      if (result.ok) {
        setAwaitedRevision(result.revision);
        return;
      }
      setDraftFadeMs(null);
    });
  };

  const fadeMs = draftFadeMs ?? state?.transition.fadeMs ?? 0;
  return { fadeMs, change, release };
}

interface VjTransitionControlsProps {
  state: VjStageState | null;
  isBlocked: boolean;
  run: VjRun;
}

/**
 * Fade or Cut with the fade length. The toggle holds only for its own
 * mode sends: the slider's throttled setTransition sends share the command
 * name, and a drag must leave the toggle's aria-disabled alone.
 */
function VjTransitionControls({
  state,
  isBlocked,
  run,
}: VjTransitionControlsProps): JSX.Element {
  const { t } = useTranslation();
  const format = useFormat();
  const slider = useVjFadeSlider(state, run);
  const sliderId = useId();
  const [modeSendCount, setModeSendCount] = useState(0);
  const mode = state?.transition.mode ?? null;
  const isModeBlocked = isBlocked || state === null || modeSendCount > 0;
  const isSliderBlocked = isBlocked || state === null;
  const secondsLabel = t("vj:remote.fadeSeconds", {
    seconds: format.number(slider.fadeMs / 1000, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }),
  });
  const chooseMode = (nextMode: VjTransitionMode) => {
    if (isModeBlocked || nextMode === mode) return;
    setModeSendCount((count) => count + 1);
    void run("setTransition", { mode: nextMode }).finally(() =>
      setModeSendCount((count) => count - 1),
    );
  };

  return (
    <div className={styles.transitionRow}>
      <div
        role="group"
        aria-label={t("vj:remote.transition")}
        className={styles.segmented}
      >
        {(["fade", "cut"] as const).map((segmentMode) => (
          <Button
            key={segmentMode}
            variant="stage-ghost"
            size="sm"
            className={styles.segment}
            aria-pressed={mode === segmentMode}
            aria-disabled={isModeBlocked}
            onClick={() => chooseMode(segmentMode)}
          >
            {t(segmentMode === "fade" ? "vj:remote.fade" : "vj:remote.cut")}
          </Button>
        ))}
      </div>
      <div className={styles.fadeSlider}>
        <label htmlFor={sliderId} className={styles.fadeSliderLabel}>
          {t("vj:remote.fadeLength")}
        </label>
        <input
          id={sliderId}
          type="range"
          className={styles.fadeSliderInput}
          min={0}
          max={VJ_LIMITS.fadeMsMax}
          step={FADE_SLIDER_STEP_MS}
          value={slider.fadeMs}
          aria-valuetext={secondsLabel}
          aria-disabled={isSliderBlocked}
          onChange={(event) => {
            if (isSliderBlocked) return;
            slider.change(Number(event.currentTarget.value));
          }}
          onPointerUp={slider.release}
          onPointerCancel={slider.release}
          onKeyUp={slider.release}
          onBlur={slider.release}
        />
        <output htmlFor={sliderId} className={styles.fadeSliderValue}>
          {secondsLabel}
        </output>
      </div>
    </div>
  );
}

interface VjRemoteControlBarProps {
  state: VjStageState | null;
  isBlocked: boolean;
  run: VjRun;
  isPending: (name: VjCommandName) => boolean;
  onOpenSheet: (sheet: VjRemoteSheet) => void;
  onHeightChange: (heightPx: number) => void;
  /** The status line, drawn at the bar's top so its height counts in the bar's. */
  statusLine?: ReactNode;
}

/**
 * The remote's fixed bottom bar, portaled to the body and standing on the
 * consent banner: Fade or Cut with the fade length, Blackout, and the
 * Effects, Text and Shuffle sheets. While the remote is blocked every
 * control is aria-disabled and a tap sends nothing.
 */
export function VjRemoteControlBar({
  state,
  isBlocked,
  run,
  isPending,
  onOpenSheet,
  onHeightChange,
  statusLine,
}: VjRemoteControlBarProps): JSX.Element {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const barRef = useReportedHeight(onHeightChange);
  const fade = { duration: reducedMotion ? 0 : BAR_FADE_SECONDS };
  const isBlackout = state?.effects.isBlackout ?? false;
  const isShuffleOn = state?.shuffle.isOn ?? false;
  const isBlackoutBlocked =
    isBlocked || state === null || isPending("setEffects");
  const isSheetBlocked = isBlocked || state === null;
  const openSheet = (sheet: VjRemoteSheet) => {
    if (!isSheetBlocked) onOpenSheet(sheet);
  };

  const bar = (
    <m.div
      ref={barRef}
      className={styles.bar}
      data-theme="dark"
      data-vj-remote-bar=""
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={fade}
    >
      <div className={styles.barInner}>
        {statusLine}
        <VjTransitionControls state={state} isBlocked={isBlocked} run={run} />
        <div className={styles.actionRow}>
          <Button
            variant="stage-ghost"
            className={styles.barAction}
            aria-pressed={isBlackout}
            aria-disabled={isBlackoutBlocked}
            onClick={() => {
              if (isBlackoutBlocked) return;
              void run("setEffects", { isBlackout: !isBlackout });
            }}
          >
            <FiMoon aria-hidden="true" focusable="false" />
            <span>{t("vj:remote.blackout")}</span>
          </Button>
          <Button
            variant="stage-ghost"
            className={styles.barAction}
            aria-haspopup="dialog"
            aria-disabled={isSheetBlocked}
            onClick={() => openSheet("effects")}
          >
            <FiSliders aria-hidden="true" focusable="false" />
            <span>{t("vj:remote.effects")}</span>
          </Button>
          <Button
            variant="stage-ghost"
            className={styles.barAction}
            aria-haspopup="dialog"
            aria-disabled={isSheetBlocked}
            onClick={() => openSheet("text")}
          >
            <FiType aria-hidden="true" focusable="false" />
            <span>{t("vj:remote.text")}</span>
          </Button>
          <Button
            variant="stage-ghost"
            className={styles.barAction}
            aria-haspopup="dialog"
            aria-disabled={isSheetBlocked}
            onClick={() => openSheet("shuffle")}
          >
            <span className={styles.barActionIcon}>
              <FiShuffle aria-hidden="true" focusable="false" />
              <AnimatePresence initial={false}>
                {isShuffleOn ? (
                  <m.span
                    key="shuffle-on"
                    className={styles.onDot}
                    data-vj-shuffle-on=""
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.4 }}
                    aria-hidden="true"
                    transition={fade}
                  />
                ) : null}
              </AnimatePresence>
            </span>
            <span>{t("vj:remote.shuffle")}</span>
            {isShuffleOn ? (
              <span className="visuallyHidden">{t("vj:shuffle.isOn")}</span>
            ) : null}
          </Button>
        </div>
      </div>
    </m.div>
  );

  return createPortal(bar, document.body);
}
