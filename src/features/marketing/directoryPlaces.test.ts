import { describe, it, expect } from "vitest";
import {
  openStatus,
  upcomingHoursExceptions,
  type ListingHoursException,
} from "./directoryPlaces";

const at = (dayOffset: number, hour: number, minute = 0) => {
  // 2026-06-01 is a Monday; add `dayOffset` days, set the clock.
  return new Date(2026, 5, 1 + dayOffset, hour, minute);
};

describe("openStatus", () => {
  it("returns unknown when no hours are set", () => {
    expect(openStatus(undefined, at(4, 20)).state).toBe("unknown");
    expect(openStatus({}, at(4, 20)).state).toBe("unknown");
  });
  it("is open inside a normal same-day window", () => {
    const hours = {
      Fri: { open: true, intervals: [{ from: "18:00", to: "23:00" }] },
    };
    expect(openStatus(hours, at(4, 20)).state).toBe("open"); // Fri 20:00
  });
  it("is closed before opening and on a closed day", () => {
    const hours = {
      Fri: { open: true, intervals: [{ from: "18:00", to: "23:00" }] },
    };
    expect(openStatus(hours, at(4, 12)).state).toBe("closed"); // Fri 12:00
    expect(openStatus(hours, at(0, 20)).state).toBe("closed"); // Mon
  });
  it("handles a window that closes after midnight", () => {
    const hours = {
      Fri: { open: true, intervals: [{ from: "18:00", to: "02:00" }] },
    };
    expect(openStatus(hours, at(5, 1)).state).toBe("open"); // Sat 01:00
  });
  it("respects a lunch-break split (closed between two windows)", () => {
    const hours = {
      Fri: {
        open: true,
        intervals: [
          { from: "12:00", to: "15:00" },
          { from: "19:00", to: "23:00" },
        ],
      },
    };
    expect(openStatus(hours, at(4, 13)).state).toBe("open"); // Fri 13:00
    expect(openStatus(hours, at(4, 17)).state).toBe("closed"); // Fri 17:00 (break)
    expect(openStatus(hours, at(4, 20)).state).toBe("open"); // Fri 20:00
  });
  it("still heals a legacy {open,from,to} row at runtime", () => {
    // Older stored rows may not be migrated yet; openStatus normalizes first.
    const legacy = { Fri: { open: true, from: "18:00", to: "23:00" } } as never;
    expect(openStatus(legacy, at(4, 20)).state).toBe("open");
  });
});

/** An hours exception for one date. `open: false` means closed that day. */
const exception = (
  date: string,
  overrides: Partial<ListingHoursException> = {},
): ListingHoursException => ({
  date,
  open: false,
  intervals: [],
  note: "",
  ...overrides,
});

// 2026-06-05 is the Friday `at(4, …)` lands on, and 2026-06-06 the Saturday.
const FRIDAY = "2026-06-05";
const SATURDAY = "2026-06-06";

describe("openStatus with hours exceptions", () => {
  const fridayEvening = {
    Fri: { open: true, intervals: [{ from: "18:00", to: "23:00" }] },
  };

  it("lets a closure exception win over the weekday grid", () => {
    // Fridays are normally open 18:00–23:00, but this Friday is a closure.
    // Reading "open" off the weekday row here is the exact bug exceptions exist
    // to prevent (the Christmas Eve case).
    expect(
      openStatus(fridayEvening, at(4, 20), [exception(FRIDAY)]).state,
    ).toBe("closed");
  });

  it("ignores an exception dated some other day", () => {
    expect(
      openStatus(fridayEvening, at(4, 20), [exception(SATURDAY)]).state,
    ).toBe("open");
  });

  it("applies special hours from an exception instead of the weekday row", () => {
    const specialHours = [
      exception(FRIDAY, {
        open: true,
        intervals: [{ from: "12:00", to: "14:00" }],
        note: "Pride brunch only",
      }),
    ];
    // Inside the special window, even though the weekday row is closed at 13:00.
    expect(openStatus(fridayEvening, at(4, 13), specialHours).state).toBe(
      "open",
    );
    // Outside it, even though the weekday row is open at 20:00.
    expect(openStatus(fridayEvening, at(4, 20), specialHours).state).toBe(
      "closed",
    );
  });

  it("lets a closure exception cancel an overnight window from the day before", () => {
    const lateBar = {
      Fri: { open: true, intervals: [{ from: "18:00", to: "02:00" }] },
    };
    // Saturday 01:00 sits in Friday's overnight tail, so FRIDAY's exception is
    // the one that governs it.
    expect(openStatus(lateBar, at(5, 1), [exception(FRIDAY)]).state).toBe(
      "closed",
    );
    expect(openStatus(lateBar, at(5, 1)).state).toBe("open");
  });

  it("reports closed for an exception even when no weekday hours exist at all", () => {
    expect(openStatus(undefined, at(4, 20), [exception(FRIDAY)]).state).toBe(
      "closed",
    );
  });
});

