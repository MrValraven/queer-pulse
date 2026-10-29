/**
 * Captures the Studio landing page screenshots from the demo app.
 *
 * Usage, run from the queerpulse/ root (the output path is relative to it):
 *
 *   VITE_API_URL= VITE_DEMO=1 node node_modules/vite/bin/vite.js --port 5190 --strictPort
 *   node scripts/capture-studio-landing-shots.mjs http://localhost:5190 [pngDir]
 *
 * <baseUrl> must be a Vite DEV server started exactly like the first line,
 * on a free port from 5190 to 5199 (never 5173 or 3000). A production build
 * or preview hashes the CSS module class names, so the class substring
 * selectors in SHOWCASE_ONLY_SELECTORS silently hide nothing there. The
 * optional [pngDir] receives the full-size PNG of every shot for review;
 * keep it outside the repo.
 *
 * Writes public/studio-landing/<fileBase>-<theme>.webp for the twelve shots
 * in both themes (each of the five gallery screens, the artist dashboard
 * included, on a laptop and on a phone, plus the phone-only player and
 * share shots), plus public/studio-landing/og-studio.jpg
 * cut from the dark home shot. Nothing is written there unless every shot
 * passes.
 *
 * The demo renders money and live counts that live Studio never shows
 * (useStudioShowcase). hideShowcaseOnly() hides them in the captured page
 * only, replaceDemoSearchHint() puts the live search hint in the shell
 * search, and assertShotIsHonest() refuses any shot whose text, labels or
 * placeholders still show money, a listening count, sheet music (a
 * showcase-only shelf), the demo member's real name, or a withdrawn or no
 * longer available item (demo fixtures that would read as broken content
 * on a landing page).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const OUTPUT_DIRECTORY = "public/studio-landing";
const THEMES = ["light", "dark"];
const RESERVED_PORTS = new Set([5173, 3000]);

/**
 * The five gallery screens shown on both devices. Each becomes a laptop
 * shot (`<screen>-desktop`) and a phone shot (`<screen>-phone`) with the
 * same route, hiding, name swap and guards.
 */
const GALLERY_SCREENS = [
  {
    shotName: "home",
    paths: ["/studio"],
    readyHeading: "Cidade dos santos",
    // At a laptop height the featured hero fills the frame and leaves the
    // Staff picks shelf cut off under the player bar, its tiles untitled,
    // and the hero and the shelf never fit together. So the laptop shot
    // scrolls the hero just out of frame and opens on the format chips and
    // the full Staff picks shelf, titles included. On a phone the featured
    // release at the top is the shot.
    laptopScroll: "past-heading-section",
  },
  {
    shotName: "artist",
    // Vanda Diesel: the richest demo persona the demo member does not own
    // (a photo, two releases, 54 followers). Mariana Sol is the demo
    // member's own persona and shows owner tools.
    paths: ["/studio/artist?id=sp-ines-fonseca-vanda-diesel"],
    readyHeading: "Vanda Diesel",
  },
  {
    shotName: "release",
    paths: ["/studio/album?id=demo-release-cidade-dos-santos"],
    readyHeading: "Cidade dos santos",
  },
  {
    shotName: "playlists",
    // Cartas que voltam: collaborative (Rita edits it), three playable
    // tracks, each with an "Added by" line, and no unavailable row. The
    // other collaborative demo playlists each end on a "No longer
    // available" row (For the group chat, Tour diary) or open on an
    // unanswered invite banner (Pride warm-up).
    paths: ["/studio/collection?id=demo-playlist-cartas-que-voltam"],
    readyHeading: "Cartas que voltam",
    // On a phone the cover fills the first screen and the tracks start
    // under the mini player; scroll the title up under the top bar so the
    // collaborative badge and the "Added by" rows share the frame.
    phoneScroll: "heading-to-top",
  },
  {
    shotName: "dashboard",
    // Mariana Sol is the demo member's own persona, so the dashboard opens
    // on her numbers. The demo dashboard renders a showcase hero and body
    // (money cards, listening charts) above "Your numbers"; they are hidden
    // for this shot, which leaves the live view of the page. If the honesty
    // guard still refuses this page (money or a listening count inside
    // Your numbers), capture /studio/artist?id=demo-persona-mariana-sol
    // scrolled to the owner tools instead, and give the landing's dashboard
    // alt keys a copy pass.
    paths: ["/studio/dashboard?persona=demo-persona-mariana-sol"],
    // The "Your numbers" heading: "How <em>{name}</em> is reaching people".
    readyHeading: "How Mariana Sol is reaching people",
    // The frame opens on the Plays card title, with the Top listeners card
    // under it (the cards between them and after them are hidden below).
    laptopScroll: "plays-heading-top",
    phoneScroll: "plays-heading-top",
    // The showcase hero (StudioDashboardShowcase, with the heroColumn
    // class) and the body that follows it (charts, side cards).
    hiddenSelectors: [
      'section[class*="_hero_"]:has([class*="_heroColumn_"])',
      'section[class*="_body_"]:has([class*="_cardH_"])',
      // The Next steps card (drafts, scheduled release, release checklist)
      // above the numbers: it would push the plays trend and the supporters
      // below the fold, and the landing says the shot shows those.
      'section[class*="_nextSteps_"]',
      // The "Payments to confirm" creator nav item: a purchases-feature
      // hint, not for the public landing.
      'a[href^="/studio/payments"]',
      // The followers-per-week chart and the cards of the pair grid other
      // than Top listeners ("Your music on the Studio page", placements,
      // milestones) sit around the plays trend and Top listeners; hidden so
      // the two fit one frame.
      '[class*="_extras_"] [class*="_growth_"]',
      '[class*="_pair_"] > :not([class*="_supporters_"])',
      // The plays totals and note under the chart, and the "Showing
      // themselves" line under Top listeners: the chart and the listeners
      // then fit one laptop frame.
      '[class*="_trendFooter_"]',
      '[class*="_optedIn_"]',
      // The "Show data table" button under the chart, the fifth listener
      // row and the per-release numbers table that follows the cards (its
      // first rows would peek under the player bar).
      '[class*="_trendCard_"] button[aria-controls]',
      '[class*="_supporters_"] ol > li:nth-child(5)',
      '[class*="_extras_"] ~ *',
    ],
    // Capture-only spacing: pull Top listeners 14px up so its bottom edge
    // clears the player bar on a laptop.
    extraStyle: '[class*="_supporters_"] { margin-top: -14px; }',
    // The creator shell has no player bar.
    hasNoPlayerBar: true,
  },
];

