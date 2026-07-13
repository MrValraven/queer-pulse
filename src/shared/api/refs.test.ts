import { describe, expect, it } from "vitest";
import {
  initialsOf,
  memberRefToPerson,
  tintForSlug,
  type MemberRefDTO,
} from "./refs";

describe("tintForSlug", () => {
  it("is deterministic for the same slug", () => {
    expect(tintForSlug("joao-ribeiro")).toBe(tintForSlug("joao-ribeiro"));
  });
  it("only ever returns coral / plum / jade", () => {
    const seen = new Set(
      ["a", "bb", "ccc", "sofia", "rui", "mariana", "andre", "carla"].map(
        tintForSlug,
      ),
    );
    for (const t of seen) expect(["coral", "plum", "jade"]).toContain(t);
  });
  it("distributes across all three tints over many slugs", () => {
    const seen = new Set(
      Array.from({ length: 50 }, (_, i) => tintForSlug(`slug-${i}`)),
    );
    expect(seen.size).toBe(3);
  });
});

describe("initialsOf", () => {
  it("uppercases the first letter of each name", () => {
    expect(initialsOf("inês", "santos")).toBe("IS");
  });
  it("tolerates empty names", () => {
    expect(initialsOf("", "")).toBe("");
  });
});

describe("memberRefToPerson", () => {
  const ref: MemberRefDTO = {
    slug: "joao-ribeiro",
    firstName: "João",
    lastName: "Ribeiro",
    avatarUrl: "https://example.test/a.jpg",
  };

  it("maps a ref to a render-ready person", () => {
    const p = memberRefToPerson(ref);
    expect(p).not.toBeNull();
    expect(p?.name).toBe("João Ribeiro");
    expect(p?.initials).toBe("JR");
    expect(p?.avatarUrl).toBe("https://example.test/a.jpg");
    expect(p?.tint).toBe(tintForSlug("joao-ribeiro"));
  });

  it("passes null / undefined through as null", () => {
    expect(memberRefToPerson(null)).toBeNull();
    expect(memberRefToPerson(undefined)).toBeNull();
  });

  it("defaults a missing avatarUrl to null", () => {
    const { avatarUrl: _omit, ...noAvatar } = ref;
    void _omit;
    expect(memberRefToPerson(noAvatar)?.avatarUrl).toBeNull();
  });
});
