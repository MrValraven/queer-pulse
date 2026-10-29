import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { studioErrorCodeOf } from "../../studio/api/studio.api";
import { DEMO_ARTIST_LATE_BLOOMERS } from "../../studio/api/studioDemoMe.data";
import {
  DEMO_LANDING_FOREIGN_IMAGE_KEY,
  demoAdminStudioLanding,
  demoRemoveCard,
  resetDemoAdminStudioLanding,
} from "../StudioAdminLanding.data";
import {
  ineligibleLabelKeyOf,
  ineligibleReasonOfError,
  landingPhotoErrorKeyOf,
} from "../studioAdmin.model";
import type {
  AdminStudioLandingArtistCardDTO,
  AdminStudioLandingDTO,
  AdminStudioLandingSettingsDTO,
} from "./studioLandingAdmin.api";
import {
  useCreateLandingCard,
  usePutLandingPhoto,
  useRemoveLandingPreview,
  useReorderLandingPreviews,
  useRequestLandingPreview,
  useSetFoundingShelf,
  useUpdateLandingCard,
} from "./useStudioAdminLandingMutations";
import {
  adminStudioLandingKey,
  useAdminStudioLanding,
} from "./useStudioAdminLanding";

const demoHolder: { demoMode: boolean } = vi.hoisted(() => ({
  demoMode: true,
}));
const getLanding = vi.hoisted(() => vi.fn<() => Promise<unknown>>());
const reorderPreviews = vi.hoisted(() =>
  vi.fn<(body: { previewIds: string[] }) => Promise<unknown>>(),
);
const updateCard = vi.hoisted(() =>
  vi.fn<(cardId: string, body: unknown) => Promise<unknown>>(),
);
const removePreview = vi.hoisted(() =>
  vi.fn<(previewId: string) => Promise<unknown>>(),
);
const setSettings = vi.hoisted(() =>
  vi.fn<(body: unknown) => Promise<unknown>>(),
);

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: demoHolder.demoMode }),
}));
vi.mock("./studioLandingAdmin.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./studioLandingAdmin.api")>()),
  getAdminStudioLanding: () => getLanding(),
  reorderAdminStudioLandingPreviews: (body: { previewIds: string[] }) =>
    reorderPreviews(body),
  updateAdminStudioLandingCard: (cardId: string, body: unknown) =>
    updateCard(cardId, body),
  removeAdminStudioLandingPreview: (previewId: string) =>
    removePreview(previewId),
  setAdminStudioLandingSettings: (body: unknown) => setSettings(body),
}));

function setup(landing: AdminStudioLandingDTO) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData(adminStudioLandingKey(demoHolder.demoMode), landing);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

function cachedLanding(queryClient: QueryClient) {
  return queryClient.getQueryData<AdminStudioLandingDTO>(
    adminStudioLandingKey(demoHolder.demoMode),
  );
}

beforeEach(() => {
  demoHolder.demoMode = true;
  resetDemoAdminStudioLanding();
  getLanding.mockReset();
  reorderPreviews.mockReset();
  updateCard.mockReset();
  setSettings.mockReset();
  removePreview.mockReset();
});

describe("the Studio page content read", () => {
  it("reads the demo store in demo and never calls the api", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useAdminStudioLanding(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    const landing = result.current.data;
    const statuses = (landing?.previews ?? []).map((row) => row.status);
    expect(statuses.filter((status) => status === "pending")).toHaveLength(2);
    expect(statuses.filter((status) => status === "approved")).toHaveLength(3);
    expect(statuses.filter((status) => status === "declined")).toHaveLength(1);
    expect(
      landing?.previews.some(
        (row) =>
          row.status === "approved" &&
          row.ineligibleReason === "content_warnings",
      ),
    ).toBe(true);
    expect(landing?.artistCards).toHaveLength(6);
    expect(landing?.photos.hero).not.toBeNull();
    expect(landing?.photos.manifesto).not.toBeNull();
    expect(landing?.foundingArtists).toHaveLength(3);
    expect(landing?.settings.isFoundingShelfVisible).toBe(true);
    expect(getLanding).not.toHaveBeenCalled();
  });

  it("reads the api in live", async () => {
    demoHolder.demoMode = false;
    const live: AdminStudioLandingDTO = {
      ...demoAdminStudioLanding(),
      settings: { isFoundingShelfVisible: false },
    };
    getLanding.mockResolvedValue(live);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useAdminStudioLanding(), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(live));
    expect(getLanding).toHaveBeenCalledTimes(1);
  });
});

