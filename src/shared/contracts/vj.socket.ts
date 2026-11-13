/**
 * VJ wire contract (C 3), frontend mirror of
 * `queerpulse-backend/src/vj/vj.contract.ts` and `vj-response.ts`. Names and
 * values match it; edit both together.
 * Socket.io namespace /vj: acks (C 7.2), attach (C 7.1), stage frames
 * (C 7.4), client payloads (C 7.5), server frames (C 7.8), library changes
 * (C 7.10) and the frame name lists (C 9.3).
 */

import type { VjSocketErrorCode, VjWsTransportCode } from "./vj.codes";
import type { VjEffectId, VjEffectSetting, VjGeneratorId } from "./vj.effects";
import type {
  VjAttachRole,
  VjBlendMode,
  VjColorToken,
  VjEventCardKind,
  VjLogoCorner,
  VjOverlayPosition,
  VjOverlaySize,
  VjOverlayStyle,
  VjQuantize,
  VjRenderMode,
  VjShuffleIntervalKind,
  VjShuffleSource,
  VjSpeed,
  VjStageCause,
  VjTempoSource,
  VjTransitionId,
} from "./vj.lists";
import type {
  VjScreenOverride,
  VjStageRestore,
  VjStageState,
  VjTransitionLength,
} from "./vj.state";
import type {
  VjScreenHealth,
  VjScreenMicReport,
  VjScreenPreload,
} from "./vj.status";

/**
 * `exception` frame: handshake refusals and FORBIDDEN after a lost admin role
 * (then disconnect), TOKEN_EXPIRED (then disconnect), and payloads the
 * ValidationPipe rejects (the socket stays up and gets no ack).
 */
export interface VjExceptionFrame {
  status: "error";
  code: VjWsTransportCode;
  message: unknown;
  /** "vj_not_admin" on a role refusal, "vj_screen_replaced" on a replaced
   *  screen, "vj_stopped" on a connection stopped from the VJ library. */
  domainCode?: string;
  statusCode?: number;
}

// Acks (C 7.2): every ack carries the server's clock

export type VjAck<Success extends object = Record<string, never>> =
  ({ ok: true; serverNow: number } & Success) | VjAckFailure;

export interface VjAckFailure {
  ok: false;
  code: VjSocketErrorCode;
  /** English, for logs; the frontend maps `code` to copy. */
  message: string;
  /** Carried on the codes C 7.11 marks "state", so the sender can snap to it. */
  state?: VjStageState;
  /** Server epoch ms (Date.now()) when the ack was built. */
  serverNow: number;
}

/** Success ack of every stage command. */
export interface VjCommandSuccess {
  /** The state's revision after this command. */
  revision: number;
  /** True when nothing changed (nothing broadcast, revision unchanged). */
  isNoop: boolean;
  /** Server epoch ms this change lands on screens; null when it applies at once, and on a noop. */
  applyAt: number | null;
}

export type VjReauthAck =
  | { ok: true; exp: number; serverNow: number }
  | { ok: false; code: VjWsTransportCode; serverNow: number };

// Attach (C 7.1)

export type VjAttachPayload =
  | {
      role: "screen";
      contractVersion: number;
      screenId: string;
      restoreState: VjStageRestore | null;
    }
  | { role: "remote"; contractVersion: number };

export interface VjAttachSuccess {
  role: VjAttachRole;
  /** Epoch ms, exp * 1000. */
  connectionExpiresAt: number;
  stageEpoch: string;
  /** Screen only: whether this attach seeded the stage from restoreState. */
  isRestored: boolean;
  /** Screen only: whether this screen leads now; null for a remote. */
  isLead: boolean | null;
  /** Screen only: this screen's 1-based number ("Screen 2"); null for a remote. */
  screenNumber: number | null;
}

// Stage frame (C 7.4)

export interface VjStageFrame {
  state: VjStageState;
  cause: VjStageCause;
  /** The clientId whose command caused this; null for every other cause. */
  sourceClientId: string | null;
  /** Server epoch ms every client applies this state at; null applies at once. */
  applyAt: number | null;
}

// Client payloads (C 7.5)

export interface VjClientCommandFields {
  clientId: string;
  commandSequence: number;
}

