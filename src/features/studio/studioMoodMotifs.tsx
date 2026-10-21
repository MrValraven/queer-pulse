import type { ReactElement } from "react";
import type { StudioMood } from "./api/studio.types";
import art from "./StudioFacetTiles.module.css";

/* One drawn motif per mood for the home browse tiles, on the same 160 by
   100 board as the genre motifs: every shape keeps below y 46, clear of a
   label that runs the full width. */

/** A four-point sparkle centred on (centreX, centreY). */
function sparklePath(centreX: number, centreY: number, size: number): string {
  return `M${centreX} ${centreY - size} Q${centreX} ${centreY} ${centreX + size} ${centreY} Q${centreX} ${centreY} ${centreX} ${centreY + size} Q${centreX} ${centreY} ${centreX - size} ${centreY} Q${centreX} ${centreY} ${centreX} ${centreY - size} Z`;
}

const NIGHT_SPARKLES = [
  { centreX: 72, centreY: 78, size: 5 },
  { centreX: 94, centreY: 58, size: 3.5 },
  { centreX: 46, centreY: 92, size: 3 },
  { centreX: 152, centreY: 62, size: 4 },
];
const NIGHT_DOTS = [
  { centreX: 86, centreY: 92, radius: 1.2 },
  { centreX: 146, centreY: 92, radius: 1.6 },
  { centreX: 58, centreY: 60, radius: 1 },
  { centreX: 30, centreY: 76, radius: 1.3 },
];
const BURST_RAYS = Array.from({ length: 18 }, (_cell, index) => {
  const angle = (index * 20 * Math.PI) / 180;
  const outer = index % 2 === 0 ? 30 : 20;
  return {
    angle: index,
    fromX: 122 + Math.cos(angle) * 9,
    fromY: 80 + Math.sin(angle) * 9,
    toX: 122 + Math.cos(angle) * outer,
    toY: 80 + Math.sin(angle) * outer,
  };
});
const RAIN_DROPS = Array.from({ length: 24 }, (_cell, index) => {
  const column = index % 8;
  const row = Math.floor(index / 8);
  return {
    startX: 58 + column * 14 + row * 5,
    startY: 48 + row * 15 + (column % 2) * 6,
  };
});
const DEFIANT_CHEVRONS = [52, 64, 76, 88];
const FLAME_SCALES = [1, 0.7, 0.42];
const HEAT_LINES = [72, 90, 108, 126, 144];
const RIPPLE_RADII = [12, 24, 36, 50];

