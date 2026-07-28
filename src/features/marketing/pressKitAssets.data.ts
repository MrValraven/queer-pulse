import type { TFunction } from "../../shared/i18n/types";

/**
 * Real, client-generated file payloads for the press-kit downloads. The
 * prototype has no backend, so each "download" produces a genuine Blob from
 * these strings via downloadBlob(). Every line of prose here is
 * platform-authored chrome (a press-kit README/licence/placeholder text)
 * that ships in the bundle regardless of demo/live mode, so it's translated
 * in full via `t()` — see `buildKitReadme` / `buildBoilerTxt` / `assetFor`.
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

/** Builds the plain-text README + licence file bundled with the full kit. */
export function buildKitReadme(t: TFunction): string {
  return `${t("marketing:pressKit.readme.heading")}
======================
${t("marketing:pressKit.readme.updated")}

${t("marketing:pressKit.readme.licenceHeading")}
-------
${t("marketing:pressKit.readme.licenceBody")}

${t("marketing:pressKit.readme.contentsHeading")}
--------
1. ${t("marketing:pressKit.readme.contents.boilerplate")}
2. ${t("marketing:pressKit.readme.contents.marks")}
3. ${t("marketing:pressKit.readme.contents.colour")}
4. ${t("marketing:pressKit.readme.contents.photography")}
5. ${t("marketing:pressKit.readme.contents.spokespeople")}
6. ${t("marketing:pressKit.readme.contents.factSheet")}
7. ${t("marketing:pressKit.readme.contents.transparencyReport")}

${t("marketing:pressKit.readme.pressDeskHeading")}
----------
press@queerpulse.app · +351 21 314 08 22 (${t("marketing:pressKit.readme.hours")})
${t("marketing:pressKit.readme.responseTime")}

(${t("marketing:pressKit.readme.prototypeNote")})
`;
}

export function buildKitManifest(t: TFunction): PressAsset {
  return {
    filename: "queerpulse-press-kit-README.txt",
    mime: "text/plain;charset=utf-8",
    content: buildKitReadme(t),
  };
}

export function buildKitPreview(
  t: TFunction,
): { ic: string; title: string; description: string }[] {
  return [
    {
      ic: "TXT",
      title: t("marketing:pressKit.preview.readme.title"),
      description: t("marketing:pressKit.preview.readme.desc"),
    },
    {
      ic: "SVG",
      title: t("marketing:pressKit.preview.marks.title"),
      description: t("marketing:pressKit.preview.marks.desc"),
    },
    {
      ic: "PNG",
      title: t("marketing:pressKit.preview.marksPng.title"),
      description: t("marketing:pressKit.preview.marksPng.desc"),
    },
    {
      ic: "JPG",
      title: t("marketing:pressKit.preview.photography.title"),
      description: t("marketing:pressKit.preview.photography.desc"),
    },
    {
      ic: "TXT",
      title: t("marketing:pressKit.preview.boilerplate.title"),
      description: t("marketing:pressKit.preview.boilerplate.desc"),
    },
    {
      ic: "PDF",
      title: t("marketing:pressKit.preview.factSheet.title"),
      description: t("marketing:pressKit.preview.factSheet.desc"),
    },
  ];
}

/** Builds the plain-text approved-boilerplate download, reusing the same
 * translated short/medium boilerplate copy shown on the page itself. */
export function buildBoilerTxt(t: TFunction): string {
  return `${t("marketing:pressKit.readme.boilerHeading")}
=================================

${t("marketing:pressKit.boiler.short.wc").toUpperCase()}
${t("marketing:pressKit.boiler.short.text")}

${t("marketing:pressKit.boiler.med.wc").toUpperCase()}
${t("marketing:pressKit.boiler.med.text")}

${t("marketing:pressKit.readme.boilerCleared")}
`;
}

/**
 * Build the file payload for a given Downloads-section row, keyed off its
 * icon label. Logos/marks become real SVGs; everything else a readable text
 * manifest describing the asset.
 */
export function assetFor(
  t: TFunction,
  ic: string,
  title: string,
  description: string,
): PressAsset {
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
    return buildKitManifest(t);
  }
  return {
    filename: `${slug}.txt`,
    mime: "text/plain;charset=utf-8",
    content:
      title === t("marketing:pressKit.downloads.boilerplate.title") ||
      /boilerplate/i.test(title)
        ? buildBoilerTxt(t)
        : `QUEERPULSE — ${title.toUpperCase()}\n\n${description}\n\n${t("marketing:pressKit.placeholderFile.line1")}\n${t("marketing:pressKit.placeholderFile.line2")}\n\npress@queerpulse.app\n`,
  };
}
