import { describe, expect, it } from "vitest";
import { mergePlaces, registryPlacesForMember } from "./places.data";

describe("registryPlacesForMember", () => {
  it("finds the places a member runs", () => {
    const places = registryPlacesForMember("ines");
    expect(places.length).toBeGreaterThan(0);
    expect(places.every((place) => place.status === "live")).toBe(true);
  });

  it("returns nothing for a member who runs none", () => {
    expect(registryPlacesForMember("joao-ribeiro")).toEqual([]);
  });
});

describe("mergePlaces", () => {
  const live = [
    {
      key: "r1",
      name: "Café Janela",
      slug: "janela",
      status: "live" as const,
      meta: "Café · Arroios",
    },
  ];
  const pending = [
    {
      key: "s1",
      name: "New Bar",
      slug: "new-bar",
      status: "review" as const,
      meta: "Bar · Anjos",
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
        name: "Café Janela",
        slug: "janela",
        status: "live" as const,
        meta: "Café · Arroios",
      },
    ];
    expect(mergePlaces(live, alsoLive, true)).toHaveLength(1);
  });
});
