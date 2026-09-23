/**
 * The demo Uno reverse sticker pack: committed PNGs plus the catalogue entry
 * that serves them in demo mode, so the composer's sticker picker shows real
 * artwork with no backend running.
 *
 * OUTPUTS are `public/stickers/uno-reverse/<flagId>.png`, one per flag in
 * `UNO_REVERSE_FLAG_IDS`, and `src/features/stickers/demoStickerPacks.data.ts`.
 * Both are generated in full and never hand-edited. Re-run with `pnpm
 * stickers` after touching the geometry, the default params, or the flag
 * registry.
 *
 * Like `scripts/generate-icons.mjs` and `scripts/generate-chat-wallpapers.mjs`,
 * the result is committed rather than built on demand: the art changes
 * roughly never, and a build-time Chromium launch would be a poor trade for
 * eleven static images. That is also why this script is NOT wired into
 * `pnpm build`.
 *
 * TWO PROBLEMS, two tools, neither re-derived here:
 *
 * - The geometry lives in TypeScript (`unoReverse.geometry.ts`), so a plain
 *   Node script cannot `import` it directly. Vite's own dev server can:
 *   `createServer({ root, server: { middlewareMode: true }, appType: "custom" })`
 *   followed by `ssrLoadModule(...)` compiles and runs the module in this
 *   process, closed in a `finally`. `middlewareMode` binds no port, so this
 *   never touches 5173 or 3000. `vite` is a declared dependency; `tsx`,
 *   `jiti` and a top-level `esbuild` are not, and fail to resolve under
 *   pnpm's strict `node_modules`.
 * - The geometry is standalone SVG (`primitivesToSvg`), and only a real
 *   browser rasterises SVG with a preserved alpha channel around the card.
 *   `@playwright/test`'s Chromium, already a devDependency for prerendering
 *   and e2e, loads each SVG through `page.setContent` inside a document with
 *   a transparent background and screenshots it with `omitBackground: true`.
 *
 * Every SVG is kept in memory between the two phases; only the PNGs are
 * wanted as output, so no intermediate `.svg` file ever touches disk.
 *
 * The sticker fields below (slug, keyword lists, the "<Flag> reverse" label)
 * mirror what `useStickerPublish.ts` sends a real pack through the admin
 * builder, so a demo sticker and a published one carry the same shape. The
 * flag names come from `cards:flag.<id>` in the English catalog rather than
 * a capitalised flag id, which is also what the builder's own preview grid
 * reads its labels from.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { chromium } from "@playwright/test";
import { format, resolveConfig } from "prettier";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, "..");
const pngOutputDirectory = path.join(repoRoot, "public/stickers/uno-reverse");
const dataOutputPath = path.join(
  repoRoot,
  "src/features/stickers/demoStickerPacks.data.ts",
);

const PACK_ID = "demo-sticker-pack-uno-reverse";
const PACK_SLUG = "uno-reverse";
const PACK_NAME = "Uno reverse";
const PACK_DESCRIPTION =
  "Every striped pride flag, drawn as an Uno reverse card.";

/* -------------------------------------------------------------- geometry */

const server = await createServer({
  root: repoRoot,
  server: { middlewareMode: true },
  appType: "custom",
  // The four modules loaded below pull in nothing heavier than plain data
  // and type-only imports, so there is nothing for the dependency optimizer
  // to usefully pre-bundle. Left at its default, Vite still crawls the
  // app's own `index.html` (140+ routes) looking for client dependencies to
  // scan, which is pure overhead here and, against a project this size, has
  // been observed to spin rather than finish. `noDiscovery` skips that scan
  // entirely.
  optimizeDeps: { noDiscovery: true, include: [] },
});

