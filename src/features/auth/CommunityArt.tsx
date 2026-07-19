import type { CSSProperties } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
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

/** Radius of the hearth's coral core, and the gaps the dashed trail leaves at
 *  each end so it reads as touching rather than piercing. */
const HEARTH_CORE_RADIUS = 14;
const ORB_GAP = 3;
const HEARTH_GAP = 2;

/** The dashed trail an orb leaves behind it: a full run from just outside the
 *  orb all the way in to the edge of the hearth's core, so every member is
 *  visibly connected to the centre. */
function trail(orb: Orb) {
  const deltaX = orb.cx - HEARTH.cx;
  const deltaY = orb.cy - HEARTH.cy;
  const distance = Math.hypot(deltaX, deltaY) || 1;
  const unitX = deltaX / distance;
  const unitY = deltaY / distance;
  const inset = orb.r + ORB_GAP;
  const outset = HEARTH_CORE_RADIUS + HEARTH_GAP;
  return {
    x1: orb.cx - unitX * inset,
    y1: orb.cy - unitY * inset,
    x2: HEARTH.cx + unitX * outset,
    y2: HEARTH.cy + unitY * outset,
  };
}

/** The first orb waits until the hearth has bloomed and given one full beat
 *  (see `.hearthBeat` in auth.module.css), then they arrive in sequence. */
const ORB_DELAY = 1.3;
const ORB_STEP = 0.09;

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
  const { t } = useTranslation();
  return (
    <svg
      className={styles.artSvg}
      viewBox="0 0 300 150"
      role="img"
      aria-label={t("auth:communityArt.ariaLabel")}
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

      {/* Dashed trails running from each orb all the way in to the hearth —
          each fades in just behind its own orb */}
      <g
        stroke="rgba(var(--cream-rgb), 0.24)"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeDasharray="1.5 5"
      >
        {ORBS.map((orb, index) => (
          <line
            key={index}
            className={styles.artStem}
            style={{ animationDelay: `${ORB_DELAY + index * ORB_STEP + 0.08}s` }}
            {...trail(orb)}
          />
        ))}
      </g>

      {/* Member orbs — drift home toward the hearth, one after another */}
      {ORBS.map((orb, index) => {
        const { dx, dy } = driftFrom(orb);
        return (
          <circle
            key={index}
            className={styles.artOrb}
            style={
              {
                "--dx": `${dx}px`,
                "--dy": `${dy}px`,
                animationDelay: `${ORB_DELAY + index * ORB_STEP}s`,
              } as CSSProperties
            }
            cx={orb.cx}
            cy={orb.cy}
            r={orb.r}
            fill={FILL[orb.tone]}
            stroke="rgba(var(--cream-rgb), 0.5)"
            strokeWidth={1.2}
          />
        );
      })}

      {/* The hearth: a still ring, one gently pulsing ring (the brand pulse),
          and the warm coral core. It blooms and beats once on its own before
          any member arrives — the centre calls, then the community answers. */}
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
      <g className={styles.hearthBeat}>
        <circle
          className={styles.hearthBloom}
          cx={HEARTH.cx}
          cy={HEARTH.cy}
          r={HEARTH_CORE_RADIUS}
          fill="var(--accent)"
          stroke="rgba(var(--cream-rgb), 0.55)"
          strokeWidth={1.4}
        />
      </g>
    </svg>
  );
}