/**
 * The twelve shots. Mirrors STUDIO_LANDING_SCREENS, STUDIO_LANDING_ARTIST_SHOTS and
 * STUDIO_LANDING_SHOT_SIZES in src/features/studio/landing/studioLanding.data.ts
 * (this script cannot import TypeScript). Keep the file bases and sizes in
 * step with that file.
 */
const SHOTS = [
  ...GALLERY_SCREENS.map((screen) => ({
    shotName: screen.shotName,
    fileBase: `${screen.shotName}-desktop`,
    device: "laptop",
    paths: screen.paths,
    readyHeading: screen.readyHeading,
    scroll: screen.laptopScroll,
    hiddenSelectors: screen.hiddenSelectors,
    extraStyle: screen.extraStyle,
    hasNoPlayerBar: screen.hasNoPlayerBar,
  })),
  ...GALLERY_SCREENS.map((screen) => ({
    shotName: `${screen.shotName}-phone`,
    fileBase: `${screen.shotName}-phone`,
    device: "phone",
    paths: screen.paths,
    readyHeading: screen.readyHeading,
    scroll: screen.phoneScroll,
    hiddenSelectors: screen.hiddenSelectors,
    extraStyle: screen.extraStyle,
    hasNoPlayerBar: screen.hasNoPlayerBar,
  })),
  {
    shotName: "player",
    fileBase: "player-phone",
    device: "phone",
    paths: ["/studio"],
    shouldOpenNowPlaying: true,
    allowedDialogLabel: "Now playing",
  },
  {
    shotName: "share",
    fileBase: "share-phone",
    device: "phone",
    // The Priya thread carries a Studio track card. On a phone the `c` deep
    // link clears itself and leaves the inbox list, so the row is tapped.
    paths: ["/messages?c=priya"],
    conversationName: "Priya Shah",
    readySelector: "[data-studio-share-frame]",
    // Demo-data artefact: no demo thread has only live Studio cards. The
    // Priya thread's second Studio message links a demo track whose release
    // is withdrawn (demoDirectThreads.data.ts, demo-msg-priya-studio-002),
    // so its virtual list row is hidden in the captured page only and the
    // shot shows the live track card with its note. The message row's DOM
    // id is `message-<message id>`; the virtualizer re-measures and closes
    // the gap.
    hiddenSelectors: [
      '[role="listitem"]:has(#message-demo-msg-priya-studio-002)',
    ],
  },
];

const DEVICES = {
  laptop: {
    outputWidth: 1600,
    // 1280x800 keeps the 1.6 ratio of the 1600x1000 output and lays the
    // Studio pages out the way most laptops see them.
    contextOptions: { viewport: { width: 1280, height: 800 } },
  },
  phone: {
    outputWidth: 640,
    contextOptions: {
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    },
  },
};

// The kitchen in April by Rita Ferreira: a release the demo member does not
// own, with cover art unlike Cidade dos santos, so the player bar, Now
// playing and the release page do not all repeat one cover.
const PRIME_RELEASE_PATH = "/studio/album?id=demo-release-home-1";
const PRIME_TARGET_FRACTION = 0.4;
const PRIME_MAX_PRESSES = 80;

