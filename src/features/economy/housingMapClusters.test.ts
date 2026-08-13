import { describe, expect, it } from "vitest";
import { buildHousingClusters } from "./housingMapClusters";
import { HOUSING_LISTINGS } from "./housingListings";

describe("buildHousingClusters", () => {
  it("groups listings by hood and pins at the approx centroid", () => {
    const clusters = buildHousingClusters(HOUSING_LISTINGS);
    const arroios = clusters.find((cluster) => cluster.name === "Arroios");
    expect(arroios).toBeDefined();
    expect(arroios!.listings.length).toBeGreaterThanOrEqual(1);
    expect(typeof arroios!.latitude).toBe("number");
    expect(typeof arroios!.longitude).toBe("number");
  });

  it("drops listings with no approximate coordinates", () => {
    const withoutCoords = [
      {
        ...HOUSING_LISTINGS[0]!,
        hood: "Nowhere",
        location: {
          approxLatitude: null,
          approxLongitude: null,
          preciseLatitude: null,
          preciseLongitude: null,
          addressLine: null,
          precision: "area" as const,
        },
      },
    ];
    expect(buildHousingClusters(withoutCoords)).toEqual([]);
  });
});
