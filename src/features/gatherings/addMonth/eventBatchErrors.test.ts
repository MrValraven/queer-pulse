import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { TFunction } from "../../../shared/i18n/types";
import { EVENT_BATCH_MAX_ROWS } from "./addMonth.data";
import {
  EVENT_BATCH_COMMUNITY_ONLY_UNNAMED_KEY,
  EVENT_BATCH_FAILURE_KEYS,
  EVENT_BATCH_READ_FAILURE_KEYS,
  EVENT_BATCH_UNDATED_FAILURE_KEYS,
  eventBatchFailureOf,
  eventBatchFailureText,
  type EventBatchFailure,
} from "./eventBatchErrors";

const coded = (status: number, code: string, extra: object = {}) =>
  new ApiError(status, "x", {
    statusCode: status,
    code,
    message: "x",
    ...extra,
  });
const rowKeys = { rowIndex: 2, field: "date", date: "2026-11-21" };

/** A `t` that echoes the key and the values it was handed. */
const echoTranslate = (): TFunction =>
  vi.fn(
    (key: string, values?: Record<string, unknown>) =>
      `${key}|${JSON.stringify(values ?? {})}`,
  );

describe("eventBatchFailureOf", () => {
  it.each([
    [new ApiError(404, "This feature is not available yet."), "noAccess"],
    [coded(404, "EVENT_BATCH_TEMPLATE_NOT_FOUND"), "templateNotFound"],
    [
      coded(409, "EVENT_BATCH_TEMPLATE_COMMUNITY_ONLY", {
        communityName: "Queer Runners",
      }),
      "communityOnly",
    ],
    [coded(400, "EVENT_BATCH_TOO_MANY_DATES", { limit: 31 }), "tooManyDates"],
    [coded(400, "EVENT_BATCH_DUPLICATE_DATE", rowKeys), "duplicateDate"],
    [
      coded(400, "EVENT_BATCH_DATE_IN_PAST", {
        ...rowKeys,
        field: "startTime",
      }),
      "dateInPast",
    ],
    [
      coded(400, "EVENT_BATCH_DATE_TOO_FAR", {
        ...rowKeys,
        lastDate: "2027-11-02",
      }),
      "dateTooFar",
    ],
    [
      coded(400, "EVENT_BATCH_ROW_INVALID", { ...rowKeys, field: "endTime" }),
      "rowInvalid",
    ],
    [
      coded(400, "EVENT_BATCH_VENUE_NOT_FOUND", { field: "listingId" }),
      "venueNotFound",
    ],
    [coded(403, "ACCOUNT_RESTRICTED"), "restricted"],
    [coded(403, "UPLOAD_NOT_YOURS"), "coverNotYours"],
    [coded(403, "ACTIVE_MEMBERSHIP_REQUIRED"), "membershipInactive"],
    [coded(403, "CSRF_REJECTED"), "refused"],
    [new ApiError(403, "Forbidden resource"), "refused"],
    [new ApiError(429, "ThrottlerException"), "rateLimited"],
    [new ApiError(400, "title must be shorter"), "invalid"],
    [coded(400, "SOMETHING_ELSE"), "invalid"],
    [new ApiError(413, "request entity too large"), "tooLarge"],
    [new ApiError(401, "x"), "signedOut"],
    [new TypeError("Failed to fetch"), "unreachable"],
    [new ApiError(408, "Request timed out"), "timedOut"],
    [new ApiError(409, "x"), "refused"],
    [new ApiError(502, "x"), "server"],
    [new ApiError(418, "x"), "refused"],
  ])("names %s as %s", (error, reason) => {
    expect(eventBatchFailureOf(error, { isOffline: false }).reason).toBe(
      reason,
    );
  });

  it("names the 403 cover and membership refusals by their machine codes only", () => {
    expect(
      eventBatchFailureOf(coded(403, "UPLOAD_NOT_YOURS"), { isOffline: false })
        .reason,
    ).toBe("coverNotYours");
    expect(
      eventBatchFailureOf(coded(403, "ACTIVE_MEMBERSHIP_REQUIRED"), {
        isOffline: false,
      }).reason,
    ).toBe("membershipInactive");
    expect(
      eventBatchFailureOf(
        new ApiError(403, "Referenced upload does not belong to you"),
        { isOffline: false },
      ).reason,
    ).toBe("refused");
    expect(
      eventBatchFailureOf(new ApiError(403, "Active membership required"), {
        isOffline: false,
      }).reason,
    ).toBe("refused");
    expect(
      eventBatchFailureOf(new ApiError(403, "Forbidden resource"), {
        isOffline: false,
      }).reason,
    ).toBe("refused");
  });

  it("reports offline first whenever the browser has no network", () => {
    expect(
      eventBatchFailureOf(new ApiError(500, "x"), { isOffline: true }).reason,
    ).toBe("offline");
  });

  it("carries the row keys of a row-coded error", () => {
    expect(
      eventBatchFailureOf(
        coded(400, "EVENT_BATCH_DATE_IN_PAST", {
          ...rowKeys,
          field: "startTime",
        }),
        { isOffline: false },
      ).rowError,
    ).toEqual({
      code: "EVENT_BATCH_DATE_IN_PAST",
      rowIndex: 2,
      field: "startTime",
      date: "2026-11-21",
    });
  });

  it("reads a row-coded body with a missing rowIndex as a failure with no row", () => {
    expect(
      eventBatchFailureOf(coded(400, "EVENT_BATCH_DUPLICATE_DATE"), {
        isOffline: false,
      }).rowError,
    ).toBeNull();
  });

  it("carries the limit, the last date and the community name", () => {
    expect(
      eventBatchFailureOf(
        coded(400, "EVENT_BATCH_TOO_MANY_DATES", { limit: 31 }),
        {
          isOffline: false,
        },
      ).limit,
    ).toBe(31);
    expect(
      eventBatchFailureOf(
        coded(400, "EVENT_BATCH_DATE_TOO_FAR", {
          ...rowKeys,
          lastDate: "2027-11-02",
        }),
        { isOffline: false },
      ).lastDate,
    ).toBe("2027-11-02");
    expect(
      eventBatchFailureOf(
        coded(409, "EVENT_BATCH_TEMPLATE_COMMUNITY_ONLY", {
          communityName: "Queer Runners",
        }),
        { isOffline: false },
      ).communityName,
    ).toBe("Queer Runners");
  });
});

