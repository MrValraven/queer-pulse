/**
 * The demo sticker packs: committed PNGs plus the catalogue entries that
 * serve them in demo mode, so the composer's sticker picker shows real
 * artwork with no backend running.
 *
 * THREE PACKS, one per registered template: Uno reverse, Blip and Tea. Each
 * pack's PNGs are written to `public/stickers/<packSlug>/<itemId>.png`, one
 * per item in that template's `items` list, and every pack lands together in
 * `src/features/stickers/demoStickerPacks.data.ts`. All of it is generated
 * in full and never hand-edited. Re-run with `pnpm stickers` after touching
 * a template's geometry, default style or item catalog, or after adding a
 * template to the registry.
 *
 * Like `scripts/generate-icons.mjs` and `scripts/generate-chat-wallpapers.mjs`,
 * the result is committed rather than built on demand: the art changes
 * roughly never, and a build-time Chromium launch would be a poor trade for
 * a few dozen static images. That is also why this script is NOT wired into
 * `pnpm build`.
 *
 * TWO PROBLEMS, two tools, neither re-derived here:
 *
 * - The geometry lives in TypeScript (the registry and each template's
 *   geometry module), so a plain Node script cannot `import` it directly.
 *   Vite's own dev server can: `createServer({ root, server: { middlewareMode:
 *   true }, appType: "custom" })` followed by `ssrLoadModule(...)` compiles
 *   and runs the module in this process, closed in a `finally`.
 *   `middlewareMode` binds no port, so this never touches 5173 or 3000.
 *   `vite` is a declared dependency; `tsx`, `jiti` and a top-level `esbuild`
 *   are not, and fail to resolve under pnpm's strict `node_modules`.
 * - The geometry is standalone SVG (`primitivesToSvg`), and only a real
 *   browser rasterises SVG with a preserved alpha channel around the card.
 *   `@playwright/test`'s Chromium, already a devDependency for prerendering
 *   and e2e, loads each SVG through `page.setContent` inside a document with
 *   a transparent background and screenshots it with `omitBackground: true`.
 *
 * Every SVG is kept in memory between the two phases; only the PNGs are
 * wanted as output, so no intermediate `.svg` file ever touches disk.
 *
 * The sticker fields below (slug, keyword lists, labels) mirror what
 * `useStickerPublish.ts` sends a real pack through the admin builder, so a
 * demo sticker and a published one carry the same shape. Uno reverse keeps
 * its own label (`"<flag name> reverse"`, from the English `cards` catalog,
 * and `labelPt` the same way from the Portuguese one) and keyword format
 * exactly as before; Blip and Tea take their English and Portuguese labels
 * and keywords straight from the template's own item catalog, since those
 * two templates carry no separate flag-name lookup.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { chromium } from "@playwright/test";
import { format, resolveConfig } from "prettier";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, "..");
const publicStickersDirectory = path.join(repoRoot, "public/stickers");
const dataOutputPath = path.join(
  repoRoot,
  "src/features/stickers/demoStickerPacks.data.ts",
);

/** One row per pack, in registry order. `templateId` resolves the template
 *  through the registry; everything else names the pack itself. */
const PACK_TABLE = [
  {
    templateId: "uno-reverse",
    packId: "demo-sticker-pack-uno-reverse",
    packSlug: "uno-reverse",
    packName: "Uno reverse",
    packNamePt: "Uno reverse",
    packDescription: "Every pride flag, drawn as an Uno reverse card.",
    pngDirectoryName: "uno-reverse",
  },
  {
    templateId: "blip",
    packId: "demo-sticker-pack-blip",
    packSlug: "blip",
    packName: "Blip",
    packNamePt: "Blip",
    packDescription: "QueerPulse's own mascot, in 22 moods.",
    pngDirectoryName: "blip",
  },
  {
    templateId: "tea-slang",
    packId: "demo-sticker-pack-tea",
    packSlug: "tea",
    packName: "Tea, shade and sparkle",
    packNamePt: "Cusquice, veneno e brilho",
    packDescription: "Queer slang, no words needed.",
    pngDirectoryName: "tea",
  },
];

