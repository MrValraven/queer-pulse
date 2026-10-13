import { describe, expect, it } from "vitest";
import type { TFunction } from "../../shared/i18n/types";
import type { EventDetailDTO } from "./api/events.api";
import { detailToGathering } from "./api/events.adapters";
import { DEMO_COLLAB_INVITE } from "./collabInvite.data";
import { gatheringDetails } from "./data";

const t: TFunction = (key) => key;

describe("guest communities in the demo data", () => {
  it("gives the queer runners gathering an accepted guest the demo viewer runs", () => {
    expect(gatheringDetails["queer-runners-run"]?.guestCommunities).toEqual([
      {
        id: "demo-collab-trans-hub-run",
        slug: "trans-hub",
        name: "Trans & Non-Binary Hub",
        accessTier: "public",
        viewerManages: true,
        avatarImageUrl: null,
      },
    ]);
  });

  it("backs the invite page with a pending invite the demo viewer can answer", () => {
    expect(DEMO_COLLAB_INVITE.status).toBe("pending");
    expect(DEMO_COLLAB_INVITE.canRespond).toBe(true);
    expect(DEMO_COLLAB_INVITE.community.slug).toBe("queer-runners");
    expect(DEMO_COLLAB_INVITE.leadCommunity?.name).toBe(
      "Rainbow Arts Collective",
    );
  });
});

describe("detailToGathering guest communities", () => {
  const detail = {
    slug: "supper",
    title: "Supper",
    startAt: "2026-11-01T19:00:00",
    description: "",
  } as EventDetailDTO;

  it("carries the accepted guests onto the view model with a null avatar when absent", () => {
    const guest = {
      id: "row-1",
      slug: "trans-hub",
      name: "Trans & Non-Binary Hub",
      accessTier: "public" as const,
      viewerManages: false,
    };
    expect(
      detailToGathering({ ...detail, guestCommunities: [guest] }, t)
        .guestCommunities,
    ).toEqual([{ ...guest, avatarImageUrl: null }]);
  });

  it("reads an older server with no field as no guests", () => {
    expect(detailToGathering(detail, t).guestCommunities).toEqual([]);
  });
});
