import { describe, expect, it } from "vitest";
import { createFormatters } from "../../../shared/i18n/format";
import { interpolate } from "../../../shared/i18n/translate";
import type { TFunction, TranslateOptions } from "../../../shared/i18n/types";
import { amountRangeLabel, callDeadlineCopy } from "./fundingFormat";

const fmt = createFormatters("en");
const STRINGS: Record<string, string> = {
  "forum:funding.amount.range": "{min} to {max}",
  "forum:funding.amount.upTo": "Up to {max}",
  "forum:funding.amount.from": "From {min}",
};
const t: TFunction = (key: string, values?: TranslateOptions) =>
  interpolate(STRINGS[key] ?? key, values);
const NOW = Date.parse("2026-07-20T12:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;

describe("fundingFormat", () => {
  it("labels whole-euro amounts and ranges", () => {
    expect(amountRangeLabel(t, fmt, 500, 2000)).toBe("€500 to €2,000");
    expect(amountRangeLabel(t, fmt, null, 2000)).toBe("Up to €2,000");
    expect(amountRangeLabel(t, fmt, 500, null)).toBe("From €500");
    expect(amountRangeLabel(t, fmt, 750, 750)).toBe("€750");
    expect(amountRangeLabel(t, fmt, null, null)).toBeNull();
  });

  it("gives a closing call an accent countdown with a count", () => {
    const copy = callDeadlineCopy(
      fmt,
      {
        deadline: new Date(NOW + 3 * DAY_MS + 3600_000).toISOString(),
        callState: "closing",
        updatedAt: "2026-07-01T00:00:00.000Z",
      },
      NOW,
    );
    expect(copy).toEqual({
      key: "forum:funding.deadline.closesInDays",
      values: { count: 3 },
      count: 3,
      tone: "accent",
    });
  });

  it("mutes a closed call and a stale rolling call", () => {
    expect(
      callDeadlineCopy(
        fmt,
        {
          deadline: "2026-07-01T00:00:00.000Z",
          callState: "closed",
          updatedAt: "2026-06-01T00:00:00.000Z",
        },
        NOW,
      )?.tone,
    ).toBe("muted");
    expect(
      callDeadlineCopy(
        fmt,
        {
          deadline: null,
          callState: "stale",
          updatedAt: "2025-12-01T00:00:00.000Z",
        },
        NOW,
      )?.key,
    ).toBe("forum:funding.deadline.stale");
  });

  it("closes a call the server still calls open once its deadline has passed", () => {
    const copy = callDeadlineCopy(
      fmt,
      {
        deadline: new Date(NOW - 1000).toISOString(),
        callState: "closing",
        updatedAt: "2026-07-01T00:00:00.000Z",
      },
      NOW,
    );
    expect(copy?.key).toBe("forum:funding.deadline.closed");
  });

  it("says nothing about the deadline of something that is no call", () => {
    expect(
      callDeadlineCopy(
        fmt,
        {
          deadline: null,
          callState: null,
          updatedAt: "2026-07-01T00:00:00.000Z",
        },
        NOW,
      ),
    ).toBeNull();
  });
});