/* -------------------------------------------------------------- geometry */

const server = await createServer({
  root: repoRoot,
  server: { middlewareMode: true },
  appType: "custom",
  // The modules loaded below pull in nothing heavier than plain data and
  // type-only imports, so there is nothing for the dependency optimizer to
  // usefully pre-bundle. Left at its default, Vite still crawls the app's
  // own `index.html` (140+ routes) looking for client dependencies to scan,
  // which is pure overhead here and, against a project this size, has been
  // observed to spin indefinitely without completing. `noDiscovery` skips
  // that scan entirely.
  optimizeDeps: { noDiscovery: true, include: [] },
});

let packEntries;
let stickerCanvasSize;
try {
  const registryModule = await server.ssrLoadModule(
    "/src/features/stickers/templates/registry.ts",
  );
  const svgModule = await server.ssrLoadModule(
    "/src/features/stickers/render/primitivesToSvg.ts",
  );
  const cardsModule = await server.ssrLoadModule(
    "/src/shared/i18n/catalogs/en/cards.ts",
  );
  const portugueseCardsModule = await server.ssrLoadModule(
    "/src/shared/i18n/catalogs/pt/cards.ts",
  );
  const paramsModule = await server.ssrLoadModule(
    "/src/features/stickers/templates/unoReverse.params.ts",
  );

  const { templateById } = registryModule;
  const { primitivesToSvg } = svgModule;
  const { cards } = cardsModule;
  const { cards: portugueseCards } = portugueseCardsModule;
  const { STICKER_CANVAS_SIZE } = paramsModule;

  stickerCanvasSize = STICKER_CANVAS_SIZE;

  packEntries = PACK_TABLE.map((packConfig) => {
    const template = templateById(packConfig.templateId);
    if (!template) {
      throw new Error(
        `generate-sticker-packs: no "${packConfig.templateId}" template in the registry`,
      );
    }
    const isUnoReverse = packConfig.templateId === "uno-reverse";
    const stickerEntries = template.items.map((item) => {
      const itemId = item.id;
      let label;
      let labelPt;
      let keywords;
      if (isUnoReverse) {
        const flagName = cards[`flag.${itemId}`];
        if (!flagName) {
          throw new Error(
            `generate-sticker-packs: no English "flag.${itemId}" entry in cards.ts`,
          );
        }
        label = `${flagName} reverse`;
        // A flag missing from the Portuguese catalog keeps its English name.
        labelPt = `${portugueseCards[`flag.${itemId}`] ?? flagName} reverse`;
        keywords = {
          en: [itemId, "uno", "reverse"],
          pt: [itemId, "uno", "reverso"],
        };
      } else {
        label = item.label.en;
        labelPt = item.label.pt;
        keywords = item.keywords;
      }
      const primitives = template.geometry(template.defaultStyle, itemId);
      const svg = primitivesToSvg(primitives, STICKER_CANVAS_SIZE);
      return {
        itemId,
        stickerId: `demo-sticker-${packConfig.packSlug}-${itemId}`,
        slug: template.slugFor(itemId),
        label,
        labelPt,
        url: `/stickers/${packConfig.pngDirectoryName}/${itemId}.png`,
        keywords,
        svg,
      };
    });
    return {
      ...packConfig,
      coverStickerId: `demo-sticker-${packConfig.packSlug}-${template.coverItemId}`,
      stickerEntries,
    };
  });
} finally {
  await server.close();
}

