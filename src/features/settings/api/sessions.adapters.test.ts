import { describe, expect, it } from "vitest";
import { catalogs } from "../../../shared/i18n/catalogs";
import { resolveEntry } from "../../../shared/i18n/translate";
import { createFormatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import {
  deviceLabelFor,
  deviceTypeFromUserAgent,
  sessionResponseToSession,
  signedInAgo,
} from "./sessions.adapters";
import type { SessionResponse } from "./account.api";

/** A real (English) `t`, resolved against the shipped catalog — so this test
 * asserts against the actual translated copy rather than a duplicated literal. */
const t: TFunction = (key, options) => {
  const path = key.startsWith("settings:")
    ? key.slice("settings:".length)
    : key;
  return resolveEntry(catalogs.en.settings, path, "en", options) ?? key;
};
const fmt = createFormatters("en");

const MAC_SAFARI =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const WIN_CHROME =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36";
const WIN_EDGE = `${WIN_CHROME} Edg/138.0.0.0`;

function response(over: Partial<SessionResponse> = {}): SessionResponse {
  return {
    id: "0f5b8b3e-0000-4000-8000-000000000001",
    deviceLabel: null,
    userAgent: MAC_SAFARI,
    current: false,
    createdAt: "2026-07-16T09:00:00.000Z",
    expiresAt: "2026-08-16T09:00:00.000Z",
    ...over,
  };
}

describe("deviceTypeFromUserAgent", () => {
  it("reads phones and tablets as mobile", () => {
    expect(deviceTypeFromUserAgent(IPHONE_SAFARI)).toBe("mobile");
  });

  it("reads desktop UAs as desktop", () => {
    expect(deviceTypeFromUserAgent(MAC_SAFARI)).toBe("desktop");
    expect(deviceTypeFromUserAgent(WIN_CHROME)).toBe("desktop");
  });

  it("falls back to desktop on an empty UA rather than throwing", () => {
    expect(deviceTypeFromUserAgent("")).toBe("desktop");
  });
});

describe("deviceLabelFor", () => {
  it("prefers the backend's deviceLabel when it ever starts sending one", () => {
    expect(deviceLabelFor(response({ deviceLabel: "Ana's laptop" }))).toBe(
      "Ana's laptop",
    );
  });

  it("derives platform · browser from the UA when deviceLabel is null", () => {
    expect(deviceLabelFor(response())).toBe("macOS · Safari");
    expect(deviceLabelFor(response({ userAgent: IPHONE_SAFARI }))).toBe(
      "iPhone · Safari",
    );
  });

  it("does not let Chrome's UA string win over Edge", () => {
    expect(deviceLabelFor(response({ userAgent: WIN_EDGE }))).toBe(
      "Windows · Edge",
    );
  });

  it("says 'Unknown device' rather than guessing when the UA is empty", () => {
    expect(deviceLabelFor(response({ userAgent: "" }))).toBe("Unknown device");
  });
});

describe("signedInAgo", () => {
  const now = Date.parse("2026-07-16T12:00:00.000Z");

  it("formats sub-minute, minute, hour and day distances", () => {
    expect(signedInAgo("2026-07-16T11:59:40.000Z", t, fmt, now)).toBe(
      "just now",
    );
    expect(signedInAgo("2026-07-16T11:59:00.000Z", t, fmt, now)).toBe(
      "1 minute ago",
    );
    expect(signedInAgo("2026-07-16T11:30:00.000Z", t, fmt, now)).toBe(
      "30 minutes ago",
    );
    expect(signedInAgo("2026-07-16T11:00:00.000Z", t, fmt, now)).toBe(
      "1 hour ago",
    );
    expect(signedInAgo("2026-07-16T08:00:00.000Z", t, fmt, now)).toBe(
      "4 hours ago",
    );
    expect(signedInAgo("2026-07-08T12:00:00.000Z", t, fmt, now)).toBe(
      "8 days ago",
    );
  });

  it("clamps a future timestamp to 'just now' instead of a negative age", () => {
    expect(signedInAgo("2026-07-16T12:05:00.000Z", t, fmt, now)).toBe(
      "just now",
    );
  });

  it("returns 'unknown' for an unparseable timestamp", () => {
    expect(signedInAgo("not-a-date", t, fmt, now)).toBe("unknown");
  });
});

describe("sessionResponseToSession", () => {
  const now = Date.parse("2026-07-16T12:00:00.000Z");

  it("maps a live row onto the page's Session shape", () => {
    expect(sessionResponseToSession(response(), t, fmt, now)).toEqual({
      id: "0f5b8b3e-0000-4000-8000-000000000001",
      device: "macOS · Safari",
      variant: "normal",
      deviceType: "desktop",
      signedIn: "3 hours ago",
    });
  });

  it("badges the presenting session as current", () => {
    expect(
      sessionResponseToSession(response({ current: true }), t, fmt, now)
        .variant,
    ).toBe("current");
  });

  // The point of the whole workstream: the backend's refresh-token store has no
  // location, no last-seen and no risk signal, so the adapter must leave those
  // blank rather than fabricate a plausible-looking one.
  it("invents no location and no last activity", () => {
    const session = sessionResponseToSession(response(), t, fmt, now);
    expect(session.location).toBeUndefined();
    expect(session.lastActivity).toBeUndefined();
    expect(session.extra).toBeUndefined();
  });

  it("never badges a live session as suspect — there is no such signal", () => {
    for (const current of [true, false]) {
      expect(
        sessionResponseToSession(response({ current }), t, fmt, now).variant,
      ).not.toBe("suspect");
    }
  });
});
