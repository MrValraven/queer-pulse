import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  endFundingAsk,
  getThreads,
  lookupFundingLink,
  updateThreadFunding,
} from "./forum.api";

const { apiGetMock, apiGetNullableMock, apiPatchMock, apiPostMock } =
  vi.hoisted(() => ({
    apiGetMock: vi.fn(),
    apiGetNullableMock: vi.fn(),
    apiPatchMock: vi.fn(),
    apiPostMock: vi.fn(),
  }));

vi.mock("../../../shared/api/client", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  apiGet: apiGetMock,
  apiGetNullable: apiGetNullableMock,
  apiPatch: apiPatchMock,
  apiPost: apiPostMock,
}));

describe("forum.api funding calls", () => {
  beforeEach(() => {
    apiGetMock.mockReset().mockResolvedValue([]);
    apiGetNullableMock.mockReset().mockResolvedValue(null);
    apiPatchMock.mockReset().mockResolvedValue({});
    apiPostMock.mockReset().mockResolvedValue({});
  });

  it("sends the funding view, every eligibility value and the scope", async () => {
    await getThreads("funding", undefined, {
      fundingView: "open",
      eligibility: ["students", "collectives"],
      scope: "eu",
    });
    expect(apiGetMock).toHaveBeenCalledWith(
      "/forum/threads?category=funding&fundingView=open&eligibility=students&eligibility=collectives&scope=eu",
    );
  });

  it("keeps the funding view off every other category", async () => {
    await getThreads("housing", undefined, { fundingView: "open" });
    expect(apiGetMock).toHaveBeenCalledWith("/forum/threads?category=housing");
  });

  it("encodes the link for the duplicate lookup and reads a 204 as null", async () => {
    await expect(
      lookupFundingLink("https://example.org/a b?x=1"),
    ).resolves.toBeNull();
    expect(apiGetNullableMock.mock.calls[0]?.[0]).toBe(
      `/forum/funding/lookup?link=${encodeURIComponent("https://example.org/a b?x=1")}`,
    );
  });

  it("patches the whole funding object and posts the end reason", async () => {
    await updateThreadFunding("call-1", { linkUrl: "https://example.org/x" });
    expect(apiPatchMock).toHaveBeenCalledWith("/forum/threads/call-1", {
      funding: { linkUrl: "https://example.org/x" },
    });
    await endFundingAsk("ask-1", "goal_reached");
    expect(apiPostMock).toHaveBeenCalledWith(
      "/forum/threads/ask-1/funding/end",
      {
        reason: "goal_reached",
      },
    );
  });
});
