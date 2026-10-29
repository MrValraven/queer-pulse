import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { STUDIO_LANDING_AUDIENCE_STORAGE_KEY } from "./studioLanding.data";
import { useStudioLandingAudience } from "./useStudioLandingAudience";

let originalLocalStorage: PropertyDescriptor | undefined;

function openAt(url: string) {
  window.history.replaceState(null, "", url);
}

function blockLocalStorage() {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get() {
      throw new DOMException("Site data is blocked", "SecurityError");
    },
  });
}

beforeEach(() => {
  originalLocalStorage = Object.getOwnPropertyDescriptor(
    window,
    "localStorage",
  );
  openAt("/studio");
});

afterEach(() => {
  if (originalLocalStorage) {
    Object.defineProperty(window, "localStorage", originalLocalStorage);
  }
  window.localStorage.clear();
  vi.restoreAllMocks();
  openAt("/");
});

describe("useStudioLandingAudience", () => {
  it("reads the listener with no hash and nothing stored", () => {
    const { result } = renderHook(() => useStudioLandingAudience());
    expect(result.current.audience).toBe("listener");
    expect(result.current.isOpenedOnArtists).toBe(false);
  });

  it("opens on the artist audience from #artists, over a stored choice", () => {
    window.localStorage.setItem(
      STUDIO_LANDING_AUDIENCE_STORAGE_KEY,
      "listener",
    );
    openAt("/studio#artists");
    const { result } = renderHook(() => useStudioLandingAudience());
    expect(result.current.audience).toBe("artist");
    expect(result.current.isOpenedOnArtists).toBe(true);
  });

  it("brings back a stored artist choice", () => {
    window.localStorage.setItem(STUDIO_LANDING_AUDIENCE_STORAGE_KEY, "artist");
    const { result } = renderHook(() => useStudioLandingAudience());
    expect(result.current.audience).toBe("artist");
    expect(result.current.isOpenedOnArtists).toBe(false);
  });

  it("switching stores the choice and rewrites the hash without a scroll", () => {
    const scrollTo = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => undefined);
    openAt("/studio?preview=visitor");
    const { result } = renderHook(() => useStudioLandingAudience());

    act(() => result.current.setAudience("artist"));
    expect(result.current.audience).toBe("artist");
    expect(
      window.localStorage.getItem(STUDIO_LANDING_AUDIENCE_STORAGE_KEY),
    ).toBe("artist");
    expect(window.location.pathname).toBe("/studio");
    expect(window.location.search).toBe("?preview=visitor");
    expect(window.location.hash).toBe("#artists");

    act(() => result.current.setAudience("listener"));
    expect(result.current.audience).toBe("listener");
    expect(
      window.localStorage.getItem(STUDIO_LANDING_AUDIENCE_STORAGE_KEY),
    ).toBe("listener");
    expect(window.location.hash).toBe("");
    expect(window.location.search).toBe("?preview=visitor");
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("reads the listener and still switches when localStorage throws", () => {
    blockLocalStorage();
    const { result } = renderHook(() => useStudioLandingAudience());
    expect(result.current.audience).toBe("listener");

    act(() => result.current.setAudience("artist"));
    expect(result.current.audience).toBe("artist");
    expect(window.location.hash).toBe("#artists");
  });

  it("flips to the artist audience on a hashchange to #artists", () => {
    const { result } = renderHook(() => useStudioLandingAudience());
    expect(result.current.audience).toBe("listener");

    act(() => {
      openAt("/studio#artists");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(result.current.audience).toBe("artist");
  });
});
