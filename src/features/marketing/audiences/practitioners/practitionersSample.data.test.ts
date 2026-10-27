import { describe, expect, it } from "vitest";
import type { Language, TFunction } from "../../../../shared/i18n/types";
import { DIRECTORY_PLACES } from "../../directoryPlaces";
import { DEMO_SUBPROFILES } from "../../../subprofiles/data/subprofiles.data";
import { TATTOO_DEMO_SUBPROFILES } from "../../../subprofiles/data/tattooDemoSubprofiles.data";
import { THERAPIST_DEMO_SUBPROFILES } from "../../../subprofiles/data/therapistDemoSubprofiles.data";
import { TATTOO_ARTIST_DEMO_SUBPROFILE } from "../../../subprofiles/data/tattooArtistDemoSubprofile.data";
import { skinFor } from "../../../subprofiles/subprofile-skins";
import { loadTestT } from "../shared/testing/audienceTestUtils";
import {
  PRACTITIONER_TRY_KINDS,
  type PractitionerTryKind,
} from "./practitionersLanding.data";
import { buildSamplePractitioner } from "./practitionersSample.data";

const TODAY = new Date(2026, 9, 27);
const LANGUAGES: readonly Language[] = ["en", "pt"];
const DEMO_USER_PHOTO = "photo-1500648767791-00dcc994a43e";
const BANNED_KEY = /^(tips?|sustain\w*|payouts?|listening\w*)$/i;
const THERAPIST_BANNED =
  /\b(cure|heal|diagnos|treat(s|ment)? for|guarantee|verified|licensed|accredited|certified by)\b/i;

async function samplesIn(language: Language) {
  const t: TFunction = await loadTestT(language, [
    "forPractitioners",
    "subprofiles",
  ]);
  return PRACTITIONER_TRY_KINDS.map((kind) =>
    buildSamplePractitioner(t, kind, TODAY),
  );
}

/** Every object key anywhere under `value`. */
function allKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(allKeys);
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => [
      key,
      ...allKeys(child),
    ]);
  }
  return [];
}

const DEMO_PERSONAS = [
  ...DEMO_SUBPROFILES,
  ...TATTOO_DEMO_SUBPROFILES,
  ...THERAPIST_DEMO_SUBPROFILES,
  TATTOO_ARTIST_DEMO_SUBPROFILE,
];

describe("practitioners sample honesty guard", () => {
  it.each(LANGUAGES)(
    "%s: no real member, place or demo-only money",
    async (language) => {
      const samples = await samplesIn(language);
      const text = JSON.stringify(samples);
      expect(text).not.toMatch(/Tiago|ILGA|Trumps|Cevicheria/i);
      expect(text).not.toContain(DEMO_USER_PHOTO);
      expect(allKeys(samples).filter((key) => BANNED_KEY.test(key))).toEqual(
        [],
      );
      for (const url of text.match(/https:\/\/[^"\s]+/g) ?? []) {
        expect(url.startsWith("https://images.unsplash.com/")).toBe(true);
      }
    },
  );

  it.each(LANGUAGES)(
    "%s: no name or handle from the demo directory or demo personas",
    async (language) => {
      const samples = await samplesIn(language);
      const takenNames = new Set([
        ...DIRECTORY_PLACES.flatMap((place) => [place.name, place.slug]),
        ...DEMO_PERSONAS.flatMap((persona) => [
          persona.displayName,
          persona.slug,
          persona.handle ?? "",
        ]),
      ]);
      for (const sample of samples) {
        expect(takenNames.has(sample.displayName)).toBe(false);
        expect(takenNames.has(sample.slug)).toBe(false);
        expect(takenNames.has(sample.handle ?? "")).toBe(false);
      }
    },
  );

  it.each(LANGUAGES)(
    "%s: the therapist sample makes no health, outcome or vetting claim",
    async (language) => {
      const samples = await samplesIn(language);
      const therapist = samples.find((sample) => sample.kind === "therapist");
      expect(therapist).toBeDefined();
      expect(JSON.stringify(therapist)).not.toMatch(THERAPIST_BANNED);
      expect(therapist?.skinData?.therapist?.registration).toBe("");
    },
  );

  it("each practice wears its own skin", () => {
    const expectedSkins: Record<PractitionerTryKind, string> = {
      tattoo_artist: "studio",
      therapist: "practice",
      hair_stylist: "chair",
      photographer: "studio",
    };
    for (const kind of PRACTITIONER_TRY_KINDS) {
      expect(skinFor(kind)).toBe(expectedSkins[kind]);
    }
  });
});
