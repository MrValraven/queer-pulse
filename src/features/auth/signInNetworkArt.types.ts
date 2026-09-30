/** Shared shapes for the animated "queer network" sign-in art: the tones
 *  every person and light is painted in, and the far layers behind the Q.
 *  Every position is in CSS pixels of the measured art box. */

export type Tone = "coral" | "jade" | "cream";

export interface DustMote {
  anchorX: number;
  anchorY: number;
  radius: number;
  brightness: number;
  depth: number;
  twinklePhase: number;
  twinkleSpeed: number;
  isJade: boolean;
}

/** A large, very soft out-of-focus light far behind everyone. */
export interface Bokeh {
  anchorX: number;
  anchorY: number;
  radius: number;
  brightness: number;
  tone: Tone;
  driftPhase: number;
}
