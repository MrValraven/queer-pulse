import type { ReactNode } from "react";

// Custom monoline "spot illustrations" for the desktop meganav highlight card.
// Rendered on a SOLID plum ground: strokes are cream, exactly one accent (coral)
// element per scene. Decorative only. Keep the plum showing through — no bg rect.

const svgBaseProps = {
  viewBox: "0 0 240 150",
  width: "100%",
  height: "100%",
  preserveAspectRatio: "xMidYMid meet",
  fill: "none",
  stroke: "rgb(var(--cream-rgb))",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false as const,
};

// Community → three even figures gathered around a round table (a shared meal).
export function CommunityArt(): ReactNode {
  return (
    <svg {...svgBaseProps}>
      <ellipse cx="120" cy="102" rx="46" ry="17" />
      <circle cx="120" cy="46" r="12" />
      <path d="M104 84c0-15 7-25 16-25s16 10 16 25" />
      <circle cx="60" cy="64" r="11" />
      <path d="M46 100c0-14 6-23 14-23s14 9 14 23" />
      <circle cx="180" cy="64" r="11" />
      <path d="M166 100c0-14 6-23 14-23s14 9 14 23" />
      <circle cx="120" cy="98" r="5" fill="var(--accent)" stroke="none" />
    </svg>
  );
}

// Lisbon → a coral map pin dropped between two little hillside houses.
export function LisbonArt(): ReactNode {
  return (
    <svg {...svgBaseProps}>
      <path d="M40 118h160" />
      <path d="M54 118V94l18-14 18 14v24" />
      <path d="M54 94h36" />
      <path d="M62 104h20" />
      <path d="M150 118V98l18-13 18 13v20" />
      <path d="M150 98h36" />
      <path d="M158 108h20" />
      <path
        d="M120 32C106 32 95 43 95 57 95 78 120 118 120 118 120 118 145 78 145 57 145 43 134 32 120 32Z"
        stroke="var(--accent)"
      />
      <circle cx="120" cy="53" r="9" />
    </svg>
  );
}

// Resources → a life-buoy ring (support & care).
export function ResourcesArt(): ReactNode {
  return (
    <svg {...svgBaseProps}>
      <circle cx="120" cy="75" r="48" />
      <circle cx="120" cy="75" r="22" />
      <path d="M120 27v20M120 103v20M72 75h20M148 75h20" />
      <path d="M86 41l14 14M154 41l-14 14M86 109l14-14M154 109l-14-14" />
      <path d="M120 27v20M72 75h20" stroke="var(--accent)" />
    </svg>
  );
}

// Culture → an open book beside a small film frame (magazine + cinema).
export function CultureArt(): ReactNode {
  return (
    <svg {...svgBaseProps}>
      <path d="M36 52c18-8 40-8 52 2 12-10 34-10 52-2v54c-18-8-40-8-52 0-12-8-34-8-52 0z" />
      <path d="M88 56v52" />
      <path d="M88 62v6" stroke="var(--accent)" />
      <rect x="150" y="58" width="54" height="44" rx="4" />
      <path d="M150 72h54M150 88h54M164 58v44M190 58v44" />
    </svg>
  );
}

// Work → a briefcase with a single coral clasp (your work, in one place).
export function WorkArt(): ReactNode {
  return (
    <svg {...svgBaseProps}>
      <rect x="54" y="52" width="132" height="62" rx="12" />
      <path d="M102 52v-8a8 8 0 0 1 8-8h20a8 8 0 0 1 8 8v8" />
      <path d="M54 78h132" />
      <rect
        x="112"
        y="72"
        width="16"
        height="12"
        rx="3"
        stroke="var(--accent)"
      />
    </svg>
  );
}

// About → a compass rose, with a single filled dot as the QueerPulse mark.
export function AboutArt(): ReactNode {
  return (
    <svg {...svgBaseProps}>
      <circle cx="120" cy="75" r="46" />
      <path d="M120 33v14M120 103v14M78 75h14M148 75h14" />
      <path d="M120 47l16 44-16-12-16 12z" />
      <path
        d="M120 47l16 44-16-12z"
        fill="rgb(var(--cream-rgb))"
        stroke="none"
      />
      <circle cx="120" cy="75" r="5" fill="var(--accent)" stroke="none" />
    </svg>
  );
}
