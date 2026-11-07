import { useId, useState, type FormEvent, type RefObject } from "react";
import { FiAlertTriangle, FiMic, FiMinus, FiPlus } from "react-icons/fi";
import {
  VJ_LIMITS,
  type VjScreenStatus,
  type VjTempo,
  type VjTempoSource,
} from "../../../../shared/contracts/vj";
import { Collapse } from "../../../../shared/components/ui";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { VjCommandOutcome } from "../../live/vjStageCommands";
import { VjSheetAlert } from "../VjSheetAlert";
import {
  reportVjRefusal,
  type VjSendRefusal,
} from "../hooks/useVjOptimisticValue";
import { VjDockPopover } from "../kit/VjDockPopover";
import styles from "./VjDockRows.module.css";

export type VjTempoPatch = {
  bpm?: number;
  quantize?: VjTempo["quantize"];
  source?: VjTempoSource;
};

/** Clamped to the contract's 60..200 and rounded to one decimal place. */
function clampVjBpm(bpm: number): number {
  const clampedBpm = Math.min(
    VJ_LIMITS.bpmMax,
    Math.max(VJ_LIMITS.bpmMin, bpm),
  );
  return Math.round(clampedBpm * 10) / 10;
}

/** The typed field as a bpm, or null when it is no number inside 60..200. */
function parseVjBpm(text: string): number | null {
  const bpm = Number(text.trim().replace(",", "."));
  if (text.trim() === "" || !Number.isFinite(bpm)) return null;
  if (bpm < VJ_LIMITS.bpmMin || bpm > VJ_LIMITS.bpmMax) return null;
  return Math.round(bpm * 10) / 10;
}

export interface VjBpmPopoverProps {
  anchorRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  tempo: VjTempo | null;
  leadMic: VjScreenStatus["mic"];
  isBlocked: boolean;
  setTempo: (patch: VjTempoPatch) => Promise<VjCommandOutcome>;
}

/**
 * Tempo entry over the BPM readout: one BPM slower or faster, half and
 * double tempo, a typed BPM, and following the lead screen's mic. Every
 * BPM send is `setTempo({ bpm })` (the server marks it manual and re-anchors
 * the bar, contract 7.6). A refusal shows its named reason in place.
 */
export function VjBpmPopover(props: VjBpmPopoverProps) {
  const titleId = useId();
  return (
    <VjDockPopover
      anchorRef={props.anchorRef}
      isOpen={props.isOpen}
      onClose={props.onClose}
      labelledBy={titleId}
    >
      <VjBpmPopoverBody {...props} titleId={titleId} />
    </VjDockPopover>
  );
}

