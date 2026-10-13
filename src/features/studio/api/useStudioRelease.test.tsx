import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { studioKeys } from "./studioQueryKeys";
import { useStudioRelease } from "./useStudioRelease";

const getStudioRelease = vi.fn();

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("./useStudioAccess", () => ({
  useStudioAccess: () => ({ hasAccess: true }),
}));
vi.mock("./studio.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./studio.api")>()),
  getStudioRelease: (releaseId: string) =>
    getStudioRelease(releaseId) as unknown,
}));

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const meKey = studioKeys.me(false, "user-1");
  queryClient.setQueryData(meKey, { hasAccess: true, uploadablePersonas: [] });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, meKey, wrapper };
}

describe("useStudioRelease", () => {
  it("re-reads GET /studio/me when the grant was withdrawn", async () => {
    getStudioRelease.mockRejectedValueOnce(
      new ApiError(403, "refused", {
        statusCode: 403,
        code: "studio_access_required",
      }),
    );
    const { queryClient, meKey, wrapper } = setup();
    const { result } = renderHook(() => useStudioRelease("r1"), { wrapper });
    await waitFor(() => expect(result.current.loadState.isError).toBe(true));
    expect(queryClient.getQueryState(meKey)?.isInvalidated).toBe(true);
  });

  it("leaves the access query alone on any other failure", async () => {
    getStudioRelease.mockRejectedValueOnce(
      new ApiError(404, "Not found", { statusCode: 404 }),
    );
    const { queryClient, meKey, wrapper } = setup();
    const { result } = renderHook(() => useStudioRelease("r1"), { wrapper });
    await waitFor(() => expect(result.current.loadState.isNotFound).toBe(true));
    expect(queryClient.getQueryState(meKey)?.isInvalidated).toBe(false);
  });
});