describe("openStatus closing-soon", () => {
  const fridayEvening = {
    Fri: { open: true, intervals: [{ from: "18:00", to: "23:00" }] },
  };

  it("flags the last hour before closing", () => {
    const status = openStatus(fridayEvening, at(4, 22, 30));
    expect(status.state).toBe("open");
    expect(status.isClosingSoon).toBe(true);
    expect(status.closesAt).toBe("23:00");
  });

  it("does not flag a venue with hours left to run", () => {
    const status = openStatus(fridayEvening, at(4, 20));
    expect(status.state).toBe("open");
    expect(status.isClosingSoon).toBe(false);
    expect(status.closesAt).toBe("23:00");
  });

  it("counts an overnight window's remaining time across midnight", () => {
    // `to <= from` closes the NEXT day: at 23:45 a 00:30 close is 45 minutes
    // away, not fifteen hours in the past.
    const nearlyMidnight = {
      Fri: { open: true, intervals: [{ from: "18:00", to: "00:30" }] },
    };
    expect(openStatus(nearlyMidnight, at(4, 23, 45)).isClosingSoon).toBe(true);
    // Same window earlier in the evening: 02:00 close is still hours away.
    const lateBar = {
      Fri: { open: true, intervals: [{ from: "18:00", to: "02:00" }] },
    };
    expect(openStatus(lateBar, at(4, 23, 30)).isClosingSoon).toBe(false);
    // And in the small hours it is the tail of yesterday's window that counts.
    expect(openStatus(lateBar, at(5, 1, 30)).isClosingSoon).toBe(true);
  });

  it("flags a venue closing soon under an exception's special hours too", () => {
    const specialHours = [
      exception(FRIDAY, {
        open: true,
        intervals: [{ from: "12:00", to: "14:00" }],
      }),
    ];
    const status = openStatus(fridayEvening, at(4, 13, 30), specialHours);
    expect(status.isClosingSoon).toBe(true);
    expect(status.closesAt).toBe("14:00");
  });

  it("never flags a closed venue", () => {
    const status = openStatus(fridayEvening, at(4, 12));
    expect(status.state).toBe("closed");
    expect(status.isClosingSoon).toBe(false);
    expect(status.closesAt).toBe(null);
  });
});

describe("upcomingHoursExceptions", () => {
  it("drops past dates, keeps today, and orders by date", () => {
    const upcoming = upcomingHoursExceptions(
      [
        exception("2026-06-24"),
        exception("2026-06-01"), // already passed
        exception(FRIDAY), // today
        exception("2026-06-10"),
      ],
      at(4, 20),
    );
    expect(upcoming.map((entry) => entry.date)).toEqual([
      FRIDAY,
      "2026-06-10",
      "2026-06-24",
    ]);
  });

  it("caps the list", () => {
    const many = ["2026-06-10", "2026-06-11", "2026-06-12", "2026-06-13"].map(
      (date) => exception(date),
    );
    expect(upcomingHoursExceptions(many, at(4, 20), 2)).toHaveLength(2);
  });

  it("returns nothing when there are no exceptions", () => {
    expect(upcomingHoursExceptions(undefined, at(4, 20))).toEqual([]);
    expect(upcomingHoursExceptions([], at(4, 20))).toEqual([]);
  });
});
