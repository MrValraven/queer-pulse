import { existsSync, readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { loadNamespace } from "../../../shared/i18n/catalogs";
import type { Catalog } from "../../../shared/i18n/types";
import type { Theme } from "../../../app/providers/themeContext";
import {
  STUDIO_LANDING_COMPARISON_ROWS,
  STUDIO_LANDING_HERO_SHOTS,
  STUDIO_LANDING_OG_IMAGE,
  STUDIO_LANDING_PLAN_POINTS,
  STUDIO_LANDING_PROMISES,
  STUDIO_LANDING_SCREENS,
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
];

/** Every key the exported data structures hand to `t()`. */
const EXPORTED_KEYS: readonly string[] = [
  ...STUDIO_LANDING_SCREENS.flatMap((screen) => [
    screen.tabKey,
    screen.captionKey,
    screen.shot.altKey,
    screen.phoneShot.altKey,
  ]),
  ...[...STUDIO_LANDING_PROMISES, ...STUDIO_LANDING_PLAN_POINTS].flatMap(
    (point) => [point.titleKey, point.bodyKey],
  ),
  ...STUDIO_LANDING_COMPARISON_ROWS.flatMap((row) => [
    row.topicKey,
    row.bigAppsKey,
    row.studioKey,
  ]),
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

  it("lists the gallery screens in order", () => {
    expect(STUDIO_LANDING_SCREENS.map((screen) => screen.screenId)).toEqual([
      "home",
      "artist",
      "release",
      "playlists",
      "player",
      "share",
    ]);
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
  });

  it("gives every screen a phone shot at the phone size", () => {
    for (const screen of STUDIO_LANDING_SCREENS) {
      expect(screen.phoneShot.device, screen.screenId).toBe("phone");
      expect({
        width: screen.phoneShot.width,
        height: screen.phoneShot.height,
      }).toEqual(STUDIO_LANDING_SHOT_SIZES.phone);
    }
    const homeScreen = STUDIO_LANDING_SCREENS.find(
      (screen) => screen.screenId === "home",
    );
    expect(
      homeScreen && studioLandingShotSrc(homeScreen.phoneShot, "light"),
    ).toBe("/studio-landing/home-phone-light.webp");
  });

  it("has an image file for every shot in both themes", () => {
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
