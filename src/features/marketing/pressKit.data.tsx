import { type ReactNode } from "react";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";

/**
 * i18n Pattern B — several fields carry inline `<em>`/`<b>` runs, so this file
 * exports `buildX(t)` functions rather than plain-string Pattern A arrays.
 *
 * Scope split (see `docs/i18n/extraction-brief.md` §1):
 * - Boilerplate, logo/colour/photography/fact-sheet metadata, spokespeople
 *   roles and availability: platform-authored press-kit chrome → translated.
 * - `COVERAGE` headlines + sources: real press pieces written by other
 *   publications → left in English (they're quotations, not our copy).
 * - Swatch `name`/`hex` and spokespeople names: proper nouns → left as-is.
 */

export function buildBoiler(
  t: TFunction,
): { id: string; label: string; wc: string; text: string }[] {
  return [
    {
      id: "short",
      label: t("marketing:pressKit.boiler.short.label"),
      wc: t("marketing:pressKit.boiler.short.wc"),
      text: t("marketing:pressKit.boiler.short.text"),
    },
    {
      id: "med",
      label: t("marketing:pressKit.boiler.med.label"),
      wc: t("marketing:pressKit.boiler.med.wc"),
      text: t("marketing:pressKit.boiler.med.text"),
    },
    {
      id: "long",
      label: t("marketing:pressKit.boiler.long.label"),
      wc: t("marketing:pressKit.boiler.long.wc"),
      text: t("marketing:pressKit.boiler.long.text"),
    },
  ];
}

export function buildLogos(): {
  display: string;
  mark: string;
  meta: ReactNode;
}[] {
  return [
    {
      display: "displayCream",
      mark: "markDark",
      meta: (
        <Translation
          i18nKey="marketing:pressKit.mark.logo.light.meta"
          components={{ b: <b /> }}
        />
      ),
    },
    {
      display: "displayPlum",
      mark: "markLight",
      meta: (
        <Translation
          i18nKey="marketing:pressKit.mark.logo.plum.meta"
          components={{ b: <b /> }}
        />
      ),
    },
    {
      display: "displayCoral",
      mark: "markLight markCoral",
      meta: (
        <Translation
          i18nKey="marketing:pressKit.mark.logo.coral.meta"
          components={{ b: <b /> }}
        />
      ),
    },
  ];
}

export function buildSwatches(
  t: TFunction,
): { bg: string; name: string; hex: string; meta: string; border?: boolean }[] {
  return [
    {
      bg: "#2D1B3D",
      name: "Plum",
      hex: "#2D1B3D",
      meta: t("marketing:pressKit.colour.plum.meta"),
    },
    {
      bg: "#E8775A",
      name: "Coral",
      hex: "#E8775A",
      meta: t("marketing:pressKit.colour.coral.meta"),
    },
    {
      bg: "#F7F3EE",
      name: "Cream",
      hex: "#F7F3EE",
      meta: t("marketing:pressKit.colour.cream.meta"),
      border: true,
    },
    {
      bg: "#4A8C6F",
      name: "Jade",
      hex: "#4A8C6F",
      meta: t("marketing:pressKit.colour.jade.meta"),
    },
  ];
}

export function buildImages(t: TFunction): { tint: string; label: string }[] {
  return [
    { tint: "tintA", label: t("marketing:pressKit.photography.image1") },
    { tint: "tintB", label: t("marketing:pressKit.photography.image2") },
    { tint: "tintC", label: t("marketing:pressKit.photography.image3") },
    { tint: "tintA", label: t("marketing:pressKit.photography.image4") },
    { tint: "tintB", label: t("marketing:pressKit.photography.image5") },
    { tint: "tintC", label: t("marketing:pressKit.photography.image6") },
  ];
}

export function buildTeam(t: TFunction): {
  ph: string;
  phCls: string;
  name: ReactNode;
  role: string;
  desc: ReactNode;
  langs: ReactNode;
  email: string;
}[] {
  return [
    {
      ph: "MR",
      phCls: "",
      name: (
        <>
          Marta <em>Reis</em>
        </>
      ),
      role: t("marketing:pressKit.team.marta.role"),
      desc: (
        <Translation
          i18nKey="marketing:pressKit.team.marta.desc"
          components={{ em: <em /> }}
        />
      ),
      langs: (
        <Translation
          i18nKey="marketing:pressKit.team.marta.langs"
          components={{ b: <b /> }}
        />
      ),
      email: "marta@queerpulse.app",
    },
    {
      ph: "CV",
      phCls: "phJade",
      name: (
        <>
          Catarina <em>Vaz</em>
        </>
      ),
      role: t("marketing:pressKit.team.catarina.role"),
      desc: t("marketing:pressKit.team.catarina.desc"),
      langs: (
        <Translation
          i18nKey="marketing:pressKit.team.catarina.langs"
          components={{ b: <b /> }}
        />
      ),
      email: "catarina@queerpulse.app",
    },
    {
      ph: "AB",
      phCls: "phPlum",
      name: (
        <>
          André <em>Bento</em>
        </>
      ),
      role: t("marketing:pressKit.team.andre.role"),
      desc: t("marketing:pressKit.team.andre.desc"),
      langs: (
        <Translation
          i18nKey="marketing:pressKit.team.andre.langs"
          components={{ b: <b /> }}
        />
      ),
      email: "andre@queerpulse.app",
    },
  ];
}

