import { existsSync, readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { loadNamespace } from "../../../shared/i18n/catalogs";
import type { Catalog } from "../../../shared/i18n/types";
import type { Theme } from "../../../app/providers/themeContext";
import {
  SPOTIFY_ROYALTY_SOURCE_URL,
  STUDIO_LANDING_ARTIST_SHOTS,
  STUDIO_LANDING_COMPARISON_ROWS,
  STUDIO_LANDING_FAQ,
  STUDIO_LANDING_FOR_ARTISTS_POINTS,
  STUDIO_LANDING_HERO_SHOTS,
  STUDIO_LANDING_LISTEN_REASON_KEY,
  STUDIO_LANDING_NEXT_STEPS,
  STUDIO_LANDING_OG_IMAGE,
  STUDIO_LANDING_PLAN_POINTS,
  STUDIO_LANDING_SCREENS,
  STUDIO_LANDING_SECTION_ORDER,
  STUDIO_LANDING_SHOT_SIZES,
  STUDIO_LANDING_WHY_PARAGRAPH_KEYS,
  studioLandingShotSrc,
  type StudioLandingShot,
} from "./studioLanding.data";

const DATA_FILE_PATH = "src/features/studio/landing/studioLanding.data.ts";
const THEMES: readonly Theme[] = ["light", "dark"];
const BANNED_COPY_PATTERN =
  /[\u2013\u2014]|, not |\bgathering\b|\broom\b|a real person|€|\d+%/;

const ALL_SHOTS: readonly StudioLandingShot[] = [
  ...STUDIO_LANDING_SCREENS.flatMap((screen) => [
    screen.shot,
    screen.phoneShot,
  ]),
  STUDIO_LANDING_HERO_SHOTS.laptop,
  STUDIO_LANDING_HERO_SHOTS.phone,
  STUDIO_LANDING_ARTIST_SHOTS.laptop,
  STUDIO_LANDING_ARTIST_SHOTS.phone,
];

/** Every key the exported data structures hand to `t()`. */
const EXPORTED_KEYS: readonly string[] = [
  ...STUDIO_LANDING_SCREENS.flatMap((screen) => [
    screen.titleKey,
    screen.captionKey,
    screen.shot.altKey,
    screen.phoneShot.altKey,
  ]),
  STUDIO_LANDING_ARTIST_SHOTS.laptop.altKey,
  STUDIO_LANDING_ARTIST_SHOTS.phone.altKey,
  ...[
    ...STUDIO_LANDING_PLAN_POINTS,
    ...STUDIO_LANDING_FOR_ARTISTS_POINTS,
    ...STUDIO_LANDING_NEXT_STEPS,
  ].flatMap((point) => [point.titleKey, point.bodyKey]),
  ...STUDIO_LANDING_COMPARISON_ROWS.flatMap((row) => [
    row.topicKey,
    row.streamingKey,
    row.platformsKey,
    row.studioKey,
  ]),
  ...STUDIO_LANDING_FAQ.flatMap((item) => [item.questionKey, item.answerKey]),
  ...Object.values(STUDIO_LANDING_LISTEN_REASON_KEY),
  ...STUDIO_LANDING_WHY_PARAGRAPH_KEYS,
];

/** Every literal `"studio:landing.…"` string written in the data file. */
function literalKeysInDataFile(): string[] {
  const source = readFileSync(DATA_FILE_PATH, "utf8");
  return [...source.matchAll(/"studio:(landing\.[^"]+)"/g)].map(
    (match) => match[1] ?? "",
  );
}

function withoutNamespace(key: string): string {
  return key.replace(/^studio:/, "");
}

