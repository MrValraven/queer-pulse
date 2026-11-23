/**
 * Captures the install dialog screenshots that the web app manifest lists
 * (vite.config.ts, manifest.screenshots). Chrome on Android and desktop show
 * them in the rich install sheet.
 *
 * Usage, run from the queerpulse/ root (the output path is relative to it):
 *
 *   VITE_API_URL= VITE_DEMO=1 node node_modules/vite/bin/vite.js --port 5391 --strictPort
 *   node scripts/capture-pwa-screenshots.mjs http://localhost:5391 [shotName ...]
 *
 * <baseUrl> must be a Vite DEV server in demo mode on a free port (never
 * 5173, 5174 or 3000). Optional shot names capture only those shots.
 *
 * Writes public/screenshots/<shotName>.png: narrow shots at a 360x780 CSS
 * viewport with deviceScaleFactor 3 (1080x2340, the size the manifest
 * declares) and wide shots at 1920x1080 with deviceScaleFactor 1.
 *
 * In demo mode the signed-in member's display name is a real person's name
 * (DEMO_VIEWER_MEMBER in src/features/studio/studioCollection.data.ts).
 * The script reads that name from the source file at start-up, so nothing
 * here spells it. replaceDemoMemberName() swaps it for a sample name in the
 * captured page only, and assertNoRealName() fails the shot when the page
 * markup or its text still holds the full name, the first name or the
 * surname, or an avatar still shows the real initials. The guard runs
 * before and after every capture.
 *
 * Every shot runs on the demo clock (DEMO_NOW in
 * src/features/myevents/myEvents.data.ts, read from the source too) in the
 * Europe/Lisbon time zone. The My events demo data is dated around that
 * moment, so pinning the browser clock to it keeps "Today", the dates and
 * "Starts in" lines consistent with the date the feed greets you with.
 */
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const OUTPUT_DIRECTORY = "public/screenshots";
const RESERVED_PORTS = new Set([5173, 5174, 3000]);

