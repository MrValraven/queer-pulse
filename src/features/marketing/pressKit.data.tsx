import { type ReactNode } from "react";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";
import { PRESS_ASSETS, type PressAsset } from "./pressKitAssets.data";

/**
 * i18n Pattern B — several fields carry inline `<em>`/`<b>` runs, so this file
 * exports `buildX(t)` functions rather than plain-string Pattern A arrays.
 *
 * Scope split (see `docs/i18n/extraction-brief.md` §1):
 * - Boilerplate, logo and colour metadata: platform-authored press-kit
 *   chrome → translated.
 * - Swatch `name`/`hex`: proper nouns → left as-is.
 *
 * Press coverage, spokespeople and the derived headline figures are NOT here —
 * they come from `usePressKit()` (admin-managed / platform-derived in live; the
 * demo-only fabricated fixtures live in `pressKit.demo.data.ts`).
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

/**
 * The three published wordmark colourways. Each card's `asset` is the real
 * PNG generated from the same values the card itself renders with, so what a
 * journalist sees on the page is what the download hands them.
 */
export function buildLogos(): {
  asset: PressAsset;
  display: string;
  mark: string;
  meta: ReactNode;
}[] {
  return [
    {
      asset: PRESS_ASSETS.logoPrimary,
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
      asset: PRESS_ASSETS.logoInverse,
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
      asset: PRESS_ASSETS.logoCoral,
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

// Press-kit brand swatches. The literal hex values are INTENTIONAL and must not
// become design tokens: this card publishes the resolved brand colours (shown as
// the `hex:` label and rendered as the `background:` swatch) so press/partners
// can reproduce them outside the app, where CSS variables don't exist. They
// mirror the token palette (plum/coral/cream/jade) by design.
export function buildSwatches(t: TFunction): {
  background: string;
  name: string;
  hex: string;
  meta: string;
  border?: boolean;
}[] {
  return [
    {
      background: "#2D1B3D",
      name: "Plum",
      hex: "#2D1B3D",
      meta: t("marketing:pressKit.colour.plum.meta"),
    },
    {
      background: "#E8775A",
      name: "Coral",
      hex: "#E8775A",
      meta: t("marketing:pressKit.colour.coral.meta"),
    },
    {
      background: "#F7F3EE",
      name: "Cream",
      hex: "#F7F3EE",
      meta: t("marketing:pressKit.colour.cream.meta"),
      border: true,
    },
    {
      background: "#4A8C6F",
      name: "Jade",
      hex: "#4A8C6F",
      meta: t("marketing:pressKit.colour.jade.meta"),
    },
  ];
}

export function buildDownloads(t: TFunction): {
  asset: PressAsset;
  icCls: string;
  title: string;
  description: string;
}[] {
  return [
    {
      asset: PRESS_ASSETS.completeKit,
      icCls: "dlZip",
      title: t("marketing:pressKit.downloads.completeKit.title"),
      description: t("marketing:pressKit.downloads.completeKit.desc"),
    },
    {
      asset: PRESS_ASSETS.markSvg,
      icCls: "",
      title: t("marketing:pressKit.downloads.markSvg.title"),
      description: t("marketing:pressKit.downloads.markSvg.desc"),
    },
    {
      asset: PRESS_ASSETS.markMonochromeSvg,
      icCls: "",
      title: t("marketing:pressKit.downloads.markMonochrome.title"),
      description: t("marketing:pressKit.downloads.markMonochrome.desc"),
    },
    {
      asset: PRESS_ASSETS.logoPrimary,
      icCls: "",
      title: t("marketing:pressKit.downloads.wordmarkPng.title"),
      description: t("marketing:pressKit.downloads.wordmarkPng.desc"),
    },
    {
      asset: PRESS_ASSETS.appIcon,
      icCls: "",
      title: t("marketing:pressKit.downloads.appIcon.title"),
      description: t("marketing:pressKit.downloads.appIcon.desc"),
    },
    {
      asset: PRESS_ASSETS.brandReference,
      icCls: "",
      title: t("marketing:pressKit.downloads.brandReference.title"),
      description: t("marketing:pressKit.downloads.brandReference.desc"),
    },
  ];
}
