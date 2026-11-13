/**
 * The one dispatcher every remote input shares (plan R26, decision 10).
 * Touch, the keyboard and a MIDI controller each turn what the operator did
 * into a `VjRemoteAction`; this hook owns the optimistic highlight, the
 * rollback with its named reason, haptics, cue mode and the flash consent
 * gate (one consent per stage epoch for every flash-capable effect,
 * transition and the strobe). The per-kind work lives in
 * `vjRemoteActionHandlers.ts`.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  vjSceneLookFlashes,
  type VjClipDTO,
  type VjEffectId,
  type VjGeneratorId,
  type VjQuantize,
  type VjSceneDTO,
  type VjSetlistDTO,
  type VjTransitionId,
  type VjTransitionLength,
} from "../../../../shared/contracts/vj";
import { useVjClipFavorite } from "../../api/useVjClipFavorite";
import type {
  VjCommandOutcome,
  VjStageController,
} from "../../live/useVjStage";
import {
  VJ_DRAG_THROTTLE_MS,
  VJ_FADE_SLIDER_THROTTLE_MS,
} from "../../vj.constants";
import { vjErrorKeyOf } from "../../vjErrors";
import type { VjTileState } from "../grid/VjRemoteTile";
import type { VjCueMode } from "../hooks/useVjCueMode";
import type { VjFlashConsent } from "../hooks/useVjFlashConsent";
import {
  reportVjRefusal,
  useVjOptimisticValue,
  type VjSendRefusal,
} from "../hooks/useVjOptimisticValue";
import type { VjRemoteClock } from "../hooks/useVjRemoteClock";
import type { VjActionDispatch } from "../input/vjRemoteAction";
import type { VjPadId } from "../rules/vjDockPads";
import { vibrateVj } from "../rules/vjHaptics";
import { createVjTrailingSender } from "../rules/vjThrottle";
import type { VjRun } from "../useVjCommandRunner";
import {
  dispatchVjRemoteAction,
  handleAllEffectsOff,
  handleSetlistPlay,
  handleSetlistPlayFlashing,
  handleSetlistSetLooping,
  handleSetlistSkipFlashing,
  handleSetlistStep,
  handleSetlistStepThrough,
  handleSetlistStop,
  handleSetlistTogglePlaying,
  handleTouchPadSend,
  sendVjMixAmount,
  sendVjPad,
  sendVjTransitionLength,
  VJ_BLACKOUT_KEY,
  vjGeneratorKeyOf,
  vjPadKeyOf,
  vjSetlistLoopKeyOf,
  vjTileKeyOf,
  type VjHeldPad,
  type VjRemoteActionContext,
} from "./vjRemoteActionHandlers";

export const VJ_RESET_DONE_KEY = "vj:dock.resetDone";
export const VJ_RESET_DONE_MS = 2_500;
/** The optimistic key of the tempo's quantize. */
const VJ_QUANTIZE_KEY = "quantize";

/** A press waiting for the flash warning's confirm. */
export interface VjFlashConsentRequest {
  /** The pad that asked; null when a flash-capable transition asked. */
  padId: VjPadId | null;
  /** The transition mode that asked, for the confirm's label; null for a pad. */
  transitionMode: VjTransitionId | null;
  /** Set when a scene recall or a set list step asked: the scene's name, for the confirm's label. */
  sceneName?: string;
  /**
   * Set when a step whose look this remote cannot read asked (its scene or
   * its set list is not loaded): a catalog key that names it on the confirm,
   * such as vj:setlistItems.sceneGone or vj:strip.setlistNext.
   */
  sceneNameKey?: string;
  /**
   * Set when a sequence that plays itself asked (Play, Resume, Play again):
   * the sequence's name, for vj:flash.sequenceConfirm; null otherwise.
   */
  setlistName: string | null;
  anchor: HTMLElement | null;
}

/**
 * The sequence controls for touch: each takes the pressed button as the
 * flash warning's anchor. Keyboard and MIDI reach the same handlers through
 * `dispatch` with no anchor.
 */