/** `b` holds the figure itself (numeric markup); `s` is the translated label
 * shown under it. */
export function buildFacts(t: TFunction): { b: ReactNode; s: string }[] {
  return [
    {
      b: (
        <>
          <em>2024</em>
        </>
      ),
      s: t("marketing:pressKit.facts.founded"),
    },
    { b: <>1,847</>, s: t("marketing:pressKit.facts.activeMembers") },
    {
      b: (
        <>
          <em>96</em>%
        </>
      ),
      s: t("marketing:pressKit.facts.toPrograms"),
    },
    {
      b: (
        <>
          €<em>278</em>k
        </>
      ),
      s: t("marketing:pressKit.facts.totalRaised"),
    },
    { b: <>284</>, s: t("marketing:pressKit.facts.gatherings") },
    {
      b: (
        <>
          <em>147</em>
        </>
      ),
      s: t("marketing:pressKit.facts.microGrants"),
    },
    {
      b: (
        <>
          <em>42</em>
        </>
      ),
      s: t("marketing:pressKit.facts.safeSpaces"),
    },
    { b: <>9</>, s: t("marketing:pressKit.facts.magazineIssues") },
    {
      b: (
        <>
          22<em>%</em>
        </>
      ),
      s: t("marketing:pressKit.facts.transNonBinary"),
    },
  ];
}

/**
 * Real press coverage — each headline and outlet is another publication's own
 * wording, so this list stays in English regardless of locale.
 */
export const COVERAGE: {
  source: string;
  title: ReactNode;
  meta: string;
  day: string;
  month: string;
}[] = [
  {
    source: "Público · 4 Mar 2026",
    title: (
      <>
        "Em Lisboa, uma rede profissional <em>queer e independente</em>."
      </>
    ),
    meta: "Long-form feature · by Ana Sá Lopes · 6,400 words",
    day: "04",
    month: " Mar",
  },
  {
    source: "Vice Portugal · 18 Feb 2026",
    title: (
      <>
        The platform that <em>refuses to scale.</em>
      </>
    ),
    meta: "Interview with Marta Reis · 22 min read",
    day: "18",
    month: " Feb",
  },
  {
    source: "FT Weekend · 24 Jan 2026",
    title: <>Inside Lisbon's quietest queer institution.</>,
    meta: "Long-form magazine piece · syndicated to FT.com",
    day: "24",
    month: " Jan",
  },
  {
    source: "Mensagem de Lisboa · 11 Nov 2025",
    title: (
      <>
        A Câmara dos <em>Anjos.</em>
      </>
    ),
    meta: "Local-press feature on the neighbourhood",
    day: "11",
    month: " Nov",
  },
  {
    source: "Are.na Annual · Dec 2024",
    title: <>The 12 platforms we wished existed in 2024.</>,
    meta: "Editor's pick · positioned #4",
    day: "12",
    month: " Dec",
  },
];

export function buildDownloads(
  t: TFunction,
): { ic: string; icCls: string; title: string; desc: string }[] {
  return [
    {
      ic: "ZIP",
      icCls: "dlZip",
      title: t("marketing:pressKit.downloads.completeKit.title"),
      desc: t("marketing:pressKit.downloads.completeKit.desc"),
    },
    {
      ic: "SVG",
      icCls: "",
      title: t("marketing:pressKit.downloads.marksSvg.title"),
      desc: t("marketing:pressKit.downloads.marksSvg.desc"),
    },
    {
      ic: "PNG",
      icCls: "",
      title: t("marketing:pressKit.downloads.marksPng.title"),
      desc: t("marketing:pressKit.downloads.marksPng.desc"),
    },
    {
      ic: "JPG",
      icCls: "",
      title: t("marketing:pressKit.downloads.photography.title"),
      desc: t("marketing:pressKit.downloads.photography.desc"),
    },
    {
      ic: "PDF",
      icCls: "",
      title: t("marketing:pressKit.downloads.factSheet.title"),
      desc: t("marketing:pressKit.downloads.factSheet.desc"),
    },
    {
      ic: "PDF",
      icCls: "",
      title: t("marketing:pressKit.downloads.transparency.title"),
      desc: t("marketing:pressKit.downloads.transparency.desc"),
    },
  ];
}
