import { useMemo, useState } from "react";
import {
  VJ_LOOP_MODES,
  VJ_SPEEDS,
  type VjClipDTO,
  type VjLoopMode,
  type VjSpeed,
} from "../../../shared/contracts/vj";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useUpdateVjClip } from "../api/useVjClipMutations";
import {
  clampVjLoopSpan,
  vjLoopPatchOf,
  vjLoopSpanOf,
  type VjLoopSpan,
} from "./vjLoopPlayhead";

/** What the dialog's preview stage plays: the shown speed, the draft loop
 *  and the shown mode, so an edit is heard before it is saved. */
export interface VjPreviewPlayback {
  speed: number;
  span: VjLoopSpan | null;
  loopMode: VjLoopMode;
}

export interface VjClipPlaybackDraft {
  speed: VjSpeed;
  loopMode: VjLoopMode;
  /** The handles' positions (the draft); null for a GIF. */
  span: VjLoopSpan | null;
  isLoopChanged: boolean;
  /** The time the dragged handle points at while a drag lasts; null otherwise. */
  scrubMs: number | null;
  chooseSpeed: (value: string) => void;
  chooseLoopMode: (value: string) => void;
  moveHandle: (which: "in" | "out", ms: number) => void;
  releaseHandle: () => void;
  saveLoop: () => void;
  saveWholeClip: () => void;
  speedError: unknown;
  loopModeError: unknown;
  loopError: unknown;
  isSavingLoop: boolean;
  previewPlayback: VjPreviewPlayback;
}

function vjSpeedOf(value: string): VjSpeed | null {
  const speed = Number(value);
  return VJ_SPEEDS.find((candidate) => candidate === speed) ?? null;
}

function isVjLoopMode(value: string): value is VjLoopMode {
  return (VJ_LOOP_MODES as readonly string[]).includes(value);
}

function isSamePatch(
  first: { loopInMs: number | null; loopOutMs: number | null },
  second: { loopInMs: number | null; loopOutMs: number | null },
): boolean {
  return (
    first.loopInMs === second.loopInMs && first.loopOutMs === second.loopOutMs
  );
}

/**
 * The playback fields of Edit clip. Speed and loop mode save on choice and
 * show the chosen value until the answer lands (back to the stored one on a
 * refusal). Loop points are a draft that "Save loop" sends; each field has
 * its own write, so each names its own reason.
 */
export function useVjClipPlaybackDraft(clip: VjClipDTO): VjClipPlaybackDraft {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const updateSpeed = useUpdateVjClip();
  const updateLoopMode = useUpdateVjClip();
  const updateLoop = useUpdateVjClip();

  const [chosenSpeed, setChosenSpeed] = useState<VjSpeed | null>(null);
  if (chosenSpeed !== null && chosenSpeed === clip.defaultSpeed) {
    setChosenSpeed(null);
  }
  const speed = chosenSpeed ?? clip.defaultSpeed;

  const [chosenLoopMode, setChosenLoopMode] = useState<VjLoopMode | null>(null);
  if (chosenLoopMode !== null && chosenLoopMode === clip.loopMode) {
    setChosenLoopMode(null);
  }
  const loopMode = chosenLoopMode ?? clip.loopMode;

  const durationMs = clip.durationMs ?? 0;
  const storedSpan = vjLoopSpanOf(clip);
  const storedKey = `${clip.mediaKind}|${durationMs}|${clip.loopInMs}|${clip.loopOutMs}`;
  const [baselineKey, setBaselineKey] = useState(storedKey);
  const [baselineSpan, setBaselineSpan] = useState(storedSpan);
  const [span, setSpan] = useState(storedSpan);
  const [scrubMs, setScrubMs] = useState<number | null>(null);
  // Points saved elsewhere replace the handles only while they hold no edit.
  if (storedKey !== baselineKey) {
    setBaselineKey(storedKey);
    setBaselineSpan(storedSpan);
    const isUntouched =
      span === null ||
      baselineSpan === null ||
      isSamePatch(
        vjLoopPatchOf(span, durationMs),
        vjLoopPatchOf(baselineSpan, durationMs),
      );
    if (isUntouched) setSpan(storedSpan);
  }

  const isLoopChanged =
    span !== null &&
    storedSpan !== null &&
    !isSamePatch(
      vjLoopPatchOf(span, durationMs),
      vjLoopPatchOf(storedSpan, durationMs),
    );

  const chooseSpeed = (value: string) => {
    const nextSpeed = vjSpeedOf(value);
    if (nextSpeed === null || nextSpeed === speed) return;
    setChosenSpeed(nextSpeed);
    updateSpeed.mutate(
      { clipId: clip.id, defaultSpeed: nextSpeed },
      { onError: () => setChosenSpeed(null) },
    );
  };

  const chooseLoopMode = (value: string) => {
    if (!isVjLoopMode(value) || value === loopMode) return;
    setChosenLoopMode(value);
    updateLoopMode.mutate(
      { clipId: clip.id, loopMode: value },
      { onError: () => setChosenLoopMode(null) },
    );
  };

  const moveHandle = (which: "in" | "out", ms: number) => {
    if (span === null) return;
    const moved =
      which === "in" ? { ...span, inMs: ms } : { ...span, outMs: ms };
    const next = clampVjLoopSpan(moved, which, durationMs);
    setSpan(next);
    setScrubMs(which === "in" ? next.inMs : next.outMs);
    if (updateLoop.isError) updateLoop.reset();
  };

  const saveLoop = () => {
    if (span === null || !isLoopChanged || updateLoop.isPending) return;
    updateLoop.mutate(
      { clipId: clip.id, ...vjLoopPatchOf(span, durationMs) },
      {
        onSuccess: (updated) => {
          setSpan(vjLoopSpanOf(updated));
          showToast(t("vj:playback.loopSaved"), "success");
        },
      },
    );
  };

  const saveWholeClip = () => {
    if (updateLoop.isPending) return;
    updateLoop.mutate(
      { clipId: clip.id, loopInMs: null, loopOutMs: null },
      {
        onSuccess: (updated) => {
          setSpan(vjLoopSpanOf(updated));
          showToast(t("vj:playback.wholeClipSaved"), "success");
        },
      },
    );
  };

  const previewPlayback = useMemo<VjPreviewPlayback>(
    () => ({ speed, span, loopMode }),
    [speed, span, loopMode],
  );

  return {
    speed,
    loopMode,
    span,
    isLoopChanged,
    scrubMs,
    chooseSpeed,
    chooseLoopMode,
    moveHandle,
    releaseHandle: () => setScrubMs(null),
    saveLoop,
    saveWholeClip,
    speedError: updateSpeed.error,
    loopModeError: updateLoopMode.error,
    loopError: updateLoop.error,
    isSavingLoop: updateLoop.isPending,
    previewPlayback,
  };
}
