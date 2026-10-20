import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMessageLinkCard } from "./useMessageLinkCard";

const useLinkPreview = vi.fn((url: string | null) => {
  void url;
  return { data: undefined, isLoading: false };
});
vi.mock("./useLinkPreview", () => ({
  useLinkPreview: (url: string | null) => useLinkPreview(url),
  hasPreviewContent: () => false,
}));
vi.mock("../../marketing/api/useDirectory", () => ({
  useDirectoryPlace: () => ({ place: undefined, isLoading: false }),
}));

const TRACK_URL =
  "https://queerpulse.com/studio/track?id=3f2b8c1e-4d5a-4b6c-8e9f-0a1b2c3d4e5f";

beforeEach(() => useLinkPreview.mockClear());

describe("useMessageLinkCard", () => {
  it("resolves a Studio link to a card target with no unfurl", () => {
    const { result } = renderHook(() => useMessageLinkCard(TRACK_URL));
    expect(result.current.studioTarget).toEqual({
      kind: "track",
      id: "3f2b8c1e-4d5a-4b6c-8e9f-0a1b2c3d4e5f",
      startAtSeconds: null,
    });
    expect(result.current.hasContent).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(useLinkPreview).not.toHaveBeenCalledWith(TRACK_URL);
  });

  it("never unfurls an artist link or a preview link", () => {
    for (const url of [
      "https://queerpulse.com/studio/artist?id=p1",
      `https://queerpulse.com/studio/preview/${"a".repeat(64)}`,
    ]) {
      const { result } = renderHook(() => useMessageLinkCard(url));
      expect(result.current.studioTarget).toBeNull();
      expect(result.current.hasContent).toBe(false);
      expect(useLinkPreview).not.toHaveBeenCalledWith(url);
    }
  });

  it("still unfurls another site", () => {
    renderHook(() => useMessageLinkCard("https://example.com/post"));
    expect(useLinkPreview).toHaveBeenCalledWith("https://example.com/post");
  });
});
