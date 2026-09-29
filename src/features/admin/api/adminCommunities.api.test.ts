import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../shared/api/client", () => ({
  apiGet: vi.fn(() => Promise.resolve(undefined)),
  apiPost: vi.fn(() => Promise.resolve(undefined)),
  apiPatch: vi.fn(() => Promise.resolve(undefined)),
  apiDelete: vi.fn(() => Promise.resolve(undefined)),
}));

import { apiDelete } from "../../../shared/api/client";
import { removeAdminCommunityMember } from "./adminCommunities.api";

const COMMUNITY_SLUG = "night-market";
const MEMBER_SLUG = "rui-marcal";

beforeEach(() => vi.clearAllMocks());

describe("adminCommunities.api", () => {
  it("removeAdminCommunityMember sends no query by default", async () => {
    await removeAdminCommunityMember(COMMUNITY_SLUG, MEMBER_SLUG);
    expect(apiDelete).toHaveBeenCalledWith(
      `/admin/communities/${COMMUNITY_SLUG}/members/${MEMBER_SLUG}`,
    );
  });

  it("removeAdminCommunityMember asks for the bar with barReturn=true", async () => {
    await removeAdminCommunityMember(COMMUNITY_SLUG, MEMBER_SLUG, true);
    expect(apiDelete).toHaveBeenCalledWith(
      `/admin/communities/${COMMUNITY_SLUG}/members/${MEMBER_SLUG}?barReturn=true`,
    );
  });
});
