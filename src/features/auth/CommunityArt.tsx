import type { CSSProperties } from "react";
import styles from "./auth.module.css";

type Tone = "coral" | "jade" | "cream";
type Orb = { cx: number; cy: number; r: number; tone: Tone };

/** The warm centre everyone is gathered around — the "hearth". */
const HEARTH = { cx: 150, cy: 74 } as const;

/** Member orbs drifting home toward the hearth. Positions sit within a
 *  300×150 viewBox — a full-spread ring of 7, matching the chosen tweak
 *  settings (Members 7, Spread 100%). */
const ORBS: Orb[] = [
  { cx: 135.7, cy: 16.4, r: 7, tone: "cream" },
  { cx: 252.1, cy: 43.5, r: 9, tone: "jade" },
  { cx: 269.4, cy: 80, r: 11, tone: "coral" },
  { cx: 188.9, cy: 128.9, r: 7, tone: "cream" },
  { cx: 111.2, cy: 128.9, r: 9, tone: "jade" },
  { cx: 30.7, cy: 80, r: 11, tone: "coral" },
  { cx: 48, cy: 43.5, r: 7, tone: "cream" },
];

const FILL: Record<Tone, string> = {
  coral: "var(--accent)",
  jade: "var(--jade)",
  cream: "rgba(var(--cream-rgb), 0.92)",
};

/** A point 34% of the way from an orb toward the hearth — a short dashed
 *  "drifting home" stem, rather than a hard line all the way in. */
const toward = (from: number, target: number) => from + (target - from) * 0.34;

/** Each orb enters by drifting home from a little further out. This returns the
 *  small outward offset (in user units) it starts from — the vector pointing
 *  away from the hearth, normalised to a short ~11-unit reach. */
function driftFrom(o: Orb) {
  const dx = o.cx - HEARTH.cx;
  const dy = o.cy - HEARTH.cy;
  const len = Math.hypot(dx, dy) || 1;
  const reach = 11;
  return { dx: (dx / len) * reach, dy: (dy / len) * reach };
}

/** Abstract illustration of a queer community as a gathered hearth — member
 *  orbs drifting home toward one warm coral centre that keeps a place for you.
 *  Token-built so it themes in light and dark; sits on the plum art tile. */
export function CommunityArt() {
  return (
    <svg
      className={styles.artSvg}
      viewBox="0 0 300 150"
      role="img"
      aria-label="A community gathered around one warm centre, keeping a place for you"
    >
      <defs>
        <radialGradient id="qpHearthGlow">
          <stop offset="0%" stopColor="rgba(var(--accent-rgb), 0.51)" />
          <stop offset="60%" stopColor="rgba(var(--accent-rgb), 0)" />
        </radialGradient>
      </defs>

      {/* Warm light field behind everything — blooms in first */}
      <circle
        className={styles.artGlow}
        cx={HEARTH.cx}
        cy={HEARTH.cy}
        r={96}
        fill="url(#qpHearthGlow)"
      />

      {/* Short dashed stems pulling each orb toward the hearth — each fades in
          with its orb */}
      <g
        stroke="rgba(var(--cream-rgb), 0.24)"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeDasharray="1.5 5"
      >
        {ORBS.map((o, i) => (
          <line
            key={i}
            className={styles.artStem}
            style={{ animationDelay: `${0.52 + i * 0.08}s` }}
            x1={o.cx}
            y1={o.cy}
            x2={toward(o.cx, HEARTH.cx)}
            y2={toward(o.cy, HEARTH.cy)}
          />
        ))}
      </g>

      {/* Member orbs — drift home toward the hearth, one after another */}
      {ORBS.map((o, i) => {
        const { dx, dy } = driftFrom(o);
        return (
          <circle
            key={i}
            className={styles.artOrb}
            style={
              {
                "--dx": `${dx}px`,
                "--dy": `${dy}px`,
                animationDelay: `${0.44 + i * 0.08}s`,
              } as CSSProperties
            }
            cx={o.cx}
            cy={o.cy}
            r={o.r}
            fill={FILL[o.tone]}
            stroke="rgba(var(--cream-rgb), 0.5)"
            strokeWidth={1.2}
          />
        );
      })}

      {/* The hearth: a still ring, one gently pulsing ring (the brand pulse),
          and the warm coral core — blooms in before the orbs arrive */}
      <circle
        className={styles.hearthBloom}
        cx={HEARTH.cx}
        cy={HEARTH.cy}
        r={24}
        fill="none"
        stroke="rgba(var(--accent-rgb), 0.3)"
        strokeWidth={1.4}
      />
      <circle
        className={styles.hearthRipple}
        cx={HEARTH.cx}
        cy={HEARTH.cy}
        r={24}
        fill="none"
        stroke="rgba(var(--accent-rgb), 0.45)"
        strokeWidth={1.4}
      />
      <circle
        className={styles.hearthBloom}
        cx={HEARTH.cx}
        cy={HEARTH.cy}
        r={14}
        fill="var(--accent)"
        stroke="rgba(var(--cream-rgb), 0.55)"
        strokeWidth={1.4}
      />
    </svg>
  );
}
