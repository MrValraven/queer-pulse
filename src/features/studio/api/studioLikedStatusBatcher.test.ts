import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readStudioLikedStatus } from "./studioLikedStatusBatcher";

const getStudioLikedStatus = vi.fn();
vi.mock("./studioLiked.api", () => ({
  getStudioLikedStatus: (trackIds: string[]) => getStudioLikedStatus(trackIds),
}));

describe("readStudioLikedStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getStudioLikedStatus.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("sends every heart asked within the window as one request", async () => {
    getStudioLikedStatus.mockResolvedValue({ likedTrackIds: ["a"] });
    const likedA = readStudioLikedStatus("a");
    const likedB = readStudioLikedStatus("b");
    await vi.advanceTimersByTimeAsync(40);
    expect(getStudioLikedStatus).toHaveBeenCalledTimes(1);
    expect(getStudioLikedStatus).toHaveBeenCalledWith(["a", "b"]);
    await expect(likedA).resolves.toBe(true);
    await expect(likedB).resolves.toBe(false);
  });

  it("rejects every waiter when the read fails", async () => {
    getStudioLikedStatus.mockRejectedValue(new Error("studio_liked_failed"));
    const liked = readStudioLikedStatus("c");
    const outcome = expect(liked).rejects.toThrow("studio_liked_failed");
    await vi.advanceTimersByTimeAsync(40);
    await outcome;
  });
});
