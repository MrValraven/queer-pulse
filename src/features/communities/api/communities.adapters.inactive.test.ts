import { describe, expect, it } from "vitest";
import {
  INACTIVE_MEMBER_LABEL_KEY,
  type MemberRefDTO,
} from "../../../shared/api/refs";
import type { TFunction } from "../../../shared/i18n/types";
import { pulseThreadToCard, refToPerson } from "./communities.adapters";

/**
 * PRD-507. A byline whose author is paused, suspended or deleting arrives as
 * the backend's stand-in. The community view-model names it by the inactive
 * label, carries no slug (so nothing links to a profile) and no face.
 */
const t: TFunction = (key) => key;

const STAND_IN: MemberRefDTO = {
  slug: "",
  firstName: "",
  lastName: "",
  avatarUrl: null,
  isInactiveMember: true,
};

describe("community adapters and the inactive member stand-in", () => {
  it("maps the stand-in to the label with no slug, photo or initials", () => {
    const person = refToPerson(STAND_IN, t);
    expect(person.name).toBe(INACTIVE_MEMBER_LABEL_KEY);
    expect(person.slug).toBeUndefined();
    expect(person.avatarUrl).toBeUndefined();
    expect(person.initials).toBe("");
    expect(person.isInactiveMember).toBe(true);
  });

  it("keeps an ordinary member linked and named", () => {
    const person = refToPerson(
      { slug: "ana-lima", firstName: "Ana", lastName: "Lima", avatarUrl: null },
      t,
    );
    expect(person.name).toBe("Ana Lima");
    expect(person.slug).toBe("ana-lima");
    expect(person.isInactiveMember).toBeUndefined();
  });

  it("names a pulse thread's inactive author by the label", () => {
    const card = pulseThreadToCard(
      {
        id: "thread-1",
        slug: "first-run",
        title: "First run of the season",
        author: {
          handle: "",
          displayName: "",
          avatarUrl: null,
          isInactiveMember: true,
        },
        replyCount: 2,
      },
      t,
    );
    expect(card.authorName).toBe(INACTIVE_MEMBER_LABEL_KEY);
  });
});
