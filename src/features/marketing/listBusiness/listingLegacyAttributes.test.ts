import { describe, expect, it } from "vitest";
import type { ListingDraft } from "./listBusiness.data";
import { blankDraft } from "./listingFormDraft";
import {
  healLegacyLanguages,
  healLegacyListingAttributes,
  healLegacyListingDraft,
  type LegacyListingDraftFields,
} from "./listingLegacyAttributes";

/** A draft as a build from before 2026-10-08 saved it: tags, Good-for and
 *  language names, none of the new fields. */
function legacyDraft(
  fields: Partial<ListingDraft> & LegacyListingDraftFields,
): ListingDraft & LegacyListingDraftFields {
  const {
    attributes: _attributes,
    highlights: _highlights,
    entryMode: _entryMode,
    coverPolicy: _coverPolicy,
    langsOther: _langsOther,
    ...older
  } = blankDraft();
  return { ...older, ...fields };
}

describe("healLegacyListingAttributes", () => {
  it("maps tags then Good-for to attributes, once each, case and spaces ignored", () => {
    const healed = healLegacyListingAttributes(
      legacyDraft({
        cats: ["space"],
        tags: ["  vegan OPTIONS ", "Community events", "Terrace"],
        goodFor: ["Hosts community events", "Dog-friendly"],
      }),
    );
    expect(healed.attributes).toEqual([
      "vegan-options",
      "hosts-events",
      "terrace",
      "dog-friendly",
    ]);
  });

  it("drops what the table retires and anything it does not know", () => {
    const healed = healLegacyListingAttributes(
      legacyDraft({
        tags: ["Gender-neutral pricing", "Late opening", "Cosy", "Workshops"],
        goodFor: [
          "Budget-friendly",
          "Wheelchair accessible",
          "Gender-neutral toilets",
          "Quiet, low-sensory hours",
        ],
      }),
    );
    expect(healed.attributes).toEqual(["workshops"]);
  });

  it("drops every way in and Free entry on an online listing", () => {
    const healed = healLegacyListingAttributes(
      legacyDraft({
        online: true,
        cats: ["culture"],
        tags: ["Walk-ins welcome", "Booking recommended", "Free entry"],
        goodFor: ["Members only"],
      }),
    );
    expect(healed.attributes).toEqual([]);
    expect(healed.entryMode).toBeNull();
    expect(healed.coverPolicy).toBeNull();
  });

  it("keeps what the new fields already hold", () => {
    const healed = healLegacyListingAttributes(
      legacyDraft({
        cats: ["nightlife"],
        attributes: ["dj-nights"],
        highlights: ["dj-nights"],
        entryMode: "walkIn",
        tags: ["Members only", "Terrace", "DJ nights"],
      }),
    );
    expect(healed.attributes).toEqual(["dj-nights", "terrace"]);
    expect(healed.highlights).toEqual(["dj-nights"]);
    expect(healed.entryMode).toBe("walkIn");
  });

  it("lets the strictest way in win when several are set", () => {
    const healed = healLegacyListingAttributes(
      legacyDraft({
        tags: ["Booking recommended", "By appointment"],
        goodFor: ["Walk-ins welcome"],
      }),
    );
    expect(healed.entryMode).toBe("appointmentOnly");
    expect(
      healLegacyListingAttributes(
        legacyDraft({ tags: ["Members only", "By appointment"] }),
      ).entryMode,
    ).toBe("membersOnly");
  });

  it("turns By appointment into an attribute on an online listing, with no way in", () => {
    const healed = healLegacyListingAttributes(
      legacyDraft({
        online: true,
        tags: ["By appointment", "Walk-ins welcome"],
      }),
    );
    expect(healed.attributes).toEqual(["by-appointment"]);
    expect(healed.entryMode).toBeNull();
  });

  it("keeps Free entry only for nightlife or culture", () => {
    expect(
      healLegacyListingAttributes(
        legacyDraft({ cats: ["culture"], tags: ["Free entry"] }),
      ).coverPolicy,
    ).toBe("free");
    expect(
      healLegacyListingAttributes(
        legacyDraft({ cats: ["food"], tags: ["Free entry"] }),
      ).coverPolicy,
    ).toBeNull();
  });

  it("picks the first three mapped attributes as highlights", () => {
    const healed = healLegacyListingAttributes(
      legacyDraft({
        tags: ["Workshops", "Classes", "Terrace", "Solo-friendly"],
      }),
    );
    expect(healed.highlights).toEqual(["workshops", "classes", "terrace"]);
  });

  it("drops the legacy keys from the healed draft", () => {
    const healed = healLegacyListingAttributes(
      legacyDraft({ tags: ["Terrace"], goodFor: [] }),
    );
    expect("tags" in healed).toBe(false);
    expect("goodFor" in healed).toBe(false);
  });

  it("returns the same draft when there is nothing to heal", () => {
    const current = { ...blankDraft(), langs: ["pt", "en"] };
    expect(healLegacyListingAttributes(current)).toBe(current);
  });
});

describe("healLegacyLanguages", () => {
  it("turns names into codes, keeps codes, drops Other and keeps the rest as written", () => {
    expect(
      healLegacyLanguages(
        ["Português", "English", "Other", "pt-BR", "Galego", "LGP (sign)"],
        "",
      ),
    ).toEqual({ langs: ["pt", "en", "pt-BR", "lgp"], langsOther: "Galego" });
  });

  it("appends whole names to what the field holds, skipping one that runs past 80 characters", () => {
    const healed = healLegacyLanguages(
      ["Tetum", "x".repeat(70), "Crioulo"],
      "Galego",
    );
    expect(healed.langsOther).toBe("Galego, Tetum, Crioulo");
    expect(healed.langsOther.length).toBeLessThanOrEqual(80);
  });

  it("never ends the text on a separator", () => {
    const healed = healLegacyLanguages(["x".repeat(75), "Tetum"], "");
    expect(healed.langsOther).toBe("x".repeat(75));
  });

  it("matches names and codes in any case and Unicode form, each kept once", () => {
    expect(
      healLegacyLanguages(
        ["Portugue\u0302s", "ENGLISH", "PT-br", "Tetum", "tetum"],
        "",
      ),
    ).toEqual({ langs: ["pt", "en", "pt-BR"], langsOther: "Tetum" });
  });

  it("leaves out a name the field already holds", () => {
    expect(healLegacyLanguages(["galego", "Tetum"], "Galego").langsOther).toBe(
      "Galego, Tetum",
    );
  });
});

describe("healLegacyListingDraft", () => {
  it("moves retired online tags first, then maps what is left", () => {
    const healed = healLegacyListingDraft(
      legacyDraft({ online: true, tags: ["MB WAY", "Workshops"] }),
    );
    expect(healed.onlineDetails?.payments).toEqual(["mbway"]);
    expect(healed.attributes).toEqual(["workshops"]);
  });

  it("is a no-op on a draft it already healed", () => {
    const once = healLegacyListingDraft(
      legacyDraft({ tags: ["Terrace"], langs: ["Português"] }),
    );
    expect(healLegacyListingDraft(once)).toBe(once);
    expect(once.langs).toEqual(["pt"]);
  });
});
