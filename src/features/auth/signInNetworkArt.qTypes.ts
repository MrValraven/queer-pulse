import type { Camera, Projected } from "./signInNetworkArt.projection";
import type { Bokeh, DustMote, Tone } from "./signInNetworkArt.types";

/** Shapes for the 3D Q composition. Model positions are in bowl units;
 *  `view` holds this frame's projection. */

export interface QPerson {
  homeX: number;
  homeY: number;
  homeZ: number;
  modelX: number;
  modelY: number;
  modelZ: number;
  /** Where the entrance starts: far back in depth and spread out. */
  fromX: number;
  fromY: number;
  fromZ: number;
  arrivesAt: number;
  view: Projected;
  radius: number;
  tone: Tone;
  isTail: boolean;
  penOrder: number;
  presence: number;
  flash: number;
  /** 0 to 1: how close to the hearth, for its rim light. */
  rim: number;
  breathPhase: number;
  newcomer: QNewcomer | null;
}

/** `waiting` until its handshake is due; `inviting` while the light
 *  travels from sender to receiver; `drawing` as the thread settles in. */
export type QThreadPhase =
  "waiting" | "inviting" | "drawing" | "resting" | "fading" | "gone";

export interface QThread {
  from: QPerson;
  to: QPerson;
  phase: QThreadPhase;
  startsAt: number;
  progress: number;
  /** Brief brightness after the handshake lands, easing back to rest. */
  glow: number;
  bend: number;
  /** The next thread along the same contour, for calm relayed pulses. */
  next: QThread | null;
  depth: number;
}

export interface QLight {
  thread: QThread | null;
  progress: number;
  duration: number;
  hopsLeft: number;
}

export type QNewcomerPhase = "idle" | "drifting" | "settled" | "leaving";

export interface QNewcomer {
  phase: QNewcomerPhase;
  progress: number;
  startedAt: number;
  thread: QThread;
}

export interface QScene {
  width: number;
  height: number;
  scale: number;
  isBand: boolean;
  time: number;
  camera: Camera;
  hearth: QPerson;
  hearthRadius: number;
  bloom: number;
  bloomStartsAt: number;
  people: QPerson[];
  /** The same people, re-sorted far to near every frame. */
  drawOrder: QPerson[];
  threads: QThread[];
  threadOrder: QThread[];
  letterThreadCount: number;
  lights: QLight[];
  newcomers: QPerson[];
  /** Candidate spots just outside the letter, in bowl units. */
  slots: { u: number; v: number }[];
  nextSlot: number;
  nextNewcomerAt: number;
  nextPulseAt: number;
  dust: DustMote[];
  bokeh: Bokeh[];
  random: () => number;
}
