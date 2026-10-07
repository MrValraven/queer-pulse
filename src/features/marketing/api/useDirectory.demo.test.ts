import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isSellingOnline } from "../listBusiness/listingOnline.data";
import { DIRECTORY_PLACES } from "../directoryPlaces";
import { ADULT_ONLINE_DIRECTORY_PLACES } from "../directoryOnlinePlaces.data";
import { demoDirectoryPlaces, useDirectoryPlace } from "./useDirectory";

const authState = vi.hoisted(() => ({ loggedIn: false }));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));

vi.mock("../../../app/providers/authContext", () => ({
  useAuth: () => ({ user: null, loggedIn: authState.loggedIn }),
}));

vi.mock("../../../app/providers/useDirectoryListingsActions", () => ({
  useDirectoryListingsActions: () => ({ local: [] }),
}));

vi.mock("../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ language: "en", t: (key: string) => key }),
}));

vi.mock("../../../shared/i18n/format", () => ({
  useFormat: () => ({}),
}));

afterEach(() => {
  authState.loggedIn = false;
});

function renderDetail(slug: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return renderHook(() => useDirectoryPlace(slug), { wrapper });
}

describe("useDirectoryPlace in demo for the 18+ fixture", () => {
  it("answers nothing to a signed-out viewer", () => {
    const { result } = renderDetail("toque-macio");
    expect(result.current.place).toBeUndefined();
  });

  it("answers a signed-in member with the 18+ fixture", () => {
    authState.loggedIn = true;
    const { result } = renderDetail("toque-macio");
    expect(result.current.place?.slug).toBe("toque-macio");
    expect(result.current.place?.isAdultsOnly).toBe(true);
  });
});

describe("demoDirectoryPlaces", () => {
  it("narrows to listings that sell online, places with a shop included", () => {
    const online = demoDirectoryPlaces(true);
    expect(online.every((place) => isSellingOnline(place))).toBe(true);
    expect(online.map((place) => place.slug)).toContain("livraria-bertha");
    expect(online.map((place) => place.slug)).not.toContain("atelier-pulso");
  });

  it("returns the whole registry otherwise", () => {
    expect(demoDirectoryPlaces(false)).toBe(DIRECTORY_PLACES);
  });

  it("keeps the 18+ fixture out of every public demo read", () => {
    expect(DIRECTORY_PLACES.some((place) => place.isAdultsOnly)).toBe(false);
    expect(ADULT_ONLINE_DIRECTORY_PLACES).toHaveLength(1);
    expect(ADULT_ONLINE_DIRECTORY_PLACES[0]).toMatchObject({
      cat: "intimacy",
      isAdultsOnly: true,
      online: true,
    });
  });

  it("fills every new online field on at least one demo listing", () => {
    const all = [...DIRECTORY_PLACES, ...ADULT_ONLINE_DIRECTORY_PLACES];
    const details = all.flatMap((place) =>
      place.onlineDetails ? [place.onlineDetails] : [],
    );
    expect(all.some((place) => place.city && place.online)).toBe(true);
    expect(
      all.some((place) => (place.shopItems ?? []).some((item) => item.photo)),
    ).toBe(true);
    expect(details.some((block) => block.moreLinks.length > 0)).toBe(true);
    expect(details.some((block) => block.pickupNote !== "")).toBe(true);
    expect(
      details.some(
        (block) => block.shipsFrom === "outsideEu" && !block.isVatIncluded,
      ),
    ).toBe(true);
    expect(details.some((block) => block.payments.length > 0)).toBe(true);
    expect(details.some((block) => block.sessionFormats.length > 0)).toBe(true);
    expect(details.some((block) => block.registration.body !== "")).toBe(true);
    expect(details.some((block) => block.replyNote !== "")).toBe(true);
    expect(details.some((block) => block.fulfilment.includes("digital"))).toBe(
      true,
    );
  });

  it("gives every online-only fixture a card summary built from its block", () => {
    const onlineOnly = [
      ...DIRECTORY_PLACES,
      ...ADULT_ONLINE_DIRECTORY_PLACES,
    ].filter((place) => place.online === true);
    expect(onlineOnly.length).toBeGreaterThan(0);
    for (const place of onlineOnly) {
      // Both sides undefined would pass the comparison below on its own.
      expect(place.onlineDetails, place.slug).toBeTruthy();
      expect(place.onlineSummary?.mainLink).toEqual(
        place.onlineDetails?.mainLink,
      );
    }
  });
});
