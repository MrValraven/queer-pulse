import type {
  VjAck,
  VjAttachPayload,
  VjAttachSuccess,
  VjClientCommandFields,
  VjClockSyncPayload,
  VjCommandSuccess,
  VjGoClipPayload,
  VjGoGeneratorPayload,
  VjLibraryChange,
  VjReauthAck,
  VjRecallScenePayload,
  VjRemoteCommandName,
  VjResetLookPayload,
  VjScreenAdvancePayload,
  VjScreenIdentifyFrame,
  VjScreenIdentifyPayload,
  VjScreenRenderModeFrame,
  VjScreenStatus,
  VjScreenStatusPayload,
  VjSetCountdownPayload,
  VjSetEffectsPayload,
  VjSetEventCardPayload,
  VjSetLogoPayload,
  VjSetMixPayload,
  VjSetOverlayPayload,
  VjSetPackPayload,
  VjSetRenderModePayload,
  VjSetScreenOverridePayload,
  VjSetShufflePayload,
  VjSetStrobePayload,
  VjSetTempoPayload,
  VjSetTransitionPayload,
  VjSetlistSelectPayload,
  VjSetlistSetLoopingPayload,
  VjSetlistSetPlayingPayload,
  VjSetlistStepPayload,
  VjStageFrame,
  VjSwapMixPayload,
} from "../../../shared/contracts/vj";

/** Payload types live in the contract (C 7.5); re-exported so importers of this file keep working. */
export type {
  VjClientCommandFields,
  VjSetPackPayload,
  VjGoClipPayload,
  VjGoGeneratorPayload,
  VjSetTransitionPayload,
  VjSetOverlayPayload,
  VjSetEffectsPayload,
  VjSetStrobePayload,
  VjSetShufflePayload,
  VjSetTempoPayload,
  VjSetMixPayload,
  VjSwapMixPayload,
  VjSetScreenOverridePayload,
  VjResetLookPayload,
  VjRecallScenePayload,
  VjSetlistSelectPayload,
  VjSetlistStepPayload,
  VjSetlistSetPlayingPayload,
  VjSetlistSetLoopingPayload,
  VjSetCountdownPayload,
  VjSetLogoPayload,
  VjSetEventCardPayload,
  VjScreenIdentifyPayload,
  VjSetRenderModePayload,
  VjScreenAdvancePayload,
  VjScreenStatusPayload,
};

/** v1 names, kept for importers. */
export type VjCommandStamp = VjClientCommandFields;
export type VjAdvancePayload = VjScreenAdvancePayload;

/** One entry per VJ_CLIENT_FRAME_NAMES member except screen:status (C 7.5). */
export interface VjClientFrameMap {
  "vj:attach": { payload: VjAttachPayload; success: VjAttachSuccess };
  "clock:sync": { payload: VjClockSyncPayload; success: Record<string, never> };
  "session:reauth": { payload: { ticket: string }; success: { exp: number } };
  "stage:setPack": { payload: VjSetPackPayload; success: VjCommandSuccess };
  "stage:goClip": { payload: VjGoClipPayload; success: VjCommandSuccess };
  "stage:goGenerator": {
    payload: VjGoGeneratorPayload;
    success: VjCommandSuccess;
  };
  "stage:setTransition": {
    payload: VjSetTransitionPayload;
    success: VjCommandSuccess;
  };
  "stage:setOverlay": {
    payload: VjSetOverlayPayload;
    success: VjCommandSuccess;
  };
  "stage:setEffects": {
    payload: VjSetEffectsPayload;
    success: VjCommandSuccess;
  };
  "stage:setStrobe": { payload: VjSetStrobePayload; success: VjCommandSuccess };
  "stage:setShuffle": {
    payload: VjSetShufflePayload;
    success: VjCommandSuccess;
  };
  "stage:setTempo": { payload: VjSetTempoPayload; success: VjCommandSuccess };
  "stage:setMix": { payload: VjSetMixPayload; success: VjCommandSuccess };
  "stage:swapMix": { payload: VjSwapMixPayload; success: VjCommandSuccess };
  "stage:setScreenOverride": {
    payload: VjSetScreenOverridePayload;
    success: VjCommandSuccess;
  };
  "stage:resetLook": {
    payload: VjResetLookPayload;
    success: VjCommandSuccess;
  };
  "stage:recallScene": {
    payload: VjRecallScenePayload;
    success: VjCommandSuccess;
  };
  "stage:setlistSelect": {
    payload: VjSetlistSelectPayload;
    success: VjCommandSuccess;
  };
  "stage:setlistNext": {
    payload: VjSetlistStepPayload;
    success: VjCommandSuccess;
  };
  "stage:setlistPrevious": {
    payload: VjSetlistStepPayload;
    success: VjCommandSuccess;
  };
  "stage:setlistSetPlaying": {
    payload: VjSetlistSetPlayingPayload;
    success: VjCommandSuccess;
  };
  "stage:setlistSetLooping": {
    payload: VjSetlistSetLoopingPayload;
    success: VjCommandSuccess;
  };
  "stage:setCountdown": {
    payload: VjSetCountdownPayload;
    success: VjCommandSuccess;
  };
  "stage:setLogo": { payload: VjSetLogoPayload; success: VjCommandSuccess };
  "stage:setEventCard": {
    payload: VjSetEventCardPayload;
    success: VjCommandSuccess;
  };
  "screen:identify": {
    payload: VjScreenIdentifyPayload;
    success: { identifiedCount: number };
  };
  "screens:setRenderMode": {
    payload: VjSetRenderModePayload;
    success: { reachedCount: number };
  };
  "screen:advance": {
    payload: VjScreenAdvancePayload;
    success: VjCommandSuccess;
  };
}

/** Every acked frame; screen:status goes through sendScreenStatus. */
export type VjClientFrameName = keyof VjClientFrameMap;
/** The 22 stamped remote commands (C 9.3). */
export type VjCommandFrameName = VjRemoteCommandName;
export type VjClientPayload<Name extends VjClientFrameName> =
  VjClientFrameMap[Name]["payload"];
/** A command's payload without its stamp. */
export type VjCommandPatch<Name extends VjCommandFrameName> = Omit<
  VjClientPayload<Name>,
  keyof VjClientCommandFields
>;
export type VjAckFor<Name extends VjClientFrameName> =
  Name extends "session:reauth"
    ? VjReauthAck
    : VjAck<VjClientFrameMap[Name]["success"]>;

export type VjServerFrame =
  | { event: "stage:state"; payload: VjStageFrame }
  | { event: "screen:role"; payload: { isLead: boolean } }
  | { event: "screens:update"; payload: { screens: VjScreenStatus[] } }
  | { event: "library:changed"; payload: VjLibraryChange }
  | { event: "screen:identify"; payload: VjScreenIdentifyFrame }
  | { event: "screen:renderMode"; payload: VjScreenRenderModeFrame };
