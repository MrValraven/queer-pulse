import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { demoStudioListeningSupporting } from "./studioDemoYourListening";
import {
  toSupportingViews,
  type StudioSupportingView,
} from "./studioListening.adapters";
import { studioKeys } from "./studioQueryKeys";
import { useRemoveStudioSupporter } from "./useStudioSupporter";

const mocks: { deletedIds: string[] } = vi.hoisted(() => ({
  deletedIds: [],
}));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("./studioListening.api", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./studioListening.api")>();
  return {
    ...original,
    deleteStudioSupporter: (subprofileId: string) => {
      mocks.deletedIds.push(subprofileId);
      return Promise.resolve();
    },
  };
});

const supportingKey = studioKeys.listeningSupporting(false);

describe("useRemoveStudioSupporter cache", () => {
  let queryClient = new QueryClient();
  let wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  beforeEach(() => {
    mocks.deletedIds = [];
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    // The refresh after a removal is not under test: keep the cache as set.
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  });

  it("removes the artist from the cached Artists you support list", async () => {
    const rows = toSupportingViews(demoStudioListeningSupporting());
    const [removedRow, ...keptRows] = rows;
    expect(removedRow).toBeDefined();
    queryClient.setQueryData<StudioSupportingView[]>(supportingKey, rows);
    const { result } = renderHook(
      () => useRemoveStudioSupporter(removedRow!.artist.id),
      { wrapper },
    );
    await act(async () => {
      await result.current.remove();
    });
    expect(mocks.deletedIds).toEqual([removedRow!.artist.id]);
    expect(
      queryClient.getQueryData<StudioSupportingView[]>(supportingKey),
    ).toEqual(keptRows);
  });

  it("invents no rows when the list was never cached", async () => {
    const { result } = renderHook(() => useRemoveStudioSupporter("artist-1"), {
      wrapper,
    });
    await act(async () => {
      await result.current.remove();
    });
    expect(queryClient.getQueryData(supportingKey)).toBeUndefined();
  });
});
