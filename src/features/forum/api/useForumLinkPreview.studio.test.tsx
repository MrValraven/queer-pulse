import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LinkPreviewResponse } from "../../../shared/contracts/contracts";
import { useForumLinkPreview } from "./useForumLinkPreview";

const apiGet = vi.fn<(path: string) => Promise<unknown>>();
const getLinkPreview = vi.fn<(url: string) => Promise<LinkPreviewResponse>>();
vi.mock("../../../shared/api/client", () => ({
  apiGet: (path: string) => apiGet(path),
}));
vi.mock("../../messages/api/link-preview.api", () => ({
  getLinkPreview: (url: string) => getLinkPreview(url),
}));
vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));

const STUDIO_URL =
  "https://queerpulse.com/studio/album?id=3f0c2a52-8d1e-4c6b-9a57-2b7f1e9d4c10";
const STUDIO_PREVIEW_URL =
  "https://queerpulse.com/studio/preview/secret-token-123";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  vi.useFakeTimers();
  apiGet.mockReset();
  getLinkPreview.mockReset();
  getLinkPreview.mockResolvedValue({
    url: "https://example.org/gigs",
    siteName: "Example",
    title: "Gigs",
    description: null,
    imageUrl: null,
  });
});

afterEach(() => vi.useRealTimers());

describe("useForumLinkPreview and Studio links", () => {
  it("never sends a Studio URL to /link-preview", async () => {
    const { result } = renderHook(() => useForumLinkPreview(STUDIO_URL), {
      wrapper,
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(getLinkPreview).not.toHaveBeenCalled();
    expect(apiGet).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("never sends a Studio preview link to /link-preview", async () => {
    const { result } = renderHook(
      () => useForumLinkPreview(STUDIO_PREVIEW_URL),
      { wrapper },
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(getLinkPreview).not.toHaveBeenCalled();
    expect(apiGet).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("still unfurls an external URL", async () => {
    renderHook(() => useForumLinkPreview("https://example.org/gigs"), {
      wrapper,
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(getLinkPreview).toHaveBeenCalledWith("https://example.org/gigs");
  });
});
