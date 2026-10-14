import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { demoStudioPreview } from "./studioDemoApi";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";
import {
  DEMO_PREVIEW_TOKEN,
  DEMO_PUBLISHED_PREVIEW_TOKEN,
} from "./studioDemoArtistTools";
import { studioKeys } from "./studioQueryKeys";
import { useStudioPreview } from "./useStudioPreview";
import { useSaveStudioPressKit, useStudioPressKit } from "./useStudioPressKit";

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));
vi.mock("./studioDemoApi", async (importOriginal) => {
  const original = await importOriginal<typeof import("./studioDemoApi")>();
  return { ...original, demoStudioPreview: vi.fn(original.demoStudioPreview) };
});
vi.mock("./useStudioAccess", () => ({
  useStudioAccess: () => ({ hasAccess: true, uploadablePersonas: [] }),
}));

function wrapperWith(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
const freshClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe("useStudioPreview", () => {
  it("reads the draft behind a valid token", async () => {
    const { result } = renderHook(() => useStudioPreview(DEMO_PREVIEW_TOKEN), {
      wrapper: wrapperWith(freshClient()),
    });
    await waitFor(() => expect(result.current.preview).not.toBeNull());
    expect(result.current.preview?.release?.isPreview).toBe(true);
    expect(result.current.preview?.release?.title).toBe("Cartas ao mar");
  });

  it("hands back the published id for a release that went live", async () => {
    const { result } = renderHook(
      () => useStudioPreview(DEMO_PUBLISHED_PREVIEW_TOKEN),
      { wrapper: wrapperWith(freshClient()) },
    );
    await waitFor(() =>
      expect(result.current.preview?.publishedReleaseId).toBe(
        "demo-release-cidade-dos-santos",
      ),
    );
  });

  it("reads a malformed token as not found without asking", () => {
    vi.mocked(demoStudioPreview).mockClear();
    const queryClient = freshClient();
    const { result } = renderHook(() => useStudioPreview("../../etc"), {
      wrapper: wrapperWith(queryClient),
    });
    expect(result.current.loadState.isNotFound).toBe(true);
    const previewQueries = queryClient
      .getQueryCache()
      .findAll({ queryKey: ["studio", "studioPreview"] });
    expect(previewQueries).toHaveLength(1);
    const [onlyQuery] = previewQueries;
    expect(onlyQuery?.state.fetchStatus).toBe("idle");
    expect(onlyQuery?.state.dataUpdatedAt).toBe(0);
    expect(demoStudioPreview).not.toHaveBeenCalled();
  });

  it("reads an unknown token as not found", async () => {
    const { result } = renderHook(() => useStudioPreview("0".repeat(64)), {
      wrapper: wrapperWith(freshClient()),
    });
    await waitFor(() => expect(result.current.loadState.isNotFound).toBe(true));
  });
});

describe("useStudioPressKit", () => {
  it("reads Mariana's press kit and saves a change into the cache", async () => {
    const queryClient = freshClient();
    const wrapper = wrapperWith(queryClient);
    const read = renderHook(() => useStudioPressKit(DEMO_ARTIST_MARIANA.id), {
      wrapper,
    });
    await waitFor(() => expect(read.result.current.pressKit).not.toBeNull());
    expect(read.result.current.pressKit?.isOwner).toBe(true);
    const save = renderHook(() => useSaveStudioPressKit(), { wrapper });
    await act(() =>
      save.result.current.mutateAsync({
        subprofileId: DEMO_ARTIST_MARIANA.id,
        body: {
          pitch: "New pitch",
          pressBio: null,
          featuredTrackIds: [],
          quotes: [],
          contact: null,
        },
      }),
    );
    expect(
      queryClient.getQueryData<{ pitch: string | null }>(
        studioKeys.studioPressKit(true, DEMO_ARTIST_MARIANA.id),
      )?.pitch,
    ).toBe("New pitch");
  });
});
