/**
 * Real, client-generated file payloads for the press-kit downloads. The
 * prototype has no backend, so each "download" produces a genuine Blob from
 * these strings via downloadBlob().
 */

export interface PressAsset {
  filename: string;
  mime: string;
  content: string;
}

/** A simple, on-brand QueerPulse wordmark SVG (coral pulse dot + plum text). */
export function logoSvg(variant: "light" | "plum" | "coral" = "light"): string {
  const dot = variant === "coral" ? "#2D1B3D" : "#E8775A";
  const text =
    variant === "plum" || variant === "coral" ? "#F7F3EE" : "#2D1B3D";
  const bg =
    variant === "plum" ? "#2D1B3D" : variant === "coral" ? "#E8775A" : "none";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 96" width="360" height="96" role="img" aria-label="QueerPulse">
  <rect width="360" height="96" fill="${bg}"/>
  <circle cx="34" cy="52" r="13" fill="${dot}"/>
  <text x="60" y="62" font-family="Georgia, 'Times New Roman', serif" font-size="46" font-weight="400" fill="${text}">Queer<tspan font-style="italic">Pulse</tspan></text>
</svg>`;
}

const KIT_README = `QUEERPULSE — PRESS KIT
======================
Updated 14 May 2026

Licence
-------
All assets in this kit are licensed under Creative Commons BY 4.0 for editorial
use. Commercial reuse requires written permission — write to press@queerpulse.app.

Contents
--------
1. Boilerplate (25 / 60 / 130 words) — cleared for direct quotation.
2. Marks — SVG + PNG @2x, three approved variations.
3. Colour system — Plum #2D1B3D · Coral #E8775A · Cream #F7F3EE · Jade #4A8C6F.
4. Photography — six model-released images, 3000 x 2000 px.
5. Named spokespeople and their topics.
6. Fact sheet (EN & PT).
7. 2025 transparency report (audited).

Press desk
----------
press@queerpulse.app · +351 21 314 08 22 (Mon-Fri 10:00-18:00 WET)
Response time: < 8 working hours · Languages: EN · PT · ES

(This is a prototype download generated in your browser — the real ZIP is
assembled server-side in production.)
`;

export const KIT_MANIFEST: PressAsset = {
  filename: "queerpulse-press-kit-README.txt",
  mime: "text/plain;charset=utf-8",
  content: KIT_README,
};

export const KIT_PREVIEW = [
  {
    ic: "TXT",
    title: "README + licence",
    desc: "CC BY 4.0 terms · contacts · contents list",
  },
  {
    ic: "SVG",
    title: "Marks · 3 variations",
    desc: "Light · plum · coral · vector",
  },
  { ic: "PNG", title: "Marks @2x", desc: "For docs, slides, web" },
  {
    ic: "JPG",
    title: "Photography · 6 images",
    desc: "3000 × 2000 px · model-released",
  },
  { ic: "TXT", title: "Boilerplate", desc: "25 / 60 / 130-word versions" },
  { ic: "PDF", title: "Fact sheet · EN & PT", desc: "One-page printable" },
];

const BOILER_TXT = `QUEERPULSE — APPROVED BOILERPLATE
=================================

SHORT (25 words)
QueerPulse is a queer professional network rooted in Lisbon — connecting LGBTQ+
professionals, creatives, activists and community members for work, community,
culture and mutual support.

MEDIUM (60 words)
QueerPulse is a queer professional network rooted in Lisbon, founded in 2024.
We connect LGBTQ+ professionals, creatives, activists and community members for
work, community, culture and mutual support. Membership is by invitation,
operationally protected, and free at the solidarity tier. The platform runs a
magazine, a podcast, a safe-spaces network, and a micro-grants fund disbursed by
the community itself.

These versions are cleared for direct quotation without further sign-off.
`;

/**
 * Build the file payload for a given Downloads-section row, keyed off its
 * icon label. Logos/marks become real SVGs; everything else a readable text
 * manifest describing the asset.
 */
export function assetFor(ic: string, title: string, desc: string): PressAsset {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (ic === "SVG") {
    return {
      filename: `${slug}.svg`,
      mime: "image/svg+xml",
      content: logoSvg("light"),
    };
  }
  if (ic === "ZIP") {
    return KIT_MANIFEST;
  }
  return {
    filename: `${slug}.txt`,
    mime: "text/plain;charset=utf-8",
    content:
      title === "Boilerplate" || /boilerplate/i.test(title)
        ? BOILER_TXT
        : `QUEERPULSE — ${title.toUpperCase()}\n\n${desc}\n\nThis file is a prototype placeholder generated in your browser.\nThe production press kit ships the real asset described above.\n\npress@queerpulse.app\n`,
  };
}