const FORM_FACTORS = {
  narrow: {
    viewport: { width: 360, height: 780 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    expectedSize: { width: 1080, height: 2340 },
  },
  wide: {
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    expectedSize: { width: 1920, height: 1080 },
  },
};

/**
 * Three phone shots and three desktop shots. The directory stays phone
 * only: at desktop width its first grid row shows the "Photo coming"
 * placeholder of demo places without a photo, so the desktop set shows the
 * community feed in its place. Each shot names its route, whether the visitor is signed in, and a
 * selector whose visibility means the demo data landed behind the
 * skeletons. Keep the shot names in step with manifest.screenshots in
 * vite.config.ts.
 */
const SHOTS = [
  {
    shotName: "home-narrow",
    formFactor: "narrow",
    appPath: "/",
    isLoggedIn: false,
    readySelector: "main h1",
  },
  {
    shotName: "events-narrow",
    formFactor: "narrow",
    appPath: "/events",
    isLoggedIn: true,
    readySelector: "main h1",
  },
  {
    shotName: "directory-narrow",
    formFactor: "narrow",
    appPath: "/local/directory",
    isLoggedIn: true,
    readySelector: "main h1",
  },
  {
    shotName: "home-wide",
    formFactor: "wide",
    appPath: "/",
    isLoggedIn: false,
    readySelector: "main h1",
  },
  {
    shotName: "events-wide",
    formFactor: "wide",
    appPath: "/events",
    isLoggedIn: true,
    readySelector: "main h1",
  },
  {
    shotName: "feed-wide",
    formFactor: "wide",
    appPath: "/feed",
    isLoggedIn: true,
    // The feed has no page heading; its first post card means the demo
    // posts landed.
    readySelector: "main article",
  },
];

/**
 * Demo-only showcase money (Studio tips, Sustain pills, per-play prices).
 * None of the captured pages is a Studio page today; these stay as a
 * guard in case a shared surface starts rendering one. Vite dev keeps the
 * local CSS module name in the generated class, so the substring
 * selectors are stable across runs.
 */
const SHOWCASE_ONLY_SELECTORS = [
  '[class*="_sustainPill_"]',
  '[class*="_payPill_"]',
  '[class*="_perPlay_"]',
  'button[aria-label^="Tip "]',
];

/** Dev-only overlays that must never reach a shot. */
const DEV_OVERLAY_SELECTORS = [
  "vite-error-overlay",
  "[data-tanstack-devtools]",
];

const DEMO_VIEWER_SOURCE = "src/features/studio/studioCollection.data.ts";
const DEMO_CLOCK_SOURCE = "src/features/myevents/myEvents.data.ts";
const DEMO_TIME_ZONE = "Europe/Lisbon";
const SAMPLE_MEMBER = {
  fullName: "Alex Moreno",
  firstName: "Alex",
  surname: "Moreno",
  initials: "AM",
};

/** Narrow PNGs above this get re-encoded with a palette. */
const MAX_PNG_BYTES = 600 * 1024;
const CAPTURE_ATTEMPTS = 3;

function fail(message) {
  console.error(message);
  process.exit(1);
}

/**
 * Reads DEMO_VIEWER_MEMBER's displayName from its source file (this script
 * cannot import TypeScript) and splits it into the parts the swap and the
 * guard need.
 */
async function readDemoMember() {
  const source = await readFile(DEMO_VIEWER_SOURCE, "utf8");
  const match =
    /export const DEMO_VIEWER_MEMBER = \{[^}]*?displayName:\s*"([^"]+)"/.exec(
      source,
    );
  if (!match) {
    fail(
      `Could not find DEMO_VIEWER_MEMBER's displayName in ${DEMO_VIEWER_SOURCE}, so the name guard has nothing to check. Update readDemoMember() to the file's new shape.`,
    );
  }
  const nameParts = match[1].trim().split(/\s+/);
  if (nameParts.length < 2) {
    fail(
      `DEMO_VIEWER_MEMBER's displayName in ${DEMO_VIEWER_SOURCE} has no surname; readDemoMember() expects a first name and a surname.`,
    );
  }
  return {
    fullName: nameParts.join(" "),
    firstName: nameParts[0],
    surname: nameParts[nameParts.length - 1],
    initials:
      `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase(),
  };
}

/** Milliseconds between UTC and the time zone's wall clock at `epoch`. */
function timeZoneOffsetAt(epoch, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(epoch))
      .map((part) => [part.type, part.value]),
  );
  const wallClockAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return wallClockAsUtc - epoch;
}

/**
 * Reads DEMO_NOW (`new Date(year, monthIndex, day, hour, minute)`, a wall
 * clock time) from its source file and returns that moment in Lisbon.
 */
async function readDemoClock() {
  const source = await readFile(DEMO_CLOCK_SOURCE, "utf8");
  const match =
    /export const DEMO_NOW = new Date\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)/.exec(
      source,
    );
  if (!match) {
    fail(
      `Could not find DEMO_NOW in ${DEMO_CLOCK_SOURCE}, so the shots cannot be pinned to the demo clock. Update readDemoClock() to the file's new shape.`,
    );
  }
  const [year, monthIndex, day, hour, minute] = match.slice(1).map(Number);
  const wallClockAsUtc = Date.UTC(year, monthIndex, day, hour, minute);
  return new Date(
    wallClockAsUtc - timeZoneOffsetAt(wallClockAsUtc, DEMO_TIME_ZONE),
  );
}

function parseBaseUrl(rawUrl) {
  if (!rawUrl) {
    fail(
      "No base URL given. Start a demo dev server on a free port (never 5173, 5174 or 3000) and pass its URL.",
    );
  }
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    fail(`The base URL "${rawUrl}" is not a valid URL.`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    fail(
      `The base URL "${rawUrl}" has no http:// or https:// scheme; pass it like http://localhost:5391.`,
    );
  }
  const port = Number(url.port);
  if (RESERVED_PORTS.has(port)) {
    fail(`Port ${port} is reserved for manual testing; use another port.`);
  }
  return url.origin;
}