export interface VjSetlistRemoteActions {
  play: (setlistId: string, anchor: HTMLElement | null) => void;
  stepThrough: (setlistId: string, anchor: HTMLElement | null) => void;
  /** Pause while playing, else Play, Resume or Play again. */
  togglePlaying: (anchor: HTMLElement | null) => void;
  step: (direction: "next" | "previous", anchor: HTMLElement | null) => void;
  setLooping: (isLooping: boolean) => void;
  stop: () => void;
  playFlashing: () => void;
  skipFlashing: () => void;
}

export interface VjRemoteActions {
  dispatch: VjActionDispatch;
  /** Touch path: the pad's own press machine decided; the anchor places the consent popover. */
  onPadSend: (
    padId: VjPadId,
    send: "on" | "off",
    anchor: HTMLElement | null,
  ) => void;
  padIsOn: (padId: VjPadId, serverIsOn: boolean) => boolean;
  padIsPending: (padId: VjPadId) => boolean;
  /** Turns every effect and a running strobe off in one go (the Effects on strip's All off). */
  turnAllEffectsOff: () => void;
  tileStateOf: (clipId: string) => Pick<VjTileState, "isPending" | "isArmed">;
  generatorIsPending: (generatorId: VjGeneratorId) => boolean;
  toggleFavorite: (clipId: string, isFavorite: boolean) => void;
  /** Set while a flash-capable press waits for consent; R27 renders VjFlashConsentPopover for it. */
  flashConsent: VjFlashConsentRequest | null;
  /** A flash-capable transition asks here (VjTransitionRow's onNeedFlashConsent). */
  requestFlashConsent: (
    anchor: HTMLElement | null,
    onConsented: () => void,
    transitionMode: VjTransitionId,
  ) => void;
  /**
   * A scene recall asks here: a look that flashes waits for the flash
   * warning unless this show already has consent; any other look runs
   * `onConsented` at once.
   */
  requestSceneFlashConsent: (
    scene: Pick<VjSceneDTO, "name" | "look">,
    anchor: HTMLElement | null,
    onConsented: () => void,
  ) => void;
  confirmFlash: () => void;
  dismissFlash: () => void;
  blackoutIsOn: (serverIsOn: boolean) => boolean;
  isBlackoutPending: boolean;
  setlist: VjSetlistRemoteActions;
  /** A sequence's Loop switch as shown: the pressed value until its ack lands. */
  setlistLoopIsOn: (setlistId: string, serverIsOn: boolean) => boolean;
  /** Whether that sequence's Loop switch waits for its ack. */
  isSetlistLoopPending: (setlistId: string) => boolean;
  /** vj:dock.resetDone for 2.5 s after a reset look lands; null otherwise. */
  infoKey: string | null;
}

export interface UseVjRemoteActionsOptions {
  stage: VjStageController;
  clock: VjRemoteClock;
  run: VjRun;
  /** The grid's shown order: slot indexes (keyboard, MIDI) resolve here. */
  visibleClips: readonly VjClipDTO[];
  dockPads: readonly VjEffectId[];
  cue: VjCueMode;
  flashConsent: VjFlashConsent;
  isBlocked: boolean;
  onRefused: (errorKey: string | null) => void;
  onOpenSheet: (sheet: "shortcuts") => void;
  /** The library's scenes and set lists, so a sequence's steps can be checked for flashes. */
  scenes?: readonly VjSceneDTO[];
  setlists?: readonly VjSetlistDTO[];
}

const NO_SCENES: readonly VjSceneDTO[] = [];
const NO_SETLISTS: readonly VjSetlistDTO[] = [];

interface VjPendingConsent extends VjFlashConsentRequest {
  /** A transition's or a scene's send, run once confirmed; null for a pad. */
  onConsented: (() => void) | null;
}

/** The info line key and how to show it for a while. */
function useVjTimedInfoKey(): {
  infoKey: string | null;
  showInfo: (key: string) => void;
} {
  const [infoKey, setInfoKey] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);
  const showInfo = useCallback((key: string) => {
    if (!isMountedRef.current) return;
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    setInfoKey(key);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setInfoKey(null);
    }, VJ_RESET_DONE_MS);
  }, []);
  return { infoKey, showInfo };
}

