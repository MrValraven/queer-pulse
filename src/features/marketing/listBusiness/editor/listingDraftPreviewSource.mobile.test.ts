import { describe, expect, it } from "vitest";
import { blankDraft } from "../listingFormDraft";
import { emptyMobileDetails } from "../listingMobile.data";
import { listingDraftToPreviewSource } from "./listingDraftPreviewSource";

const noPhotos = { wide: "", d1: "", d2: "", vibe: "" };

describe("listingDraftToPreviewSource for an out-and-about listing", () => {
  const draft = {
    ...blankDraft(),
    name: "Muda Comigo",
    mobile: true,
    mobileDetails: { ...emptyMobileDetails(), alsoTravelsTo: ["Oeiras"] },
    address: "Rua Antiga 3",
    hood: "Beato",
    latitude: 38.73,
    longitude: -9.1,
    geocoded: true,
  };

  it("previews no location while the meeting point is unticked", () => {
    const source = listingDraftToPreviewSource(draft, "muda-comigo", noPhotos);
    expect(source).toMatchObject({
      address: "",
      hood: "",
      latitude: null,
      longitude: null,
      geocoded: false,
      mobile: true,
    });
    expect(source.mobileDetails?.alsoTravelsTo).toEqual(["Oeiras"]);
  });

  it("previews the meeting point once it is ticked", () => {
    const source = listingDraftToPreviewSource(
      { ...draft, hasMeetingPoint: true },
      "muda-comigo",
      noPhotos,
    );
    expect(source).toMatchObject({ address: "Rua Antiga 3", latitude: 38.73 });
  });
});
