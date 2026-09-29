import type { PathCommand } from "../primitives";

export type BlipStyle = {
  bodyColor: string;
  bodyFlagId: string | null;
  hasDieCut: boolean;
};

export const BLIP_DEFAULTS: BlipStyle = {
  bodyColor: "#e8775a",
  bodyFlagId: null,
  hasDieCut: true,
};

export const BLIP_COLORS = {
  ink: "#1b1b1b",
  cream: "#f7f3ee",
  blush: "#f28b9a",
  tear: "#5bcefa",
  heart: "#e0245e",
  spark: "#ffd23f",
  sadTip: "#8fa3c7",
  angryTip: "#d63b2f",
  formShadow: "#d9654a",
  shine: "#f6ad97",
  steam: "#e6e1da",
  heat: "#f08a24",
  coral: "#e8775a",
} as const;

export type BlipItemId =
  | "hi"
  | "yay"
  | "crying-laughing"
  | "love"
  | "shocked"
  | "side-eye"
  | "sad"
  | "hug"
  | "thinking"
  | "sleepy"
  | "shy"
  | "sipping-tea"
  | "thank-you"
  | "sorry"
  | "hmph"
  | "party"
  | "proud"
  | "fan-clack"
  | "shrug"
  | "on-my-way"
  | "home-safe"
  | "melting";

export type BlipEyes =
  | "bean"
  | "arcs"
  | "closed"
  | "wide"
  | "hearts"
  | "stars"
  | "half"
  | "teary"
  | "none";

export type BlipBrows = "worried" | "determined" | "raised" | "up";

export type BlipMouth =
  | "smile"
  | "grin"
  | "laugh"
  | "o"
  | "small"
  | "wobbly"
  | "flat"
  | "smirk"
  | "cat"
  | "tongue"
  | "frown"
  | "pout"
  | "none";

export type BlipAntenna =
  | "steady"
  | "spike"
  | "heart"
  | "droop"
  | "wave"
  | "question"
  | "exclaim"
  | "angry";

export type BlipArms =
  | "wave"
  | "up"
  | "hug"
  | "chin"
  | "together"
  | "hips"
  | "shrug"
  | "cup"
  | "fan";

export type BlipProp = "house";

export type BlipExtra =
  | "blush"
  | "bigBlush"
  | "tears"
  | "sweat"
  | "sparkles"
  | "zzz"
  | "steam"
  | "confetti"
  | "motion"
  | "heat"
  | "floatHearts";

export interface BlipPose {
  id: BlipItemId;
  squash?: number;
  melt?: number;
  tiltDeg?: number;
  eyes: BlipEyes;
  look?: readonly [number, number];
  brows?: BlipBrows;
  mouth: BlipMouth;
  antenna: BlipAntenna;
  arms?: BlipArms;
  prop?: BlipProp;
  extras?: readonly BlipExtra[];
  faceShift?: number;
  faceDrop?: number;
  mouthShift?: number;
}

/** Everything a part needs to place itself, computed once per pose (Task 4). */
export interface BlipFrame {
  centerX: number;
  baseY: number;
  width: number;
  height: number;
  top: number;
  centerY: number;
  melt: number;
  bodyPoints: readonly (readonly [number, number])[];
  bodyPath: PathCommand[];
  eyeY: number;
  faceX: number;
  eyeGap: number;
  leftEyeX: number;
  rightEyeX: number;
  mouthX: number;
  mouthY: number;
  look: readonly [number, number];
  isFlagBody: boolean;
  /** Arm nubs: the body colour, or the flag's middle band colour. */
  armColor: string;
  /** Base of the antenna: 6% of body width left of top centre, 6 below the top. */
  antennaX: number;
  antennaY: number;
}
