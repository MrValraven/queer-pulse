import { describe, expect, it } from "vitest";
import type { TFunction } from "../i18n/types";
import {
  INACTIVE_MEMBER_LABEL_KEY,
  authorDisplayName,
  inactiveMemberLabel,
  initialsOf,
  isInactiveMemberRef,
  memberRefDisplayName,
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

describe("the inactive member stand-in (PRD-507)", () => {
  const t: TFunction = (key) => key;
  const standIn: MemberRefDTO = {
    slug: "",
    firstName: "",
    lastName: "",
    avatarUrl: null,
    isInactiveMember: true,
  };

  it("is told apart from an ordinary ref and from a flattened author", () => {
    expect(isInactiveMemberRef(standIn)).toBe(true);
    expect(
      isInactiveMemberRef({ slug: "ana", firstName: "Ana", lastName: "" }),
    ).toBe(false);
    expect(isInactiveMemberRef(null)).toBe(false);
    expect(
      isInactiveMemberRef({
        handle: "",
        displayName: "",
        isInactiveMember: true,
      }),
    ).toBe(true);
  });

  it("maps to a person with the label and a blank slug, photo and initials", () => {
    const person = memberRefToPerson(standIn, t);
    expect(person).toEqual(
      expect.objectContaining({
        slug: "",
        name: INACTIVE_MEMBER_LABEL_KEY,
        initials: "",
        avatarUrl: null,
        tint: "default",
        isInactiveMember: true,
      }),
    );
  });

  it("reads the label from the eager common catalog when no translator is passed", () => {
    expect(memberRefToPerson(standIn)?.name).toBe(inactiveMemberLabel());
  });

  it("names the stand-in by the label in both byline helpers", () => {
    expect(memberRefDisplayName(standIn, t)).toBe(INACTIVE_MEMBER_LABEL_KEY);
    const flattenedStandIn = { displayName: "", isInactiveMember: true };
    expect(authorDisplayName(flattenedStandIn, t)).toBe(
      INACTIVE_MEMBER_LABEL_KEY,
    );
    expect(authorDisplayName({ displayName: "Ana Lima" }, t)).toBe("Ana Lima");
    expect(memberRefDisplayName(null, t)).toBe("");
  });
});