async function assertServerAnswers(baseUrl) {
  try {
    const response = await fetch(baseUrl, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      fail(
        `Nothing answered at ${baseUrl}; start the demo dev server first. (HTTP ${response.status})`,
      );
    }
  } catch (error) {
    const cause =
      error?.cause?.code ?? error?.name ?? "unknown connection error";
    fail(
      `Nothing answered at ${baseUrl}; start the demo dev server first. (${cause})`,
    );
  }
}

/**
 * Pre-sets the stored choices that would otherwise put a banner or a nudge
 * in the shot: the consent banner (qp.consent.v1 at the current policy
 * version, POLICY_VERSION in src/shared/api/consent.api.ts) and the install
 * nudge (qp.installNudge.snoozedAt, InstallNudge.tsx).
 */
function initScript(isLoggedIn) {
  return `(() => {
    localStorage.setItem("qp.demoMode.v1", "true");
    localStorage.setItem(
      "qp.consent.v1",
      ${JSON.stringify(
        JSON.stringify({
          analytics: false,
          monitoring: false,
          policyVersion: "3.4",
        }),
      )},
    );
    localStorage.setItem("qp-theme", "light");
    localStorage.setItem("qp.lang", "en");
    localStorage.setItem("qp.installNudge.snoozedAt", String(Date.now()));
    ${
      isLoggedIn
        ? 'localStorage.setItem("qp_logged_in", "true");'
        : 'localStorage.setItem("qp_logged_in", "false");'
    }
  })();`;
}

/**
 * Scrolls the whole page in viewport steps so every lazy cover and image
 * starts loading (a cover never scrolled into view stays a blank gradient),
 * then returns to the top.
 */
async function scrollThroughPage(page) {
  await page.evaluate(async () => {
    const pause = (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds));
    const step = Math.max(200, Math.floor(innerHeight * 0.8));
    for (
      let offset = 0;
      offset < document.documentElement.scrollHeight;
      offset += step
    ) {
      window.scrollTo(0, offset);
      await pause(150);
    }
    window.scrollTo(0, 0);
    await pause(300);
  });
}

/** Waits until every image in the viewport has loaded and decoded. */
async function waitForViewportImages(page) {
  await page.waitForFunction(
    () =>
      [...document.images].every((image) => {
        const box = image.getBoundingClientRect();
        const isInViewport =
          box.bottom > 0 &&
          box.right > 0 &&
          box.top < innerHeight &&
          box.left < innerWidth &&
          box.width > 0;
        return !isInViewport || image.complete;
      }),
    undefined,
    { timeout: 20000 },
  );
  await page.evaluate(() =>
    Promise.all(
      [...document.images]
        .filter((image) => {
          const box = image.getBoundingClientRect();
          return (
            box.bottom > 0 &&
            box.top < innerHeight &&
            box.width > 0 &&
            image.complete
          );
        })
        .map((image) => image.decode().catch(() => undefined)),
    ).then(() => undefined),
  );
}

/** Waits until no finite animation is still running, then one more frame. */
async function waitForAnimations(page, shot) {
  await page
    .waitForFunction(
      () =>
        document.getAnimations().every((animation) => {
          const iterations = animation.effect?.getComputedTiming().iterations;
          return animation.playState !== "running" || iterations === Infinity;
        }),
      undefined,
      { timeout: 8000, polling: 100 },
    )
    .catch(() => {
      throw new Error(
        `${shot.shotName}: an animation was still running after 8s, so the page never settled for the shot.`,
      );
    });
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => resolve())),
  );
}

async function hideOverlaysAndShowcase(page) {
  await page.evaluate(
    (selectors) => {
      const styleId = "pwa-screenshots-hide";
      document.getElementById(styleId)?.remove();
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `${selectors.join(",\n")} { display: none !important; }`;
      document.head.append(style);
    },
    [...SHOWCASE_ONLY_SELECTORS, ...DEV_OVERLAY_SELECTORS],
  );
}