describe("the demo store refusals", () => {
  it("refuses a card without consent and leaves the cache untouched", async () => {
    const before = demoAdminStudioLanding();
    const { queryClient, wrapper } = setup(before);
    const { result } = renderHook(() => useCreateLandingCard(), { wrapper });
    const error = await act(() =>
      result.current
        .mutateAsync({
          subprofileId: DEMO_ARTIST_LATE_BLOOMERS.id,
          quote: "a line",
          hasConsent: false,
        })
        .catch((caught: unknown) => caught),
    );
    expect(studioErrorCodeOf(error)).toBe("studio_landing_consent_required");
    expect(cachedLanding(queryClient)).toBe(before);
  });

  it("adds a card once consent is given and refuses a second card for the same artist", async () => {
    // The demo page holds all 6 cards; one is taken off so a new card fits.
    demoRemoveCard("demo-landing-card-demo-persona-rita-ferreira");
    const { queryClient, wrapper } = setup(demoAdminStudioLanding());
    const { result } = renderHook(() => useCreateLandingCard(), { wrapper });
    const body = {
      subprofileId: DEMO_ARTIST_LATE_BLOOMERS.id,
      quote: "  ",
      hasConsent: true,
    };
    await act(() => result.current.mutateAsync(body));
    const cards = cachedLanding(queryClient)?.artistCards ?? [];
    expect(cards).toHaveLength(6);
    expect(cards[5]).toMatchObject({ quote: null, position: 6 });
    const error = await act(() =>
      result.current.mutateAsync(body).catch((caught: unknown) => caught),
    );
    expect(studioErrorCodeOf(error)).toBe("studio_landing_card_exists");
  });

  it("refuses a track that cannot play with the 422 and its reason", async () => {
    const { wrapper } = setup(demoAdminStudioLanding());
    const { result } = renderHook(() => useRequestLandingPreview(), {
      wrapper,
    });
    // Track 3 of the demo album carries a content warning.
    const error = await act(() =>
      result.current
        .mutateAsync({ trackId: "demo-track-cidade-dos-santos-03" })
        .catch((caught: unknown) => caught),
    );
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(422);
    expect(studioErrorCodeOf(error)).toBe(
      "studio_landing_preview_track_not_eligible",
    );
    expect(ineligibleReasonOfError(error)).toBe("content_warnings");
  });

  it("refuses a photo naming an upload the demo did not issue with the codeless 403", async () => {
    const { wrapper } = setup(demoAdminStudioLanding());
    const { result } = renderHook(() => usePutLandingPhoto(), { wrapper });
    const error = await act(() =>
      result.current
        .mutateAsync({
          slot: "manifesto",
          imageKey: DEMO_LANDING_FOREIGN_IMAGE_KEY,
          altTextEn: "A sample",
          altTextPt: "Um exemplo",
          credit: "",
          hasConsent: true,
        })
        .catch((caught: unknown) => caught),
    );
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(403);
    expect(studioErrorCodeOf(error)).toBeNull();
    expect(landingPhotoErrorKeyOf(error)).toBe(
      "studio:errors.reason.studio_landing_photo_not_yours",
    );
  });
});

