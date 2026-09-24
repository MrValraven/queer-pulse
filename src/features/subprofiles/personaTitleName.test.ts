import { describe, expect, it } from "vitest";
import { subprofiles as subprofilesPt } from "../../shared/i18n/catalogs/pt/subprofiles";
import type { SubprofileKind } from "./api/subprofiles.api";
import {
  isBareProfessionName,
  KIND_LABEL_KEYS,
  personaAddressName,
  personaNameBesideCraft,
  personaTitleName,
} from "./subprofile-kinds";

// Unrun per repo policy (`do-not-run-tests-unless-asked`) — verified statically.

describe("isBareProfessionName", () => {
  it("is true when the name is still the auto-filled profession", () => {
    expect(isBareProfessionName({ displayName: "Poet", kind: "poet" })).toBe(
      true,
    );
  });

  it("ignores case and surrounding whitespace", () => {
    // The stored value is owner-editable, so an owner may have retyped it.
    expect(
      isBareProfessionName({ displayName: "  developer ", kind: "developer" }),
    ).toBe(true);
  });

  it("is false for a name the owner actually chose", () => {
    expect(
      isBareProfessionName({ displayName: "Hot Mess Express", kind: "dj" }),
    ).toBe(false);
  });

  it("compares against the persona's OWN kind, not any profession", () => {
    // "Poet" is a profession label, but not this persona's — a dancer who
    // named themselves "Poet" chose that name.
    expect(isBareProfessionName({ displayName: "Poet", kind: "dancer" })).toBe(
      false,
    );
  });

  it("recognises the Portuguese kind label the create form suggests", () => {
    // In Portuguese the name field's placeholder reads "por ex. Terapia".
    expect(
      isBareProfessionName({ displayName: "Terapia", kind: "therapist" }),
    ).toBe(true);
    expect(isBareProfessionName({ displayName: "Poesia", kind: "poet" })).toBe(
      true,
    );
  });

  it("ignores accents, case and extra whitespace in either language", () => {
    expect(
      isBareProfessionName({
        displayName: "  PROGRAMACAO ",
        kind: "developer",
      }),
    ).toBe(true);
    expect(
      isBareProfessionName({
        displayName: "docencia   universitaria",
        kind: "lecturer",
      }),
    ).toBe(true);
  });

  it("matches a Portuguese label only for its own kind", () => {
    expect(
      isBareProfessionName({ displayName: "Poesia", kind: "dancer" }),
    ).toBe(false);
  });

  it("is false for a Portuguese name the owner actually chose", () => {
    expect(
      isBareProfessionName({ displayName: "Casa da Poesia", kind: "poet" }),
    ).toBe(false);
  });

  it("knows every kind's label in the Portuguese catalog", () => {
    // Guards the static copy in subprofile-kinds.ts against catalog drift.
    for (const [kind, labelKey] of Object.entries(KIND_LABEL_KEYS)) {
      const catalogLabel = subprofilesPt[labelKey.replace("subprofiles:", "")];
      expect(catalogLabel, labelKey).toBeTruthy();
      expect(
        isBareProfessionName({
          displayName: catalogLabel ?? "",
          kind: kind as SubprofileKind,
        }),
        labelKey,
      ).toBe(true);
    }
  });
});

describe("personaTitleName", () => {
  it("titles a bare profession as 'Owner Name | Craft'", () => {
    expect(
      personaTitleName({
        displayName: "Poet",
        kind: "poet",
        ownerName: "Tiago Costa",
      }),
    ).toBe("Tiago Costa | Poet");
  });

  it("uses the canonical craft label, so a retyped name still titles cleanly", () => {
    expect(
      personaTitleName({
        displayName: "developer",
        kind: "developer",
        ownerName: "Tiago Costa",
      }),
    ).toBe("Tiago Costa | Developer");
  });

  it("titles a Portuguese bare profession with the owner's name too", () => {
    expect(
      personaTitleName({
        displayName: "Terapia",
        kind: "therapist",
        ownerName: "Inês Duarte",
      }),
    ).toBe("Inês Duarte | Therapist");
  });

  it("leaves a chosen name untouched even when the owner is known", () => {
    expect(
      personaTitleName({
        displayName: "Hot Mess Express",
        kind: "dj",
        ownerName: "Tiago Costa",
      }),
    ).toBe("Hot Mess Express");
  });

  it("keeps the bare name when no owner is known (unlinked persona)", () => {
    // An unlinked persona is pseudonymous: `toCardDTO` sends null rather than
    // leak the owner tie, and anonymity outranks a nicer title.
    expect(personaTitleName({ displayName: "Poet", kind: "poet" })).toBe(
      "Poet",
    );
    expect(
      personaTitleName({ displayName: "Poet", kind: "poet", ownerName: null }),
    ).toBe("Poet");
  });

  it("keeps the bare name rather than titling as ' | Craft'", () => {
    // An owner whose name parts are both blank composes to "".
    expect(
      personaTitleName({ displayName: "Poet", kind: "poet", ownerName: "   " }),
    ).toBe("Poet");
  });

  it("trims the display name it passes through", () => {
    expect(
      personaTitleName({ displayName: "  Nightform  ", kind: "musician" }),
    ).toBe("Nightform");
  });
});

describe("personaNameBesideCraft", () => {
  it("gives the owner's name alone, leaving the craft to its own slot", () => {
    expect(
      personaNameBesideCraft({
        displayName: "Poet",
        kind: "poet",
        ownerName: "Tiago Costa",
      }),
    ).toBe("Tiago Costa");
  });

  it("never composes the craft in, so a runhead cannot say it twice", () => {
    expect(
      personaNameBesideCraft({
        displayName: "Poet",
        kind: "poet",
        ownerName: "Tiago Costa",
      }),
    ).not.toContain("Poet");
  });

  it("falls back on the same terms as personaTitleName", () => {
    expect(
      personaNameBesideCraft({
        displayName: "Hot Mess Express",
        kind: "dj",
        ownerName: "Tiago Costa",
      }),
    ).toBe("Hot Mess Express");
    expect(personaNameBesideCraft({ displayName: "Poet", kind: "poet" })).toBe(
      "Poet",
    );
  });
});

describe("personaAddressName", () => {
  // The in-sentence sibling ("backing {name}'s work") is unchanged by this
  // work, but it shares `isBareProfessionName` — pin the split so a later
  // change to the predicate cannot silently swap one helper's answer.
  it("gives the owner's FIRST name, where a title would not read", () => {
    expect(
      personaAddressName({
        displayName: "Poet",
        kind: "poet",
        ownerName: "Tiago Costa",
      }),
    ).toBe("Tiago");
  });

  it("addresses a Portuguese bare profession by the owner's first name", () => {
    expect(
      personaAddressName({
        displayName: "Astrologia",
        kind: "astrologer",
        ownerName: "Inês Duarte",
      }),
    ).toBe("Inês");
  });
});
