import { beforeEach, describe, expect, it } from "vitest";
import { galleryShotsOf } from "./directoryGalleryShots";
import { getPlace } from "./directoryPlaces";
import {
  applyDemoPhotoFraming,
  recordDemoPhotoFraming,
  resetDemoPhotoFraming,
} from "./listingPhotoFramingDemoOverlay";

const framing = { focusX: 0.2, focusY: 0.7, zoom: 1.5 };
const laterFraming = { focusX: 0.9, focusY: 0.1, zoom: 2 };
const farinha = getPlace("a-farinha")!;
const bertha = getPlace("livraria-bertha")!;

describe("demo photo framing overlay", () => {
  beforeEach(resetDemoPhotoFraming);

  it("returns the fixture unchanged before anything was recorded", () => {
    expect(applyDemoPhotoFraming(farinha)).toBe(farinha);
  });

  it("returns the recorded framing for that slug only", () => {
    recordDemoPhotoFraming("a-farinha", [
      { image: farinha.photos!.wide!, framing },
    ]);
    expect(galleryShotsOf(applyDemoPhotoFraming(farinha))[0]!.framing).toEqual(
      framing,
    );
    expect(applyDemoPhotoFraming(bertha)).toBe(bertha);
  });

  it("layers a later save over an earlier one", () => {
    const image = farinha.photos!.wide!;
    recordDemoPhotoFraming("a-farinha", [{ image, framing }]);
    recordDemoPhotoFraming("a-farinha", [{ image, framing: laterFraming }]);
    expect(galleryShotsOf(applyDemoPhotoFraming(farinha))[0]!.framing).toEqual(
      laterFraming,
    );
  });

  it("forgets every recorded framing after a reset", () => {
    recordDemoPhotoFraming("a-farinha", [
      { image: farinha.photos!.wide!, framing },
    ]);
    resetDemoPhotoFraming();
    expect(applyDemoPhotoFraming(farinha)).toBe(farinha);
  });
});
