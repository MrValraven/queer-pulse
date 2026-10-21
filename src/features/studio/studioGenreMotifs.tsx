import type { ReactElement } from "react";
import type { StudioGenre } from "./api/studio.types";
import art from "./StudioFacetTiles.module.css";

/* One drawn motif per genre for the home browse tiles, on a 160 by 100
   board. The label sits top-left and can run the full width, so every
   shape keeps below y 46. Strokes take the tile's cream-lifted mark;
   shapes classed `shade` take its deeper step. */

const FADO_STRINGS = [62, 68, 74, 80, 86, 92];
const ELECTRONIC_BARS = [14, 28, 22, 40, 26, 48, 34, 18, 40, 26, 12];
const GRID_COLUMNS = [0, 1, 2, 3, 4];
const GRID_ROWS = [0, 1, 2];
const FOLK_WEAVE = [0, 1, 2, 3, 4, 5, 6];
const POP_DOTS = Array.from({ length: 11 * 5 }, (_cell, index) => {
  const column = index % 11;
  const row = Math.floor(index / 11);
  const radius = (column / 10 + row / 4) * 2.2;
  return { centreX: 50 + column * 11, centreY: 52 + row * 11, radius };
}).filter((dot) => dot.radius > 0.7);
const VINYL_GROOVES = [38, 33, 28, 23];
const BRUSH_BRISTLES = [
  { tipX: 80, tipY: 62 },
  { tipX: 84, tipY: 64 },
  { tipX: 88, tipY: 66 },
  { tipX: 90, tipY: 69 },
  { tipX: 92, tipY: 72 },
  { tipX: 92, tipY: 76 },
];
const STAFF_LINES = [58, 65, 72, 79, 86];
const NOTE_HEADS = [
  { centreX: 82, centreY: 76 },
  { centreX: 108, centreY: 70 },
  { centreX: 134, centreY: 80 },
];
const DRONE_RINGS = [12, 22, 32, 42, 52];
const SPEECH_ARCS = [10, 20, 30, 40];