describe("EVENT_BATCH_FAILURE_KEYS", () => {
  it("gives every reason a catalog key under gatherings:addMonth.error", () => {
    for (const key of Object.values(EVENT_BATCH_FAILURE_KEYS))
      expect(key).toMatch(/^gatherings:addMonth\.error\.[a-zA-Z]+$/);
    for (const key of Object.values(EVENT_BATCH_READ_FAILURE_KEYS))
      expect(key).toMatch(/^gatherings:addMonth\.error\.read\.[a-zA-Z]+$/);
    for (const key of Object.values(EVENT_BATCH_UNDATED_FAILURE_KEYS))
      expect(key).toMatch(/^gatherings:addMonth\.error\.plain\.[a-zA-Z]+$/);
    expect(EVENT_BATCH_COMMUNITY_ONLY_UNNAMED_KEY).toMatch(
      /^gatherings:addMonth\.error\.[a-zA-Z]+$/,
    );
  });
});

describe("eventBatchFailureText", () => {
  it("fills the date, last date, limit, community and status into the copy", () => {
    const translate = echoTranslate();
    const failure: EventBatchFailure = {
      reason: "dateTooFar",
      status: 400,
      rowError: {
        code: "EVENT_BATCH_DATE_TOO_FAR",
        rowIndex: 2,
        field: "date",
        date: "2026-11-21",
      },
      communityName: "Queer Runners",
      limit: 31,
      lastDate: "2027-11-02",
    };
    const text = eventBatchFailureText(
      failure,
      translate,
      (date) => `D(${date})`,
    );
    expect(text).toContain("gatherings:addMonth.error.dateTooFar|");
    expect(text).toContain('"date":"D(2026-11-21)"');
    expect(text).toContain('"lastDate":"D(2027-11-02)"');
    expect(text).toContain('"limit":31');
    expect(text).toContain('"communityName":"Queer Runners"');
    expect(text).toContain('"status":400');
  });

  it("fills the dates of a server row error through formatDate", () => {
    const translate = echoTranslate();
    const text = eventBatchFailureText(
      eventBatchFailureOf(
        coded(400, "EVENT_BATCH_DATE_TOO_FAR", {
          ...rowKeys,
          lastDate: "2027-11-02",
        }),
        { isOffline: false },
      ),
      translate,
      (date) => `D(${date})`,
    );
    expect(text).toContain('"date":"D(2026-11-21)"');
    expect(text).toContain('"lastDate":"D(2027-11-02)"');
  });

  it("names the refused status in the copy", () => {
    const translate = echoTranslate();
    const text = eventBatchFailureText(
      eventBatchFailureOf(new ApiError(418, "x"), { isOffline: false }),
      translate,
      (date) => date,
    );
    expect(text).toContain("gatherings:addMonth.error.refused|");
    expect(text).toContain('"status":418');
  });

  it("uses the unnamed copy when the community-only body names no community", () => {
    const translate = echoTranslate();
    for (const communityName of [null, ""]) {
      const text = eventBatchFailureText(
        eventBatchFailureOf(
          coded(409, "EVENT_BATCH_TEMPLATE_COMMUNITY_ONLY", { communityName }),
          { isOffline: false },
        ),
        translate,
        (date) => date,
      );
      expect(text).toContain(`${EVENT_BATCH_COMMUNITY_ONLY_UNNAMED_KEY}|`);
    }
  });

  it("uses the named copy when the community-only body names the community", () => {
    const translate = echoTranslate();
    const text = eventBatchFailureText(
      eventBatchFailureOf(
        coded(409, "EVENT_BATCH_TEMPLATE_COMMUNITY_ONLY", {
          communityName: "Queer Runners",
        }),
        { isOffline: false },
      ),
      translate,
      (date) => date,
    );
    expect(text).toContain("gatherings:addMonth.error.communityOnly|");
    expect(text).toContain('"communityName":"Queer Runners"');
  });
});