/** The crossfader and length senders: one per page, each trailing its last value. */
function useVjContinuousSenders(sends: {
  sendMix: (amount: number) => void;
  sendLength: (length: VjTransitionLength) => void;
}) {
  const [senders] = useState(() => ({
    crossfader: createVjTrailingSender<number>({
      intervalMs: VJ_DRAG_THROTTLE_MS,
      send: sends.sendMix,
    }),
    transitionLength: createVjTrailingSender<VjTransitionLength>({
      intervalMs: VJ_FADE_SLIDER_THROTTLE_MS,
      send: sends.sendLength,
    }),
  }));
  useEffect(
    () => () => {
      senders.crossfader.cancel();
      senders.transitionLength.cancel();
    },
    [senders],
  );
  return senders;
}

/**
 * The flash consent gate: one request at a time, from a pad, a transition or
 * a scene recall. Confirming records the show's consent and sends only while
 * the remote is still online.
 */
function useVjFlashConsentGate(
  optionsRef: RefObject<UseVjRemoteActionsOptions>,
  contextRef: RefObject<VjRemoteActionContext | null>,
) {
  const [consent, setConsent] = useState<VjPendingConsent | null>(null);
  const requestPadConsent = useCallback(
    (padId: VjPadId, anchor: HTMLElement | null) =>
      setConsent({
        padId,
        transitionMode: null,
        setlistName: null,
        anchor,
        onConsented: null,
      }),
    [],
  );
  const requestFlashConsent = useCallback(
    (
      anchor: HTMLElement | null,
      onConsented: () => void,
      transitionMode: VjTransitionId,
    ) => {
      if (optionsRef.current.flashConsent.hasConsented) {
        onConsented();
        return;
      }
      setConsent({
        padId: null,
        transitionMode,
        setlistName: null,
        anchor,
        onConsented,
      });
    },
    [optionsRef],
  );
  const requestSceneFlashConsent = useCallback(
    (
      scene: Pick<VjSceneDTO, "name" | "look">,
      anchor: HTMLElement | null,
      onConsented: () => void,
    ) => {
      const hasConsented = optionsRef.current.flashConsent.hasConsented;
      if (hasConsented || !vjSceneLookFlashes(scene.look)) {
        onConsented();
        return;
      }
      setConsent({
        padId: null,
        transitionMode: null,
        sceneName: scene.name,
        setlistName: null,
        anchor,
        onConsented,
      });
    },
    [optionsRef],
  );
  // The handlers decide a sequence needs the warning; this only asks it.
  const requestSetlistConsent = useCallback(
    (
      setlist: Pick<VjSetlistDTO, "name">,
      anchor: HTMLElement | null,
      onConsented: () => void,
    ) => {
      if (optionsRef.current.flashConsent.hasConsented) {
        onConsented();
        return;
      }
      setConsent({
        padId: null,
        transitionMode: null,
        setlistName: setlist.name,
        anchor,
        onConsented,
      });
    },
    [optionsRef],
  );
  // A step whose look this remote cannot read: the handler counts it as flashing.
  const requestStepConsent = useCallback(
    (
      stepNameKey: string,
      anchor: HTMLElement | null,
      onConsented: () => void,
    ) => {
      if (optionsRef.current.flashConsent.hasConsented) {
        onConsented();
        return;
      }
      setConsent({
        padId: null,
        transitionMode: null,
        sceneNameKey: stepNameKey,
        setlistName: null,
        anchor,
        onConsented,
      });
    },
    [optionsRef],
  );
  // A step the server refused as an unconfirmed flash: it asks whatever the
  // look here says, naming the step.
  const requestNamedStepConsent = useCallback(
    (stepName: string, anchor: HTMLElement | null, onConsented: () => void) => {
      if (optionsRef.current.flashConsent.hasConsented) {
        onConsented();
        return;
      }
      setConsent({
        padId: null,
        transitionMode: null,
        sceneName: stepName,
        setlistName: null,
        anchor,
        onConsented,
      });
    },
    [optionsRef],
  );
  const confirmFlash = useCallback(() => {
    if (consent === null) return;
    setConsent(null);
    optionsRef.current.flashConsent.consent();
    // The remote may have gone offline while the warning was open.
    const context = contextRef.current;
    if (context === null || context.isBlocked) return;
    if (consent.onConsented !== null) {
      consent.onConsented();
      return;
    }
    if (consent.padId === null) return;
    sendVjPad(context, consent.padId, "on");
  }, [consent, optionsRef, contextRef]);
  const dismissFlash = useCallback(() => setConsent(null), []);
  const shownConsent = useMemo<VjFlashConsentRequest | null>(
    () =>
      consent === null
        ? null
        : {
            padId: consent.padId,
            transitionMode: consent.transitionMode,
            sceneName: consent.sceneName,
            sceneNameKey: consent.sceneNameKey,
            setlistName: consent.setlistName,
            anchor: consent.anchor,
          },
    [consent],
  );
  return {
    consentPadId: consent?.padId ?? null,
    shownConsent,
    requestPadConsent,
    requestFlashConsent,
    requestSceneFlashConsent,
    requestSetlistConsent,
    requestStepConsent,
    requestNamedStepConsent,
    confirmFlash,
    dismissFlash,
  };
}