export type VjSetPackPayload = {
  packId: string | null;
} & VjClientCommandFields;
export type VjGoClipPayload = { clipId: string | null } & VjClientCommandFields;
export type VjGoGeneratorPayload = {
  generatorId: VjGeneratorId | null;
  variant?: string | null;
} & VjClientCommandFields;
export type VjSetTransitionPayload = {
  mode?: VjTransitionId;
  length?: VjTransitionLength;
} & VjClientCommandFields;
export type VjSetOverlayPayload = {
  text?: string;
  style?: VjOverlayStyle;
  isVisible?: boolean;
  position?: VjOverlayPosition;
  size?: VjOverlaySize;
  colorToken?: VjColorToken;
  /** 1000..600000 sets hideAt from when the overlay shows; null turns auto-hide off. */
  hideAfterMs?: number | null;
} & VjClientCommandFields;
/** One effect's patch; absent fields keep the current value (or the catalog default). */
export type VjEffectSettingPatch = Partial<VjEffectSetting>;
export type VjSetEffectsPayload = {
  speed?: VjSpeed;
  isBlackout?: boolean;
  /** null resets that effect to its off default. */
  settings?: Partial<Record<VjEffectId, VjEffectSettingPatch | null>>;
  isImmediate?: boolean;
} & VjClientCommandFields;
export type VjSetStrobePayload = {
  isStrobing: boolean;
  isImmediate?: boolean;
} & VjClientCommandFields;
export type VjSetShufflePayload = {
  isOn?: boolean;
  intervalKind?: VjShuffleIntervalKind;
  intervalValue?: number;
  source?: VjShuffleSource;
  /** Replaces the whole list. */
  excludedClipIds?: string[];
} & VjClientCommandFields;
export type VjSetTempoPayload = {
  bpm?: number;
  downbeatAt?: number;
  quantize?: VjQuantize;
  source?: VjTempoSource;
} & VjClientCommandFields;
export type VjSetMixPayload = {
  clipId?: string | null;
  amount?: number;
  blendMode?: VjBlendMode;
} & VjClientCommandFields;
export type VjSwapMixPayload = VjClientCommandFields;
export type VjSetScreenOverridePayload = {
  screenId: string;
  override: VjScreenOverride | null;
} & VjClientCommandFields;
export type VjResetLookPayload = {
  isImmediate?: boolean;
} & VjClientCommandFields;
export type VjRecallScenePayload = { sceneId: string } & VjClientCommandFields;
/** `stage:setlistSelect`: index null arms; isPlaying true plays from index (null reads as 0). */
export type VjSetlistSelectPayload = {
  setlistId: string | null;
  index: number | null;
  isPlaying?: boolean;
  isFlashConfirmed?: boolean;
} & VjClientCommandFields;
/** `stage:setlistSetPlaying`: Play, Pause, Resume and Play again. */
export type VjSetlistSetPlayingPayload = {
  isPlaying: boolean;
  isFlashConfirmed?: boolean;
} & VjClientCommandFields;
/** `stage:setlistSetLooping`: saves Loop on the active set list. */
export type VjSetlistSetLoopingPayload = {
  isLooping: boolean;
} & VjClientCommandFields;
/** `stage:setlistNext` and `stage:setlistPrevious`: isFlashConfirmed records
 *  the flash warning consent for the step the tap lands. */
export type VjSetlistStepPayload = {
  isFlashConfirmed?: boolean;
} & VjClientCommandFields;
export type VjSetCountdownPayload = {
  isVisible?: boolean;
  /** Absolute server epoch ms; or send durationMs. */
  targetAt?: number;
  durationMs?: number;
  label?: string;
} & VjClientCommandFields;
export type VjSetLogoPayload = {
  isVisible?: boolean;
  corner?: VjLogoCorner;
} & VjClientCommandFields;
export type VjSetEventCardPayload = {
  isVisible?: boolean;
  kind?: VjEventCardKind;
} & VjClientCommandFields;

/** Unstamped remote frame. screenId null identifies every connected screen. */
export interface VjScreenIdentifyPayload {
  screenId: string | null;
}
/**
 * Unstamped remote frame. Outside the command queue; the backend relays it to
 * the screens connected at that moment and stores nothing.
 */
export interface VjSetRenderModePayload {
  mode: VjRenderMode;
}
export type VjClockSyncPayload = Record<string, never>;