const MAX_WEBP_BYTES = 180 * 1024;
const START_QUALITY = 74;
const QUALITY_STEP = 6;
const QUALITY_FLOOR = 50;

const TOAST_WAIT_MS = 6000;
const CAPTURE_ATTEMPTS = 3;

const HONESTY_PATTERNS = [
  /Tiago/i,
  /€/,
  /\bEUR\b/,
  /[$£]/,
  /\beuros?\b/i,
  /\/mo\b|\/mês/,
  // innerText applies text-transform, so an uppercased TIP label must match.
  /\btip\b/i,
  /Sustain/i,
  /\d+\s+listening|listening now/i,
  /paid out|payout/i,
  // The demo shell search hint names sheet music, a showcase-only shelf.
  /sheet music/i,
];

/**
 * Demo fixtures for content our team took down or that is gone. They are
 * real states in live Studio, but on the landing page they read as broken
 * content, so no shot may show one.
 */
const UNAVAILABLE_PATTERNS = [/No longer available/i, /withdrawn/i];

/**
 * Demo-only surfaces on the seven captured screens, each a
 * useStudioShowcase() caller. Vite dev keeps the local CSS module name in
 * the generated class (`_sustainPill_<hash>_<line>`), so the class
 * substring selectors are stable across runs.
 */
const SHOWCASE_ONLY_SELECTORS = [
  // StudioShell: the "Sustain · €…/mo" pill in the top bar.
  '[class*="_sustainPill_"]',
  // StudioHomeHeroShowcase: the "N listening" stats line under the hero.
  '[class*="_heroInfo_"] [class*="_stats_"]',
  // StudioHomeHeroShowcase and StudioArtistHero: the per-play pay pill.
  '[class*="_payPill_"]',
  // StudioHomeHero: the "Tip <artist>" button, the only soft Button in the
  // hero action row (Play is StudioPlayButton, Save is quiet).
  '[class*="_homeHeroActions_"] > button[class*="_soft_"]',
  // StudioAlbumHeroActions and StudioArtistHeroActions: the tip pill or
  // icon button, named "Tip <artist>".
  'button[aria-label^="Tip "]',
  // The compact (phone) tip IconButton sits in a Tooltip wrapper whose
  // bubble repeats "Tip <artist>" as text; hide the wrapper with it.
  '[class*="_wrap_"]:has(> button[aria-label^="Tip "]):has(> [role="tooltip"])',
  // StudioArtistHeroActions: the labelled tip button (class `tip`).
  '[class*="_tip_"]',
  // StudioArtistSidebar and StudioAlbumSidebar: the buy card and the money
  // ledger in the side column.
  '[class*="_buyCard_"]',
  '[class*="_ledgerCard_"]',
  // StudioOfferPanel (the purchases buy panel, a section labelled "Buy
  // <release>" with the price): live Studio shows no money on the landing.
  'section[aria-label^="Buy "]',
  // StudioAlbumTracklist: the per-play money note above the track list.
  '[class*="_perPlay_"]',
  // StudioPlayerShowcase: the per-play line and tip button in the player.
  '[class*="_showcase_"]',
  // StudioRoom: the demo's Wednesday set section with its listener count.
  'section[aria-labelledby="studio-home-set"]',
  // StudioRail: the showcase rail links live does not have (live shows
  // Home, Search and Library, studioRailLive.data.ts): The Wednesday set,
  // Sheet music and Live broadcasts.
  'a[href="/studio/set"]',
  'a[href="/studio/sheet-store"]',
  'a[href="/studio/live"]',
];

/**
 * The demo member's display name ("Tiago Costa", DEMO_VIEWER_MEMBER in
 * studioCollection.data.ts) is a real person's name. The landing gallery
 * says it shows sample members, so the captured page swaps it for a
 * fictional sample name. Capture only: the demo data stays as it is, and
 * the honesty guard still rejects any "Tiago" left over.
 */
const DEMO_MEMBER_NAME = "Tiago Costa";
const SAMPLE_MEMBER_NAME = "Alex Moreno";
const DEMO_MEMBER_INITIALS = "TC";
const SAMPLE_MEMBER_INITIALS = "AM";

/**
 * The demo shell search shows the showcase hint (shell.searchPlaceholder,
 * which names sheet music). Live shows shell.searchPlaceholderLive. Mirrors
 * that en string in src/shared/i18n/catalogs/en/studio.ts (this script
 * cannot import TypeScript); keep the two in step.
 */
