/*
  Renders the team tee's print files.

    pnpm merch

  Into public/marketing-merch/, where Admin › Marketing lists them (see
  src/features/admin/marketingVideos/marketingMerch.data.ts):
  <id>-front.png and <id>-back.png (transparent, 300 dpi, trimmed to the
  ink, so they print at their real size), <id>-front.pdf and <id>-back.pdf
  (vector, fonts embedded), <id>-front.svg and <id>-back.svg (vector, the
  letters converted to shapes so no font is needed, for screen printers and
  editing), <id>-mockup.png with both prints on a black tee, and
  <id>-preview.jpg (810 x 455) for the dashboard card. Trimming uses
  Python's Pillow and the SVGs come from Poppler's pdftocairo
  (`brew install poppler`), which macOS setups here have.
*/
import { spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const OUT = join(HERE, "../../public/marketing-merch");
const MERCH_ID = "team-tee";
const PAGE = pathToFileURL(join(HERE, "tee.html")).href;
const PRINT_DPI = 300;
const PRINTS = ["front", "back"];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

async function open(part, deviceScaleFactor) {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor,
  });
  await page.goto(`${PAGE}?part=${part}`);
  await page.evaluate(() => window.ready);
  return page;
}

for (const part of PRINTS) {
  // 1 CSS px is 1/96 in, so this scale shoots the print at 300 dpi.
  const page = await open(part, PRINT_DPI / 96);
  const print = page.locator(`#${part}`);
  const pngPath = join(OUT, `${MERCH_ID}-${part}.png`);
  await print.screenshot({ path: pngPath, omitBackground: true });
  const box = await print.boundingBox();
  await page.pdf({
    path: join(OUT, `${MERCH_ID}-${part}.pdf`),
    width: `${Math.ceil(box.width)}px`,
    height: `${Math.ceil(box.height)}px`,
    pageRanges: "1",
  });
  await page.close();

  // The SVG is the PDF with every glyph drawn as a path, so it needs no font.
  const svg = spawnSync(
    "pdftocairo",
    [
      "-svg",
      join(OUT, `${MERCH_ID}-${part}.pdf`),
      join(OUT, `${MERCH_ID}-${part}.svg`),
    ],
    { encoding: "utf8" },
  );
  if (svg.error || svg.status !== 0)
    throw new Error(
      `pdftocairo failed (brew install poppler): ${svg.error?.message ?? svg.stderr}`,
    );

  // Trim the transparent padding and stamp 300 dpi into the file.
  const trim = spawnSync(
    "python3",
    [
      "-c",
      `import sys
from PIL import Image
image = Image.open(sys.argv[1])
image = image.crop(image.getchannel("A").getbbox())
image.save(sys.argv[1], dpi=(${PRINT_DPI}, ${PRINT_DPI}))
print(f"{image.width} x {image.height} px = {image.width / ${PRINT_DPI} * 2.54:.1f} x {image.height / ${PRINT_DPI} * 2.54:.1f} cm")`,
      pngPath,
    ],
    { encoding: "utf8" },
  );
  if (trim.status !== 0) throw new Error(trim.stderr);
  console.log(`${MERCH_ID}-${part}.png: ${trim.stdout.trim()}`);
}

const mockup = await open("mockup", 2);
await mockup.locator("#mockup").screenshot({
  path: join(OUT, `${MERCH_ID}-mockup.png`),
});
// The dashboard card's still, at half size so the page stays light.
const preview = await open("mockup", 0.5);
await preview.locator("#mockup").screenshot({
  path: join(OUT, `${MERCH_ID}-preview.jpg`),
  type: "jpeg",
  quality: 82,
});
await browser.close();
console.log(`Wrote the print files and mockup to ${OUT}`);
