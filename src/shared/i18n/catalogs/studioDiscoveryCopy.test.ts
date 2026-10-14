import { describe, expect, it } from "vitest";
import { STUDIO_GENRE_LABEL_KEY } from "../../../features/studio/api/studio.adapters";
import {
  STUDIO_CREDIT_ROLES,
  STUDIO_GENRES,
  STUDIO_MOODS,
} from "../../../features/studio/api/studio.types";
import {
  STUDIO_CREDIT_ROLE_LABEL_KEY,
  STUDIO_MOOD_LABEL_KEY,
} from "../../../features/studio/studioDiscoveryLabels";
import { loadNamespace } from "./index";

const LANGUAGES = ["en", "pt"] as const;
/** A chip or a button label this long still wraps as whole words in the
 *  328px column a 360px phone leaves inside its 16px gutters. */
const CHIP_LABEL_MAX = 16;
const RADIO_BUTTON_LABEL_MAX = 36;

const pathOf = (key: string) => key.slice(key.indexOf(":") + 1);

describe("Studio discovery copy at 360px", () => {
  it.each(LANGUAGES)(
    "keeps every mood and credit role label short enough for a chip (%s)",
    async (language) => {
      const catalog = await loadNamespace(language, "studio");
      const keys = [
        ...STUDIO_MOODS.map((mood) => STUDIO_MOOD_LABEL_KEY[mood]),
        ...STUDIO_CREDIT_ROLES.map(
          (role) => STUDIO_CREDIT_ROLE_LABEL_KEY[role],
        ),
      ];
      for (const key of keys) {
        const label = catalog[pathOf(key)];
        expect(label, key).toBeTypeOf("string");
        expect(label?.length ?? 0, key).toBeLessThanOrEqual(CHIP_LABEL_MAX);
      }
    },
  );

  it.each(LANGUAGES)(
    "keeps the longest Play radio label within one wrapped button (%s)",
    async (language) => {
      const catalog = await loadNamespace(language, "studio");
      const template = catalog["radio.playCta"] ?? "";
      expect(template).toContain("{name}");
      const names = [
        ...STUDIO_GENRES.map(
          (genre) => catalog[pathOf(STUDIO_GENRE_LABEL_KEY[genre])] ?? "",
        ),
        ...STUDIO_MOODS.map(
          (mood) => catalog[pathOf(STUDIO_MOOD_LABEL_KEY[mood])] ?? "",
        ),
      ];
      const longest = Math.max(
        ...names.map((name) => template.replace("{name}", name).length),
      );
      expect(longest).toBeLessThanOrEqual(RADIO_BUTTON_LABEL_MAX);
    },
  );
});
