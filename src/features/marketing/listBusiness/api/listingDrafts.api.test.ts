import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ListingDraftPayload } from "./listingDrafts.api";
import { saveListingDraftKeepalive } from "./listingDrafts.api";

interface ClientMocks {
  apiPost: ReturnType<typeof vi.fn>;
}

const mocks = vi.hoisted<ClientMocks>(() => ({
  apiPost: vi.fn(),
}));

vi.mock("../../../../shared/api/client", () => ({
  apiPost: mocks.apiPost,
  apiGet: vi.fn(),
  apiDelete: vi.fn(),
}));

const PAYLOAD = { step: 1 } as unknown as ListingDraftPayload;

describe("saveListingDraftKeepalive", () => {
  beforeEach(() => {
    mocks.apiPost.mockReset();
  });

  it("sends an update once more as a plain request when keepalive throws", async () => {
    mocks.apiPost
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce({ id: "draft-1" });

    await expect(
      saveListingDraftKeepalive(PAYLOAD, "draft-1"),
    ).resolves.toEqual({ id: "draft-1" });
    expect(mocks.apiPost).toHaveBeenCalledTimes(2);
  });

  it("sends a first create once so it cannot mint a second draft", async () => {
    mocks.apiPost.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(saveListingDraftKeepalive(PAYLOAD)).rejects.toBeInstanceOf(
      TypeError,
    );
    expect(mocks.apiPost).toHaveBeenCalledTimes(1);
  });
});
