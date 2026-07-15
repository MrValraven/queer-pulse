export type CoverStyle = "stripe";
export type PatternKey = "none" | "stripe" | "dots" | "grid";

export const COVER_STYLES: { key: CoverStyle; label: string }[] = [
  { key: "stripe", label: "Bold stripe" },
];

export const PATTERNS: {
  key: PatternKey;
  background: string;
  title: string;
}[] = [
  { key: "none", background: "var(--plum)", title: "Solid" },
  {
    key: "stripe",
    background:
      "repeating-linear-gradient(45deg,rgba(255,255,255,.15) 0,rgba(255,255,255,.15) 2px,transparent 2px,transparent 10px),var(--plum)",
    title: "Diagonal stripes",
  },
  {
    key: "dots",
    background:
      "radial-gradient(circle,rgba(255,255,255,.2) 1px,transparent 1px) 0 0/6px 6px,var(--plum)",
    title: "Dot grid",
  },
  {
    key: "grid",
    background:
      "repeating-linear-gradient(90deg,rgba(255,255,255,.08) 0,rgba(255,255,255,.08) 1px,transparent 1px,transparent 8px),repeating-linear-gradient(rgba(255,255,255,.08) 0,rgba(255,255,255,.08) 1px,transparent 1px,transparent 8px),var(--plum)",
    title: "Grid",
  },
];

export const FLAG_SWATCHES: {
  label: string;
  colors: string[];
  background: string;
}[] = [
  {
    label: "Rainbow",
    colors: ["#E40303", "#FF8C00", "#FFED00", "#008026", "#004DFF", "#750787"],
    background:
      "linear-gradient(to right,#E40303 0%,#FF8C00 20%,#FFED00 40%,#008026 60%,#004DFF 80%,#750787 100%)",
  },
  {
    label: "Trans Pride",
    colors: ["#5BCEFA", "#F5A9B8", "#fff", "#F5A9B8", "#5BCEFA"],
    background:
      "linear-gradient(to bottom,#5BCEFA 0%,#5BCEFA 20%,#F5A9B8 20%,#F5A9B8 40%,#fff 40%,#fff 60%,#F5A9B8 60%,#F5A9B8 80%,#5BCEFA 80%)",
  },
  {
    label: "Non-Binary",
    colors: ["#FCF434", "#fff", "#9C59D1", "#2D2D2D"],
    background:
      "linear-gradient(to bottom,#FCF434 0%,#FCF434 25%,#fff 25%,#fff 50%,#9C59D1 50%,#9C59D1 75%,#2D2D2D 75%)",
  },
  {
    label: "Bisexual",
    colors: ["#D60270", "#9B4F96", "#0038A8"],
    background:
      "linear-gradient(to bottom,#D60270 0%,#D60270 40%,#9B4F96 40%,#9B4F96 60%,#0038A8 60%)",
  },
  {
    label: "Lesbian",
    colors: ["#D52D00", "#FF9A56", "#fff", "#D162A4", "#A50062"],
    background:
      "linear-gradient(to bottom,#D52D00 0%,#EF7627 20%,#FF9A56 40%,#fff 40%,#fff 60%,#D162A4 60%,#B55690 80%,#A50062 100%)",
  },
  {
    label: "Pansexual",
    colors: ["#FF218C", "#FFD800", "#21B1FF"],
    background:
      "linear-gradient(to bottom,#FF218C 0%,#FF218C 33%,#FFD800 33%,#FFD800 66%,#21B1FF 66%)",
  },
  {
    label: "Asexual",
    colors: ["#000", "#A4A4A4", "#fff", "#810081"],
    background:
      "linear-gradient(to bottom,#000 0%,#000 25%,#A4A4A4 25%,#A4A4A4 50%,#fff 50%,#fff 75%,#810081 75%)",
  },
  {
    label: "Aromantic",
    colors: ["#3DA542", "#A8D37A", "#fff", "#ABABAB", "#000"],
    background:
      "linear-gradient(to bottom,#3DA542 0%,#A8D37A 25%,#fff 40%,#fff 60%,#ABABAB 75%,#000 100%)",
  },
  {
    label: "Genderfluid",
    colors: ["#FF76A4", "#fff", "#BE18D6", "#000", "#333EBC"],
    background:
      "linear-gradient(to bottom,#FF76A4 0%,#FF76A4 20%,#fff 20%,#fff 40%,#BE18D6 40%,#BE18D6 60%,#000 60%,#000 80%,#333EBC 80%)",
  },
  {
    label: "Genderqueer",
    colors: ["#B77FDD", "#fff", "#4A8123"],
    background:
      "linear-gradient(to bottom,#B77FDD 0%,#B77FDD 33%,#fff 33%,#fff 66%,#4A8123 66%)",
  },
  { label: "Intersex", colors: ["#FFD800", "#7902AA"], background: "#FFD800" },
  {
    label: "No theme",
    colors: ["var(--plum)", "var(--cream)"],
    background: "linear-gradient(135deg,var(--plum) 50%,var(--cream) 50%)",
  },
];

export const BADGE_OPTIONS = [
  "Founding Member (Legendary)",
  "Event Host (Legendary)",
  "Sustainer (Rare)",
  "Regular (Rare)",
  "Vouch (Rare)",
];
