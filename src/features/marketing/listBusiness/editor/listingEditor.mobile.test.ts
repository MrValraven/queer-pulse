import { describe, expect, it } from "vitest";
import { ANCHOR } from "../listBusiness.data";
import { LISTING_EDITOR_SECTIONS } from "./listingEditor.data";

const anchorsOf = (key: string) =>
  LISTING_EDITOR_SECTIONS.find((section) => section.key === key)?.anchors ?? [];

describe("the out-and-about anchors in the editor sections", () => {
  it("counts Where you work under Basics", () => {
    expect(anchorsOf("basics")).toContain(ANCHOR.whereYouWork);
  });

  it("counts the meeting point and By appointment only under Practical", () => {
    expect(anchorsOf("practical")).toEqual(
      expect.arrayContaining([ANCHOR.meetingPoint, ANCHOR.byAppointment]),
    );
  });
});
