/*
  Renders the marketing pieces into public/marketing-flyers/, where
  Admin › Marketing lists them (see
  src/features/admin/marketingVideos/marketingFlyers.data.ts).

    pnpm flyers                                      every piece
    node scripts/launch-flyer/render.mjs first-event       the event flyer only
    node scripts/launch-flyer/render.mjs studio-open-call  the Studio story only

  first-event (flyer.html): writes qr.svg (queerpulse.com, plum on white)
  next to flyer.html, then <id>.png (2480 x 3520, A5 at about 425 dpi),
  vector PDFs at A5 and A4, <id>-a5-print.pdf for print shops (A5 with
  3 mm bleed and crop marks, 166 x 228 mm overall) and <id>-preview.jpg
  (620 x 880) for the dashboard card. The flyer is one 1240 x 1760 canvas,
  which is A5's ratio, so A5 fits exactly and A4 scales by its height.

  studio-open-call (studio-story.html): the QueerPulse Studio open call as
  an Instagram story, one 1080 x 1920 canvas rendered at 1x, because
  Instagram re-compresses anything bigger. Writes <id>.png (English),
  <id>-pt.png (Portuguese, from ?lang=pt) and <id>-preview.jpg (540 x 960,
  from the English) for the dashboard card. No PDF and no QR.
*/
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import QRCode from "qrcode";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const OUT = join(HERE, "../../public/marketing-flyers");
const CSS_PX_PER_MM = 96 / 25.4;

/** Opens a source page and waits for its fonts and assets to settle. */
async function openPage(browser, pageOptions, href) {
  const page = await browser.newPage(pageOptions);
  await page.goto(href);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
  return page;
}

async function renderFirstEvent(browser) {
  const FLYER_ID = "first-event";
  const URL_TARGET = "https://queerpulse.com";
  const CANVAS = { width: 1240, height: 1760 };
  const PAPERS = [
    { name: "a5", widthMm: 148, heightMm: 210 },
    { name: "a4", widthMm: 210, heightMm: 297 },
  ];
  const flyerHref = pathToFileURL(join(HERE, "flyer.html")).href;

  const qrSvg = await QRCode.toString(URL_TARGET, {
    type: "svg",
    errorCorrectionLevel: "Q",
    margin: 2,
    color: { dark: "#2d1b3d", light: "#ffffff" },
  });
  await writeFile(join(HERE, "qr.svg"), qrSvg);

  const page = await openPage(
    browser,
    { viewport: CANVAS, deviceScaleFactor: 2 },
    flyerHref,
  );

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
  const printPage = await openPage(
    browser,
    {
      viewport: {
        width: Math.ceil(CANVAS.width * (1 + (2 * marginMm) / A5.widthMm)),
        height: Math.ceil(CANVAS.height * (1 + (2 * marginMm) / A5.heightMm)),
      },
    },
    `${flyerHref}?print=bleed`,
  );
  await printPage.pdf({
    path: join(OUT, `${FLYER_ID}-a5-print.pdf`),
    width: `${A5.widthMm + 2 * marginMm}mm`,
    height: `${A5.heightMm + 2 * marginMm}mm`,
    printBackground: true,
    pageRanges: "1",
    scale: (A5.widthMm * CSS_PX_PER_MM) / CANVAS.width,
  });

  // The dashboard card's still, at half size so the page stays light.
  const preview = await openPage(
    browser,
    { viewport: CANVAS, deviceScaleFactor: 0.5 },
    flyerHref,
  );
  await preview.screenshot({
    path: join(OUT, `${FLYER_ID}-preview.jpg`),
    type: "jpeg",
    quality: 82,
  });

  console.log(`Wrote qr.svg and ${FLYER_ID} PNG, PDFs and preview to ${OUT}`);
}

async function renderStudioOpenCall(browser) {
  const STORY_ID = "studio-open-call";
  const CANVAS = { width: 1080, height: 1920 };
  const storyHref = pathToFileURL(join(HERE, "studio-story.html")).href;

  for (const [lang, suffix] of [
    ["en", ""],
    ["pt", "-pt"],
  ]) {
    const page = await openPage(
      browser,
      { viewport: CANVAS, deviceScaleFactor: 1 },
      `${storyHref}?lang=${lang}`,
    );
    await page.screenshot({ path: join(OUT, `${STORY_ID}${suffix}.png`) });
  }

  // The dashboard card's still, at half size, from the English story.
  const preview = await openPage(
    browser,
    { viewport: CANVAS, deviceScaleFactor: 0.5 },
    `${storyHref}?lang=en`,
  );
  await preview.screenshot({
    path: join(OUT, `${STORY_ID}-preview.jpg`),
    type: "jpeg",
    quality: 82,
  });

  console.log(`Wrote ${STORY_ID} PNGs (EN, PT) and preview to ${OUT}`);
}

const PIECES = {
  "first-event": renderFirstEvent,
  "studio-open-call": renderStudioOpenCall,
};

const requested = process.argv[2];
if (requested && !(requested in PIECES)) {
  console.error(
    `Unknown piece "${requested}": render.mjs knows ${Object.keys(PIECES).join(", ")}`,
  );
  process.exit(1);
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
for (const [pieceId, render] of Object.entries(PIECES)) {
  if (!requested || requested === pieceId) await render(browser);
}
await browser.close();
