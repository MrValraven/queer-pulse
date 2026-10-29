import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { StudioArtistRefDTO } from "../../studio/api/studio.types";
import { studioAdminSaveErrorKeyOf } from "../studioAdmin.model";
import {
  adminStudioSpotlightKey,
  useAdminStudioSpotlight,
  useAdminStudioSpotlightArtistSearch,
} from "./StudioAdminSpotlightHooks";
import { useReorderAdminStudioNewStars } from "./StudioAdminSpotlightListMutations";
import {
  useAddAdminStudioNewStar,
  useSetAdminStudioArtistOfTheMonth,
} from "./StudioAdminSpotlightMutations";
import type {
  AdminStudioSpotlightArtistDTO,
  AdminStudioSpotlightArtistOptionDTO,
  AdminStudioSpotlightDTO,
  StudioSpotlightSlot,
} from "./studioSpotlightAdmin.api";

const demoHolder: { demoMode: boolean } = vi.hoisted(() => ({
  demoMode: true,
}));
const getSpotlight = vi.hoisted(() => vi.fn<() => Promise<unknown>>());
const searchArtists = vi.hoisted(() =>
  vi.fn<(query: string) => Promise<unknown>>(),
);
const putMonth = vi.hoisted(() =>
  vi.fn<
    (body: { subprofileId: string; note?: string | null }) => Promise<unknown>
  >(),
);
const reorderStars = vi.hoisted(() =>
  vi.fn<(body: { spotlightIds: string[] }) => Promise<unknown>>(),
);

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: demoHolder.demoMode }),
}));
vi.mock("./studioSpotlightAdmin.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./studioSpotlightAdmin.api")>()),
  getAdminStudioSpotlight: () => getSpotlight(),
  searchAdminStudioSpotlightArtists: (query: string) => searchArtists(query),
  putAdminStudioArtistOfTheMonth: (body: {
    subprofileId: string;
    note?: string | null;
  }) => putMonth(body),
  reorderAdminStudioNewStars: (body: { spotlightIds: string[] }) =>
    reorderStars(body),
}));

function artistOf(artistId: string, name: string): StudioArtistRefDTO {
  return { id: artistId, handle: "", name, kind: "musician", avatarUrl: null };
}

const RITA = artistOf("demo-persona-rita-ferreira", "Rita Ferreira");

function rowOf(
  rowId: string,
  slot: StudioSpotlightSlot,
  position: number,
  artist: StudioArtistRefDTO,
  note: string | null = null,
): AdminStudioSpotlightArtistDTO {
  return {
    id: rowId,
    slot,
    position,
    note,
    createdAt: "2026-10-01T10:00:00.000Z",
    isListenable: true,
    artist,
  };
}

function optionOf(
  artist: StudioArtistRefDTO,
): AdminStudioSpotlightArtistOptionDTO {
  return {
    artist,
    latestReleaseTitle: "Kitchen songs",
    isInArtistOfTheMonth: false,
    isInNewStars: false,
  };
}

const starsOf = (count: number) =>
  Array.from({ length: count }, (_unused, index) =>
    rowOf(
      `star-${index + 1}`,
      "new_stars",
      index + 1,
      artistOf(`persona-${index + 1}`, `Persona ${index + 1}`),
    ),
  );

function setup(spotlight?: AdminStudioSpotlightDTO) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  if (spotlight)
    queryClient.setQueryData(
      adminStudioSpotlightKey(demoHolder.demoMode),
      spotlight,
    );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

function cachedSpotlight(queryClient: QueryClient) {
  return queryClient.getQueryData<AdminStudioSpotlightDTO>(
    adminStudioSpotlightKey(demoHolder.demoMode),
  );
}

async function refusalOf(attempt: () => Promise<unknown>): Promise<unknown> {
  try {
    await attempt();
  } catch (error) {
    return error;
  }
  throw new Error("the write was expected to be refused");
}

beforeEach(() => {
  demoHolder.demoMode = true;
  getSpotlight.mockReset();
  searchArtists.mockReset();
  putMonth.mockReset();
  reorderStars.mockReset();
});

describe("the spotlight read", () => {
  it("serves the demo spotlight without a request", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useAdminStudioSpotlight(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.artistOfTheMonth?.artist.name).toBe(
      "Vanda Diesel",
    );
    expect(result.current.data?.newStars).toHaveLength(5);
    expect(getSpotlight).not.toHaveBeenCalled();
  });

  it("searches only for a non-blank query", async () => {
    demoHolder.demoMode = false;
    searchArtists.mockResolvedValue({ items: [] });
    const { wrapper } = setup();
    const blank = renderHook(() => useAdminStudioSpotlightArtistSearch("   "), {
      wrapper,
    });
    expect(blank.result.current.fetchStatus).toBe("idle");
    expect(searchArtists).not.toHaveBeenCalled();
    const typed = renderHook(
      () => useAdminStudioSpotlightArtistSearch(" vanda "),
      { wrapper },
    );
    await waitFor(() => expect(typed.result.current.data).toEqual([]));
    expect(searchArtists).toHaveBeenCalledTimes(1);
    expect(searchArtists).toHaveBeenCalledWith("vanda");
  });
});

