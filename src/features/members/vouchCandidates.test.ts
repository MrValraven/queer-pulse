import { describe, expect, it } from "vitest";
import { resolveVouchCandidates } from "./vouchCandidates";
import type { MemberCard } from "./memberDirectoryFilter.data";

const card = (overrides: Partial<MemberCard> & { slug: string }): MemberCard =>
  ({
    meta: "she/her",
    role: "",
    tags: [],
    openTo: [],
    hood: "",
    discipline: "",
    profession: "",
    identities: [],
    languages: [],
    years: 1,
    ...overrides,
  }) as MemberCard;

describe("resolveVouchCandidates", () => {
  it("removes the viewer, who cannot vouch for themselves", () => {
    const candidates = resolveVouchCandidates(
      [
        card({ slug: "me", firstName: "Ana", lastName: "Reis" }),
        card({ slug: "other", firstName: "Rui", lastName: "Sousa" }),
      ],
      "",
      "me",
      false,
    );

    expect(candidates.map((candidate) => candidate.slug)).toEqual(["other"]);
  });

  it("matches names through diacritics", () => {
    const candidates = resolveVouchCandidates(
      [card({ slug: "ines", firstName: "Inês", lastName: "Faria" })],
      "ines",
      undefined,
      false,
    );

    expect(candidates).toHaveLength(1);
  });

  it("never substitutes a mock persona in live mode", () => {
    // A live card with no name of its own is dropped. Falling back to the mock
    // registry here would print a demo persona's name over a real member.
    const candidates = resolveVouchCandidates(
      [card({ slug: "ines" })],
      "",
      undefined,
      false,
    );

    expect(candidates).toEqual([]);
  });

  it("resolves a demo card's name from the mock registry", () => {
    const candidates = resolveVouchCandidates(
      [card({ slug: "ines" })],
      "",
      undefined,
      true,
    );

    expect(candidates[0]?.name).toBeTruthy();
  });
});