/** The sequence controls, each reading the newest render through the context. */
function useVjSetlistRemoteActions(
  contextRef: RefObject<VjRemoteActionContext | null>,
): VjSetlistRemoteActions {
  const play = useCallback(
    (setlistId: string, anchor: HTMLElement | null) => {
      const context = contextRef.current;
      if (context !== null) handleSetlistPlay(context, setlistId, anchor);
    },
    [contextRef],
  );
  const stepThrough = useCallback(
    (setlistId: string, anchor: HTMLElement | null) => {
      const context = contextRef.current;
      if (context !== null) {
        handleSetlistStepThrough(context, setlistId, anchor);
      }
    },
    [contextRef],
  );
  const togglePlaying = useCallback(
    (anchor: HTMLElement | null) => {
      const context = contextRef.current;
      if (context !== null) handleSetlistTogglePlaying(context, anchor);
    },
    [contextRef],
  );
  const step = useCallback(
    (direction: "next" | "previous", anchor: HTMLElement | null) => {
      const context = contextRef.current;
      if (context !== null) handleSetlistStep(context, direction, anchor);
    },
    [contextRef],
  );
  const setLooping = useCallback(
    (isLooping: boolean) => {
      const context = contextRef.current;
      if (context !== null) handleSetlistSetLooping(context, isLooping);
    },
    [contextRef],
  );
  const stop = useCallback(() => {
    const context = contextRef.current;
    if (context !== null) handleSetlistStop(context);
  }, [contextRef]);
  const playFlashing = useCallback(() => {
    const context = contextRef.current;
    if (context !== null) handleSetlistPlayFlashing(context);
  }, [contextRef]);
  const skipFlashing = useCallback(() => {
    const context = contextRef.current;
    if (context !== null) handleSetlistSkipFlashing(context);
  }, [contextRef]);
  return useMemo(
    () => ({
      play,
      stepThrough,
      togglePlaying,
      step,
      setLooping,
      stop,
      playFlashing,
      skipFlashing,
    }),
    [
      play,
      stepThrough,
      togglePlaying,
      step,
      setLooping,
      stop,
      playFlashing,
      skipFlashing,
    ],
  );
}