/* ------------------------------------------------------------ rasterise */

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: stickerCanvasSize, height: stickerCanvasSize },
    deviceScaleFactor: 1,
  });
  for (const packEntry of packEntries) {
    const pngOutputDirectory = path.join(
      publicStickersDirectory,
      packEntry.pngDirectoryName,
    );
    await mkdir(pngOutputDirectory, { recursive: true });
    for (const stickerEntry of packEntry.stickerEntries) {
      const html =
        "<!doctype html><html><head><style>html,body{margin:0;padding:0;background:transparent;}</style></head>" +
        `<body>${stickerEntry.svg}</body></html>`;
      await page.setContent(html);
      await page.screenshot({
        path: path.join(pngOutputDirectory, `${stickerEntry.itemId}.png`),
        omitBackground: true,
      });
    }
    console.log(
      `Wrote ${packEntry.stickerEntries.length} stickers to ${path.relative(repoRoot, pngOutputDirectory)}/`,
    );
  }
} finally {
  await browser.close();
}

/* ------------------------------------------------------------ data file */

function renderSticker(stickerEntry) {
  const fields = [
    `id: ${JSON.stringify(stickerEntry.stickerId)}`,
    `slug: ${JSON.stringify(stickerEntry.slug)}`,
    `label: ${JSON.stringify(stickerEntry.label)}`,
    `labelPt: ${JSON.stringify(stickerEntry.labelPt)}`,
    `url: ${JSON.stringify(stickerEntry.url)}`,
    `width: ${stickerCanvasSize}`,
    `height: ${stickerCanvasSize}`,
    `keywords: { en: ${JSON.stringify(stickerEntry.keywords.en)}, pt: ${JSON.stringify(stickerEntry.keywords.pt)} }`,
  ];
  return `        { ${fields.join(", ")} },`;
}

function renderPack(packEntry) {
  const stickerLines = packEntry.stickerEntries.map(renderSticker).join("\n");
  return [
    "  {",
    `    id: ${JSON.stringify(packEntry.packId)},`,
    `    slug: ${JSON.stringify(packEntry.packSlug)},`,
    `    name: ${JSON.stringify(packEntry.packName)},`,
    `    namePt: ${JSON.stringify(packEntry.packNamePt)},`,
    `    description: ${JSON.stringify(packEntry.packDescription)},`,
    `    coverStickerId: ${JSON.stringify(packEntry.coverStickerId)},`,
    "    stickers: [",
    stickerLines,
    "    ],",
    "  },",
  ].join("\n");
}

function renderModule(entries) {
  const packLines = entries.map(renderPack).join("\n");
  return [
    'import type { StickerPackResponse } from "../../shared/contracts/contracts";',
    "",
    "/**",
    " * The demo catalogue. GENERATED by `scripts/generate-sticker-packs.mjs`",
    " * (`pnpm stickers`); edit the generator instead.",
    " *",
    " * Three packs, one per registered template: the Uno reverse card,",
    " * painted for every flag in `UNO_REVERSE_FLAG_IDS`; Blip, the mascot,",
    " * in its 22 poses; and Tea, shade and sparkle, in its 12 poses. The",
    " * PNGs each pack points at live alongside it under",
    " * `public/stickers/<packSlug>/`, written by the same generator run.",
    " */",
    "export const DEMO_STICKER_PACKS: StickerPackResponse[] = [",
    packLines,
    "];",
    "",
  ].join("\n");
}

const prettierOptions = await resolveConfig(dataOutputPath);
const source = await format(renderModule(packEntries), {
  ...prettierOptions,
  parser: "typescript",
});
await writeFile(dataOutputPath, source, "utf8");

const totalStickerCount = packEntries.reduce(
  (runningTotal, packEntry) => runningTotal + packEntry.stickerEntries.length,
  0,
);
const kilobytes = (Buffer.byteLength(source, "utf8") / 1024).toFixed(1);
console.log(
  `demoStickerPacks.data.ts: ${packEntries.length} packs, ${totalStickerCount} stickers, ${kilobytes} KB -> ${path.relative(repoRoot, dataOutputPath)}`,
);
