import type {
  VjAck,
  VjAttachPayload,
  VjAttachSuccess,
  VjCommandSuccess,
  VjLibraryChange,
  VjOverlayStyle,
  VjScreenPreload,
  VjScreenStatus,
  VjShuffleIntervalKind,
  VjSpeed,
  VjStageFrame,
  VjTransitionMode,
} from "../../../shared/contracts/vj";

export interface VjCommandStamp {
  clientId: string;
  commandSequence: number;
}
export type VjSetPackPayload = { packId: string | null } & VjCommandStamp;
export type VjGoClipPayload = { clipId: string | null } & VjCommandStamp;
export type VjSetTransitionPayload = {
  mode?: VjTransitionMode;
  fadeMs?: number;
} & VjCommandStamp;
export type VjSetOverlayPayload = {
  text?: string;
  style?: VjOverlayStyle;
  isVisible?: boolean;
} & VjCommandStamp;
export type VjSetEffectsPayload = {
  speed?: VjSpeed;
  isMonochrome?: boolean;
  isMirrored?: boolean;
  isHueCycling?: boolean;
  isBlackout?: boolean;
} & VjCommandStamp;
export type VjSetStrobePayload = { isStrobing: boolean } & VjCommandStamp;
export type VjSetShufflePayload = {
  isOn?: boolean;
  intervalKind?: VjShuffleIntervalKind;
  intervalValue?: number;
  bpm?: number;
} & VjCommandStamp;
export interface VjAdvancePayload {
  expectedClipSequence: number;
  clipId: string;
}
export interface VjScreenStatusPayload {
  isFullscreen: boolean;
  preload: VjScreenPreload;
}

export interface VjClientFrameMap {
  "vj:attach": { payload: VjAttachPayload; success: VjAttachSuccess };
  "session:reauth": { payload: { ticket: string }; success: { exp: number } };
  "stage:setPack": { payload: VjSetPackPayload; success: VjCommandSuccess };
  "stage:goClip": { payload: VjGoClipPayload; success: VjCommandSuccess };
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
  "screen:advance": { payload: VjAdvancePayload; success: VjCommandSuccess };
}

/** Every acked frame; screen:status goes through sendScreenStatus. */
export type VjClientFrameName = keyof VjClientFrameMap;
export type VjCommandFrameName = Exclude<
  VjClientFrameName,
  "vj:attach" | "session:reauth" | "screen:advance"
>;
export type VjClientPayload<Name extends VjClientFrameName> =
  VjClientFrameMap[Name]["payload"];
export type VjAckFor<Name extends VjClientFrameName> = VjAck<
  VjClientFrameMap[Name]["success"]
>;

export type VjServerFrame =
  | { event: "stage:state"; payload: VjStageFrame }
  | { event: "screen:role"; payload: { isLead: boolean } }
  | { event: "screens:update"; payload: { screens: VjScreenStatus[] } }
  | { event: "library:changed"; payload: VjLibraryChange };
