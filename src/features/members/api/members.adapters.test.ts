import { describe, expect, it } from "vitest";
import { profileToMember } from "./members.adapters";
import type { ProfileDTO } from "./members.api";

// ENG-444 made the member's privacy toggles owner-only, so a visitor's
// `GET /profiles/:slug` carries no `vouchersVisible` or `lookingForPublic`.
// `profileToMember` re-derives both for a visitor from content the backend
// already gated: `mutualVoucherCount` is null to a non-owner exactly when the
// roster is hidden (see backend `ProfilesService.loadMutualVoucherCount`), and
// `lookingFor` reaches a non-owner only when the member made it public. These
// cases pin that contract so a backend change to either shape shows up here.

function profileDto(overrides: Partial<ProfileDTO> = {}): ProfileDTO {
  return {
    slug: "tiago",
    firstName: "Tiago",
    lastName: "Costa",
    vouchCount: 3,
    visibility: "open",
    limited: false,
    ...overrides,
  };
}

describe("profileToMember vouchersVisible", () => {
  it("keeps the owner's own toggle when it is on", () => {
    // The owner's response always has a null count and the real flag.
    const member = profileToMember(
      profileDto({ vouchersVisible: true, mutualVoucherCount: null }),
    );
    expect(member.vouchersVisible).toBe(true);
  });

  it("keeps the owner's own toggle when it is off", () => {
    const member = profileToMember(
      profileDto({ vouchersVisible: false, mutualVoucherCount: null }),
    );
    expect(member.vouchersVisible).toBe(false);
  });

  it("reads a visitor's numeric mutual count as a visible roster", () => {
    const withMutuals = profileToMember(profileDto({ mutualVoucherCount: 2 }));
    expect(withMutuals).toHaveProperty("vouchersVisible", true);

    // Zero mutual vouchers is still a visible roster.
    const withoutMutuals = profileToMember(
      profileDto({ mutualVoucherCount: 0 }),
    );
    expect(withoutMutuals.vouchersVisible).toBe(true);
  });

  it("reads a visitor's null mutual count as a hidden roster", () => {
    const member = profileToMember(profileDto({ mutualVoucherCount: null }));
    expect(member.vouchersVisible).toBe(false);
  });
});

describe("profileToMember lookingForPublic", () => {
  it("keeps the owner's own toggle whichever way it is set", () => {
    const ownedPublic = profileToMember(
      profileDto({ lookingFor: ["Friendship"], lookingForPublic: true }),
    );
    expect(ownedPublic.lookingForPublic).toBe(true);

    // The owner sees their private list with the "only you" hint.
    const ownedPrivate = profileToMember(
      profileDto({ lookingFor: ["Friendship"], lookingForPublic: false }),
    );
    expect(ownedPrivate.lookingForPublic).toBe(false);
    expect(ownedPrivate.lookingFor).toEqual(["Friendship"]);
  });

  it("reads a visitor's non-empty list as public", () => {
    const member = profileToMember(profileDto({ lookingFor: ["Friendship"] }));
    expect(member.lookingForPublic).toBe(true);
    expect(member.lookingFor).toEqual(["Friendship"]);
  });

  it("reads a visitor's empty list as hidden", () => {
    const member = profileToMember(profileDto({ lookingFor: [] }));
    expect(member.lookingForPublic).toBe(false);
    expect(member.lookingFor).toEqual([]);
  });
});
