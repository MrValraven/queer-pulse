import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DirectoryPlace } from "./directoryPlaces";
import { emptyMobileDetails } from "./listBusiness/listingMobile.data";
import type { LocalPlace } from "./localPlaces";
import { useDirectoryMapView } from "./useDirectoryMapView";

function business(
  id: string,
  source: Partial<DirectoryPlace>,
  coords: LocalPlace["coords"],
  freguesia = "",
): LocalPlace {
  return {
    id,
    kind: "business",
    name: id,
    category: "grooming",
    neighbourhood: freguesia,
    freguesia,
    coords,
    detailPath: `/local/directory/${id}`,
    searchText: id,
    source: { slug: id, online: false, ...source } as DirectoryPlace,
  };
}

const hairdresser = business(
  "corte-movel",
  {
    mobile: true,
    mobileDetails: {
      ...emptyMobileDetails(),
      allOfCity: false,
      parishes: ["Arroios", "Estrela"],
    },
  },
  null,
);
const movers = business(
  "muda-comigo",
  { mobile: true, mobileDetails: emptyMobileDetails() },
  null,
);
const tour = business(
  "lisboa-arco-iris-walks",
  {
    mobile: true,
    mobileDetails: emptyMobileDetails(),
    latitude: 38.7153,
    longitude: -9.1352,
  },
  { latitude: 38.7153, longitude: -9.1352 },
  "Santa Maria Maior",
);
const shop = business(
  "atelier-pulso",
  {},
  { latitude: 38.7167, longitude: -9.149 },
  "Misericórdia",
);

const PLACES = [hairdresser, movers, tour, shop];

describe("useDirectoryMapView for out-and-about listings", () => {
  it("pins a meeting point with its label flag and leaves the rest unpinned", () => {
    const { result } = renderHook(() => useDirectoryMapView(PLACES));
    const markers = result.current.markers;
    expect(markers.map((marker) => marker.id)).toEqual([
      "lisboa-arco-iris-walks",
      "atelier-pulso",
    ]);
    expect(
      markers.find((marker) => marker.id === "lisboa-arco-iris-walks")
        ?.isMeetingPoint,
    ).toBe(true);
    expect(
      markers.find((marker) => marker.id === "atelier-pulso")?.isMeetingPoint,
    ).toBeFalsy();
  });

  it("lists the ones with no pin under Across Lisbon", () => {
    const { result } = renderHook(() => useDirectoryMapView(PLACES));
    expect(result.current.acrossLisbon.map((place) => place.id)).toEqual([
      "corte-movel",
      "muda-comigo",
    ]);
  });

  it("keeps only those covering a selected parish", () => {
    const { result } = renderHook(() => useDirectoryMapView(PLACES));
    act(() => result.current.toggleFreguesia("Beato"));
    expect(result.current.acrossLisbon.map((place) => place.id)).toEqual([
      "muda-comigo",
    ]);
    act(() => result.current.toggleFreguesia("Arroios"));
    expect(result.current.acrossLisbon.map((place) => place.id)).toEqual([
      "corte-movel",
      "muda-comigo",
    ]);
  });

  it("hides the group while a pin has the sidebar", () => {
    const { result } = renderHook(() => useDirectoryMapView(PLACES));
    act(() => result.current.selectPlace("atelier-pulso"));
    expect(result.current.acrossLisbon).toEqual([]);
  });

  it("shades the parishes of the hovered card, and nothing otherwise", () => {
    const { result } = renderHook(() => useDirectoryMapView(PLACES));
    expect(result.current.highlightedFreguesias).toEqual([]);
    act(() => result.current.setHoveredId("corte-movel"));
    expect(result.current.highlightedFreguesias).toEqual([
      "Arroios",
      "Estrela",
    ]);
    act(() => result.current.setHoveredId("muda-comigo"));
    expect(result.current.highlightedFreguesias).toHaveLength(24);
    act(() => result.current.setHoveredId("atelier-pulso"));
    expect(result.current.highlightedFreguesias).toEqual([]);
  });

  it("keeps the parish counts to pinned places", () => {
    const { result } = renderHook(() => useDirectoryMapView(PLACES));
    expect(result.current.counts).toEqual({
      "Santa Maria Maior": 1,
      Misericórdia: 1,
    });
  });
});
