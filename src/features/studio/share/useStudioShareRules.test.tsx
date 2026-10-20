import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { useStudioShareRules } from "./useStudioShareRules";

const reads = vi.hoisted(() => ({
  track: vi.fn(),
  release: vi.fn(),
  playlist: vi.fn(),
}));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("../api/useStudioAccess", () => ({
  useStudioAccess: () => ({
    hasAccess: true,
    isPending: false,
    uploadablePersonas: [],
  }),
}));
vi.mock("../api/studioTrackQuery", () => ({
  studioTrackQueryOptions: (demoMode: boolean, id: string) => ({
    queryKey: ["studio", "track", demoMode, id],
    queryFn: reads.track,
  }),
}));
vi.mock("../api/useStudioRelease", () => ({
  studioReleaseQueryOptions: (demoMode: boolean, id: string) => ({
    queryKey: ["studio", "release", demoMode, id],
    queryFn: reads.release,
  }),
}));
vi.mock("../api/useStudioPlaylist", () => ({
  studioPlaylistQueryOptions: (demoMode: boolean, id: string) => ({
    queryKey: ["studio", "playlist", demoMode, id],
    queryFn: reads.playlist,
  }),
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useStudioShareRules", () => {
  it("answers the open rules for a share that is not a Studio link and reads nothing", () => {
    const { result } = renderHook(() => useStudioShareRules(null), { wrapper });
    expect(result.current).toEqual({
      canSendToOthers: true,
      ownPersonaName: null,
    });
    expect(reads.track).not.toHaveBeenCalled();
    expect(reads.release).not.toHaveBeenCalled();
    expect(reads.playlist).not.toHaveBeenCalled();
  });

  it("reads only the target's own kind", () => {
    reads.release.mockReturnValue(new Promise(() => {}));
    renderHook(
      () =>
        useStudioShareRules({
          kind: "release",
          id: "r1",
          startAtSeconds: null,
        }),
      { wrapper },
    );
    expect(reads.release).toHaveBeenCalled();
    expect(reads.track).not.toHaveBeenCalled();
    expect(reads.playlist).not.toHaveBeenCalled();
  });
});
