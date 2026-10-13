import { describe, expect, it } from "vitest";
import { emptyHours, type ListingDraft } from "./listBusiness.data";
import { blankDraft } from "./listingFormDraft";
import {
  withAppointmentAnswersInStep,
  withByAppointmentLinked,
  withEntryModeLinked,
} from "./listingAppointmentLink";
import { withKind, withWhereFoundChoice } from "./listingKind";
import { normalizeMobileDetails } from "./listingMobile.data";

function draftWith(fields: Partial<ListingDraft>): ListingDraft {
  return { ...blankDraft(), ...fields };
}
const isToggleOn = (draft: ListingDraft) =>
  normalizeMobileDetails(draft.mobileDetails).byAppointment;
const mobile = (fields: Partial<ListingDraft> = {}) =>
  draftWith({ mobile: true, cats: ["grooming"], ...fields });

describe("withByAppointmentLinked on an out-and-about listing", () => {
  it("sets the way in to By appointment only when the toggle goes on", () => {
    const linked = withByAppointmentLinked(
      mobile({ entryMode: "walkIn" }),
      true,
    );
    expect(isToggleOn(linked)).toBe(true);
    expect(linked.entryMode).toBe("appointmentOnly");
  });

  it("clears an appointment-only way in to Not saying when the toggle goes off", () => {
    const on = withByAppointmentLinked(mobile(), true);
    const off = withByAppointmentLinked(on, false);
    expect(isToggleOn(off)).toBe(false);
    expect(off.entryMode).toBeNull();
  });

  it("keeps any other way in when the toggle goes off", () => {
    const off = withByAppointmentLinked(
      mobile({ entryMode: "bookingRecommended" }),
      false,
    );
    expect(off.entryMode).toBe("bookingRecommended");
  });
});

describe("withEntryModeLinked on an out-and-about listing", () => {
  it("turns the hours toggle on with By appointment only", () => {
    const linked = withEntryModeLinked(mobile(), "appointmentOnly");
    expect(linked.entryMode).toBe("appointmentOnly");
    expect(isToggleOn(linked)).toBe(true);
  });

  it("turns the toggle off when the way in moves away, to a mode or to Not saying", () => {
    const on = withEntryModeLinked(mobile(), "appointmentOnly");
    expect(isToggleOn(withEntryModeLinked(on, "walkIn"))).toBe(false);
    expect(isToggleOn(withEntryModeLinked(on, null))).toBe(false);
    expect(withEntryModeLinked(on, null).entryMode).toBeNull();
  });

  it("keeps the toggle off between two other ways in", () => {
    expect(
      isToggleOn(
        withEntryModeLinked(mobile({ entryMode: "walkIn" }), "membersOnly"),
      ),
    ).toBe(false);
  });
});

describe("a place and an online listing", () => {
  it("changes the way in alone on a place, which has no appointment toggle", () => {
    const place = draftWith({ cats: ["design"] });
    const linked = withEntryModeLinked(place, "appointmentOnly");
    expect(linked.entryMode).toBe("appointmentOnly");
    expect(linked.mobileDetails).toEqual(place.mobileDetails);
  });

  it("changes the toggle alone off an out-and-about listing", () => {
    const place = draftWith({ cats: ["design"], entryMode: "walkIn" });
    expect(withByAppointmentLinked(place, true).entryMode).toBe("walkIn");
  });
});

describe("withAppointmentAnswersInStep on load and on becoming out and about", () => {
  const toggledOn = (fields: Partial<ListingDraft> = {}) =>
    mobile({
      mobileDetails: {
        ...normalizeMobileDetails(null),
        byAppointment: true,
      },
      ...fields,
    });

  it("gives the toggle's listing By appointment only when it has no way in", () => {
    const inStep = withAppointmentAnswersInStep(toggledOn({ entryMode: null }));
    expect(inStep.entryMode).toBe("appointmentOnly");
    expect(isToggleOn(inStep)).toBe(true);
  });

  it("reads a way in absent from an older draft as no way in", () => {
    const { entryMode: _entryMode, ...olderDraft } = toggledOn();
    expect(withAppointmentAnswersInStep(olderDraft).entryMode).toBe(
      "appointmentOnly",
    );
  });

  it("turns the toggle on for By appointment only while the draft keeps no hours", () => {
    const inStep = withAppointmentAnswersInStep(
      mobile({ entryMode: "appointmentOnly" }),
    );
    expect(isToggleOn(inStep)).toBe(true);
    expect(inStep.entryMode).toBe("appointmentOnly");
  });

  it("keeps the hours: leaves the pair apart", () => {
    const openTuesday = emptyHours();
    openTuesday.Tue = {
      open: true,
      intervals: [{ from: "10:00", to: "19:00" }],
    };
    const cases = [
      mobile({ entryMode: "appointmentOnly", hours: openTuesday }),
      mobile({ entryMode: "appointmentOnly", hoursNote: "Saturdays book up" }),
      mobile({
        entryMode: "appointmentOnly",
        hoursExceptions: [
          { date: "2026-12-24", open: false, intervals: [], note: "Closed" },
        ],
      }),
    ];
    for (const draft of cases) {
      const inStep = withAppointmentAnswersInStep(draft);
      expect(inStep).toBe(draft);
      expect(isToggleOn(inStep)).toBe(false);
    }
  });

  it("hands back the same object for a pair already in step or any other pair", () => {
    const cases = [
      mobile(),
      mobile({ entryMode: "walkIn" }),
      toggledOn({ entryMode: "appointmentOnly" }),
      toggledOn({ entryMode: "walkIn" }),
    ];
    for (const draft of cases) {
      expect(withAppointmentAnswersInStep(draft)).toBe(draft);
    }
  });

  it("hands back a place or an online draft untouched", () => {
    const place = draftWith({
      cats: ["design"],
      entryMode: "appointmentOnly",
    });
    const online = draftWith({
      online: true,
      cats: ["food"],
      mobileDetails: { ...normalizeMobileDetails(null), byAppointment: true },
    });
    expect(withAppointmentAnswersInStep(place)).toBe(place);
    expect(withAppointmentAnswersInStep(online)).toBe(online);
  });
});

describe("switching a draft to out and about", () => {
  it("turns the toggle on for a draft whose way in is By appointment only", () => {
    const place = draftWith({
      cats: ["grooming"],
      entryMode: "appointmentOnly",
    });
    const switched = withKind(place, "mobile");
    expect(switched.mobile).toBe(true);
    expect(isToggleOn(switched)).toBe(true);
    expect(switched.entryMode).toBe("appointmentOnly");
    expect(isToggleOn(withWhereFoundChoice(place, "mobile"))).toBe(true);
  });

  it("leaves the toggle off for any other way in", () => {
    const place = draftWith({ cats: ["grooming"], entryMode: "walkIn" });
    expect(isToggleOn(withKind(place, "mobile"))).toBe(false);
  });

  it("leaves the place's answers alone when switching back to a place", () => {
    const outAndAbout = mobile({ entryMode: "appointmentOnly" });
    expect(withKind(outAndAbout, "place").entryMode).toBe("appointmentOnly");
  });
});
