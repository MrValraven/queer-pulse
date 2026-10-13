/*
  Renders the event flyer.

    pnpm flyers

  Writes qr.svg (queerpulse.com, plum on white) next to flyer.html, then
  into public/marketing-flyers/, where Admin › Marketing lists them (see
  src/features/admin/marketingVideos/marketingFlyers.data.ts):
  <id>.png (2480 x 3520, A5 at about 425 dpi), vector PDFs at A5 and A4,
  <id>-a5-print.pdf for print shops (A5 with 3 mm bleed and crop marks,
  166 x 228 mm overall) and <id>-preview.jpg (620 x 880) for the
  dashboard card. The flyer is
  one 1240 x 1760 canvas, which is A5's ratio, so A5 fits exactly and A4
  scales by its height.
*/
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import QRCode from "qrcode";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const OUT = join(HERE, "../../public/marketing-flyers");
const FLYER_ID = "first-event";
const URL_TARGET = "https://queerpulse.com";
const CANVAS = { width: 1240, height: 1760 };
const CSS_PX_PER_MM = 96 / 25.4;
const PAPERS = [
  { name: "a5", widthMm: 148, heightMm: 210 },
  { name: "a4", widthMm: 210, heightMm: 297 },
];

const qrSvg = await QRCode.toString(URL_TARGET, {
  type: "svg",
  errorCorrectionLevel: "Q",
  margin: 2,
  color: { dark: "#2d1b3d", light: "#ffffff" },
});
await writeFile(join(HERE, "qr.svg"), qrSvg);
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: CANVAS,
  deviceScaleFactor: 2,
});
await page.goto(pathToFileURL(join(HERE, "flyer.html")).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForLoadState("networkidle");

await page.screenshot({ path: join(OUT, `${FLYER_ID}.png`) });

for (const paper of PAPERS) {
  const scale = Math.min(
    (paper.widthMm * CSS_PX_PER_MM) / CANVAS.width,
    (paper.heightMm * CSS_PX_PER_MM) / CANVAS.height,
  );
  await page.pdf({
    path: join(OUT, `${FLYER_ID}-${paper.name}.pdf`),
    width: `${paper.widthMm}mm`,
    height: `${paper.heightMm}mm`,
    printBackground: true,
    pageRanges: "1",
    scale,
  });
}

// The print-shop PDF: the page grows by the bleed and the slug on every
// side, at the same scale as the A5, so the trim box is exactly A5.
const BLEED_MM = 3,
  SLUG_MM = 6;
const A5 = PAPERS[0];
const marginMm = BLEED_MM + SLUG_MM;
const printPage = await browser.newPage({
  viewport: {
    width: Math.ceil(CANVAS.width * (1 + (2 * marginMm) / A5.widthMm)),
    height: Math.ceil(CANVAS.height * (1 + (2 * marginMm) / A5.heightMm)),
  },
});
await printPage.goto(`${pathToFileURL(join(HERE, "flyer.html")).href}?print=bleed`);
await printPage.evaluate(() => document.fonts.ready);
await printPage.waitForLoadState("networkidle");
await printPage.pdf({
  path: join(OUT, `${FLYER_ID}-a5-print.pdf`),
  width: `${A5.widthMm + 2 * marginMm}mm`,
  height: `${A5.heightMm + 2 * marginMm}mm`,
  printBackground: true,
  pageRanges: "1",
  scale: (A5.widthMm * CSS_PX_PER_MM) / CANVAS.width,
});

// The dashboard card's still, at half size so the page stays light.
const preview = await browser.newPage({
  viewport: CANVAS,
  deviceScaleFactor: 0.5,
});
await preview.goto(pathToFileURL(join(HERE, "flyer.html")).href);
await preview.evaluate(() => document.fonts.ready);
await preview.waitForLoadState("networkidle");
await preview.screenshot({
  path: join(OUT, `${FLYER_ID}-preview.jpg`),
  type: "jpeg",
  quality: 82,
});

await browser.close();
console.log(`Wrote qr.svg and ${FLYER_ID} PNG, PDFs and preview to ${OUT}`);