describe("eventBatchFailureOf with an unreadable answer", () => {
  const unreadable = () =>
    new ApiError(
      422,
      "Malformed JSON in response from /events/batch",
      "<html>",
    );

  it("names an unreadable publish answer as a month that may be published", () => {
    const failure = eventBatchFailureOf(unreadable(), {
      isOffline: false,
      context: "publish",
    });
    expect(failure.reason).toBe("unreadableAnswer");
    expect(
      eventBatchFailureText(failure, echoTranslate(), (date) => date),
    ).toContain("gatherings:addMonth.error.unreadableAnswer|");
  });

  it("keeps an unreadable read answer as a refusal", () => {
    expect(
      eventBatchFailureOf(unreadable(), { isOffline: false, context: "read" })
        .reason,
    ).toBe("refused");
    expect(eventBatchFailureOf(unreadable(), { isOffline: false }).reason).toBe(
      "refused",
    );
  });
});

describe("eventBatchFailureText by context", () => {
  const textFor = (
    error: unknown,
    context: "read" | "publish",
    isOffline = false,
  ) =>
    eventBatchFailureText(
      eventBatchFailureOf(error, { isOffline }),
      echoTranslate(),
      (date) => date,
      context,
    );

  it("names an offline read with the read copy and an offline publish with the publish copy", () => {
    const error = new TypeError("Failed to fetch");
    expect(textFor(error, "read", true)).toContain(
      "gatherings:addMonth.error.read.offline|",
    );
    expect(textFor(error, "publish", true)).toContain(
      "gatherings:addMonth.error.offline|",
    );
  });

  it("names a throttled read with the read copy and a throttled publish with the publish copy", () => {
    const error = new ApiError(429, "ThrottlerException");
    expect(textFor(error, "read")).toContain(
      "gatherings:addMonth.error.read.rateLimited|",
    );
    expect(textFor(error, "publish")).toContain(
      "gatherings:addMonth.error.rateLimited|",
    );
  });

  it("names a timed out publish as possibly published and a timed out read as slow", () => {
    const error = new ApiError(408, "Request timed out");
    expect(textFor(error, "publish")).toContain(
      "gatherings:addMonth.error.timedOut|",
    );
    expect(textFor(error, "read")).toContain(
      "gatherings:addMonth.error.read.timedOut|",
    );
  });

  it("publishes with the publish copy when no context is given", () => {
    const text = eventBatchFailureText(
      eventBatchFailureOf(new ApiError(503, "x"), { isOffline: false }),
      echoTranslate(),
      (date) => date,
    );
    expect(text).toContain("gatherings:addMonth.error.server|");
  });

  it("keeps one key for both contexts on a reason with no read copy", () => {
    const error = coded(404, "EVENT_BATCH_TEMPLATE_NOT_FOUND");
    expect(textFor(error, "read")).toContain(
      "gatherings:addMonth.error.templateNotFound|",
    );
    expect(textFor(error, "publish")).toContain(
      "gatherings:addMonth.error.templateNotFound|",
    );
  });
});

describe("eventBatchFailureText with missing values", () => {
  it("falls back to copy without a placeholder when a body lacks its date, last date or limit", () => {
    const textOf = (error: unknown) =>
      eventBatchFailureText(
        eventBatchFailureOf(error, { isOffline: false }),
        echoTranslate(),
        (date) => `D(${date})`,
      );
    expect(textOf(coded(400, "EVENT_BATCH_DUPLICATE_DATE"))).toContain(
      "gatherings:addMonth.error.plain.duplicateDate|",
    );
    expect(textOf(coded(400, "EVENT_BATCH_DATE_IN_PAST"))).toContain(
      "gatherings:addMonth.error.plain.dateInPast|",
    );
    expect(textOf(coded(400, "EVENT_BATCH_ROW_INVALID"))).toContain(
      "gatherings:addMonth.error.plain.rowInvalid|",
    );
    expect(textOf(coded(400, "EVENT_BATCH_DATE_TOO_FAR", rowKeys))).toContain(
      "gatherings:addMonth.error.plain.dateTooFar|",
    );
    const tooMany = textOf(coded(400, "EVENT_BATCH_TOO_MANY_DATES"));
    expect(tooMany).toContain("gatherings:addMonth.error.tooManyDates|");
    expect(tooMany).toContain(`"limit":${EVENT_BATCH_MAX_ROWS}`);
  });
});