let flagEntries;
let stickerCanvasSize;
try {
  const geometryModule = await server.ssrLoadModule(
    "/src/features/stickers/templates/unoReverse.geometry.ts",
  );
  const paramsModule = await server.ssrLoadModule(
    "/src/features/stickers/templates/unoReverse.params.ts",
  );
  const svgModule = await server.ssrLoadModule(
    "/src/features/stickers/render/primitivesToSvg.ts",
  );
  const cardsModule = await server.ssrLoadModule(
    "/src/shared/i18n/catalogs/en/cards.ts",
  );

  const { unoReverseGeometry } = geometryModule;
  const { UNO_REVERSE_DEFAULTS, UNO_REVERSE_FLAG_IDS, STICKER_CANVAS_SIZE } =
    paramsModule;
  const { primitivesToSvg } = svgModule;
  const { cards } = cardsModule;

  stickerCanvasSize = STICKER_CANVAS_SIZE;
  flagEntries = UNO_REVERSE_FLAG_IDS.map((flagId) => {
    const flagName = cards[`flag.${flagId}`];
    if (!flagName) {
      throw new Error(
        `generate-sticker-packs: no English "flag.${flagId}" entry in cards.ts`,
      );
    }
    const primitives = unoReverseGeometry({
      ...UNO_REVERSE_DEFAULTS,
      flagId,
    });
    const svg = primitivesToSvg(primitives, STICKER_CANVAS_SIZE);
    return { flagId, flagName, svg };
  });
} finally {
  await server.close();
}

/* ------------------------------------------------------------ rasterise */

await mkdir(pngOutputDirectory, { recursive: true });

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: stickerCanvasSize, height: stickerCanvasSize },
    deviceScaleFactor: 1,
  });
  for (const entry of flagEntries) {
    const html =
      "<!doctype html><html><head><style>html,body{margin:0;padding:0;background:transparent;}</style></head>" +
      `<body>${entry.svg}</body></html>`;
    await page.setContent(html);
    await page.screenshot({
      path: path.join(pngOutputDirectory, `${entry.flagId}.png`),
      omitBackground: true,
    });
  }
} finally {
  await browser.close();
}

console.log(
  `Wrote ${flagEntries.length} stickers to ${path.relative(repoRoot, pngOutputDirectory)}/`,
);

/* ------------------------------------------------------------ data file */

function renderSticker(entry) {
  const stickerId = `demo-sticker-uno-reverse-${entry.flagId}`;
  const slug = `uno-reverse-${entry.flagId}`;
  const label = `${entry.flagName} reverse`;
  const url = `/stickers/uno-reverse/${entry.flagId}.png`;
  const fields = [
    `id: ${JSON.stringify(stickerId)}`,
    `slug: ${JSON.stringify(slug)}`,
    `label: ${JSON.stringify(label)}`,
    `url: ${JSON.stringify(url)}`,
    `width: ${stickerCanvasSize}`,
    `height: ${stickerCanvasSize}`,
    `keywords: { en: ${JSON.stringify([entry.flagId, "uno", "reverse"])}, pt: ${JSON.stringify([entry.flagId, "uno", "reverso"])} }`,
  ];
  return `      { ${fields.join(", ")} },`;
}

function renderModule(entries) {
  const stickerLines = entries.map(renderSticker).join("\n");
  const coverStickerId = `demo-sticker-uno-reverse-${entries[0].flagId}`;
  return [
    'import type { StickerPackResponse } from "../../shared/contracts/contracts";',
    "",
    "/**",
    " * The demo catalogue. GENERATED by `scripts/generate-sticker-packs.mjs`",
    " * (`pnpm stickers`); edit the generator, never this file.",
    " *",
    " * One pack: the Uno reverse card template, painted for every flag in",
    " * `UNO_REVERSE_FLAG_IDS`. The PNGs it points at live alongside it under",
    " * `public/stickers/uno-reverse/`, written by the same generator run.",
    " */",
    "export const DEMO_STICKER_PACKS: StickerPackResponse[] = [",
    "  {",
    `    id: ${JSON.stringify(PACK_ID)},`,
    `    slug: ${JSON.stringify(PACK_SLUG)},`,
    `    name: ${JSON.stringify(PACK_NAME)},`,
    `    description: ${JSON.stringify(PACK_DESCRIPTION)},`,
    `    coverStickerId: ${JSON.stringify(coverStickerId)},`,
    "    stickers: [",
    stickerLines,
    "    ],",
    "  },",
    "];",
    "",
  ].join("\n");
}

const prettierOptions = await resolveConfig(dataOutputPath);
const source = await format(renderModule(flagEntries), {
  ...prettierOptions,
  parser: "typescript",
});
await writeFile(dataOutputPath, source, "utf8");

const kilobytes = (Buffer.byteLength(source, "utf8") / 1024).toFixed(1);
console.log(
  `demoStickerPacks.data.ts: 1 pack, ${flagEntries.length} stickers, ${kilobytes} KB -> ${path.relative(repoRoot, dataOutputPath)}`,
);
