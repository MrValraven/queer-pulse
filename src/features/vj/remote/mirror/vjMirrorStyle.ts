/**
 * Pure rules for the mirror band: which effects the mirror cannot draw, the
 * strobe chip's seconds, and the copy of the Live, Next and quantize lines.
 * The picture itself is drawn by the engine's own DOM pieces (VjEffectsFrame,
 * VjOverlayLayer), so nothing here restates an effect formula.
 */
import {
  VJ_EFFECT_CATALOG,
  VJ_LIMITS,
  type VjClipDTO,
  type VjEffectId,
  type VjEffectSettings,
  type VjEffects,
  type VjQuantize,
  type VjStageState,
} from "../../../../shared/contracts/vj";
import type { VjMirrorRing } from "../rules/vjMirrorRing";
import type { VjNextUp } from "../rules/vjNextUp";

/** A translation key with its named placeholder values. */
export interface VjMirrorCopy {
  key: string;
  values: Record<string, string | number>;
}

/** Effects on that the mirror cannot draw: on, with isDomCapable false in VJ_EFFECT_CATALOG (contract 3.2). */
export function vjMirrorUndrawnCount(settings: VjEffectSettings): number {
  let undrawnCount = 0;
  for (const [effectId, setting] of Object.entries(settings)) {
    if (setting === undefined || !setting.isOn) continue;
    const entry = VJ_EFFECT_CATALOG[effectId as VjEffectId] as
      (typeof VJ_EFFECT_CATALOG)[VjEffectId] | undefined;
    if (entry !== undefined && !entry.isDomCapable) undrawnCount += 1;
  }
  return undrawnCount;
}

/** Whole seconds left of the server's strobe, from its start time, clamped to the longest strobe. */
export function vjStrobeSecondsLeft(
  effects: Pick<VjEffects, "isStrobing" | "strobeStartedAt">,
  serverNowMs: number,
): number {
  if (!effects.isStrobing || effects.strobeStartedAt === null) return 0;
  const endsAt = effects.strobeStartedAt + VJ_LIMITS.strobeMaxDurationMs;
  const secondsLeft = Math.ceil((endsAt - serverNowMs) / 1000);
  const maxSeconds = VJ_LIMITS.strobeMaxDurationMs / 1000;
  return Math.min(maxSeconds, Math.max(0, secondsLeft));
}

/** The clip only when it is the one the state names, so a stale lookup never shows. */
export function vjMirrorClipFor(
  clip: VjClipDTO | null,
  clipId: string | null,
): VjClipDTO | null {
  if (clip === null || clipId === null) return null;
  return clip.id === clipId ? clip : null;
}

/** What the Live line names: the shown clip, the shown generator, or a black screen. */
export type VjMirrorLive =
  | { kind: "clip"; title: string }
  | { kind: "generator"; nameKey: string }
  | { kind: "black" };

export function vjMirrorLiveOf(
  shownState: VjStageState | null,
  liveClip: VjClipDTO | null,
): VjMirrorLive {
  if (shownState?.liveGeneratorId) {
    return {
      kind: "generator",
      nameKey: `vj:generator.name.${shownState.liveGeneratorId}`,
    };
  }
  const shownClip = vjMirrorClipFor(liveClip, shownState?.liveClipId ?? null);
  if (shownClip !== null) return { kind: "clip", title: shownClip.title };
  return { kind: "black" };
}

/**
 * What a waiting quantized change puts on the screens: the pending clip or
 * generator, once it differs from the shown one. Null with nothing waiting,
 * with the same source waiting, with a change to black, or while the pending
 * clip's title is still unknown, so the Next line keeps its next-up copy.
 */