describe("live writes", () => {
  beforeEach(() => {
    demoHolder.demoMode = false;
  });

  it("rolls a preview reorder back on a 409 studio_landing_order_mismatch", async () => {
    const before = demoAdminStudioLanding();
    const { queryClient, wrapper } = setup(before);
    reorderPreviews.mockRejectedValue(
      new ApiError(409, "Conflict", {
        statusCode: 409,
        code: "studio_landing_order_mismatch",
        message: "Conflict",
      }),
    );
    const openIds = before.previews
      .filter((row) => row.status === "pending" || row.status === "approved")
      .map((row) => row.id);
    const reversed = [...openIds].reverse();
    const { result } = renderHook(() => useReorderLandingPreviews(), {
      wrapper,
    });
    const error = await act(() =>
      result.current
        .mutateAsync({ previewIds: reversed })
        .catch((caught: unknown) => caught),
    );
    expect(studioErrorCodeOf(error)).toBe("studio_landing_order_mismatch");
    expect(reorderPreviews).toHaveBeenCalledWith({ previewIds: reversed });
    expect(cachedLanding(queryClient)?.previews).toEqual(before.previews);
  });

  it("invalidates the members' landing read after a card save", async () => {
    const before = demoAdminStudioLanding();
    const { queryClient, wrapper } = setup(before);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const card = before.artistCards[0];
    if (!card) throw new Error("the demo has artist cards");
    const saved: AdminStudioLandingArtistCardDTO = {
      ...card,
      quote: "a new line",
    };
    updateCard.mockResolvedValue(saved);
    const { result } = renderHook(() => useUpdateLandingCard(), { wrapper });
    await act(() =>
      result.current.mutateAsync({
        cardId: card.id,
        quote: "a new line",
        hasConsent: true,
      }),
    );
    expect(updateCard).toHaveBeenCalledWith(card.id, {
      quote: "a new line",
      hasConsent: true,
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["studio", "landing", false],
    });
    expect(cachedLanding(queryClient)?.artistCards[0]?.quote).toBe(
      "a new line",
    );
  });

  it("reads the staff content again after a preview is removed", async () => {
    const before = demoAdminStudioLanding();
    const { queryClient, wrapper } = setup(before);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const row = before.previews.find((preview) => preview.isOnLanding);
    if (!row) throw new Error("the demo has a row on the page");
    removePreview.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRemoveLandingPreview(), {
      wrapper,
    });
    await act(() => result.current.mutateAsync({ previewId: row.id }));
    expect(removePreview).toHaveBeenCalledWith(row.id);
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: adminStudioLandingKey(false),
    });
  });

  it("invalidates the founding read after the shelf switch", async () => {
    const { queryClient, wrapper } = setup(demoAdminStudioLanding());
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const settings: AdminStudioLandingSettingsDTO = {
      isFoundingShelfVisible: false,
    };
    setSettings.mockResolvedValue(settings);
    const { result } = renderHook(() => useSetFoundingShelf(), { wrapper });
    await act(() => result.current.mutateAsync(settings));
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["studio", "foundingArtists", false],
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["studio", "landing", false],
    });
    expect(cachedLanding(queryClient)?.settings).toEqual(settings);
  });
});

describe("error helpers", () => {
  it("reads an unknown ineligible reason as the unknown line", () => {
    expect(ineligibleLabelKeyOf("theremin")).toBe(
      "admin:studioAdmin.landing.previews.ineligible.unknown",
    );
    expect(ineligibleLabelKeyOf("explicit")).toBe(
      "admin:studioAdmin.landing.previews.ineligible.explicit",
    );
    expect(ineligibleLabelKeyOf(null)).toBeNull();
  });

  it("reads the reason of a 422 not eligible and nothing else", () => {
    expect(
      ineligibleReasonOfError(
        new ApiError(422, "x", {
          code: "studio_landing_preview_track_not_eligible",
          ineligibleReason: "content_warnings",
        }),
      ),
    ).toBe("content_warnings");
    expect(ineligibleReasonOfError(new ApiError(422, "x", {}))).toBeNull();
    expect(
      ineligibleReasonOfError(
        new ApiError(409, "x", { code: "studio_landing_preview_exists" }),
      ),
    ).toBeNull();
    expect(ineligibleReasonOfError(new Error("x"))).toBeNull();
  });

  it("reads a codeless 403 as the photo-not-yours line and a coded 403 as its own", () => {
    expect(
      landingPhotoErrorKeyOf(
        new ApiError(403, "Referenced upload does not belong to you", {
          message: "Referenced upload does not belong to you",
        }),
      ),
    ).toBe("studio:errors.reason.studio_landing_photo_not_yours");
    expect(
      landingPhotoErrorKeyOf(
        new ApiError(403, "Forbidden", { code: "studio_access_required" }),
      ),
    ).toBe("studio:errors.accessRequired");
  });
});
