import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEMO_SUBPROFILES,
  toPublicDto,
} from "../../subprofiles/data/subprofiles.data";
import { publicSubprofileToView } from "../../subprofiles/api/subprofiles.adapters";
import { toArtistView } from "./studio.adapters";
import type { StudioFoundingArtistsDTO } from "./studioLanding.types";
import { demoStudioArtist } from "./studioDemoApi";
import {
  DEMO_FOUNDING_ARTIST_IDS,
  DEMO_STUDIO_FOUNDING_ARTISTS,
} from "./studioDemoFounding.data";
import { demoArtistDetailsOf } from "./studioDemoFormats.data";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";
import {
  useStudioFoundingArtistIds,
  useStudioFoundingArtists,
} from "./useStudioFoundingArtists";

const getStudioFoundingArtists =
  vi.fn<() => Promise<StudioFoundingArtistsDTO>>();

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
const access: { hasAccess: boolean } = vi.hoisted(() => ({
  hasAccess: false,
}));

vi.mock("./useStudioAccess", () => ({
  useStudioAccess: () => ({ hasAccess: access.hasAccess }),
}));
vi.mock("./studioFounding.api", () => ({
  getStudioFoundingArtists: () => getStudioFoundingArtists(),
}));

beforeEach(() => {
  access.hasAccess = false;
  getStudioFoundingArtists.mockReset();
});

describe("toArtistView isFoundingArtist", () => {
  const baseDto = demoStudioArtist(DEMO_ARTIST_MARIANA.id);

  it("reads a literal true", () => {
    const dto = {
      ...baseDto,
      artist: { ...baseDto.artist, isFoundingArtist: true },
    };
    expect(toArtistView(dto).isFoundingArtist).toBe(true);
  });

  it("reads false when the field is false", () => {
    const dto = {
      ...baseDto,
      artist: { ...baseDto.artist, isFoundingArtist: false },
    };
    expect(toArtistView(dto).isFoundingArtist).toBe(false);
  });

  it("reads false when an older server omits the field", () => {
    const { isFoundingArtist: omitted, ...artistWithout } = baseDto.artist;
    expect(omitted).toBeFalsy();
    expect(
      toArtistView({ ...baseDto, artist: artistWithout }).isFoundingArtist,
    ).toBe(false);
  });
});

describe("publicSubprofileToView isFoundingArtist", () => {
  const unflaggedPersona = DEMO_SUBPROFILES.find(
    (persona) => persona.isFoundingArtist !== true,
  );
  if (!unflaggedPersona)
    throw new Error("fixture missing: a demo persona without the flag");
  const baseDto = toPublicDto(unflaggedPersona);

  it("reads a literal true", () => {
    expect(
      publicSubprofileToView({ ...baseDto, isFoundingArtist: true })
        .isFoundingArtist,
    ).toBe(true);
  });

  it("reads false for false and for a missing field", () => {
    expect(
      publicSubprofileToView({ ...baseDto, isFoundingArtist: false })
        .isFoundingArtist,
    ).toBe(false);
    const { isFoundingArtist: omitted, ...dtoWithout } = baseDto;
    expect(omitted).toBeFalsy();
    expect(publicSubprofileToView(dtoWithout).isFoundingArtist).toBe(false);
  });
});

describe("founding demo data", () => {
  it("lists the same ids in the shelf read and the id list", () => {
    expect(
      DEMO_STUDIO_FOUNDING_ARTISTS.artists.map((artist) => artist.id),
    ).toEqual([...DEMO_FOUNDING_ARTIST_IDS]);
    expect(DEMO_STUDIO_FOUNDING_ARTISTS.isShelfVisible).toBe(true);
  });

  it("flags NIGHTFORM as a founding artist and leaves Mariana out", () => {
    expect(demoArtistDetailsOf("sp-diogo-nightform").isFoundingArtist).toBe(
      true,
    );
    expect(demoArtistDetailsOf(DEMO_ARTIST_MARIANA.id).isFoundingArtist).toBe(
      false,
    );
  });

  it("reaches the demo artist answer", () => {
    expect(demoStudioArtist("sp-diogo-nightform").artist.isFoundingArtist).toBe(
      true,
    );
  });

  it("flags only ids listed in DEMO_FOUNDING_ARTIST_IDS in the subprofiles demo", () => {
    const flagged = DEMO_SUBPROFILES.filter(
      (persona) => persona.isFoundingArtist === true,
    );
    expect(flagged.length).toBeGreaterThan(0);
    for (const persona of flagged) {
      expect(DEMO_FOUNDING_ARTIST_IDS).toContain(persona.id);
    }
    expect(flagged.map((persona) => persona.id).sort()).toEqual(
      [...DEMO_FOUNDING_ARTIST_IDS].sort(),
    );
  });

  it("carries the flag onto the public DTO", () => {
    const nightform = DEMO_SUBPROFILES.find(
      (persona) => persona.id === "sp-diogo-nightform",
    );
    expect(nightform).toBeDefined();
    if (nightform) expect(toPublicDto(nightform).isFoundingArtist).toBe(true);
  });
});

describe("useStudioFoundingArtistIds", () => {
  it("never reads and returns an empty set without Studio access", () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children);
    const { result } = renderHook(() => useStudioFoundingArtistIds(), {
      wrapper,
    });
    expect(getStudioFoundingArtists).not.toHaveBeenCalled();
    expect(result.current.size).toBe(0);
  });

  it("returns the founding ids once a granted member's read lands", async () => {
    access.hasAccess = true;
    getStudioFoundingArtists.mockResolvedValue(DEMO_STUDIO_FOUNDING_ARTISTS);
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children);
    const { result } = renderHook(() => useStudioFoundingArtistIds(), {
      wrapper,
    });
    await waitFor(() =>
      expect([...result.current].sort()).toEqual(
        [...DEMO_FOUNDING_ARTIST_IDS].sort(),
      ),
    );
  });

  it("hides cached founding artists once access is revoked", async () => {
    access.hasAccess = true;
    getStudioFoundingArtists.mockResolvedValue(DEMO_STUDIO_FOUNDING_ARTISTS);
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children);
    const { result, rerender } = renderHook(() => useStudioFoundingArtists(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.founding).not.toBeNull());
    access.hasAccess = false;
    rerender();
    expect(result.current.founding).toBeNull();
  });
});