export const STUDIO_MOOD_MOTIF: Record<StudioMood, ReactElement> = {
  "late-night": (
    <>
      <path
        d="M127 54.41 A18 18 0 1 0 127 85.59 A22 22 0 0 1 127 54.41 Z"
        fill="currentColor"
        stroke="none"
      />
      {NIGHT_SPARKLES.map((sparkle) => (
        <path
          key={sparkle.centreX}
          d={sparklePath(sparkle.centreX, sparkle.centreY, sparkle.size)}
          fill="currentColor"
          stroke="none"
        />
      ))}
      {NIGHT_DOTS.map((dot) => (
        <circle
          key={dot.centreX}
          cx={dot.centreX}
          cy={dot.centreY}
          r={dot.radius}
          fill="currentColor"
          stroke="none"
          opacity={0.7}
        />
      ))}
    </>
  ),
  euphoric: (
    <>
      {BURST_RAYS.map((ray) => (
        <line
          key={ray.angle}
          x1={ray.fromX}
          y1={ray.fromY}
          x2={ray.toX}
          y2={ray.toY}
          strokeWidth={2.6}
        />
      ))}
      <circle cx={122} cy={80} r={6} fill="currentColor" stroke="none" />
      <circle
        className={art.shade}
        cx={68}
        cy={88}
        r={8}
        fill="currentColor"
        stroke="none"
      />
      <path d={sparklePath(84, 64, 4)} fill="currentColor" stroke="none" />
    </>
  ),
  tender: (
    <>
      <circle
        cx={100}
        cy={78}
        r={22}
        fill="currentColor"
        stroke="none"
        opacity={0.26}
      />
      <circle
        cx={124}
        cy={70}
        r={22}
        fill="currentColor"
        stroke="none"
        opacity={0.26}
      />
      <circle
        cx={120}
        cy={92}
        r={18}
        fill="currentColor"
        stroke="none"
        opacity={0.26}
      />
      <circle cx={100} cy={78} r={22} strokeWidth={1.4} opacity={0.7} />
      <circle cx={124} cy={70} r={22} strokeWidth={1.4} opacity={0.7} />
    </>
  ),
  melancholy: (
    <>
      {RAIN_DROPS.map((drop) => (
        <line
          key={`${drop.startX}-${drop.startY}`}
          x1={drop.startX}
          y1={drop.startY}
          x2={drop.startX - 5}
          y2={drop.startY + 12}
          strokeWidth={1.6}
          opacity={0.75}
        />
      ))}
      <ellipse
        cx={112}
        cy={94}
        rx={30}
        ry={5}
        strokeWidth={1.4}
        opacity={0.6}
      />
      <ellipse
        className={art.shade}
        cx={112}
        cy={94}
        rx={15}
        ry={2.6}
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  defiant: (
    <>
      <path
        className={art.shade}
        d="M88 104 L124 46 L160 104 Z"
        fill="currentColor"
        stroke="none"
      />
      {DEFIANT_CHEVRONS.map((top) => (
        <polyline
          key={top}
          points={`${104},${top + 14} ${124},${top} ${144},${top + 14}`}
          strokeWidth={5}
          opacity={top === 52 ? 1 : 0.6}
        />
      ))}
    </>
  ),
  dreamy: (
    <>
      <g className={art.soft} fill="currentColor" stroke="none" opacity={0.4}>
        <circle cx={120} cy={78} r={22} />
        <circle cx={146} cy={74} r={18} />
      </g>
      <path
        d="M70 94 a14 14 0 0 1 16 -18 a20 20 0 0 1 36 -6 a15 15 0 0 1 24 12 a11 11 0 0 1 2 12 Z"
        fill="currentColor"
        stroke="none"
        opacity={0.85}
      />
      <path d={sparklePath(62, 60, 4.5)} fill="currentColor" stroke="none" />
      <path d={sparklePath(150, 54, 3.5)} fill="currentColor" stroke="none" />
    </>
  ),
  "slow-burn": (
    <>
      {FLAME_SCALES.map((scale) => (
        <path
          key={scale}
          className={scale === 0.7 ? art.shade : undefined}
          d="M124 46 C136 60 146 72 142 84 C138 98 110 98 106 84 C102 72 112 62 124 46 Z"
          transform={`translate(${124 * (1 - scale)} ${96 * (1 - scale)}) scale(${scale})`}
          fill="currentColor"
          stroke="none"
          opacity={scale === 1 ? 0.45 : 1}
        />
      ))}
      <circle cx={84} cy={88} r={2} fill="currentColor" stroke="none" />
      <circle cx={92} cy={74} r={1.4} fill="currentColor" stroke="none" />
    </>
  ),
  sweaty: (
    <>
      {HEAT_LINES.map((lineX) => (
        <path
          key={lineX}
          d={`M${lineX} 104 C${lineX - 8} 90 ${lineX + 8} 80 ${lineX} 70 S${lineX - 8} 54 ${lineX} 48`}
          strokeWidth={2}
          opacity={0.7}
        />
      ))}
      <path
        d="M58 64 C64 74 68 80 68 86 a10 10 0 0 1 -20 0 C48 80 52 74 58 64 Z"
        fill="currentColor"
        stroke="none"
      />
      <path
        className={art.shade}
        d="M100 60 C104 66 106 70 106 74 a6 6 0 0 1 -12 0 C94 70 96 66 100 60 Z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  calm: (
    <>
      <line x1={-4} y1={58} x2={164} y2={58} strokeWidth={1} opacity={0.6} />
      <circle cx={136} cy={53} r={7} fill="currentColor" stroke="none" />
      {RIPPLE_RADII.map((radius) => (
        <ellipse
          key={radius}
          cx={116}
          cy={80}
          rx={radius}
          ry={radius * 0.3}
          strokeWidth={1.5}
          opacity={1 - radius / 70}
        />
      ))}
    </>
  ),
  playful: (
    <>
      <path
        d="M54 88 C62 66 80 66 76 80 C72 94 92 94 96 76 C100 58 120 62 116 76 C112 92 138 94 146 70"
        strokeWidth={3.4}
      />
      <rect
        x={128}
        y={50}
        width={10}
        height={10}
        rx={2}
        transform="rotate(24 133 55)"
        fill="currentColor"
        stroke="none"
      />
      <path
        className={art.shade}
        d="M100 50 L112 68 L90 68 Z"
        fill="currentColor"
        stroke="none"
      />
      <circle cx={150} cy={92} r={5} fill="currentColor" stroke="none" />
      <circle cx={34} cy={78} r={3} fill="currentColor" stroke="none" />
    </>
  ),
};
