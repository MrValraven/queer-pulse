import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ApiError } from "../../../shared/api/client";
import { getPlace, type DirectoryPlace } from "../directoryPlaces";
import { galleryShotsOf } from "../directoryGalleryShots";
import {
  applyDemoPhotoFraming,
  resetDemoPhotoFraming,
} from "../listingPhotoFramingDemoOverlay";
import type { UpdateListingPhotoFramingDto } from "./directory.api";
import { DIRECTORY_KEY } from "./directoryQueryKey";
import * as api from "./listingPhotoFraming.api";
import { useSaveListingPhotoFraming } from "./useSaveListingPhotoFraming";

const demoFlag = vi.hoisted(() => ({ isDemo: false }));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: demoFlag.isDemo }),
}));

const framing = { focusX: 0.2, focusY: 0.7, zoom: 1.5 };
const slug = "a-farinha";
const ref = "QPL-2026-0007";
const detailKey = [DIRECTORY_KEY, "detail", slug, false, "en", null];

const seedPlace: DirectoryPlace = {
  ...getPlace(slug)!,
  galleryPhotos: [
    { url: "u1", alt: "One" },
    { url: "u2", alt: "Two" },
  ],
};
const body: UpdateListingPhotoFramingDto = {
  photos: [{ image: "u1", framing }],
};

describe("useSaveListingPhotoFraming", () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const renderSave = (asAdmin = false, listingRef: string | null = ref) =>
    renderHook(
      () => useSaveListingPhotoFraming({ ref: listingRef, slug, asAdmin }),
      { wrapper },
    );
  const cachedPlace = () => queryClient.getQueryData<DirectoryPlace>(detailKey);

  beforeEach(() => {
    vi.restoreAllMocks();
    demoFlag.isDemo = false;
    resetDemoPhotoFraming();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(detailKey, seedPlace);
  });

  it("patches the detail cache before the request resolves", async () => {
    vi.spyOn(api, "updateListingPhotoFraming").mockReturnValue(
      new Promise(() => {}),
    );
    const { result } = renderSave();
    act(() => result.current.mutate(body));
    await waitFor(() =>
      expect(cachedPlace()!.galleryPhotos![0]!.framing).toEqual(framing),
    );
    expect(result.current.isPending).toBe(true);
  });

  it("writes the server gallery into the cache on success", async () => {
    vi.spyOn(api, "updateListingPhotoFraming").mockResolvedValue({
      photoGallery: [
        { image: "u1", alt: "One", caption: "", framing },
        { image: "u2", alt: "Two", caption: "" },
        { image: "u3", alt: "Three", caption: "" },
      ],
    });
    const { result } = renderSave();
    await act(() => result.current.mutateAsync(body));
    expect(cachedPlace()!.galleryPhotos).toEqual([
      { url: "u1", alt: "One", framing },
      { url: "u2", alt: "Two" },
      { url: "u3", alt: "Three" },
    ]);
  });

  it("keeps the detail query valid after a live save", async () => {
    vi.spyOn(api, "updateListingPhotoFraming").mockResolvedValue({
      photoGallery: [{ image: "u1", alt: "One", caption: "", framing }],
    });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderSave();
    await act(() => result.current.mutateAsync(body));
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("restores the cached place when the save fails", async () => {
    vi.spyOn(api, "updateListingPhotoFraming").mockRejectedValue(
      new ApiError(403, "x", { message: "x", code: "LISTING_NOT_MANAGER" }),
    );
    const { result } = renderSave();
    await act(async () => {
      await result.current.mutateAsync(body).catch(() => undefined);
    });
    expect(cachedPlace()).toEqual(seedPlace);
  });

  it("calls the admin route when asAdmin is true", async () => {
    const memberSave = vi.spyOn(api, "updateListingPhotoFraming");
    const adminSave = vi
      .spyOn(api, "updateAdminListingPhotoFraming")
      .mockResolvedValue({ photoGallery: [] });
    const { result } = renderSave(true);
    await act(() => result.current.mutateAsync(body));
    expect(adminSave).toHaveBeenCalledWith(ref, body);
    expect(memberSave).not.toHaveBeenCalled();
  });

  it("rejects with an error naming the missing ref outside demo mode", async () => {
    const memberSave = vi.spyOn(api, "updateListingPhotoFraming");
    const { result } = renderSave(false, null);
    await act(async () => {
      await result.current.mutateAsync(body).catch(() => undefined);
    });
    expect(result.current.error?.message).toContain("no ref");
    expect(memberSave).not.toHaveBeenCalled();
  });

  it("records the demo overlay and skips the network in demo mode", async () => {
    demoFlag.isDemo = true;
    const memberSave = vi.spyOn(api, "updateListingPhotoFraming");
    const adminSave = vi.spyOn(api, "updateAdminListingPhotoFraming");
    const fixture = getPlace(slug)!;
    const image = fixture.photos!.wide!;
    const { result } = renderSave(false, null);
    await act(() =>
      result.current.mutateAsync({ photos: [{ image, framing }] }),
    );
    expect(memberSave).not.toHaveBeenCalled();
    expect(adminSave).not.toHaveBeenCalled();
    expect(galleryShotsOf(applyDemoPhotoFraming(fixture))[0]!.framing).toEqual(
      framing,
    );
  });
});