function VjBpmPopoverBody({
  titleId,
  onClose,
  tempo,
  leadMic,
  isBlocked,
  setTempo,
}: VjBpmPopoverProps & { titleId: string }) {
  const { t } = useTranslation();
  const format = useFormat();
  const fieldId = useId();
  const fieldErrorId = useId();
  const micNoteId = useId();
  const [fieldText, setFieldText] = useState(() =>
    tempo === null ? "" : String(tempo.bpm),
  );
  const [isFieldInvalid, setIsFieldInvalid] = useState(false);
  const [pendingBpm, setPendingBpm] = useState<number | null>(null);
  const [refusal, setRefusal] = useState<VjSendRefusal | null>(null);
  if (pendingBpm !== null && tempo?.bpm === pendingBpm) setPendingBpm(null);

  const isSendBlocked = isBlocked || tempo === null;
  const isMicMissing = leadMic === null;
  const shownBpm = pendingBpm ?? tempo?.bpm ?? null;

  const send = (patch: VjTempoPatch, shouldCloseOnSuccess: boolean) => {
    setRefusal(null);
    if (patch.bpm !== undefined) setPendingBpm(patch.bpm);
    void setTempo(patch).then((outcome) => {
      if (!outcome.ok) {
        setPendingBpm(null);
        reportVjRefusal(outcome, setRefusal);
        return;
      }
      if (outcome.isNoop) setPendingBpm(null);
      if (shouldCloseOnSuccess) onClose();
    });
  };
  const sendBpm = (bpm: number) => {
    if (isSendBlocked) return;
    send({ bpm: clampVjBpm(bpm) }, false);
  };
  const submitField = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSendBlocked) return;
    const bpm = parseVjBpm(fieldText);
    setIsFieldInvalid(bpm === null);
    if (bpm !== null) send({ bpm }, true);
  };
  const followMic = () => {
    if (isSendBlocked || isMicMissing) return;
    send({ source: "mic" }, true);
  };

  return (
    <div className={styles.popoverBody} data-vj-bpm-popover="">
      <p id={titleId} className={styles.popoverTitle}>
        {t("vj:tempo.label")}
      </p>
      <div className={styles.stepRow}>
        <button
          type="button"
          className={styles.chip}
          aria-label={t("vj:tempo.decrease")}
          aria-disabled={isSendBlocked || undefined}
          onClick={() => shownBpm !== null && sendBpm(shownBpm - 1)}
        >
          <FiMinus aria-hidden fill="none" />
        </button>
        <span className={styles.stepValue} aria-live="polite">
          {shownBpm === null
            ? ""
            : t("vj:tempo.bpmValue", {
                bpm: format.number(shownBpm, { maximumFractionDigits: 1 }),
              })}
        </span>
        <button
          type="button"
          className={styles.chip}
          aria-label={t("vj:tempo.increase")}
          aria-disabled={isSendBlocked || undefined}
          onClick={() => shownBpm !== null && sendBpm(shownBpm + 1)}
        >
          <FiPlus aria-hidden fill="none" />
        </button>
      </div>
      <div className={styles.popoverGrid}>
        <button
          type="button"
          className={styles.chip}
          aria-disabled={isSendBlocked || undefined}
          onClick={() => shownBpm !== null && sendBpm(shownBpm / 2)}
        >
          {t("vj:tempo.half")}
        </button>
        <button
          type="button"
          className={styles.chip}
          aria-disabled={isSendBlocked || undefined}
          onClick={() => shownBpm !== null && sendBpm(shownBpm * 2)}
        >
          {t("vj:tempo.double")}
        </button>
      </div>
      <form className={styles.bpmForm} noValidate onSubmit={submitField}>
        <label htmlFor={fieldId} className={styles.fieldLabel}>
          {t("vj:shuffle.bpmLabel")}
          <input
            id={fieldId}
            className={styles.field}
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            autoComplete="off"
            value={fieldText}
            aria-invalid={isFieldInvalid || undefined}
            aria-describedby={isFieldInvalid ? fieldErrorId : undefined}
            onChange={(event) => {
              setFieldText(event.currentTarget.value);
              setIsFieldInvalid(false);
            }}
          />
        </label>
        <button
          type="submit"
          className={styles.chip}
          aria-disabled={isSendBlocked || undefined}
        >
          {t("vj:tempo.setBpm")}
        </button>
      </form>
      <Collapse isOpen={isFieldInvalid}>
        <p id={fieldErrorId} className={`${styles.note} ${styles.fieldError}`}>
          <FiAlertTriangle aria-hidden fill="none" />
          <span>{t("vj:shuffle.bpmOutOfRange")}</span>
        </p>
      </Collapse>
      <button
        type="button"
        className={`${styles.chip} ${styles.wideChip}`}
        aria-pressed={tempo?.source === "mic"}
        aria-disabled={isSendBlocked || isMicMissing || undefined}
        aria-describedby={isMicMissing ? micNoteId : undefined}
        onClick={followMic}
      >
        <FiMic aria-hidden fill="none" />
        {t("vj:tempo.followMic")}
      </button>
      <Collapse isOpen={isMicMissing}>
        <p id={micNoteId} className={styles.note}>
          {t("vj:error.socket.micUnavailable")}
        </p>
      </Collapse>
      <VjSheetAlert
        errorKey={refusal?.errorKey ?? null}
        values={{ ...refusal?.errorValues }}
      />
    </div>
  );
}
