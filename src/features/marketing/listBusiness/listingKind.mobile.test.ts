import { describe, expect, it } from "vitest";
import { blankDraft } from "./listingFormDraft";
import {
  whereFoundChoiceOf,
  withKind,
  withListingKind,
  withWhereFoundChoice,
} from "./listingKind";

describe("withKind", () => {
  it("never leaves online and mobile both on", () => {
    const mobile = withKind({ ...blankDraft(), cats: ["grooming"] }, "mobile");
    const online = withKind(mobile, "online");
    expect(online.online).toBe(true);
    expect(online.mobile).toBe(false);
    const backToMobile = withKind(online, "mobile");
    expect(backToMobile.online).toBe(false);
    expect(backToMobile.mobile).toBe(true);
  });

  it("keeps the categories between a place and a mobile listing", () => {
    const place = { ...blankDraft(), cats: ["tours", "culture"] };
    const mobile = withKind(place, "mobile");
    expect(mobile.cats).toEqual(["tours", "culture"]);
    expect(withKind(mobile, "place").cats).toEqual(["tours", "culture"]);
  });

  it("stashes the place categories on the way online and brings them back to mobile", () => {
    const mobile = withKind({ ...blankDraft(), cats: ["grooming"] }, "mobile");
    const online = withKind(mobile, "online");
    expect(online.inactiveModeCats).toEqual(["grooming"]);
    expect(withKind(online, "mobile").cats).toEqual(["grooming"]);
  });

  it("never ticks the meeting point and keeps the typed address in the draft", () => {
    const place = {
      ...blankDraft(),
      address: "Rua X 1",
      hood: "Graça",
      latitude: 38.7,
      longitude: -9.1,
    };
    const mobile = withKind(place, "mobile");
    expect(mobile.hasMeetingPoint).toBe(false);
    expect(mobile).toMatchObject({ address: "Rua X 1", hood: "Graça" });
  });

  it("returns the same draft when the kind is unchanged", () => {
    const place = blankDraft();
    expect(withKind(place, "place")).toBe(place);
  });

  it("clears mobile when the older online switch turns online on", () => {
    const mobile = withKind(blankDraft(), "mobile");
    expect(withListingKind(mobile, true).mobile).toBe(false);
  });
});

describe("the step 0 answer", () => {
  it("stays unanswered on a brand-new draft", () => {
    expect(whereFoundChoiceOf(blankDraft())).toBe("");
  });

  it("answers Out and about", () => {
    const answered = withWhereFoundChoice(blankDraft(), "mobile");
    expect(whereFoundChoiceOf(answered)).toBe("mobile");
    expect(answered.isWhereFoundAnswered).toBe(true);
  });

  it("reads a draft from before the question by its flags", () => {
    const { isWhereFoundAnswered: _isWhereFoundAnswered, ...older } = {
      ...blankDraft(),
      mobile: true,
    };
    expect(whereFoundChoiceOf(older)).toBe("mobile");
  });
});
