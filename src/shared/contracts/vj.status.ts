/**
 * VJ wire contract (C 3), frontend mirror of
 * `queerpulse-backend/src/vj/vj.contract.ts` and `vj-response.ts`. Names and
 * values match it; edit both together.
 * Screen status (C 3.8, v1 fields kept word for word).
 */

import type {
  VjClipReadyState,
  VjPreloadFailure,
  VjRenderer,
} from "./vj.lists";

export interface VjScreenClipStatus {
  clipId: string;
  state: VjClipReadyState;
  /** 0..1, bytes received over byteSize; 1 when ready. */
  progress: number;
  /** Set only when state is "failed". */
  failure: VjPreloadFailure | null;
}

export interface VjScreenPreload {
  /** The pack this report covers. */
  packId: string | null;
  /** One entry per clip of that pack, pack order. */
  clips: VjScreenClipStatus[];
}

export interface VjScreenHealth {
  renderer: VjRenderer;
  /** Frames drawn per second, mean over the last 5 s, 0..240, one decimal. */
  fps: number;
  /** Frames dropped over the last 5 s, integer 0..1 000 000. */
  droppedFrames: number;
  /** Bytes this screen holds in the VJ clip cache, safe integer. */
  cacheBytes: number;
  /** The renderer judges the current effect load too heavy for smooth output. */
  isEffectLoadHigh: boolean;
}

/** Sent only while this screen has the mic on (opt-in on the setup card). */
export interface VjScreenMicReport {
  /** 0..1, two decimals. */
  level: number;
  /** Detected tempo, 60..200; null until confident enough to guess. */
  bpm: number | null;
  /** 0..1. */
  confidence: number;
  /** Server epoch ms of the latest detected beat (local onset time plus the clock offset); null with no beat yet. */
  beatAt: number | null;
}

export interface VjScreenStatus {
  screenId: string;
  /** 1-based, assigned at the first attach of this screenId in this stage and kept for the stage's life. */
  number: number;
  isConnected: boolean;
  /** False while disconnected. */
  isLead: boolean;
  isFullscreen: boolean;
  /** Server epoch ms the current connection attached; null while disconnected. */
  connectedAt: number | null;
  /** Server epoch ms of the last frame or attach from this screen. */
  lastSeenAt: number;
  preload: VjScreenPreload;
  /** Null until this screen reports health (or from a screen that never does). */
  health: VjScreenHealth | null;
  /** The lead's shuffle pick for the next advance; null on followers and when shuffle is off. */
  nextClipId: string | null;
  /** Null while the mic is off on this screen. */
  mic: { level: number; detectedBpm: number | null; confidence: number } | null;
}
