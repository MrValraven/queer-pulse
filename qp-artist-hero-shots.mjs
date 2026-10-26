import { chromium } from "@playwright/test";
const out = "/private/tmp/claude-501/-Users-tiagocosta-Desktop-trabalhos/9381da81-cc49-40f2-a2a4-8cb3d2f52ad1/scratchpad/shots";
import fs from "node:fs"; fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const [w,h] of [[1440,900],[768,1000],[375,812]]) for (const scheme of ["light","dark"]) {
  const ctx = await browser.newContext({ viewport:{width:w,height:h}, colorScheme:scheme });
  await ctx.addInitScript((scheme) => { localStorage.setItem("qp-theme", scheme); localStorage.setItem("qp.demoMode.v1","true"); localStorage.setItem("qp.consent.v1", JSON.stringify({analytics:false,monitoring:false,policyVersion:"3.4"})); }, scheme);
  const page = await ctx.newPage();
  await page.goto("http://localhost:5199/studio/artist?id=demo-persona-mariana-sol", { waitUntil:"networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path:`${out}/artist-${w}-${scheme}.png` });
  await ctx.close();
}
await browser.close();