export function vjMirrorPendingOf(
  shownState: VjStageState | null,
  pendingState: VjStageState | null,
  pendingClip: VjClipDTO | null,
): VjMirrorLive | null {
  if (pendingState === null) return null;
  const pendingGeneratorId = pendingState.liveGeneratorId;
  if (pendingGeneratorId) {
    if (pendingGeneratorId === shownState?.liveGeneratorId) return null;
    return {
      kind: "generator",
      nameKey: `vj:generator.name.${pendingGeneratorId}`,
    };
  }
  const pendingClipId = pendingState.liveClipId;
  const isSameClipShown =
    !shownState?.liveGeneratorId && pendingClipId === shownState?.liveClipId;
  if (pendingClipId === null || isSameClipShown) return null;
  const knownClip = vjMirrorClipFor(pendingClip, pendingClipId);
  return knownClip === null ? null : { kind: "clip", title: knownClip.title };
}

/**
 * The Next line from the next-up rule; the title is the clip title, scene
 * name or step name the page resolved. The last step of a sequence without
 * Loop reads "Last step".
 */
export function vjMirrorNextCopy(
  nextUp: VjNextUp,
  nextUpTitle: string | null,
): VjMirrorCopy {
  const title = nextUpTitle ?? "";
  switch (nextUp.kind) {
    case "cue":
      return { key: "vj:mirror.nextCue", values: { title } };
    case "setlist":
      return {
        key: "vj:mirror.nextSetlist",
        values: {
          position: nextUp.position,
          total: nextUp.total,
          name: title,
        },
      };
    case "setlistLast":
      return { key: "vj:mirror.nextSetlistLast", values: {} };
    case "shuffle":
      return { key: "vj:mirror.nextShuffle", values: { title } };
    case "none":
      return { key: "vj:mirror.nextNone", values: {} };
  }
}

/** The chip a waiting quantized change shows; null when the change lands unquantized. */
export function vjMirrorQuantizeKey(quantize: VjQuantize): string | null {
  if (quantize === "beat") return "vj:mirror.onNextBeat";
  if (quantize === "bar") return "vj:mirror.onNextBar";
  return null;
}

/** The ring's catalog key for each kind that counts down. */
function vjMirrorRingKeyOf(ring: Exclude<VjMirrorRing, { kind: "none" }>) {
  switch (ring.kind) {
    case "applyAt":
      return "vj:mirror.ringApply";
    case "setlist":
      return ring.isPaused
        ? "vj:mirror.ringSetlistPaused"
        : "vj:mirror.ringSetlist";
    case "shuffle":
      return "vj:mirror.ringShuffle";
  }
}

/**
 * The ring's spoken label; whole seconds, so it changes at most once a
 * second. A paused sequence names the time its step has left.
 */
export function vjMirrorRingCopy(ring: VjMirrorRing): VjMirrorCopy | null {
  if (ring.kind === "none") return null;
  const seconds = Math.ceil(ring.msLeft / 1000);
  return { key: vjMirrorRingKeyOf(ring), values: { seconds } };
}

/** Why the active sequence stopped moving, for the band's Next line and mark. */
export type VjMirrorSequenceStatus =
  | { kind: "paused" }
  | { kind: "takenOver" }
  /** The timer waits before a flashing step; `stepName` names it. */
  | { kind: "waitingFlash"; stepName: string }
  | { kind: "finished" };

/** The band's short status line for a sequence that stopped moving. */
export function vjMirrorSequenceCopy(
  status: VjMirrorSequenceStatus,
): VjMirrorCopy {
  switch (status.kind) {
    case "paused":
      return { key: "vj:mirror.sequencePaused", values: {} };
    case "takenOver":
      return { key: "vj:mirror.sequenceTakenOver", values: {} };
    case "waitingFlash":
      return {
        key: "vj:mirror.sequenceWaitingFlash",
        values: { step: status.stepName },
      };
    case "finished":
      return { key: "vj:mirror.sequenceFinished", values: {} };
  }
}

/**
 * A playing sequence's ring never counts more than its step's length: the
 * timer's early frame can stamp the step a moment ahead of the synced
 * clock, which read as 9 s on an 8 s step.
 */
export function vjMirrorRingWithinStep(
  ring: VjMirrorRing,
  stepDurationMs: number | null,
): VjMirrorRing {
  if (ring.kind !== "setlist" || stepDurationMs === null) return ring;
  if (ring.msLeft <= stepDurationMs) return ring;
  return { ...ring, msLeft: Math.max(0, stepDurationMs) };
}