/**
 * Swaps the demo member's real name for the sample name, ignoring case, in
 * text nodes, in placeholder, title, aria-label and alt attributes and in
 * the document title: the full name first, then the first name and the
 * surname on their own (greetings, bylines). The initials are swapped
 * inside avatar elements only. A MutationObserver repeats the swap if React
 * re-renders a node.
 */
async function replaceDemoMemberName(page, demoMember) {
  await page.evaluate(
    ({ realMember, sampleMember }) => {
      const attributeNames = ["placeholder", "title", "aria-label", "alt"];
      const escapeForPattern = (text) =>
        text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const replacements = [
        [realMember.fullName, sampleMember.fullName],
        [realMember.firstName, sampleMember.firstName],
        [realMember.surname, sampleMember.surname],
      ].map(([realPart, samplePart]) => [
        new RegExp(`\\b${escapeForPattern(realPart)}\\b`, "gi"),
        samplePart,
      ]);
      const holdsRealName = (value) =>
        replacements.some(([pattern]) => {
          pattern.lastIndex = 0;
          return pattern.test(value);
        });
      const swapValue = (value) =>
        replacements.reduce(
          (swapped, [pattern, samplePart]) =>
            swapped.replace(pattern, samplePart),
          value,
        );
      const isInsideAvatar = (element) => {
        for (
          let ancestor = element, depth = 0;
          ancestor && depth < 4;
          ancestor = ancestor.parentElement, depth += 1
        ) {
          if (/avatar|initial/i.test(ancestor.getAttribute("class") ?? "")) {
            return true;
          }
        }
        return false;
      };
      const swapTextNode = (textNode) => {
        const value = textNode.nodeValue ?? "";
        if (holdsRealName(value)) {
          textNode.nodeValue = swapValue(value);
        } else if (
          value.trim().toUpperCase() === realMember.initials &&
          textNode.parentElement &&
          isInsideAvatar(textNode.parentElement)
        ) {
          textNode.nodeValue = value.replace(
            value.trim(),
            sampleMember.initials,
          );
        }
      };
      const swapElement = (element) => {
        for (const attributeName of attributeNames) {
          const value = element.getAttribute(attributeName);
          if (value && holdsRealName(value)) {
            element.setAttribute(attributeName, swapValue(value));
          }
        }
      };
      const swapTree = (root) => {
        if (root.nodeType === Node.TEXT_NODE) {
          swapTextNode(root);
          return;
        }
        if (root.nodeType !== Node.ELEMENT_NODE) return;
        swapElement(root);
        const walker = document.createTreeWalker(
          root,
          NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
        );
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (node.nodeType === Node.TEXT_NODE) swapTextNode(node);
          else swapElement(node);
        }
      };
      swapTree(document.body);
      // The dev server tags each injected stylesheet with its absolute
      // file path, and the home folder in that path carries the name. The
      // attribute is dev-only bookkeeping and never renders.
      for (const element of document.querySelectorAll("[data-vite-dev-id]")) {
        element.removeAttribute("data-vite-dev-id");
      }
      if (holdsRealName(document.title)) {
        document.title = swapValue(document.title);
      }
      if (window.pwaScreenshotsNameObserver) return;
      window.pwaScreenshotsNameObserver = new MutationObserver((records) => {
        for (const record of records) {
          if (record.type === "characterData") swapTextNode(record.target);
          else if (record.type === "attributes") swapElement(record.target);
          else record.addedNodes.forEach(swapTree);
        }
      });
      window.pwaScreenshotsNameObserver.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: attributeNames,
      });
    },
    { realMember: demoMember, sampleMember: SAMPLE_MEMBER },
  );
}

/**
 * Throws when the page markup or its rendered text still holds the demo
 * member's full name, first name or surname (ignoring case), or when an
 * avatar or initials element still shows the real initials. The markup
 * check covers every attribute, the hidden nodes and the inline data the
 * app wrote into the document.
 */
