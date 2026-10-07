import { describe, expect, it } from "vitest";
import { DIRECTORY_PLACES } from "./directoryPlaces";
import { businessToLocal } from "./localPlaces";
import { sortByNeighbourhoodDistance } from "./nearMePlaces";

describe("sortByNeighbourhoodDistance", () => {
  it("puts places with no neighbourhood after every named one", () => {
    const [first, second, third] = DIRECTORY_PLACES.map((place) =>
      businessToLocal(place, true),
    );
    const online = {
      ...first!,
      id: "business:online",
      neighbourhood: "",
      coords: null,
    };
    const near = { ...second!, id: "business:near", neighbourhood: "Graça" };
    const unmeasured = {
      ...third!,
      id: "business:far",
      neighbourhood: "Alfama",
    };
    const metres = new Map([["business:near", 300]]);
    expect(
      sortByNeighbourhoodDistance([online, unmeasured, near], metres).map(
        (place) => place.id,
      ),
    ).toEqual(["business:near", "business:far", "business:online"]);
  });

  it("keeps an empty neighbourhood last even when its place was measured", () => {
    const [first, second] = DIRECTORY_PLACES.map((place) =>
      businessToLocal(place, true),
    );
    const unnamed = { ...first!, id: "business:unnamed", neighbourhood: "" };
    const named = { ...second!, id: "business:named", neighbourhood: "Graça" };
    const metres = new Map([
      ["business:unnamed", 50],
      ["business:named", 900],
    ]);
    expect(
      sortByNeighbourhoodDistance([unnamed, named], metres).map(
        (place) => place.id,
      ),
    ).toEqual(["business:named", "business:unnamed"]);
  });
});
