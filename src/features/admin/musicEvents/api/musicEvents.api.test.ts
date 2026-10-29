import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

const mocks: {
  apiGet: Mock<(path: string) => Promise<unknown>>;
  apiPost: Mock<(path: string, body?: unknown) => Promise<unknown>>;
} = vi.hoisted(() => ({
  apiGet: vi.fn<(path: string) => Promise<unknown>>(() =>
    Promise.resolve(undefined),
  ),
  apiPost: vi.fn<(path: string, body?: unknown) => Promise<unknown>>(() =>
    Promise.resolve(undefined),
  ),
}));

vi.mock("../../../../shared/api/client", () => ({
  apiGet: (path: string) => mocks.apiGet(path),
  apiPost: (path: string, body?: unknown) => mocks.apiPost(path, body),
}));

import {
  addMusicEventCohost,
  getMusicEvents,
  searchStudioArtists,
} from "./musicEvents.api";

beforeEach(() => vi.clearAllMocks());

describe("musicEvents.api", () => {
  it("asks for one bucket page", async () => {
    await getMusicEvents("past", 2);
    expect(mocks.apiGet).toHaveBeenCalledWith(
      "/admin/music-events?bucket=past&page=2",
    );
  });

  it("searches Studio artists by q and page", async () => {
    await searchStudioArtists("DJ Maré", 3);
    expect(mocks.apiGet).toHaveBeenCalledTimes(1);
    const requestedPath = mocks.apiGet.mock.calls[0]?.[0] ?? "";
    const [pathname, queryString] = requestedPath.split("?");
    expect(pathname).toBe("/admin/music-events/studio-artists/search");
    const params = new URLSearchParams(queryString);
    expect(params.get("q")).toBe("DJ Maré");
    expect(params.get("page")).toBe("3");
  });

  it("adds a cohost by profile address", async () => {
    await addMusicEventCohost("queerpulse-club-night", "ana");
    expect(mocks.apiPost).toHaveBeenCalledWith(
      "/admin/music-events/queerpulse-club-night/cohosts",
      { slug: "ana" },
    );
  });
});