export function useVjRemoteActions(
  options: UseVjRemoteActionsOptions,
): VjRemoteActions {
  const { stage, clock, run, visibleClips, dockPads, cue, isBlocked } = options;
  const { flashConsent } = options;
  const state = stage.latestState;
  const stateRevision = state?.revision ?? null;
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  // The R5 hook already vibrated "refused"; this only names the reason.
  const reportRefusal = useCallback((refusal: VjSendRefusal) => {
    optionsRef.current.onRefused(refusal.errorKey);
  }, []);
  const reportOutcome = useCallback(
    (outcome: VjCommandOutcome) => {
      if (!outcome.ok) reportVjRefusal(outcome, reportRefusal);
    },
    [reportRefusal],
  );
  const tiles = useVjOptimisticValue<boolean>({
    stateRevision,
    onRefused: reportRefusal,
  });
  const pads = useVjOptimisticValue<boolean>({
    stateRevision,
    onRefused: reportRefusal,
  });
  const quantizes = useVjOptimisticValue<VjQuantize>({
    stateRevision,
    onRefused: reportRefusal,
  });
  const { infoKey, showInfo } = useVjTimedInfoKey();
  const { mutate: mutateFavorite } = useVjClipFavorite();
  const heldPadsRef = useRef(new Map<string, VjHeldPad>());
  const tapTimesRef = useRef<number[]>([]);
  const contextRef = useRef<VjRemoteActionContext | null>(null);
  const sendMix = useCallback(
    (amount: number) => sendVjMixAmount(contextRef.current, amount),
    [],
  );
  const sendLength = useCallback(
    (length: VjTransitionLength) =>
      sendVjTransitionLength(contextRef.current, length),
    [],
  );
  const senders = useVjContinuousSenders({ sendMix, sendLength });
  const consentGate = useVjFlashConsentGate(optionsRef, contextRef);
  const { requestPadConsent, requestSceneFlashConsent } = consentGate;
  const { requestSetlistConsent, requestStepConsent, requestNamedStepConsent } =
    consentGate;
  const currentState = useCallback(
    () => optionsRef.current.stage.latestState,
    [],
  );
  const setlistActions = useVjSetlistRemoteActions(contextRef);

  const onResetDone = useCallback(
    () => showInfo(VJ_RESET_DONE_KEY),
    [showInfo],
  );
  const onOpenSheet = useCallback(
    (sheet: "shortcuts") => optionsRef.current.onOpenSheet(sheet),
    [],
  );

  // Every handler reads the newest render through this context.
  useEffect(() => {
    contextRef.current = {
      run,
      state,
      currentState,
      serverNow: clock.serverNow,
      visibleClips,
      dockPads,
      cue,
      isBlocked,
      hasFlashConsent: flashConsent.hasConsented,
      consentPadId: consentGate.consentPadId,
      applyTile: tiles.apply,
      applyPad: pads.apply,
      padValueOf: pads.valueOf,
      applyQuantize: (value, send) =>
        quantizes.apply(VJ_QUANTIZE_KEY, value, send),
      quantizeValueOf: (serverValue) =>
        quantizes.valueOf(VJ_QUANTIZE_KEY, serverValue),
      scenes: options.scenes ?? NO_SCENES,
      setlists: options.setlists ?? NO_SETLISTS,
      heldPads: heldPadsRef.current,
      tapTimes: tapTimesRef,
      crossfader: senders.crossfader,
      transitionLength: senders.transitionLength,
      requestPadConsent,
      requestSceneConsent: requestSceneFlashConsent,
      requestSetlistConsent,
      requestStepConsent,
      requestNamedStepConsent,
      reportOutcome,
      onResetDone,
      onOpenSheet,
    };
  });

  const dispatch = useCallback<VjActionDispatch>((action, phase) => {
    const context = contextRef.current;
    if (context !== null) dispatchVjRemoteAction(context, action, phase);
  }, []);
  const onPadSend = useCallback(
    (padId: VjPadId, send: "on" | "off", anchor: HTMLElement | null) => {
      const context = contextRef.current;
      if (context !== null) handleTouchPadSend(context, padId, send, anchor);
    },
    [],
  );
  const turnAllEffectsOff = useCallback(() => {
    const context = contextRef.current;
    if (context !== null) handleAllEffectsOff(context);
  }, []);

  const toggleFavorite = useCallback(
    (clipId: string, isFavorite: boolean) => {
      mutateFavorite(
        { clipId, isFavorite },
        {
          onError: (cause) => {
            vibrateVj("refused");
            optionsRef.current.onRefused(vjErrorKeyOf(cause));
          },
        },
      );
    },
    [mutateFavorite],
  );

  const { valueOf: padValueOf, isPending: isPadKeyPending } = pads;
  const { isPending: isTileKeyPending } = tiles;
  const padIsOn = useCallback(
    (padId: VjPadId, serverIsOn: boolean) =>
      padValueOf(vjPadKeyOf(padId), serverIsOn),
    [padValueOf],
  );
  const padIsPending = useCallback(
    (padId: VjPadId) => isPadKeyPending(vjPadKeyOf(padId)),
    [isPadKeyPending],
  );
  const blackoutIsOn = useCallback(
    (serverIsOn: boolean) => padValueOf(VJ_BLACKOUT_KEY, serverIsOn),
    [padValueOf],
  );
  const setlistLoopIsOn = useCallback(
    (setlistId: string, serverIsOn: boolean) =>
      padValueOf(vjSetlistLoopKeyOf(setlistId), serverIsOn),
    [padValueOf],
  );
  const isSetlistLoopPending = useCallback(
    (setlistId: string) => isPadKeyPending(vjSetlistLoopKeyOf(setlistId)),
    [isPadKeyPending],
  );
  const armedClipId = cue.armedClipId;
  const tileStateOf = useCallback(
    (clipId: string) => ({
      isPending: isTileKeyPending(vjTileKeyOf(clipId)),
      isArmed: armedClipId === clipId,
    }),
    [isTileKeyPending, armedClipId],
  );
  const generatorIsPending = useCallback(
    (generatorId: VjGeneratorId) =>
      isTileKeyPending(vjGeneratorKeyOf(generatorId)),
    [isTileKeyPending],
  );
  return {
    dispatch,
    onPadSend,
    padIsOn,
    padIsPending,
    turnAllEffectsOff,
    tileStateOf,
    generatorIsPending,
    toggleFavorite,
    flashConsent: consentGate.shownConsent,
    requestFlashConsent: consentGate.requestFlashConsent,
    requestSceneFlashConsent,
    confirmFlash: consentGate.confirmFlash,
    dismissFlash: consentGate.dismissFlash,
    blackoutIsOn,
    isBlackoutPending: isPadKeyPending(VJ_BLACKOUT_KEY),
    setlist: setlistActions,
    setlistLoopIsOn,
    isSetlistLoopPending,
    infoKey,
  };
}

