import { useCallback, useId, useState } from "react";
import { FiRepeat, FiXCircle } from "react-icons/fi";
import { Button, Collapse } from "../../../../../shared/components/ui";
import type {
  VjBlendMode,
  VjClipDTO,
  VjMix,
} from "../../../../../shared/contracts/vj";
import type { TranslateOptions } from "../../../../../shared/i18n/types";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type { VjCommandOutcome } from "../../../live/vjStageCommands";
import { useVjOptimisticValue } from "../../hooks/useVjOptimisticValue";
import { VjCrossfader } from "../../kit/VjCrossfader";
import { VjSheetFrame } from "../../kit/VjSheetFrame";
import { useVjMidiLearnTarget } from "../../midi/useVjMidiLearnTarget";
import type { VjRun } from "../../useVjCommandRunner";
import { VjSheetAlert } from "../../VjSheetAlert";
import { useVjCrossfaderSend, type VjMixPatch } from "./useVjCrossfaderSend";
import { VjBlendModeChips } from "./VjBlendModeChips";
import { VjMixClipPicker } from "./VjMixClipPicker";
import styles from "./VjMixSheet.module.css";

const MIX_CLIP_KEY = "mix.clipId";
const BLEND_MODE_KEY = "mix.blendMode";

interface VjSheetAlertLine {
  key: string | null;
  values?: TranslateOptions;
}

/** Swap mix and live, then Clear the mix. Both hold themselves, and say
 *  why, while the mix layer is empty, so `vj_mix_empty` never fires. */
function VjMixActions({
  hasMixClip,
  isSwapHeld,
  isBlocked,
  onSwap,
  onClear,
}: {
  hasMixClip: boolean;
  isSwapHeld: boolean;
  isBlocked: boolean;
  onSwap: () => void;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  const noClipHintId = useId();
  const describedBy = hasMixClip ? undefined : noClipHintId;
  const isClearHeld = isBlocked || !hasMixClip;
  return (
    <div className={styles.actions}>
      <div className={styles.actionRow}>
        <Button
          variant="stage"
          className={styles.actionButton}
          aria-disabled={isSwapHeld}
          aria-describedby={describedBy}
          onClick={() => {
            if (!isSwapHeld) onSwap();
          }}
        >
          <FiRepeat aria-hidden fill="none" />
          {t("vj:mix.swap")}
        </Button>
        <Button
          variant="stage-ghost"
          className={styles.actionButton}
          aria-disabled={isClearHeld}
          aria-describedby={describedBy}
          onClick={() => {
            if (!isClearHeld) onClear();
          }}
        >
          <FiXCircle aria-hidden fill="none" />
          {t("vj:mix.clear")}
        </Button>
      </div>
      <Collapse isOpen={!hasMixClip}>
        <p id={noClipHintId} className={styles.hint}>
          {t("vj:mix.noClip")}
        </p>
      </Collapse>
    </div>
  );
}

export interface VjMixSheetProps {
  /** `stage.latestState.mix`. */
  mix: VjMix;
  /** The active pack's clips, in pack order. */
  packClips: readonly VjClipDTO[];
  /** `stage.latestState.liveClipId`. */
  liveClipId: string | null;
  /** `stage.latestState?.revision ?? null`. */
  stateRevision: number | null;
  run: VjRun;
  isBlocked: boolean;
  onClose: () => void;
}

/**
 * The Mix sheet: the crossfader between the live source and the mix clip,
 * Swap mix and live, Clear the mix, the mix clip picker and the blend modes.
 * Every send goes through `run`; a picked clip or mode shows at once and
 * rolls back on a refusal, which names its reason in the sheet's alert.
 */
export function VjMixSheet({
  mix,
  packClips,
  liveClipId,
  stateRevision,
  run,
  isBlocked,
  onClose,
}: VjMixSheetProps) {
  const { t } = useTranslation();
  const [alertLine, setAlertLine] = useState<VjSheetAlertLine>({ key: null });
  const [isSwapping, setIsSwapping] = useState(false);
  const clipOptimistic = useVjOptimisticValue<string | null>({ stateRevision });
  const blendOptimistic = useVjOptimisticValue<VjBlendMode>({ stateRevision });
  const { learnProps, isPickable } = useVjMidiLearnTarget({
    kind: "crossfader",
  });

  const noteOutcome = useCallback((outcome: VjCommandOutcome) => {
    setAlertLine(
      outcome.ok
        ? { key: null }
        : { key: outcome.errorKey, values: { ...outcome.errorValues } },
    );
    return outcome;
  }, []);

  const sendMix = useCallback(
    (patch: VjMixPatch) => run("setMix", patch).then(noteOutcome),
    [run, noteOutcome],
  );

  const crossfader = useVjCrossfaderSend({
    mix,
    stateRevision,
    isBlocked,
    setMix: sendMix,
  });

  const shownMixClipId = clipOptimistic.valueOf(MIX_CLIP_KEY, mix.clipId);
  const shownBlendMode = blendOptimistic.valueOf(BLEND_MODE_KEY, mix.blendMode);
  const hasMixClip = shownMixClipId !== null;

  const sendClip = (clipId: string | null) => {
    if (isBlocked) return;
    void clipOptimistic.apply(MIX_CLIP_KEY, clipId, () => sendMix({ clipId }));
  };

  const sendBlendMode = (blendMode: VjBlendMode) => {
    if (isBlocked) return;
    void blendOptimistic.apply(BLEND_MODE_KEY, blendMode, () =>
      sendMix({ blendMode }),
    );
  };

  const swapMix = async () => {
    if (isBlocked || isSwapping || !hasMixClip) return;
    setIsSwapping(true);
    noteOutcome(await run("swapMix"));
    setIsSwapping(false);
  };

  return (
    <VjSheetFrame
      title={t("vj:mix.title")}
      closeLabel={t("vj:mix.close")}
      onClose={onClose}
    >
      <div className={styles.sheetBody} data-vj-mix-sheet="">
        <div className={styles.faderRow} {...learnProps}>
          <VjCrossfader
            value={crossfader.value}
            onChange={crossfader.change}
            onRelease={crossfader.release}
            isBlocked={isBlocked || isPickable}
            hasMixClip={hasMixClip}
          />
        </div>
        <VjMixActions
          hasMixClip={hasMixClip}
          isSwapHeld={isBlocked || isSwapping || !hasMixClip}
          isBlocked={isBlocked}
          onSwap={() => void swapMix()}
          onClear={() => sendClip(null)}
        />
        <VjSheetAlert errorKey={alertLine.key} values={alertLine.values} />
        <VjMixClipPicker
          packClips={packClips}
          liveClipId={liveClipId}
          mixClipId={shownMixClipId}
          isBlocked={isBlocked}
          onPick={sendClip}
        />
        <VjBlendModeChips
          blendMode={shownBlendMode}
          isBlocked={isBlocked}
          onPick={sendBlendMode}
        />
      </div>
    </VjSheetFrame>
  );
}
