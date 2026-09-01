import { describe, expect, it } from "vitest";
import {
  isBareProfessionName,
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
});