async function assertNoRealName(page, shot, demoMember, moment) {
  const { outerHtml, innerText, avatarWithRealInitials } = await page.evaluate(
    (realInitials) => {
      // A stylesheet a lazy route injected since the last swap carries its
      // dev-only file path (see replaceDemoMemberName); it never renders.
      for (const element of document.querySelectorAll("[data-vite-dev-id]")) {
        element.removeAttribute("data-vite-dev-id");
      }
      const avatarElement = [
        ...document.body.querySelectorAll(
          '[class*="avatar" i], [class*="initial" i]',
        ),
      ].find(
        (element) => element.textContent?.trim().toUpperCase() === realInitials,
      );
      return {
        outerHtml: document.documentElement.outerHTML,
        innerText: document.body.innerText,
        avatarWithRealInitials: avatarElement
          ? avatarElement.outerHTML.slice(0, 160)
          : null,
      };
    },
    demoMember.initials,
  );
  const nameChecks = [
    ["full name", demoMember.fullName],
    ["first name", demoMember.firstName],
    ["surname", demoMember.surname],
  ];
  for (const [sourceName, source] of [
    ["document.documentElement.outerHTML", outerHtml],
    ["document.body.innerText", innerText],
  ]) {
    for (const [partName, namePart] of nameChecks) {
      const matchIndex = source.toLowerCase().indexOf(namePart.toLowerCase());
      if (matchIndex === -1) continue;
      const excerpt = source
        .slice(Math.max(0, matchIndex - 80), matchIndex + 80)
        .replace(/\s+/g, " ")
        .replace(new RegExp(namePart, "gi"), "<real name>");
      throw Object.assign(
        new Error(
          `${shot.shotName}: ${sourceName} still holds the demo member's real ${partName} ${moment} (…${excerpt}…). Extend replaceDemoMemberName for that node.`,
        ),
        { isPrivacyFailure: true },
      );
    }
  }
  if (avatarWithRealInitials) {
    throw Object.assign(
      new Error(
        `${shot.shotName}: an avatar or initials element still shows the demo member's real initials ${moment} (${avatarWithRealInitials}). Extend replaceDemoMemberName for that node.`,
      ),
      { isPrivacyFailure: true },
    );
  }
}

/** Throws when the consent banner, a dialog or a toast is on screen. */
async function assertNoStrayOverlay(page, shot) {
  const strayOverlay = await page.evaluate(() => {
    const isVisible = (element) => {
      const box = element.getBoundingClientRect();
      return (
        box.width > 0 &&
        box.height > 0 &&
        element.checkVisibility({
          opacityProperty: true,
          visibilityProperty: true,
        })
      );
    };
    const consentBanner = document.querySelector("[data-consent-region]");
    if (consentBanner && isVisible(consentBanner)) return "the consent banner";
    if (document.querySelector("[data-toast-dismiss]")) return "a toast";
    for (const dialog of document.querySelectorAll(
      '[role="dialog"], [role="alertdialog"], dialog[open]',
    )) {
      if (isVisible(dialog)) {
        return `a dialog named "${dialog.getAttribute("aria-label") || "unnamed"}"`;
      }
    }
    return null;
  });
  if (strayOverlay) {
    throw new Error(
      `${shot.shotName}: ${strayOverlay} is visible and would show in the shot.`,
    );
  }
}

