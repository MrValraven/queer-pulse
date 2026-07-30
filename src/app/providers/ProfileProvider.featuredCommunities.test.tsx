import { describe, it, expect } from "vitest";
import { toDraft, draftToUpdateDto } from "./useProfile";
import { currentUser } from "../../features/members/data/members";
import type { Member } from "../../features/members/data/members";

// `toDraft` projects the WHOLE member (openTo, work, skills, board, …), so it
// needs a complete member; spread the real demo member and override only the
// featured refs this suite is about.
const BASE = {
  ...currentUser,
  featuredCommunities: [
    {
      slug: "queer-runners",
      name: "Queer Runners",
      tagline: "runs",
      type: "sports",
      typeLabel: "Sports",
      countLabel: "128 members",
      role: "mod",
    },
  ],
} as unknown as Member;

describe("ProfileProvider featuredCommunities plumbing", () => {
  it("toDraft extracts ordered slugs from the member's featured refs", () => {
    expect(toDraft(BASE).featuredCommunities).toEqual(["queer-runners"]);
  });
  it("toDraft defaults to [] when the member has none", () => {
    expect(
      toDraft({ ...currentUser, featuredCommunities: undefined })
        .featuredCommunities,
    ).toEqual([]);
  });
  it("draftToUpdateDto sends the slug array verbatim", () => {
    const draft = {
      ...toDraft(BASE),
      featuredCommunities: ["a", "b"],
    };
    expect(draftToUpdateDto(draft).featuredCommunities).toEqual(["a", "b"]);
  });
});
