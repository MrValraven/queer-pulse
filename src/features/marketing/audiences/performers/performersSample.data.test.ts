import { describe, expect, it } from "vitest";
import { DIRECTORY_PLACES } from "../../directoryPlaces";
import { DEMO_SUBPROFILES } from "../../../subprofiles/data/subprofiles.data";
import { skinFor } from "../../../subprofiles/subprofile-skins";
import { isSamplePersonaPageKind } from "../shared/persona/SamplePersonaPage";
import { loadTestT } from "../shared/testing/audienceTestUtils";
import {
  buildSampleLineup,
  buildSamplePerformer,
  PERFORMER_TRY_KINDS,
  SAMPLE_HANDLE,
  SAMPLE_MEMBER_NAME,
  SAMPLE_PERSONA_AVATAR_URL,
  SAMPLE_STAGE_NAME,
} from "./performersSample.data";

const TODAY = new Date(2026, 9, 27, 10, 0);
const DEMO_USER_PHOTO = "photo-1500648767791-00dcc994a43e";
const BANNED_KEY = /^(tips?|sustain\w*|payouts?|listening\w*)$/i;
const ALLOWED_URL_PREFIXES = [
  "https://images.unsplash.com/",
  "https://example.com/",
];

async function buildEverything(language: "en" | "pt") {
  const t = await loadTestT(language, ["forPerformers", "subprofiles"]);
  return {
    performers: PERFORMER_TRY_KINDS.map((kind) =>
      buildSamplePerformer(t, kind, TODAY),
    ),
    lineup: buildSampleLineup(),
  };
}

function objectKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(objectKeys);
  if (value === null || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => [
    key,
    ...objectKeys(child),
  ]);
}

function stringValues(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringValues);
  if (value === null || typeof value !== "object") return [];
  return Object.values(value).flatMap(stringValues);
}

describe.each(["en", "pt"] as const)(
  "performers sample data (%s)",
  (language) => {
    it("honesty guard: no real people, places or demo money", async () => {
      const everything = await buildEverything(language);
      const serialized = JSON.stringify(everything);
      expect(serialized).not.toMatch(/Tiago|ILGA|Trumps|Cevicheria/i);
      expect(serialized).not.toMatch(/nightform|grain-studio/i);
      expect(serialized).not.toContain(DEMO_USER_PHOTO);
      expect(
        objectKeys(everything).filter((key) => BANNED_KEY.test(key)),
      ).toEqual([]);
      const urls = stringValues(everything).filter((text) =>
        text.startsWith("https://"),
      );
      expect(urls.length).toBeGreaterThan(0);
      for (const url of urls) {
        expect(
          ALLOWED_URL_PREFIXES.some((prefix) => url.startsWith(prefix)),
        ).toBe(true);
      }
    });

    it("every sentence resolves (no raw catalog keys)", async () => {
      const everything = await buildEverything(language);
      expect(JSON.stringify(everything)).not.toMatch(/forPerformers:/);
    });

    it("no name or venue matches a real directory entry", async () => {
      const everything = await buildEverything(language);
      const directoryNames = new Set(
        DIRECTORY_PLACES.flatMap((place) => [
          place.name.toLowerCase(),
          place.slug.toLowerCase(),
        ]),
      );
      const sampleNames = [
        ...everything.performers.flatMap((performer) => [
          performer.displayName,
          ...performer.items.flatMap((item) =>
            item.venue ? [item.venue] : [],
          ),
        ]),
        ...everything.lineup.map((entry) => entry.name),
      ];
      expect(
        sampleNames.filter((name) => directoryNames.has(name.toLowerCase())),
      ).toEqual([]);
    });
  },
);

describe("the sample lineup", () => {
  it("lists the member behind the persona, never the persona itself", () => {
    const lineup = buildSampleLineup();
    expect(lineup.map((entry) => entry.name)).toContain(SAMPLE_MEMBER_NAME);
    expect(
      lineup.filter(
        (entry) =>
          entry.name === SAMPLE_STAGE_NAME ||
          entry.avatarUrl === SAMPLE_PERSONA_AVATAR_URL,
      ),
    ).toEqual([]);
  });
});

describe("the sample performer", () => {
  it("shares no name or handle with a demo persona", () => {
    const demoNames = new Set(
      DEMO_SUBPROFILES.flatMap((persona) => [
        persona.displayName.toLowerCase(),
        persona.slug.toLowerCase(),
        ...(persona.handle ? [persona.handle.toLowerCase()] : []),
      ]),
    );
    expect(demoNames.has(SAMPLE_STAGE_NAME.toLowerCase())).toBe(false);
    expect(demoNames.has(SAMPLE_HANDLE)).toBe(false);
  });

  it.each(PERFORMER_TRY_KINDS)(
    "%s: one upcoming item, the Stage skin, drawable",
    async (kind) => {
      const t = await loadTestT("en", ["forPerformers"]);
      const performer = buildSamplePerformer(t, kind, TODAY);
      const upcoming = performer.items.filter(
        (item) => item.date && Date.parse(item.date) > TODAY.getTime(),
      );
      expect(upcoming).toHaveLength(1);
      expect(skinFor(kind)).toBe("stage");
      expect(isSamplePersonaPageKind(kind)).toBe(true);
      expect(performer.kind).toBe(kind);
      expect(performer.displayName).toBe(SAMPLE_STAGE_NAME);
      expect(performer.endorsementCount).toBe(0);
      expect(performer.followerCount).toBe(0);
      expect(performer.status).toBe("published");
      expect(performer.visibility).toBe("open");
      expect(performer.linkVisibility).toBe("unlinked");
      expect(performer.socialLinks.length).toBeGreaterThanOrEqual(3);
      expect(performer.socialLinks.length).toBeLessThanOrEqual(4);
      expect(performer.skinData?.booker?.fee).toBe("From 250");
      expect(performer.skinData?.booker?.contact).toMatch(/@example\.com$/);
    },
  );
});