/** Unchanged from v1. */
export interface VjScreenAdvancePayload {
  expectedClipSequence: number;
  clipId: string;
}
export interface VjScreenStatusPayload {
  isFullscreen: boolean;
  preload: VjScreenPreload;
  health?: VjScreenHealth;
  nextClipId?: string | null;
  mic?: VjScreenMicReport | null;
}

// Server frames (C 7.8)

export interface VjScreenIdentifyFrame {
  /** The screen's number ("Screen 2"). */
  number: number;
  /** How long the screen shows it: VJ_LIMITS.identifyDurationMs. */
  durationMs: number;
}

/** Unstamped server frame relayed to each connected screen; never stored. */
export interface VjScreenRenderModeFrame {
  mode: VjRenderMode;
}

// Library changes (C 7.10)

export const VJ_LIBRARY_CHANGE_KINDS = [
  "pack_created",
  "pack_renamed",
  "pack_deleted",
  "packs_reordered",
  "pack_clips_changed",
  "clip_created",
  "clip_updated",
  "clip_deleted",
  "clip_favorite_changed",
  "clip_defaults_changed",
  "clip_preview_changed",
  "pack_event_changed",
  "scene_created",
  "scene_updated",
  "scene_deleted",
  "scenes_reordered",
  "setlist_created",
  "setlist_updated",
  "setlist_items_changed",
  "setlist_deleted",
  "setlists_reordered",
] as const;
export type VjLibraryChangeKind = (typeof VJ_LIBRARY_CHANGE_KINDS)[number];

export interface VjLibraryChange {
  kind: VjLibraryChangeKind;
  /** The pack touched, when one is. */
  packId: string | null;
  /** The clip touched, when one is. */
  clipId: string | null;
  /** Every pack whose clip list changed (a clip delete lists all its packs). */
  packIds: string[];
  /** The scene touched, when one is; null on a reorder. */
  sceneId: string | null;
  /** The set list touched, when one is; null on a reorder. */
  setlistId: string | null;
  /** Every set list whose items changed (a scene delete lists each set list that held it). */
  setlistIds: string[];
  /** pack_event_changed only: the pack's event id after the change; null otherwise. */
  eventId: string | null;
}

// Frame name lists (C 9.3)

/** Frames a client emits; `screen:status` has no ack. */
export const VJ_CLIENT_FRAME_NAMES = [
  "vj:attach",
  "clock:sync",
  "session:reauth",
  "stage:setPack",
  "stage:goClip",
  "stage:goGenerator",
  "stage:setTransition",
  "stage:setOverlay",
  "stage:setEffects",
  "stage:setStrobe",
  "stage:setShuffle",
  "stage:setTempo",
  "stage:setMix",
  "stage:swapMix",
  "stage:setScreenOverride",
  "stage:resetLook",
  "stage:recallScene",
  "stage:setlistSelect",
  "stage:setlistNext",
  "stage:setlistPrevious",
  "stage:setlistSetPlaying",
  "stage:setlistSetLooping",
  "stage:setCountdown",
  "stage:setLogo",
  "stage:setEventCard",
  "screen:identify",
  "screens:setRenderMode",
  "screen:advance",
  "screen:status",
] as const;
export type VjClientFrameNameConst = (typeof VJ_CLIENT_FRAME_NAMES)[number];

export const VJ_SERVER_FRAME_NAMES = [
  "stage:state",
  "screen:role",
  "screens:update",
  "library:changed",
  "screen:identify",
  "screen:renderMode",
  "exception",
] as const;
export type VjServerFrameName = (typeof VJ_SERVER_FRAME_NAMES)[number];

/** Every frame that carries clientId and commandSequence. */
export const VJ_REMOTE_COMMAND_NAMES = [
  "stage:setPack",
  "stage:goClip",
  "stage:goGenerator",
  "stage:setTransition",
  "stage:setOverlay",
  "stage:setEffects",
  "stage:setStrobe",
  "stage:setShuffle",
  "stage:setTempo",
  "stage:setMix",
  "stage:swapMix",
  "stage:setScreenOverride",
  "stage:resetLook",
  "stage:recallScene",
  "stage:setlistSelect",
  "stage:setlistNext",
  "stage:setlistPrevious",
  "stage:setlistSetPlaying",
  "stage:setlistSetLooping",
  "stage:setCountdown",
  "stage:setLogo",
  "stage:setEventCard",
] as const;
export type VjRemoteCommandName = (typeof VJ_REMOTE_COMMAND_NAMES)[number];
