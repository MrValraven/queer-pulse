import { describe, expect, it } from "vitest";
import type { DirectoryPlace } from "../marketing/directoryPlaces";
import { mergePlaces, registryPlacesForMember } from "./places.data";

/** The card fields `mergePlaces` actually reads, as a minimal `DirectoryPlace`. */
function place(slug: string, name: string): DirectoryPlace {
  return { slug, name } as DirectoryPlace;
}

describe("registryPlacesForMember", () => {
  it("finds the places a member runs", () => {
    const places = registryPlacesForMember("ines");
    expect(places.length).toBeGreaterThan(0);
    expect(places.every((entry) => entry.status === "live")).toBe(true);
  });

  it("carries the registry entry through as the card's render source", () => {
    const places = registryPlacesForMember("ines");
    expect(places[0]?.place.slug).toBe(places[0]?.key);
  });

  it("returns nothing for a member who runs none", () => {
    expect(registryPlacesForMember("joao-ribeiro")).toEqual([]);
  });
});

describe("mergePlaces", () => {
  const live = [
    {
      key: "r1",
      status: "live" as const,
      place: place("janela", "Café Janela"),
    },
  ];
  const pending = [
    {
      key: "s1",
      status: "review" as const,
      place: place("new-bar", "New Bar"),
    },
  ];

  it("hides pending submissions from visitors", () => {
    expect(mergePlaces(live, pending, false)).toEqual(live);
  });

  it("shows pending submissions to the owner", () => {
    expect(mergePlaces(live, pending, true)).toHaveLength(2);
  });

  it("never duplicates a submission that is already live in the registry", () => {
    const alsoLive = [
      {
        key: "s2",
        status: "live" as const,
        place: place("janela", "Café Janela"),
      },
    ];
    expect(mergePlaces(live, alsoLive, true)).toHaveLength(1);
  });
});
