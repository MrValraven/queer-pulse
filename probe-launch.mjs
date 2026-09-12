import { chromium } from "@playwright/test";
const OUT = "/private/tmp/claude-501/-Users-tiagocosta-Desktop-trabalhos/dbc3fdec-02ec-4b24-8323-0d952fc8dc52/scratchpad";
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
});
await context.addInitScript(() => {
  localStorage.setItem("qp.demoMode.v1", "true");
  localStorage.setItem("qp.consent.v1", JSON.stringify({ analytics: false, monitoring: false, policyVersion: "3.4" }));
  Object.defineProperty(navigator, "standalone", { value: true, configurable: true });
  localStorage.setItem("qp-installed", "true");
});
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: { top: 59, bottom: 34, left: 0, right: 0 } });

// The REAL launch URL from the manifest's start_url.
await page.goto("http://localhost:5199/?mode=standalone", { waitUntil: "commit" });

const snap = () => page.evaluate(() => {
  const main = document.querySelector("main[data-page-main]");
  const mains = document.querySelectorAll("main[data-page-main]").length;
  const firstText = (() => {
    if (!main) return null;
    const walk = (el) => {
      for (const c of el.children) {
        if (!(c instanceof HTMLElement)) continue;
        const t = (c.innerText || "").trim();
        const r = c.getBoundingClientRect();
        if (t && r.height > 0 && getComputedStyle(c).opacity !== "0")
          return { cls: (c.getAttribute("class") || c.tagName).slice(0, 34), top: Math.round(r.top + window.scrollY) };
        const hit = walk(c);
        if (hit) return hit;
      }
      return null;
    };
    return walk(main);
  })();
  const plane = document.querySelector(".app-frame")?.children ?? [];
  return {
    path: location.pathname + location.search,
    mains,
    mainTop: main ? Math.round(main.getBoundingClientRect().top + window.scrollY) : null,
    mainH: main ? Math.round(main.getBoundingClientRect().height) : null,
    firstText,
    docH: document.scrollingElement.scrollHeight,
    scrollY: Math.round(window.scrollY),
    frameKids: [...plane].map((c) => {
      const r = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      return `${c.tagName.toLowerCase()}.${(c.getAttribute("class") || "").slice(0, 18)} top=${Math.round(r.top + window.scrollY)} h=${Math.round(r.height)} pos=${cs.position} mt=${cs.marginTop} pt=${cs.paddingTop} minH=${cs.minHeight}`;
    }),
  };
});

for (const t of [700, 700, 700, 700, 800, 1000, 1500, 2000, 3000]) {
  await page.waitForTimeout(t);
  console.log(JSON.stringify(await snap()));
}
await page.screenshot({ path: `${OUT}/launch-feed.png` });
console.log("--- now tap the Communities tab ---");
await page.getByRole("link", { name: /communities/i }).first().click({ timeout: 5000 }).catch((e) => console.log("click fail", e.message.split("\n")[0]));
for (const t of [500, 700, 1000, 2000]) {
  await page.waitForTimeout(t);
  console.log(JSON.stringify(await snap()));
}
await page.screenshot({ path: `${OUT}/launch-communities.png` });
await browser.close();