export const STUDIO_GENRE_MOTIF: Record<StudioGenre, ReactElement> = {
  fado: (
    <>
      {FADO_STRINGS.map((baseline) => (
        <path
          key={baseline}
          d={`M-6 ${baseline} C34 ${baseline - 12} 62 ${baseline + 10} 100 ${baseline - 2} S146 ${baseline - 12} 168 ${baseline - 4}`}
          strokeWidth={1.4}
        />
      ))}
      <circle
        className={art.shade}
        cx={134}
        cy={62}
        r={11}
        fill="currentColor"
        stroke="none"
      />
      <circle cx={134} cy={62} r={16} opacity={0.6} />
    </>
  ),
  electronic: (
    <>
      {ELECTRONIC_BARS.map((height, index) => (
        <rect
          key={index}
          x={56 + index * 9.4}
          y={96 - height}
          width={5}
          height={height + 8}
          rx={2.5}
          fill="currentColor"
          stroke="none"
          opacity={index % 2 === 0 ? 0.9 : 0.5}
        />
      ))}
      {GRID_COLUMNS.map((column) =>
        GRID_ROWS.map((row) => (
          <circle
            key={`${column}-${row}`}
            cx={10 + column * 9}
            cy={72 + row * 9}
            r={1.3}
            fill="currentColor"
            stroke="none"
            opacity={0.55}
          />
        )),
      )}
    </>
  ),
  folk: (
    <>
      {FOLK_WEAVE.map((step) => (
        <line
          key={step}
          x1={58 + step * 15}
          y1={104}
          x2={92 + step * 15}
          y2={50}
          strokeWidth={3.2}
          opacity={0.8}
        />
      ))}
      <polyline
        points="0,94 7,87 14,94 21,87 28,94 35,87 42,94 49,87 56,94"
        strokeWidth={1.6}
        opacity={0.7}
      />
    </>
  ),
  experimental: (
    <>
      <circle cx={120} cy={74} r={24} />
      <circle
        className={art.shade}
        cx={134}
        cy={62}
        r={10}
        fill="currentColor"
        stroke="none"
      />
      <path d="M58 94 L74 66 L90 94 Z" opacity={0.75} />
      <path d="M14 80 c8 -12 16 12 24 0 s16 12 24 0" strokeWidth={1.6} />
      <rect
        x={92}
        y={74}
        width={20}
        height={20}
        transform="rotate(18 102 84)"
        fill="currentColor"
        stroke="none"
        opacity={0.35}
      />
      <line x1={152} y1={50} x2={118} y2={102} strokeDasharray="2 6" />
    </>
  ),
  pop: (
    <>
      <circle
        className={art.shade}
        cx={130}
        cy={76}
        r={26}
        fill="currentColor"
        stroke="none"
      />
      {POP_DOTS.map((dot) => (
        <circle
          key={`${dot.centreX}-${dot.centreY}`}
          cx={dot.centreX}
          cy={dot.centreY}
          r={dot.radius}
          fill="currentColor"
          stroke="none"
        />
      ))}
    </>
  ),
  "hip-hop": (
    <>
      <circle
        className={art.shade}
        cx={126}
        cy={92}
        r={42}
        fill="currentColor"
        stroke="none"
      />
      {VINYL_GROOVES.map((radius) => (
        <circle
          key={radius}
          cx={126}
          cy={92}
          r={radius}
          strokeWidth={1}
          opacity={0.35}
        />
      ))}
      <circle cx={126} cy={92} r={12} fill="currentColor" stroke="none" />
      <circle
        className={art.shade}
        cx={126}
        cy={92}
        r={2.5}
        fill="currentColor"
        stroke="none"
      />
      <path d="M158 50 L150 66 L136 80" strokeWidth={3} />
    </>
  ),
  "r-and-b": (
    <>
      <path
        d="M-10 84 C30 58 70 104 110 74 S160 52 175 62"
        strokeWidth={12}
        opacity={0.3}
      />
      <path
        d="M-10 94 C34 72 76 108 116 84 S160 64 175 72"
        strokeWidth={5}
        opacity={0.7}
      />
      <path d="M30 104 C60 88 96 98 120 70 S150 54 170 56" strokeWidth={1.8} />
    </>
  ),
  rock: (
    <>
      <path
        className={art.shade}
        d="M112 104 L138 48 H160 L134 104 Z"
        fill="currentColor"
        stroke="none"
      />
      <polyline
        points="0,80 9,68 17,90 27,62 35,86 45,58 53,92 63,66 71,84 81,70 90,78"
        strokeWidth={2.4}
      />
      <path
        d="M140 48 L122 76 H134 L124 100 L154 68 H142 L152 48 Z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  jazz: (
    <>
      {/* A ride cymbal on its stand, swept by a wire brush. */}
      <path d="M78 58 Q112 48 148 56" strokeWidth={1.2} opacity={0.55} />
      <ellipse
        cx={114}
        cy={70}
        rx={40}
        ry={8}
        transform="rotate(-8 114 70)"
        fill="currentColor"
        stroke="none"
        opacity={0.35}
      />
      <ellipse
        cx={114}
        cy={70}
        rx={40}
        ry={8}
        transform="rotate(-8 114 70)"
        strokeWidth={1.6}
      />
      <ellipse
        cx={114}
        cy={66}
        rx={8}
        ry={4}
        transform="rotate(-8 114 66)"
        fill="currentColor"
        stroke="none"
      />
      <line x1={114} y1={74} x2={114} y2={104} strokeWidth={2.4} />
      <line
        className={art.shade}
        x1={24}
        y1={102}
        x2={62}
        y2={80}
        strokeWidth={3.4}
      />
      {BRUSH_BRISTLES.map((bristle) => (
        <line
          key={bristle.tipY}
          x1={62}
          y1={80}
          x2={bristle.tipX}
          y2={bristle.tipY}
          strokeWidth={1}
        />
      ))}
    </>
  ),
  classical: (
    <>
      {STAFF_LINES.map((baseline) => (
        <path
          key={baseline}
          d={`M-4 ${baseline} C50 ${baseline - 8} 110 ${baseline + 8} 164 ${baseline - 4}`}
          strokeWidth={1.1}
          opacity={0.75}
        />
      ))}
      {NOTE_HEADS.map((note) => (
        <g key={note.centreX}>
          <ellipse
            cx={note.centreX}
            cy={note.centreY}
            rx={5.6}
            ry={3.9}
            transform={`rotate(-22 ${note.centreX} ${note.centreY})`}
            fill="currentColor"
            stroke="none"
          />
          <line
            x1={note.centreX + 5}
            y1={note.centreY - 1}
            x2={note.centreX + 5}
            y2={note.centreY - 24}
            strokeWidth={1.6}
          />
        </g>
      ))}
    </>
  ),
  ambient: (
    <>
      {/* Slow drone rings spreading from one soft glow. */}
      <circle
        className={art.soft}
        cx={132}
        cy={100}
        r={14}
        fill="currentColor"
        stroke="none"
        opacity={0.55}
      />
      {DRONE_RINGS.map((radius) => (
        <circle
          key={radius}
          cx={132}
          cy={100}
          r={radius}
          strokeWidth={1.3}
          opacity={1 - radius / 70}
        />
      ))}
    </>
  ),
  "spoken-word": (
    <>
      {SPEECH_ARCS.map((radius) => (
        <path
          key={radius}
          d={`M${156 - radius * 0.77} ${80 - radius * 0.64} A${radius} ${radius} 0 0 0 ${156 - radius * 0.77} ${80 + radius * 0.64}`}
          strokeWidth={2.4}
          opacity={1 - radius / 70}
        />
      ))}
      <line x1={14} y1={68} x2={70} y2={68} strokeWidth={4} opacity={0.5} />
      <line x1={14} y1={79} x2={56} y2={79} strokeWidth={4} opacity={0.5} />
      <line x1={14} y1={90} x2={64} y2={90} strokeWidth={4} opacity={0.5} />
    </>
  ),
  other: (
    <>
      <circle cx={124} cy={74} r={20} strokeWidth={6} opacity={0.55} />
      <rect
        x={68}
        y={66}
        width={22}
        height={22}
        transform="rotate(20 79 77)"
        fill="currentColor"
        stroke="none"
        opacity={0.4}
      />
      <circle
        className={art.shade}
        cx={146}
        cy={90}
        r={13}
        fill="currentColor"
        stroke="none"
      />
      <circle cx={104} cy={94} r={3} fill="currentColor" stroke="none" />
      <circle cx={40} cy={88} r={2} fill="currentColor" stroke="none" />
    </>
  ),
};
