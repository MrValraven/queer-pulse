import { chromium } from "@playwright/test";
const out = process.argv[2];
const theme = process.argv[3] || "light";
const width = Number(process.argv[4] || 390);
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width, height: 844 },
  deviceScaleFactor: 2,
  reducedMotion: "reduce",
  isMobile: true,
  hasTouch: true,
});
await context.addInitScript((themeValue) => {
  localStorage.setItem("qp.demoMode.v1", "true");
  localStorage.setItem(
    "qp.consent.v1",
    JSON.stringify({
      analytics: false,
      monitoring: false,
      policyVersion: "3.4",
    }),
  );
  localStorage.setItem("qp-theme", themeValue);
}, theme);
const page = await context.newPage();
await page.goto("http://localhost:5231/host", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const scrollWidth = await page.evaluate(
  () => document.documentElement.scrollWidth,
);
console.log("scrollWidth", scrollWidth);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
