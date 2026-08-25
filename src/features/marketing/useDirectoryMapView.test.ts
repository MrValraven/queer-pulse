import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDirectoryMapView } from "./useDirectoryMapView";
import type { LocalPlace } from "./localPlaces";

function place(id: string, freguesia: string): LocalPlace {
  return {
    id,
    kind: "venue",
    name: id,
    category: "nightlife",
    neighbourhood: freguesia,
    freguesia,
    coords: { latitude: 38.72, longitude: -9.13 },
    detailPath: `/local/directory/${id}`,
    searchText: id,
    source: {} as LocalPlace["source"],
  };
}

const PLACES = [
  place("penha-one", "Penha de França"),
  place("penha-two", "Penha de França"),
  place("vicente-one", "São Vicente"),
];

describe("useDirectoryMapView parish selection", () => {
  it("draws every pin while no parish is selected", () => {
    const { result } = renderHook(() => useDirectoryMapView(PLACES));
    expect(result.current.markers.map((marker) => marker.id)).toEqual([
      "penha-one",
      "penha-two",
      "vicente-one",
    ]);
  });

  it("narrows the pins to the selected parish", () => {
    const { result } = renderHook(() => useDirectoryMapView(PLACES));
    act(() => result.current.toggleFreguesia("Penha de França"));
    expect(result.current.markers.map((marker) => marker.id)).toEqual([
      "penha-one",
      "penha-two",
    ]);
  });

  it("keeps counting every parish so unselected ones can still label a number", () => {
    const { result } = renderHook(() => useDirectoryMapView(PLACES));
    act(() => result.current.toggleFreguesia("Penha de França"));
    expect(result.current.counts).toEqual({
      "Penha de França": 2,
      "São Vicente": 1,
    });
  });

  it("clears the selection when the selected parish is clicked again", () => {
    const { result } = renderHook(() => useDirectoryMapView(PLACES));
    act(() => result.current.toggleFreguesia("Penha de França"));
    act(() => result.current.toggleFreguesia("Penha de França"));
    expect(result.current.selectedFreguesia).toBeNull();
    expect(result.current.markers).toHaveLength(3);
  });

  it("switches straight to another parish", () => {
    const { result } = renderHook(() => useDirectoryMapView(PLACES));
    act(() => result.current.toggleFreguesia("Penha de França"));
    act(() => result.current.toggleFreguesia("São Vicente"));
    expect(result.current.selectedFreguesia).toBe("São Vicente");
    expect(result.current.markers.map((marker) => marker.id)).toEqual([
      "vicente-one",
    ]);
  });

  it("brings every pin back when a pin takes over the sidebar", () => {
    const { result } = renderHook(() => useDirectoryMapView(PLACES));
    act(() => result.current.toggleFreguesia("Penha de França"));
    act(() => result.current.selectPlace("vicente-one"));
    expect(result.current.selectedFreguesia).toBeNull();
    expect(result.current.markers).toHaveLength(3);
  });
});
