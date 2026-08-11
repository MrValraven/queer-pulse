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
  stroke: "var(--cream)",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false as const,
};

// Community → three stylized figures gathered around a small round table.
function CommunityArt(): ReactNode {
  return (
    <svg {...svgBaseProps}>
      <ellipse cx="120" cy="96" rx="46" ry="16" />
      <circle cx="120" cy="50" r="12" />
      <path d="M104 88c0-14 8-24 16-24s16 10 16 24" />
      <circle cx="64" cy="68" r="11" />
      <path d="M50 104c0-13 7-22 14-22s14 9 14 22" />
      <circle cx="176" cy="68" r="11" />
      <path d="M162 104c0-13 7-22 14-22s14 9 14 22" />
      <circle cx="120" cy="96" r="6" fill="var(--accent)" stroke="none" />
    </svg>
  );
}

// Lisbon → a couple of tiled rooftops with a dropped map pin above them.
function LisbonArt(): ReactNode {
  return (
    <svg {...svgBaseProps}>
      <path d="M40 118h160" />
      <path d="M56 118V80l30-20 30 20v38" />
      <path d="M116 118V90l24-16 24 16v28" />
      <path d="M62 96h48M62 108h48" />
      <path d="M124 100h32M124 110h32" />
      <path d="M120 26c-11 0-20 9-20 20 0 14 20 30 20 30s20-16 20-30c0-11-9-20-20-20z" stroke="var(--accent)" />
      <circle cx="120" cy="46" r="6" stroke="var(--accent)" />
    </svg>
  );
}

// Resources → a life-buoy ring (support & care).
function ResourcesArt(): ReactNode {
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
function CultureArt(): ReactNode {
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

// Work → a wrench crossed with two clasped hands (skills & solidarity economy).
function WorkArt(): ReactNode {
  return (
    <svg {...svgBaseProps}>
      <path d="M60 44a14 14 0 0 0 18 18l40 40a12 12 0 0 1-17 17l-40-40a14 14 0 0 1-1-35z" />
      <path d="M132 108l40-40a14 14 0 0 0 18-18 14 14 0 0 1-1 35" />
      <path d="M120 118c8-8 18-8 26 0" stroke="var(--accent)" />
      <path d="M96 118c-8-8-8-18 0-26" />
    </svg>
  );
}

// About → a compass rose, with a single filled dot as the QueerPulse mark.
function AboutArt(): ReactNode {
  return (
    <svg {...svgBaseProps}>
      <circle cx="120" cy="75" r="46" />
      <path d="M120 33v14M120 103v14M78 75h14M148 75h14" />
      <path d="M120 47l16 44-16-12-16 12z" />
      <path d="M120 47l16 44-16-12z" fill="var(--cream)" stroke="none" />
      <circle cx="120" cy="75" r="5" fill="var(--accent)" stroke="none" />
    </svg>
  );
}

export const MEGA_NAV_ART: Record<string, ReactNode> = {
  Community: <CommunityArt />,
  Lisbon: <LisbonArt />,
  Resources: <ResourcesArt />,
  Culture: <CultureArt />,
  Work: <WorkArt />,
  About: <AboutArt />,
};
