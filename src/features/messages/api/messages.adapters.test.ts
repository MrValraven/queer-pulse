import { describe, expect, it, vi, afterEach } from "vitest";
import type { MessageResponse } from "../../../shared/contracts/contracts";
import { clockLabel, messageToChat, timeLabel } from "./messages.adapters";

// A month name in either catalog language. The point of `clockLabel` is that a
// bubble NEVER shows one, however old the message is.
const MONTH_NAME =
  /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|mai|ago|set|out|dez/i;
const CLOCK = /^\d{1,2}:\d{2}(\s?[AP]M)?$/i;

const NOW = new Date("2026-09-14T12:00:00Z");
const TODAY = "2026-09-14T09:14:00Z";
const LAST_MONTH = "2026-08-13T20:41:00Z";

function messageAt(createdAt: string): MessageResponse {
  return {
    id: "m1",
    body: "I love you",
    createdAt,
    sender: { handle: "jordan", displayName: "Jordan Park" },
  } as MessageResponse;
}

afterEach(() => {
  vi.useRealTimers();
});

describe("clockLabel", () => {
  it("gives a wall-clock time for a message from today", () => {
    expect(clockLabel(TODAY)).toMatch(CLOCK);
  });

  it("gives the SAME shape for a month-old message — never a date", () => {
    expect(clockLabel(LAST_MONTH)).toMatch(CLOCK);
    expect(clockLabel(LAST_MONTH)).not.toMatch(MONTH_NAME);
  });

  it("is empty for an unparseable timestamp", () => {
    expect(clockLabel("not-a-date")).toBe("");
  });
});

describe("messageToChat", () => {
  it("labels an old bubble with its time of day, not its date (FE-MSG-41)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    const bubble = messageToChat(messageAt(LAST_MONTH), null);
    expect(bubble.time).toMatch(CLOCK);
    expect(bubble.time).not.toMatch(MONTH_NAME);
  });
});

describe("timeLabel", () => {
  // The INBOX row keeps its ageing label — that's what the day separator can't
  // do for a one-line list row.
  it("still collapses an old inbox row to a date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    expect(timeLabel(LAST_MONTH)).toMatch(MONTH_NAME);
  });

  it("still shows a clock time for a row touched today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    expect(timeLabel(TODAY)).toMatch(CLOCK);
  });
});
