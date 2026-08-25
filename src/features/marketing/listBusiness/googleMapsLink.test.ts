import { describe, expect, it } from "vitest";
import { isShortMapsLink, parseGoogleMapsUrl } from "./googleMapsLink";

describe("parseGoogleMapsUrl", () => {
  it("prefers the !3d!4d place pin and reads the place name", () => {
    expect(
      parseGoogleMapsUrl(
        "https://www.google.com/maps/place/Bar+Name/@38.71,-9.10,17z/data=!3d38.7223!4d-9.1393",
      ),
    ).toEqual({ latitude: 38.7223, longitude: -9.1393, placeName: "Bar Name" });
  });

  it("falls back to @lat,lng and to q=/query=", () => {
    expect(
      parseGoogleMapsUrl("https://www.google.com/maps/@38.7223,-9.1393,17z"),
    ).toEqual({
      latitude: 38.7223,
      longitude: -9.1393,
    });
    expect(
      parseGoogleMapsUrl("https://maps.google.com/?q=38.7223,-9.1393"),
    ).toEqual({
      latitude: 38.7223,
      longitude: -9.1393,
    });
  });

  it("returns null for a short link (needs backend) and for junk", () => {
    expect(parseGoogleMapsUrl("https://maps.app.goo.gl/abc123")).toBeNull();
    expect(parseGoogleMapsUrl("nonsense")).toBeNull();
  });

  it("returns null for out-of-range coords", () => {
    expect(
      parseGoogleMapsUrl("https://www.google.com/maps/@200,-9,17z"),
    ).toBeNull();
  });
});

describe("isShortMapsLink", () => {
  it("flags goo.gl short links", () => {
    expect(isShortMapsLink("https://maps.app.goo.gl/abc")).toBe(true);
    expect(isShortMapsLink("https://goo.gl/maps/abc")).toBe(true);
  });
  it("does not flag full urls or junk", () => {
    expect(isShortMapsLink("https://www.google.com/maps/@1,2,3z")).toBe(false);
    expect(isShortMapsLink("nonsense")).toBe(false);
  });
});