const SHELL_SEARCH_SELECTOR = 'input[data-studio-search-input="shell"]';
const DEMO_SEARCH_PLACEHOLDER = "search artists, tracks, sheet music…";
const LIVE_SEARCH_PLACEHOLDER = "search artists, releases, tracks…";

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseBaseUrl(rawUrl) {
  if (!rawUrl) {
    fail(
      "No base URL given. Start a demo dev server on a free port from 5190 (never 5173 or 3000) and pass its URL.",
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
      `The base URL "${rawUrl}" has no http:// or https:// scheme; pass it like http://localhost:5190.`,
    );
  }
  const port = Number(url.port);
  if (RESERVED_PORTS.has(port)) {
    fail(`Port ${port} is reserved; use 5190 to 5199.`);
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

function initScript(theme) {
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
    localStorage.setItem("qp-theme", ${JSON.stringify(theme)});
    localStorage.setItem("qp_logged_in", "true");
    localStorage.setItem("qp.lang", "en");
    localStorage.setItem(
      "qp.studio.welcomeSeen.v1",
      ${JSON.stringify(JSON.stringify({ version: 1, memberId: "demo" }))},
    );
    localStorage.removeItem("qp.demoStudioAccess.v1");
  })();`;
}

/** Client-side navigation, so the in-memory player survives. */
async function navigateInApp(page, appPath) {
  await page.evaluate((targetPath) => {
    history.pushState(null, "", targetPath);
    dispatchEvent(new PopStateEvent("popstate"));
  }, appPath);
  await page.waitForURL((url) => `${url.pathname}${url.search}` === appPath);
}

function secondsOf(clockText) {
  return clockText
    .trim()
    .split(":")
    .reduce((total, part) => total * 60 + Number(part), 0);
}

/** "1:23 of 3:45" to the played fraction, or null while the length is unknown. */
function playedFractionOf(valueText) {
  const match = /(\d+(?::\d+)+)\s+of\s+(\d+(?::\d+)+)/.exec(valueText ?? "");
  if (!match) return null;
  const totalSeconds = secondsOf(match[2]);
  return totalSeconds > 0 ? secondsOf(match[1]) / totalSeconds : null;
}

/**
 * Plays the release, seeks to about 40% with the keyboard (the seek control
 * is a native range input, which Playwright cannot fill) and pauses, so the
 * player shows a track part way through.
 */
async function primePlayer(page, baseUrl) {
  await page.goto(`${baseUrl}${PRIME_RELEASE_PATH}`);
  const main = page.locator("main");
  await main
    .getByRole("button", { name: /^Play\b/ })
    .first()
    .click();
  // The phone mini bar has no seek control; seek inside Now playing there.
  const openNowPlayingButton = page
    .getByRole("button", { name: /^Open Now playing/ })
    .first();
  await openNowPlayingButton.waitFor({ timeout: 15000 });
  const isPhone = (page.viewportSize()?.width ?? 0) < 600;
  if (isPhone) await openNowPlayingButton.click();
  // On a phone the controls live in the Now playing dialog, which covers
  // the mini bar and its own Pause button.
  const controls = isPhone
    ? page.getByRole("dialog", { name: "Now playing" })
    : page;
  const seekSlider = controls.getByRole("slider", { name: "Seek" }).first();
  await seekSlider.waitFor({ state: "visible", timeout: 15000 });
  await page.waitForFunction(
    (sliderElement) =>
      /\d+:\d+ of \d+:\d+/.test(
        sliderElement?.getAttribute("aria-valuetext") ?? "",
      ),
    await seekSlider.elementHandle(),
    { timeout: 15000 },
  );
  await seekSlider.focus();
  for (let pressCount = 0; pressCount < PRIME_MAX_PRESSES; pressCount += 1) {
    const fraction = playedFractionOf(
      await seekSlider.getAttribute("aria-valuetext"),
    );
    if (fraction !== null && fraction >= PRIME_TARGET_FRACTION) break;
    await page.keyboard.press("ArrowRight");
  }
  await controls
    .getByRole("button", { name: "Pause", exact: true })
    .filter({ visible: true })
    .first()
    .click();
  await controls
    .getByRole("button", { name: "Play", exact: true })
    .filter({ visible: true })
    .first()
    .waitFor({ timeout: 5000 });
  if (isPhone) {
    await page.getByRole("button", { name: "Close Now playing" }).click();
    await page
      .getByRole("slider", { name: "Seek" })
      .waitFor({ state: "detached", timeout: 10000 });
  }
}

/** Waits until every image in the viewport has loaded. */
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
    { timeout: 15000 },
  );
  // A loaded image can still paint a frame late; decode the visible ones.
  await page.evaluate(() =>
    Promise.all(
      [...document.images]
        .filter((image) => {
          const box = image.getBoundingClientRect();
          return (
            box.bottom > 0 &&
            box.right > 0 &&
            box.top < innerHeight &&
            box.left < innerWidth &&
            box.width > 0
          );
        })
        .map((image) => image.decode().catch(() => undefined)),
    ).then(() => undefined),
  );
}

/**
 * On a phone a route change slides the new page in over the old one
 * (RouteTransition) and fades its content up, so a shot taken straight after
 * the URL changes catches the old page or a half-faded new one. Waits until
 * no finite animation is still running, then one more frame.
 */
async function waitForRouteTransition(page, shot) {
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

async function waitForToastsToClear(page) {
  await page
    .waitForFunction(
      () => document.querySelectorAll("[data-toast-dismiss]").length === 0,
      undefined,
      { timeout: TOAST_WAIT_MS },
    )
    .catch(() => {
      throw new Error(
        `A toast stayed on screen for ${TOAST_WAIT_MS}ms and would show in the shot.`,
      );
    });
}

async function settleBeforeShot(page, theme, shot) {
  // The last click leaves the pointer and focus on a control, which shows
  // its tooltip; park both.
  await page.mouse.move(1, 1);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  // An in-app navigation scrolls the rail's library list to the active
  // item, which leaves its Sort row half cut off at a laptop height. Inner
  // scrollers go back to the top too, except the chat log (it sits at the
  // newest message) and any open dialog.
  await page.evaluate(() => {
    for (const element of document.body.querySelectorAll("*")) {
      if (
        element.scrollTop > 0 &&
        !element.closest('[role="log"], [role="dialog"]')
      ) {
        element.scrollTop = 0;
      }
    }
  });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  if (shot.scroll) await scrollToReadyHeading(page, shot);
  // An open dialog locks scrolling, which zeroes the root box, so only
  // attachment is checked.
  await page.waitForSelector(`html[data-theme="${theme}"]`, {
    state: "attached",
    timeout: 10000,
  });
  await waitForViewportImages(page);
  await waitForToastsToClear(page);
}

/**
 * One style tag that hides every demo-only surface listed above, plus the
 * shot's own `hiddenSelectors` (demo-data artefacts documented on the shot).
 */
async function hideShowcaseOnly(page, shot) {
  await page.evaluate(
    ({ selectors, extraStyle }) => {
      const styleId = "studio-landing-hide-showcase";
      document.getElementById(styleId)?.remove();
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `${selectors.join(",\n")} { display: none !important; }\n${extraStyle ?? ""}`;
      document.head.append(style);
    },
    {
      selectors: [...SHOWCASE_ONLY_SELECTORS, ...(shot.hiddenSelectors ?? [])],
      extraStyle: shot.extraStyle,
    },
  );
}

/**
 * "plays-heading-top": the Plays card's title sits a fixed gap under the
 * sticky or fixed top bar (the same gap in every theme and on both devices),
 * so the plays per day chart opens the frame and the Top listeners card
 * follows it.
 */
async function scrollToPlaysHeading(page) {
  await page.evaluate(() => {
    const title = document.querySelector('[class*="_trendCard_"] figcaption');
    if (!title) throw new Error("The Plays card is not on the page.");
    let topBarBottom = 0;
    for (
      let element = document.elementFromPoint(innerWidth / 2, 2);
      element && element !== document.body;
      element = element.parentElement
    ) {
      if (["fixed", "sticky"].includes(getComputedStyle(element).position)) {
        topBarBottom = element.getBoundingClientRect().bottom;
        break;
      }
    }
    const gapUnderTopBar = 28;
    window.scrollBy({
      top: title.getBoundingClientRect().top - topBarBottom - gapUnderTopBar,
      behavior: "instant",
    });
  });
}

/**
 * Scrolls relative to the shot's ready heading and the fixed or sticky top
 * bar (found under the top centre of the viewport):
 * - "past-heading-section": the section holding the heading ends right
 *   under the top bar, so the frame opens on what follows it, and that
 *   section is hidden so the bar's blur does not show it.
 * - "heading-to-top": the heading sits a small gap under the top bar.
 */
async function scrollToReadyHeading(page, shot) {
  if (shot.scroll === "plays-heading-top") {
    await scrollToPlaysHeading(page);
    await waitForViewportImages(page);
    return;
  }
  const heading = page
    .getByRole("heading", { name: shot.readyHeading, exact: true })
    .first();
  const headingHandle = await heading.elementHandle();
  await page.evaluate(
    ({ headingElement, scrollMode }) => {
      // Room for the eyebrow line above the heading.
      const headingGap = 56;
      const isFixedOrSticky = (element) =>
        ["fixed", "sticky"].includes(getComputedStyle(element).position);
      let topBar = null;
      let topBarBottom = 0;
      for (
        let element = document.elementFromPoint(innerWidth / 2, 2);
        element && element !== document.body;
        element = element.parentElement
      ) {
        if (isFixedOrSticky(element)) {
          topBar = element;
          topBarBottom = element.getBoundingClientRect().bottom;
          break;
        }
      }
      const headingSection =
        headingElement.closest("section") ?? headingElement;
      const anchorTop =
        scrollMode === "past-heading-section"
          ? headingSection.getBoundingClientRect().bottom
          : headingElement.getBoundingClientRect().top - headingGap;
      // Instant, so the boxes measured below are the final ones (the app
      // may set a smooth scroll-behavior).
      window.scrollBy({
        top: Math.max(0, anchorTop - topBarBottom),
        behavior: "instant",
      });
      // What scrolled away now sits right behind the frosted top bar,
      // whose backdrop blur shows it as a coloured smear. Hide it without
      // changing the layout; it is out of frame either way. That is the
      // whole heading section, or for "heading-to-top" the cover above the
      // heading (any image that starts behind the bar and ends above the
      // heading, with its outermost wrapper that ends above the heading
      // too, so the frame and its shadow go with it).
      if (scrollMode === "past-heading-section") {
        headingSection.style.visibility = "hidden";
      } else {
        const headingTop = headingElement.getBoundingClientRect().top;
        for (const image of document.images) {
          const imageBox = image.getBoundingClientRect();
          if (
            imageBox.height > 0 &&
            imageBox.top < topBarBottom &&
            imageBox.bottom <= headingTop &&
            !topBar?.contains(image)
          ) {
            let coverWrapper = image;
            while (
              coverWrapper.parentElement &&
              !coverWrapper.parentElement.contains(headingElement) &&
              coverWrapper.parentElement.getBoundingClientRect().bottom <=
                headingTop
            ) {
              coverWrapper = coverWrapper.parentElement;
            }
            coverWrapper.style.visibility = "hidden";
          }
        }
      }
    },
    { headingElement: headingHandle, scrollMode: shot.scroll },
  );
  await waitForViewportImages(page);
}

/**
 * Swaps the demo member's real name for the sample name in text nodes and
 * in title, aria-label and alt attributes, and the standalone initials in
 * avatar or initials elements. A MutationObserver repeats the swap if React
 * re-renders a node before the screenshot.
 */
async function replaceDemoMemberName(page) {
  await page.evaluate(
    ({ realName, sampleName, realInitials, sampleInitials }) => {
      const attributeNames = ["title", "aria-label", "alt"];
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
        if (value.includes(realName)) {
          textNode.nodeValue = value.split(realName).join(sampleName);
        } else if (
          value.trim() === realInitials &&
          textNode.parentElement &&
          isInsideAvatar(textNode.parentElement)
        ) {
          textNode.nodeValue = value.replace(realInitials, sampleInitials);
        }
      };
      const swapElement = (element) => {
        for (const attributeName of attributeNames) {
          const value = element.getAttribute(attributeName);
          if (value?.includes(realName)) {
            element.setAttribute(
              attributeName,
              value.split(realName).join(sampleName),
            );
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
      if (window.studioLandingNameObserver) return;
      window.studioLandingNameObserver = new MutationObserver((records) => {
        for (const record of records) {
          if (record.type === "characterData") swapTextNode(record.target);
          else if (record.type === "attributes") swapElement(record.target);
          else record.addedNodes.forEach(swapTree);
        }
      });
      window.studioLandingNameObserver.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: attributeNames,
      });
    },
    {
      realName: DEMO_MEMBER_NAME,
      sampleName: SAMPLE_MEMBER_NAME,
      realInitials: DEMO_MEMBER_INITIALS,
      sampleInitials: SAMPLE_MEMBER_INITIALS,
    },
  );
}

/**
 * Swaps the showcase search hint in the shell search for the live one.
 * Only the full showcase hint is swapped: a narrow field already shows the
 * short hint (shell.searchPlaceholderShort), which live shows too. A
 * MutationObserver repeats the swap if React re-renders the attribute.
 */
async function replaceDemoSearchHint(page) {
  await page.evaluate(
    ({ selector, demoPlaceholder, livePlaceholder }) => {
      const swapHint = () => {
        for (const input of document.querySelectorAll(selector)) {
          if (input.getAttribute("placeholder") === demoPlaceholder) {
            input.setAttribute("placeholder", livePlaceholder);
          }
        }
      };
      swapHint();
      if (window.studioLandingSearchHintObserver) return;
      window.studioLandingSearchHintObserver = new MutationObserver(swapHint);
      window.studioLandingSearchHintObserver.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["placeholder"],
      });
    },
    {
      selector: SHELL_SEARCH_SELECTOR,
      demoPlaceholder: DEMO_SEARCH_PLACEHOLDER,
      livePlaceholder: LIVE_SEARCH_PLACEHOLDER,
    },
  );
}

/**
 * The visible text plus the placeholder, aria-label and title of every
 * visible element and the alt of every visible image, one per line. A
 * placeholder or a tooltip title shows in the shot without being innerText.
 */
async function visibleTextAndLabels(page) {
  return page.evaluate(() => {
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
    const labelLines = [];
    for (const element of document.body.querySelectorAll(
      "[placeholder], [aria-label], [title], img[alt]",
    )) {
      if (!isVisible(element)) continue;
      for (const attributeName of ["placeholder", "aria-label", "title"]) {
        const value = element.getAttribute(attributeName);
        if (value) labelLines.push(`[${attributeName}] ${value}`);
      }
      if (element.tagName === "IMG" && element.getAttribute("alt")) {
        labelLines.push(`[alt] ${element.getAttribute("alt")}`);
      }
    }
    return [document.body.innerText, ...labelLines].join("\n");
  });
}

/**
 * Throws when the visible text or a visible element's placeholder,
 * aria-label, title or image alt still shows demo-only money, a showcase
 * shelf, a real name, or a withdrawn or unavailable item.
 */
async function assertShotIsHonest(page, shotName) {
  const visibleText = await visibleTextAndLabels(page);
  for (const pattern of HONESTY_PATTERNS) {
    const match = pattern.exec(visibleText);
    if (match) {
      const lineWithMatch = visibleText
        .split("\n")
        .find((line) => pattern.test(line));
      const error = new Error(
        `${shotName}: visible text matches ${pattern} (demo-only money or a real name). Pick another view or extend hideShowcaseOnly.`,
      );
      error.matchedLine = lineWithMatch;
      error.isHonestyFailure = true;
      throw error;
    }
  }
  for (const pattern of UNAVAILABLE_PATTERNS) {
    if (pattern.test(visibleText)) {
      const error = new Error(
        `${shotName}: visible text matches ${pattern} (a withdrawn or no longer available demo item). Pick a view without one or hide that row for this shot.`,
      );
      error.matchedLine = visibleText
        .split("\n")
        .find((line) => pattern.test(line));
      error.isHonestyFailure = true;
      throw error;
    }
  }
}

/**
 * Throws when a dialog other than the intended Now playing sheet, or the
 * consent banner, is visible in the shot.
 */
async function assertNoStrayOverlay(page, shot) {
  const strayOverlay = await page.evaluate((allowedDialogLabel) => {
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
    const dialogs = document.querySelectorAll(
      '[role="dialog"], [role="alertdialog"], dialog[open]',
    );
    for (const dialog of dialogs) {
      const label = dialog.getAttribute("aria-label") ?? "";
      if (allowedDialogLabel && label === allowedDialogLabel) continue;
      if (isVisible(dialog)) return `a dialog named "${label || "unnamed"}"`;
    }
    return null;
  }, shot.allowedDialogLabel ?? null);
  if (strayOverlay) {
    throw new Error(
      `${shot.shotName}: ${strayOverlay} is visible and would show in the shot.`,
    );
  }
}

async function openNowPlaying(page) {
  await page
    .getByRole("button", { name: /^Open Now playing/ })
    .first()
    .click();
  await page
    .getByRole("slider", { name: "Seek" })
    .last()
    .waitFor({ state: "visible", timeout: 10000 });
  // Let the sheet finish arriving before the shot.
  await page.waitForTimeout(800);
}

async function captureShot(page, baseUrl, shot, theme) {
  let lastError = null;
  for (const appPath of shot.paths) {
    await navigateInApp(page, appPath);
    await page.waitForLoadState("networkidle").catch(() => undefined);
    if (shot.conversationName) {
      await page
        .getByText(shot.conversationName, { exact: true })
        .first()
        .click();
    }
    if (shot.readySelector) {
      await page
        .locator(shot.readySelector)
        .first()
        .waitFor({ state: "visible", timeout: 15000 });
    }
    if (shot.readyHeading) {
      // The demo loads each page behind a skeleton; its heading means the
      // data landed.
      await page
        .getByRole("heading", { name: shot.readyHeading, exact: true })
        .first()
        .waitFor({ state: "visible", timeout: 15000 })
        .catch(() => {
          throw new Error(
            `${shot.shotName}: the heading "${shot.readyHeading}" never showed at ${appPath}, so the page is still loading or the demo data changed.`,
          );
        });
    }
    await waitForRouteTransition(page, shot);
    if (shot.shouldOpenNowPlaying) await openNowPlaying(page);
    // Hide and rename first, so the layout shift they cause settles below.
    await hideShowcaseOnly(page, shot);
    await replaceDemoMemberName(page);
    await replaceDemoSearchHint(page);
    await settleBeforeShot(page, theme, shot);
    if (shot.device === "laptop" && !shot.hasNoPlayerBar) {
      const hasSeekSlider =
        (await page.getByRole("slider", { name: "Seek" }).count()) > 0;
      if (!hasSeekSlider) {
        throw new Error(`${shot.shotName}: the player bar is missing`);
      }
    }
    await assertNoStrayOverlay(page, shot);
    try {
      await assertShotIsHonest(page, shot.shotName);
    } catch (error) {
      lastError = error;
      console.error(
        `  ${shot.shotName} (${theme}) at ${appPath}: ${error.message}\n    matched line: ${error.matchedLine ?? "?"}`,
      );
      continue;
    }
    const png = await page.screenshot({ type: "png" });
    // Anything rendered between the guard and the capture fails the shot.
    await assertShotIsHonest(page, shot.shotName).catch((error) => {
      error.message = `${error.message} (seen right after the screenshot)`;
      throw error;
    });
    await assertNoStrayOverlay(page, shot);
    return { png, appPath };
  }
  throw lastError;
}

/** One shot in a fresh browser context, primed with a paused player. */
async function captureInFreshContext(browser, baseUrl, shot, theme) {
  const context = await browser.newContext({
    ...DEVICES[shot.device].contextOptions,
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  try {
    await context.addInitScript(initScript(theme));
    const page = await context.newPage();
    await primePlayer(page, baseUrl);
    return await captureShot(page, baseUrl, shot, theme);
  } finally {
    await context.close();
  }
}

/**
 * Other sessions editing the shared tree restart or hot-reload the dev
 * server mid-shot, which times out a click. Those failures get a fresh
 * attempt; an honesty guard failure never does.
 */
async function captureWithRetry(browser, baseUrl, shot, theme) {
  let lastError = null;
  for (let attempt = 1; attempt <= CAPTURE_ATTEMPTS; attempt += 1) {
    try {
      return await captureInFreshContext(browser, baseUrl, shot, theme);
    } catch (error) {
      if (error?.isHonestyFailure) throw error;
      lastError = error;
      console.error(
        `  ${shot.fileBase}-${theme}: attempt ${attempt} of ${CAPTURE_ATTEMPTS} failed: ${error instanceof Error ? error.message.split("\n")[0] : error}`,
      );
    }
  }
  throw lastError;
}

async function encodeWebp(png, outputWidth) {
  for (
    let quality = START_QUALITY;
    quality >= QUALITY_FLOOR;
    quality -= QUALITY_STEP
  ) {
    const webp = await sharp(png)
      .resize({ width: outputWidth })
      .webp({ quality, effort: 6 })
      .toBuffer();
    if (
      webp.length <= MAX_WEBP_BYTES ||
      quality - QUALITY_STEP < QUALITY_FLOOR
    ) {
      return { webp, quality };
    }
  }
  throw new Error("Unreachable: the quality loop always returns.");
}

async function main() {
  const baseUrl = parseBaseUrl(process.argv[2]);
  const pngDirectory = process.argv[3] ?? null;
  await assertServerAnswers(baseUrl);
  if (pngDirectory) await mkdir(pngDirectory, { recursive: true });

  const rows = [];
  const failures = [];
  // Every output waits here and is written only when all shots pass.
  const pendingOutputs = [];
  let darkHomePng = null;
  const browser = await chromium.launch();
  try {
    for (const theme of THEMES) {
      for (const shot of SHOTS) {
        const device = DEVICES[shot.device];
        const fileName = `${shot.fileBase}-${theme}`;
        // One failed shot is reported and the rest still run, so a single
        // run lists every problem; the script still exits nonzero.
        try {
          const { png, appPath } = await captureWithRetry(
            browser,
            baseUrl,
            shot,
            theme,
          );
          if (pngDirectory) {
            await writeFile(path.join(pngDirectory, `${fileName}.png`), png);
          }
          if (shot.shotName === "home" && theme === "dark") darkHomePng = png;
          const { webp, quality } = await encodeWebp(png, device.outputWidth);
          if (webp.length > MAX_WEBP_BYTES) {
            throw new Error(
              `${fileName}: ${webp.length} bytes at the quality floor ${QUALITY_FLOOR}, over the ${MAX_WEBP_BYTES} byte budget.`,
            );
          }
          pendingOutputs.push({ fileName: `${fileName}.webp`, buffer: webp });
          rows.push({
            name: `${fileName}.webp`,
            bytes: webp.length,
            quality,
            appPath,
          });
        } catch (error) {
          failures.push(
            `${fileName}: ${error instanceof Error ? error.message : error}`,
          );
        }
      }
    }

    console.table(rows);
    if (darkHomePng) {
      const openGraph = await sharp(darkHomePng)
        .resize(1200, 630, { fit: "cover", position: "top" })
        .jpeg({ quality: 82 })
        .toBuffer();
      pendingOutputs.push({ fileName: "og-studio.jpg", buffer: openGraph });
      console.log(`og-studio.jpg: ${openGraph.length} bytes, jpeg quality 82`);
    } else {
      failures.push("og-studio.jpg: the dark home shot was not captured.");
    }
  } finally {
    await browser.close();
  }
  if (failures.length > 0) {
    throw new Error(
      `${failures.length} shot(s) failed, so nothing was written to ${OUTPUT_DIRECTORY}:\n${failures.join("\n")}`,
    );
  }
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  for (const { fileName, buffer } of pendingOutputs) {
    await writeFile(path.join(OUTPUT_DIRECTORY, fileName), buffer);
  }
  console.log(`Wrote ${pendingOutputs.length} files to ${OUTPUT_DIRECTORY}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