async function captureShot(browser, baseUrl, shot, demoMember, demoClock) {
  const formFactor = FORM_FACTORS[shot.formFactor];
  const context = await browser.newContext({
    viewport: formFactor.viewport,
    deviceScaleFactor: formFactor.deviceScaleFactor,
    isMobile: formFactor.isMobile,
    hasTouch: formFactor.hasTouch,
    reducedMotion: "reduce",
    colorScheme: "light",
    locale: "en-GB",
    timezoneId: DEMO_TIME_ZONE,
  });
  try {
    // Date.now() and new Date() return the demo clock; timers keep running.
    await context.clock.setFixedTime(demoClock);
    await context.addInitScript(initScript(shot.isLoggedIn));
    const page = await context.newPage();
    await page.goto(`${baseUrl}${shot.appPath}`);
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await page
      .locator(shot.readySelector)
      .first()
      .waitFor({ state: "visible", timeout: 20000 })
      .catch(() => {
        throw new Error(
          `${shot.shotName}: "${shot.readySelector}" never showed at ${shot.appPath}, so the page is still loading or the route changed.`,
        );
      });
    await hideOverlaysAndShowcase(page);
    await replaceDemoMemberName(page, demoMember);
    await scrollThroughPage(page);
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.mouse.move(1, 1);
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      window.scrollTo(0, 0);
    });
    await waitForViewportImages(page);
    await waitForAnimations(page, shot);
    await replaceDemoMemberName(page, demoMember);
    await assertNoStrayOverlay(page, shot);
    await assertNoRealName(page, shot, demoMember, "before the capture");
    const png = await page.screenshot({ type: "png" });
    await assertNoRealName(page, shot, demoMember, "right after the capture");
    await assertNoStrayOverlay(page, shot);
    return png;
  } finally {
    await context.close();
  }
}

/**
 * Other sessions editing the shared tree hot-reload the dev server mid-shot,
 * which times out a wait. Those failures get a fresh attempt; a privacy
 * failure never does.
 */
async function captureWithRetry(browser, baseUrl, shot, demoMember, demoClock) {
  let lastError = null;
  for (let attempt = 1; attempt <= CAPTURE_ATTEMPTS; attempt += 1) {
    try {
      return await captureShot(browser, baseUrl, shot, demoMember, demoClock);
    } catch (error) {
      if (error.isPrivacyFailure) throw error;
      lastError = error;
      console.error(
        `  ${shot.shotName}: attempt ${attempt} failed: ${error.message}`,
      );
    }
  }
  throw lastError;
}

/** Re-encodes a PNG over the size budget with a 256 colour palette. */
async function compressIfLarge(png) {
  if (png.length <= MAX_PNG_BYTES) return png;
  return sharp(png)
    .png({ palette: true, quality: 90, compressionLevel: 9, effort: 10 })
    .toBuffer();
}

async function main() {
  const [rawBaseUrl, ...requestedShotNames] = process.argv.slice(2);
  const baseUrl = parseBaseUrl(rawBaseUrl);
  await assertServerAnswers(baseUrl);
  const unknownShotNames = requestedShotNames.filter(
    (shotName) => !SHOTS.some((shot) => shot.shotName === shotName),
  );
  if (unknownShotNames.length > 0) {
    fail(
      `Unknown shot names: ${unknownShotNames.join(", ")}. Known: ${SHOTS.map((shot) => shot.shotName).join(", ")}.`,
    );
  }
  const shots =
    requestedShotNames.length > 0
      ? SHOTS.filter((shot) => requestedShotNames.includes(shot.shotName))
      : SHOTS;

  const demoMember = await readDemoMember();
  const demoClock = await readDemoClock();
  console.log(`Demo clock pinned to ${demoClock.toISOString()} (UTC)`);
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const shot of shots) {
      const png = await compressIfLarge(
        await captureWithRetry(browser, baseUrl, shot, demoMember, demoClock),
      );
      const { width, height } = await sharp(png).metadata();
      const expected = FORM_FACTORS[shot.formFactor].expectedSize;
      if (width !== expected.width || height !== expected.height) {
        throw new Error(
          `${shot.shotName}: captured ${width}x${height}, the manifest declares ${expected.width}x${expected.height}.`,
        );
      }
      const outputPath = path.join(OUTPUT_DIRECTORY, `${shot.shotName}.png`);
      await writeFile(outputPath, png);
      const { size } = await stat(outputPath);
      console.log(
        `${outputPath} ${width}x${height} ${Math.round(size / 1024)} KB, name guard passed (no full name, first name or surname in outerHTML or innerText, no real initials in an avatar)`,
      );
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