describe("studioLanding.data", () => {
  let englishCatalog: Catalog;
  let portugueseCatalog: Catalog;

  beforeAll(async () => {
    englishCatalog = await loadNamespace("en", "studio");
    portugueseCatalog = await loadNamespace("pt", "studio");
  });

  it("lists the story screens in order, each titled from its gallery key", () => {
    expect(STUDIO_LANDING_SCREENS.map((screen) => screen.screenId)).toEqual([
      "home",
      "artist",
      "release",
      "playlists",
      "player",
      "share",
    ]);
    for (const screen of STUDIO_LANDING_SCREENS) {
      expect(screen.titleKey).toBe(
        `studio:landing.gallery.${screen.screenId}.tab`,
      );
    }
  });

  it("gives every shot the size of its device", () => {
    for (const shot of ALL_SHOTS) {
      const expectedSize = STUDIO_LANDING_SHOT_SIZES[shot.device];
      expect({ width: shot.width, height: shot.height }).toEqual(expectedSize);
    }
  });

  it("builds the themed webp path for a shot", () => {
    const homeScreen = STUDIO_LANDING_SCREENS.find(
      (screen) => screen.screenId === "home",
    );
    expect(homeScreen).toBeDefined();
    if (!homeScreen) return;
    expect(studioLandingShotSrc(homeScreen.shot, "dark")).toBe(
      "/studio-landing/home-desktop-dark.webp",
    );
    expect(
      studioLandingShotSrc(STUDIO_LANDING_ARTIST_SHOTS.phone, "light"),
    ).toBe("/studio-landing/dashboard-phone-light.webp");
  });

  it("gives every screen a phone shot at the phone size", () => {
    for (const screen of STUDIO_LANDING_SCREENS) {
      expect(screen.phoneShot.device, screen.screenId).toBe("phone");
      expect({
        width: screen.phoneShot.width,
        height: screen.phoneShot.height,
      }).toEqual(STUDIO_LANDING_SHOT_SIZES.phone);
    }
    expect(STUDIO_LANDING_ARTIST_SHOTS.laptop.device).toBe("laptop");
    expect(STUDIO_LANDING_ARTIST_SHOTS.phone.device).toBe("phone");
  });

  it("has an image file for every shot in both themes, the artist shots included", () => {
    for (const shot of ALL_SHOTS) {
      for (const theme of THEMES) {
        const imagePath = `public${studioLandingShotSrc(shot, theme)}`;
        expect(existsSync(imagePath), imagePath).toBe(true);
      }
    }
  });

  it("has the social preview image", () => {
    expect(STUDIO_LANDING_OG_IMAGE).toBe("/studio-landing/og-studio.jpg");
    expect(existsSync(`public${STUDIO_LANDING_OG_IMAGE}`)).toBe(true);
  });

  it("compares nine topics, each with three distinct answers", () => {
    expect(STUDIO_LANDING_COMPARISON_ROWS.map((row) => row.rowId)).toEqual([
      "featured",
      "releasing",
      "stageName",
      "ads",
      "listening",
      "fans",
      "safety",
      "scene",
      "owner",
    ]);
    for (const row of STUDIO_LANDING_COMPARISON_ROWS) {
      const answerKeys = [row.streamingKey, row.platformsKey, row.studioKey];
      expect(new Set(answerKeys).size, row.rowId).toBe(3);
      for (const answerKey of answerKeys) {
        expect(answerKey, row.rowId).toMatch(
          new RegExp(`^studio:landing\\.compare\\.${row.rowId}\\.`),
        );
      }
    }
  });

  it("orders the same sections for both audiences, For artists first for artists", () => {
    const listenerOrder = STUDIO_LANDING_SECTION_ORDER.listener;
    const artistOrder = STUDIO_LANDING_SECTION_ORDER.artist;
    expect(new Set(listenerOrder).size).toBe(listenerOrder.length);
    expect([...artistOrder].sort()).toEqual([...listenerOrder].sort());
    expect(listenerOrder[0]).toBe("proof");
    expect(artistOrder.slice(0, 2)).toEqual(["proof", "forArtists"]);
    expect(listenerOrder.indexOf("listen")).toBeLessThan(
      listenerOrder.indexOf("forArtists"),
    );
    expect(listenerOrder.at(-1)).toBe("manifesto");
    expect(artistOrder.at(-1)).toBe("manifesto");
  });

  it("lists the for artists points, the questions and the next steps", () => {
    expect(
      STUDIO_LANDING_FOR_ARTISTS_POINTS.map((point) => point.pointId),
    ).toEqual(["upload", "persona", "numbers", "tools", "events"]);
    expect(STUDIO_LANDING_FAQ.map((item) => item.itemId)).toEqual([
      "free",
      "later",
      "spotify",
      "ownership",
      "elsewhere",
      "stageName",
      "listening",
      "cut",
      "upload",
      "getIn",
    ]);
    expect(STUDIO_LANDING_NEXT_STEPS.map((point) => point.pointId)).toEqual([
      "invite",
      "review",
      "list",
    ]);
  });

  it("links the Spotify fact to Spotify's own announcement", () => {
    expect(new URL(SPOTIFY_ROYALTY_SOURCE_URL).hostname).toBe(
      "artists.spotify.com",
    );
    expect(SPOTIFY_ROYALTY_SOURCE_URL).toMatch(/^https:\/\//);
  });

  it("finds every listen reason line in the en and pt studio catalogs", () => {
    for (const reasonKey of Object.values(STUDIO_LANDING_LISTEN_REASON_KEY)) {
      const key = withoutNamespace(reasonKey);
      expect(englishCatalog[key], `en ${key}`).toBeTypeOf("string");
      expect(portugueseCatalog[key], `pt ${key}`).toBeTypeOf("string");
    }
  });

  it("finds every data key in the en and pt studio catalogs", () => {
    const allKeys = new Set([
      ...EXPORTED_KEYS.map(withoutNamespace),
      ...literalKeysInDataFile(),
    ]);
    expect(allKeys.size).toBeGreaterThan(0);
    for (const key of allKeys) {
      expect(englishCatalog[key], `en ${key}`).toBeTypeOf("string");
      expect(portugueseCatalog[key], `pt ${key}`).toBeTypeOf("string");
    }
  });

  it("keeps the en landing copy free of banned phrasing", () => {
    const landingEntries = Object.entries(englishCatalog).filter(([key]) =>
      key.startsWith("landing."),
    );
    expect(landingEntries.length).toBeGreaterThan(0);
    for (const [key, value] of landingEntries) {
      expect(value, key).not.toMatch(BANNED_COPY_PATTERN);
    }
  });
});
