import { useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiMic } from "react-icons/fi";
import type {
  VjQuantize,
  VjScreenStatus,
  VjTempo,
} from "../../../../shared/contracts/vj";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { VjCommandOutcome } from "../../live/vjStageCommands";
import type { VjRemoteClock } from "../hooks/useVjRemoteClock";
import type { VjActionDispatch } from "../input/vjRemoteAction";
import { VjBeatDots } from "./VjBeatDots";
import { VjBpmPopover, type VjTempoPatch } from "./VjBpmPopover";
import { VjTapButton } from "./VjTapButton";
import styles from "./VjDockRows.module.css";

const VJ_QUANTIZE_KEY: Readonly<Record<VjQuantize, string>> = {
  off: "vj:tempo.quantizeOff",
  beat: "vj:tempo.quantizeBeat",
  bar: "vj:tempo.quantizeBar",
};

/** The app's ease-out token (--ease-out) at the fast duration (--dur-fast). */
const VJ_PRESS_TRANSITION = {
  duration: 0.15,
  ease: [0.16, 1, 0.3, 1] as const,
};
const VJ_PRESS_SQUEEZE = { scale: 0.92 };
const VJ_INSTANT = { duration: 0 };

export interface VjTempoBarProps {
  tempo: VjTempo | null;
  clock: VjRemoteClock;
  leadMic: VjScreenStatus["mic"];
  isBlocked: boolean;
  /** The status line naming why the controls are blocked, for aria-describedby. */
  blockedReasonId?: string;
  dispatch: VjActionDispatch;
  setTempo: (patch: VjTempoPatch) => Promise<VjCommandOutcome>;
}

/**
 * The dock's tempo bar, one row (44px, 40 in the pads strip): the BPM readout
 * (opens tempo entry), Tap, four beat dots on the synced clock, the Downbeat
 * chip whose "1" sets the bar's first beat to now, and the quantize chip.
 * Each chip with a value shows a small caption over it; the accessible names
 * stay on aria-label. Tap, the downbeat and quantize go through the
 * shared dispatcher (it keeps the tap register and stamps the downbeat with
 * the synced server time); the popover sends `setTempo` itself.
 */
export function VjTempoBar({
  tempo,
  clock,
  leadMic,
  isBlocked,
  blockedReasonId,
  dispatch,
  setTempo,
}: VjTempoBarProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const bpmButtonRef = useRef<HTMLButtonElement>(null);
  const [isBpmOpen, setIsBpmOpen] = useState(false);
  const bpmText =
    tempo === null
      ? null
      : format.number(tempo.bpm, { maximumFractionDigits: 1 });
  const quantize = tempo?.quantize ?? "off";
  const quantizeLabel = t(VJ_QUANTIZE_KEY[quantize]);
  const pressSqueeze =
    reducedMotion || isBlocked ? undefined : VJ_PRESS_SQUEEZE;
  const isSendBlocked = isBlocked || tempo === null;
  const blockedDescription = isBlocked ? blockedReasonId : undefined;

  return (
    <div
      className={styles.row}
      data-vj-tempo-bar=""
      role="group"
      aria-label={t("vj:tempo.label")}
    >
      <span className={styles.bpmCluster}>
        <button
          ref={bpmButtonRef}
          type="button"
          className={`${styles.chip} ${styles.captionChip}`}
          data-vj-bpm-chip=""
          aria-label={
            bpmText === null
              ? t("vj:tempo.label")
              : t("vj:tempo.bpmEdit", { bpm: bpmText })
          }
          aria-haspopup="dialog"
          aria-expanded={isBpmOpen}
          onClick={() => setIsBpmOpen((isOpen) => !isOpen)}
        >
          {bpmText === null ? (
            <span className={styles.chipValue}>{t("vj:tempo.label")}</span>
          ) : (
            <>
              <span className={styles.chipCaption} aria-hidden="true">
                {t("vj:shuffle.bpmLabel")}
              </span>
              <span
                className={`${styles.chipNumber} ${styles.bpmNumber}`}
                aria-hidden="true"
              >
                {bpmText}
              </span>
            </>
          )}
        </button>
        <VjMicBadge
          isShown={tempo?.source === "mic"}
          level={leadMic?.level ?? 0}
        />
      </span>
      <VjTapButton
        isBlocked={isSendBlocked}
        describedBy={blockedDescription}
        onTap={() => dispatch({ kind: "tapTempo" }, "press")}
      />
      <VjBeatDots tempo={tempo} clock={clock} />
      <m.button
        type="button"
        className={`${styles.chip} ${styles.captionChip} ${styles.downbeatChip}`}
        data-vj-downbeat=""
        aria-label={t("vj:tempo.downbeatAria")}
        aria-disabled={isSendBlocked || undefined}
        aria-describedby={blockedDescription}
        whileTap={pressSqueeze}
        transition={reducedMotion ? VJ_INSTANT : VJ_PRESS_TRANSITION}
        onClick={() => {
          if (!isSendBlocked) dispatch({ kind: "downbeat" }, "press");
        }}
      >
        <span className={styles.chipCaption} aria-hidden="true">
          {t("vj:tempo.downbeatCaption")}
        </span>
        <span
          className={`${styles.chipNumber} ${styles.downbeatNumber}`}
          aria-hidden="true"
        >
          {t("vj:tempo.downbeat")}
        </span>
      </m.button>
      <m.button
        type="button"
        className={`${styles.chip} ${styles.captionChip} ${styles.quantize}`}
        data-quantize={quantize}
        aria-label={t("vj:tempo.quantizeAria", { mode: quantizeLabel })}
        aria-disabled={isSendBlocked || undefined}
        aria-describedby={blockedDescription}
        whileTap={pressSqueeze}
        transition={reducedMotion ? VJ_INSTANT : VJ_PRESS_TRANSITION}
        onClick={() => {
          if (!isSendBlocked) dispatch({ kind: "cycleQuantize" }, "press");
        }}
      >
        <span className={styles.chipCaption} aria-hidden="true">
          {t("vj:tempo.quantize")}
        </span>
        <span className={styles.chipValue} aria-hidden="true">
          {quantizeLabel}
        </span>
      </m.button>
      <VjBpmPopover
        anchorRef={bpmButtonRef}
        isOpen={isBpmOpen}
        onClose={() => setIsBpmOpen(false)}
        tempo={tempo}
        leadMic={leadMic}
        isBlocked={isBlocked}
        setTempo={setTempo}
      />
    </div>
  );
}

/** The mic source badge beside the readout, with the lead's level as a 2px
 *  meter (a transform, so the level costs no layout). */
function VjMicBadge({ isShown, level }: { isShown: boolean; level: number }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const clampedLevel = Math.min(1, Math.max(0, level));
  return (
    <AnimatePresence initial={false}>
      {isShown && (
        <m.span
          key="vj-mic-badge"
          className={styles.micBadge}
          data-vj-mic-badge=""
          role="img"
          aria-label={t("vj:tempo.sourceMic")}
          title={t("vj:tempo.sourceMic")}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={reducedMotion ? VJ_INSTANT : VJ_PRESS_TRANSITION}
        >
          <FiMic aria-hidden fill="none" />
          <span className={styles.micMeter} aria-hidden="true">
            <span
              className={styles.micMeterFill}
              style={{ transform: `scaleX(${clampedLevel})` }}
            />
          </span>
        </m.span>
      )}
    </AnimatePresence>
  );
}
