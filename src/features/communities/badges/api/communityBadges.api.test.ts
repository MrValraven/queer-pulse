import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getCommunityBadges,
  getCommunityMemberGifts,
  getMyCommunityGifts,
  putCommunityFlair,
  updateCommunityBadge,
  updateCommunityGift,
} from "./communityBadges.api";

const clientMock = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock("../../../../shared/api/client", () => clientMock);

describe("communityBadges.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads the badge list from the community's badges route", () => {
    void getCommunityBadges("club");
    expect(clientMock.apiGet).toHaveBeenCalledWith("/communities/club/badges");
  });

  it("sends only the changed fields on a badge edit", () => {
    void updateCommunityBadge("club", "b1", { threshold: 4 });
    expect(clientMock.apiPatch).toHaveBeenCalledWith(
      "/communities/club/badges/b1",
      { threshold: 4 },
    );
  });

  it("stops wearing with a null badge id", () => {
    void putCommunityFlair("club", null);
    expect(clientMock.apiPut).toHaveBeenCalledWith("/communities/club/flair", {
      badgeId: null,
    });
  });

  it("asks for a shelf page by number", () => {
    void getMyCommunityGifts("club", 2);
    expect(clientMock.apiGet).toHaveBeenCalledWith(
      "/communities/club/gifts/mine?page=2",
    );
  });

  it("reads a member's visible gifts by member slug", () => {
    void getCommunityMemberGifts("club", "sofia");
    expect(clientMock.apiGet).toHaveBeenCalledWith(
      "/communities/club/members/sofia/gifts",
    );
  });

  it("hides a gift with a PATCH of isHidden", () => {
    void updateCommunityGift("club", "g1", true);
    expect(clientMock.apiPatch).toHaveBeenCalledWith(
      "/communities/club/gifts/g1",
      { isHidden: true },
    );
  });
});
