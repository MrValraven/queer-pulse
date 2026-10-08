import { describe, expect, it } from "vitest";
import { updatePinSignature } from "./pinChrome";
import type { VenueMarkerData } from "./pinRenderer";

const venue: VenueMarkerData = {
  id: "business:lisboa-arco-iris-walks",
  name: "Lisboa Arco-Íris Walks",
  type: "tours",
  address: "Mouraria",
  latitude: 38.7153,
  longitude: -9.1352,
};

describe("updatePinSignature", () => {
  it("redraws a pin when its second label line changes", () => {
    const button = document.createElement("button");
    expect(updatePinSignature(button, venue)).toBe(true);
    expect(updatePinSignature(button, venue)).toBe(false);
    expect(
      updatePinSignature(button, { ...venue, secondaryLabel: "Meeting point" }),
    ).toBe(true);
  });
});
