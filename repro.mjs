import { chromium } from "./node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1340, height: 900 } });
await page.goto("http://localhost:5199/local/directory", { waitUntil: "networkidle" });

const accept = page.getByRole("button", { name: /accept/i });
if (await accept.isVisible({ timeout: 2000 }).catch(() => false)) {
  await accept.click();
}

const trigger = page.locator('button[aria-haspopup="listbox"]').first();
await trigger.waitFor({ state: "visible", timeout: 10000 });
await trigger.click();
await page.waitForTimeout(250);

const panel = page.locator('[role="listbox"]').first().locator("xpath=..");
const panelBox = await panel.boundingBox();
const panelStyles = await panel.evaluate((el) => {
  const cs = getComputedStyle(el);
  return { left: cs.left, right: cs.right, width: cs.width, minWidth: cs.minWidth };
});
console.log("panel box:", panelBox, panelStyles);

// also fetch raw CSS text served for this module to make sure the min-width rule is present in the bundle
const cssHref = await page.evaluate(() => {
  const links = [...document.querySelectorAll('link[rel=stylesheet], style')];
  return links.length;
});
console.log("stylesheet/style count:", cssHref);

const hasMinWidthRule = await page.evaluate(() => {
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.cssText && rule.cssText.includes("min-width: 160px")) {
          return { found: true, cssText: rule.cssText, href: sheet.href };
        }
      }
    } catch (e) {}
  }
  return { found: false };
});
console.log("min-width:160px rule present in loaded stylesheets:", hasMinWidthRule);

await browser.close();