export interface UseVjSceneRecallOptions {
  run: VjRun;
  isBlocked: boolean;
  onRefused: (errorKey: string | null) => void;
  requestSceneFlashConsent: VjRemoteActions["requestSceneFlashConsent"];
}

/**
 * A one-off scene recall from the strip: the flash warning first when the
 * look flashes, then the send with the chip pending until its ack. An older
 * recall's ack leaves a newer recall's pending mark alone.
 */
export function useVjSceneRecall(options: UseVjSceneRecallOptions): {
  pendingSceneId: string | null;
  recalledSceneId: string | null;
  recallScene: (
    scene: Pick<VjSceneDTO, "id" | "name" | "look">,
    anchor: HTMLElement | null,
  ) => void;
} {
  const [pendingSceneId, setPendingSceneId] = useState<string | null>(null);
  const [recalledSceneId, setRecalledSceneId] = useState<string | null>(null);
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });
  const recallScene = useCallback(
    (
      scene: Pick<VjSceneDTO, "id" | "name" | "look">,
      anchor: HTMLElement | null,
    ) => {
      if (optionsRef.current.isBlocked) return;
      const sendRecall = () => {
        const { run, onRefused } = optionsRef.current;
        setPendingSceneId(scene.id);
        void run("recallScene", scene.id).then((outcome) => {
          setPendingSceneId((currentId) =>
            currentId === scene.id ? null : currentId,
          );
          if (outcome.ok) setRecalledSceneId(scene.id);
          else onRefused(outcome.errorKey);
        });
      };
      optionsRef.current.requestSceneFlashConsent(scene, anchor, sendRecall);
    },
    [],
  );
  return { pendingSceneId, recalledSceneId, recallScene };
}
