import { describe, expect, it } from "vitest";
import {
  applyDemoGuestChanges,
  guestCommunitiesFromDetail,
  guestDraftEntries,
} from "./eventCommunities.adapters";
import type {
  EventGuestCommunityView,
  GuestCommunityDraftEntry,
} from "./eventCommunities.api";

const transHub: EventGuestCommunityView = {
  id: "row-1",
  status: "accepted",
  community: {
    slug: "trans-hub",
    name: "Trans & Non-Binary Hub",
    accessTier: "public",
  },
};
const rainbowArts: EventGuestCommunityView = {
  id: "row-2",
  status: "pending",
  community: {
    slug: "rainbow-arts",
    name: "Rainbow Arts Collective",
    accessTier: "request",
  },
};
const queerRunners: GuestCommunityDraftEntry = {
  slug: "queer-runners",
  name: "Queer Runners Lisboa",
  accessTier: "public",
  status: "unsent",
};
const queerElders: GuestCommunityDraftEntry = {
  slug: "queer-elders",
  name: "Queer Elders",
  accessTier: "public",
  status: "unsent",
};

describe("guestDraftEntries", () => {
  it("reads each saved row with the status the server holds", () => {
    expect(guestDraftEntries([transHub, rainbowArts])).toEqual([
      {
        slug: "trans-hub",
        name: "Trans & Non-Binary Hub",
        accessTier: "public",
        status: "accepted",
      },
      {
        slug: "rainbow-arts",
        name: "Rainbow Arts Collective",
        accessTier: "request",
        status: "pending",
      },
    ]);
  });
});

describe("guestCommunitiesFromDetail", () => {
  it("normalises a missing avatar to null and keeps a present one", () => {
    const guest = {
      id: "row-1",
      slug: "trans-hub",
      name: "Trans & Non-Binary Hub",
      accessTier: "public" as const,
      viewerManages: false,
    };
    expect(
      guestCommunitiesFromDetail([
        guest,
        { ...guest, id: "row-2", avatarImageUrl: "https://img/a.png" },
      ]).map((entry) => entry.avatarImageUrl),
    ).toEqual([null, "https://img/a.png"]);
  });

  it("reads an older server with no field as no guests", () => {
    expect(guestCommunitiesFromDetail(undefined)).toEqual([]);
  });
});

describe("applyDemoGuestChanges", () => {
  it("removes rows, then adds a community the viewer runs as joined and any other as invited", () => {
    const next = applyDemoGuestChanges(
      [transHub, rainbowArts],
      { invites: [queerRunners, queerElders], removeSlugs: ["rainbow-arts"] },
      (communitySlug) => communitySlug === "queer-runners",
    );
    expect(next.map((view) => [view.community.slug, view.status])).toEqual([
      ["trans-hub", "accepted"],
      ["queer-runners", "accepted"],
      ["queer-elders", "pending"],
    ]);
  });

  it("lists a community once even when it is invited again", () => {
    const next = applyDemoGuestChanges(
      [transHub],
      {
        invites: [
          {
            ...queerRunners,
            slug: "trans-hub",
            name: "Trans & Non-Binary Hub",
          },
        ],
        removeSlugs: [],
      },
      () => false,
    );
    expect(next).toHaveLength(1);
  });
});