describe("the spotlight writes", () => {
  it("replaces the artist of the month with a fresh row and no carried note", async () => {
    const oldMonth = rowOf(
      "month-old",
      "artist_of_the_month",
      1,
      artistOf("persona-old", "Old pick"),
      "old",
    );
    const { queryClient, wrapper } = setup({
      artistOfTheMonth: oldMonth,
      newStars: [],
    });
    const { result } = renderHook(() => useSetAdminStudioArtistOfTheMonth(), {
      wrapper,
    });
    await act(() =>
      result.current.mutateAsync({ option: optionOf(RITA), note: null }),
    );
    const month = cachedSpotlight(queryClient)?.artistOfTheMonth;
    expect(month?.artist.name).toBe("Rita Ferreira");
    expect(month?.note).toBeNull();
    expect(month?.id).not.toBe(oldMonth.id);
  });

  it("refuses a thirteenth new star with the slot-full code", async () => {
    const stars = starsOf(12);
    const { queryClient, wrapper } = setup({
      artistOfTheMonth: null,
      newStars: stars,
    });
    const { result } = renderHook(() => useAddAdminStudioNewStar(), {
      wrapper,
    });
    const error = await act(() =>
      refusalOf(() =>
        result.current.mutateAsync({ option: optionOf(RITA), note: null }),
      ),
    );
    expect(studioAdminSaveErrorKeyOf(error)).toBe(
      "studio:errors.spotlightSlotFull",
    );
    expect(cachedSpotlight(queryClient)?.newStars).toHaveLength(12);
  });

  it("refuses an artist already in New stars", async () => {
    const stars = starsOf(3);
    const listedArtist = stars[1]?.artist;
    if (!listedArtist) throw new Error("the seed has three stars");
    const { wrapper } = setup({ artistOfTheMonth: null, newStars: stars });
    const { result } = renderHook(() => useAddAdminStudioNewStar(), {
      wrapper,
    });
    const error = await act(() =>
      refusalOf(() =>
        result.current.mutateAsync({
          option: optionOf(listedArtist),
          note: null,
        }),
      ),
    );
    expect(studioAdminSaveErrorKeyOf(error)).toBe(
      "studio:errors.spotlightAlreadyInSlot",
    );
  });

  it("rolls back a refused live reorder and reads the server order again", async () => {
    demoHolder.demoMode = false;
    const seed: AdminStudioSpotlightDTO = {
      artistOfTheMonth: null,
      newStars: starsOf(3),
    };
    getSpotlight.mockResolvedValue(seed);
    reorderStars.mockRejectedValue(
      new ApiError(409, "Conflict", {
        code: "studio_spotlight_order_mismatch",
      }),
    );
    const { queryClient, wrapper } = setup(seed);
    const { result } = renderHook(
      () => ({
        read: useAdminStudioSpotlight(),
        reorder: useReorderAdminStudioNewStars(),
      }),
      { wrapper },
    );
    const error = await act(() =>
      refusalOf(() =>
        result.current.reorder.mutateAsync({
          spotlightIds: ["star-3", "star-1", "star-2"],
        }),
      ),
    );
    expect(studioAdminSaveErrorKeyOf(error)).toBe(
      "studio:errors.spotlightOrderMismatch",
    );
    expect(cachedSpotlight(queryClient)?.newStars).toEqual(seed.newStars);
    await waitFor(() => expect(getSpotlight).toHaveBeenCalledTimes(1));
    expect(cachedSpotlight(queryClient)?.newStars).toEqual(seed.newStars);
  });

  it("puts the artist of the month and refreshes Studio home", async () => {
    demoHolder.demoMode = false;
    const artist = artistOf("sp-x", "Persona X");
    putMonth.mockResolvedValue(
      rowOf("month-x", "artist_of_the_month", 1, artist, "Hello"),
    );
    const { queryClient, wrapper } = setup({
      artistOfTheMonth: null,
      newStars: [],
    });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useSetAdminStudioArtistOfTheMonth(), {
      wrapper,
    });
    await act(() =>
      result.current.mutateAsync({ option: optionOf(artist), note: "Hello" }),
    );
    expect(putMonth).toHaveBeenCalledWith({
      subprofileId: "sp-x",
      note: "Hello",
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["studio", "curation"],
    });
    expect(cachedSpotlight(queryClient)?.artistOfTheMonth?.id).toBe("month-x");
  });
});
