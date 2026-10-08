import { describe, expect, it } from "vitest";
import type { DirectoryPlace } from "./directoryPlaces";
import { relatedPlacesFor } from "./relatedPlaces";

function placeWith(slug: string, hood: string, cat: string): DirectoryPlace {
  return { slug, hood, cat } as DirectoryPlace;
}

describe("relatedPlacesFor", () => {
  it("renders nothing for a hood-less place with too few same-category peers", () => {
    const place = placeWith("muda", "", "services");
    const places = [
      place,
      placeWith("shop-one", "", "shop"),
      placeWith("shop-two", "", "shop"),
      placeWith("peer", "", "services"),
    ];
    expect(relatedPlacesFor(place, places)).toEqual([]);
  });

  it("never counts an empty-hood candidate as a hood match", () => {
    const place = placeWith("muda", "", "services");
    const places = [
      place,
      placeWith("peer-one", "Alfama", "services"),
      placeWith("peer-two", "", "services"),
    ];
    expect(
      relatedPlacesFor(place, places).map((related) => related.slug),
    ).toEqual(["peer-one", "peer-two"]);
  });

  it("still widens to the same hood when the place has one", () => {
    const place = placeWith("a", "Mouraria", "bar");
    const places = [
      place,
      placeWith("far-bar", "Alfama", "bar"),
      placeWith("near-cafe", "Mouraria", "cafe"),
      placeWith("far-cafe", "Alfama", "cafe"),
    ];
    expect(
      relatedPlacesFor(place, places).map((related) => related.slug),
    ).toEqual(["near-cafe", "far-bar"]);
  });
});
