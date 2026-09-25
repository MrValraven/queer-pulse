import { describe, expect, it } from "vitest";
import type { Formatters } from "../../../../../shared/i18n/format";
import type { TFunction } from "../../../../../shared/i18n/types";
import type {
  OwnerListingHistoryDTO,
  OwnerListingHistoryEventDTO,
} from "../../api/listingHistory.api";
import {
  DEMO_OWNER_LISTING_HISTORY_EVENTS,
  flattenHistoryPages,
  getDemoOwnerListingHistory,
  nextHistoryPage,
} from "../../api/ownerListingHistory.data";
import {
  changedFieldLabelKeys,
  historyActorLabel,
  describeHistoryEvent,
  historyWhen,
  LISTING_DETAILS_FIELD_KEY,
  type HistoryTextFormat,
} from "./listingHistory.data";

const PREFIX = "marketing:listBusiness.editor.history";

/** Echoes the key with its options, so a test reads what was asked for. */
const echoTranslate: TFunction = (key, options) =>
  options ? `${key} ${JSON.stringify(options)}` : key;

const testFormat: HistoryTextFormat = {
  joinList: (items) => items.join(" + "),
};

/** Formatters that return the name of the branch taken. */
const testFormatters = {
  relativeTime: () => "relative",
  date: (_value: Date | number, options?: Intl.DateTimeFormatOptions) =>
    `date:${Object.keys(options ?? {}).join(",")}`,
} as unknown as Formatters;

const JOIN_REASON =
  "Joana Reis accepted an invitation to co-manage this listing.";
const LEAVE_REASON = "Joana Reis stepped down as a co-manager of this listing.";

function makeEvent(
  overrides: Partial<OwnerListingHistoryEventDTO>,
): OwnerListingHistoryEventDTO {
  return {
    id: "event-1",
    action: "owner_edited",
    actor: { kind: "moderation" },
    fromStatus: null,
    toStatus: null,
    reason: null,
    changedFields: null,
    hasModeratorNote: false,
    createdAt: "2026-09-01T10:00:00.000Z",
    ...overrides,
  };
}

function makePage(
  events: OwnerListingHistoryEventDTO[],
  page: number,
  totalEvents: number,
  pageSize = 2,
): OwnerListingHistoryDTO {
  return { events, questions: [], totalEvents, page, pageSize };
}

describe("changedFieldLabelKeys", () => {
  it("collapses the three location columns into one map pin label", () => {
    expect(
      changedFieldLabelKeys(["address", "geocoded", "latitude", "longitude"]),
    ).toEqual([`${PREFIX}.field.address`, `${PREFIX}.field.mapPin`]);
  });

  it("names the listing details when no fields were recorded", () => {
    expect(changedFieldLabelKeys(null)).toEqual([LISTING_DETAILS_FIELD_KEY]);
    expect(changedFieldLabelKeys([])).toEqual([LISTING_DETAILS_FIELD_KEY]);
  });

  it("reads an unknown field as the listing details, once", () => {
    expect(
      changedFieldLabelKeys(["hours", "somethingNew", "constructor"]),
    ).toEqual([`${PREFIX}.field.hours`, LISTING_DETAILS_FIELD_KEY]);
  });

  it("covers the suggestion targets", () => {
    expect(changedFieldLabelKeys(["hoursNote", "tagline", "social"])).toEqual([
      `${PREFIX}.field.hoursNote`,
      `${PREFIX}.field.tagline`,
      `${PREFIX}.field.social`,
    ]);
  });
});

describe("historyActorLabel", () => {
  it("names a team member in full", () => {
    expect(
      historyActorLabel(
        {
          kind: "team",
          member: { slug: "rita", firstName: "Rita", lastName: "Almeida" },
        },
        echoTranslate,
      ),
    ).toBe("Rita Almeida");
  });

  it("falls back when the team member's account is gone", () => {
    expect(
      historyActorLabel({ kind: "team", member: null }, echoTranslate),
    ).toBe(`${PREFIX}.actor.unknownTeamMember`);
  });

  it("keeps a previous team member and moderation anonymous", () => {
    expect(historyActorLabel({ kind: "previous_team" }, echoTranslate)).toBe(
      `${PREFIX}.actor.previousTeam`,
    );
    expect(historyActorLabel({ kind: "moderation" }, echoTranslate)).toBe(
      `${PREFIX}.actor.moderation`,
    );
  });
});

describe("describeHistoryEvent", () => {
  it("lists the fields an owner edit changed", () => {
    expect(
      describeHistoryEvent(
        makeEvent({
          actor: { kind: "previous_team" },
          changedFields: ["hours", "address"],
        }),
        echoTranslate,
        testFormat,
      ),
    ).toEqual({
      kind: "catalog",
      key: `${PREFIX}.event.ownerEdited`,
      values: {
        actor: `${PREFIX}.actor.previousTeam`,
        fields: `${PREFIX}.field.hours + ${PREFIX}.field.address`,
      },
    });
  });

  it("composes its own sentence when a team member joins", () => {
    expect(
      describeHistoryEvent(
        makeEvent({
          action: "co_manager_added",
          actor: { kind: "previous_team" },
          reason: JOIN_REASON,
        }),
        echoTranslate,
        testFormat,
      ),
    ).toMatchObject({ kind: "catalog", key: `${PREFIX}.event.coManagerAdded` });
  });

  it("shows the platform text for a join whose actor reads as moderation", () => {
    expect(
      describeHistoryEvent(
        makeEvent({
          action: "co_manager_added",
          actor: { kind: "moderation" },
          reason: JOIN_REASON,
        }),
        echoTranslate,
        testFormat,
      ),
    ).toEqual({ kind: "platform", text: JOIN_REASON });
    expect(
      describeHistoryEvent(
        makeEvent({
          action: "co_manager_added",
          actor: { kind: "moderation" },
          reason: null,
        }),
        echoTranslate,
        testFormat,
      ),
    ).toMatchObject({ kind: "catalog", key: `${PREFIX}.event.teamChanged` });
  });

  it("shows the platform text when a co-manager leaves", () => {
    expect(
      describeHistoryEvent(
        makeEvent({ action: "co_manager_removed", reason: LEAVE_REASON }),
        echoTranslate,
        testFormat,
      ),
    ).toEqual({ kind: "platform", text: LEAVE_REASON });
  });

  it("falls back to its own sentence when a removal has no reason", () => {
    expect(
      describeHistoryEvent(
        makeEvent({
          action: "co_manager_removed",
          actor: { kind: "previous_team" },
          reason: null,
        }),
        echoTranslate,
        testFormat,
      ),
    ).toEqual({
      kind: "catalog",
      key: `${PREFIX}.event.teamChanged`,
      values: { actor: `${PREFIX}.actor.previousTeam` },
    });
  });

  it("gives each target status its own sentence", () => {
    const keyFor = (toStatus: "review" | "question" | "live") =>
      describeHistoryEvent(
        makeEvent({ action: "status_changed", fromStatus: "review", toStatus }),
        echoTranslate,
        testFormat,
      );
    expect(keyFor("live")).toMatchObject({ key: `${PREFIX}.event.statusLive` });
    expect(keyFor("review")).toMatchObject({
      key: `${PREFIX}.event.statusReview`,
    });
    expect(keyFor("question")).toMatchObject({
      key: `${PREFIX}.event.statusQuestion`,
    });
  });

  it("falls back to a plain status sentence when the target is missing", () => {
    expect(
      describeHistoryEvent(
        makeEvent({
          action: "bulk_status",
          fromStatus: "live",
          toStatus: null,
        }),
        echoTranslate,
        testFormat,
      ),
    ).toMatchObject({ key: `${PREFIX}.event.statusUpdated` });
  });

  it("gives every demo row a sentence", () => {
    for (const event of DEMO_OWNER_LISTING_HISTORY_EVENTS) {
      const sentence = describeHistoryEvent(event, echoTranslate, testFormat);
      expect(
        sentence.kind === "catalog" ? sentence.key : sentence.text,
      ).toBeTruthy();
    }
  });
});

describe("historyWhen", () => {
  const now = Date.parse("2026-09-25T12:00:00.000Z");

  it("stays relative inside the last week", () => {
    expect(historyWhen("2026-09-22T12:00:00.000Z", testFormatters, now)).toBe(
      "relative",
    );
  });

  it("shows a short date without the year in the current year", () => {
    expect(historyWhen("2026-06-02T12:00:00.000Z", testFormatters, now)).toBe(
      "date:day,month",
    );
  });

  it("adds the year for an earlier year", () => {
    expect(historyWhen("2025-11-02T12:00:00.000Z", testFormatters, now)).toBe(
      "date:day,month,year",
    );
  });
});

describe("paging", () => {
  it("asks for the next page only while events remain", () => {
    expect(nextHistoryPage(makePage([], 1, 5))).toBe(2);
    expect(nextHistoryPage(makePage([], 3, 5))).toBeUndefined();
  });

  it("drops an event repeated across a page boundary", () => {
    const first = makeEvent({ id: "a" });
    const second = makeEvent({ id: "b" });
    const third = makeEvent({ id: "c" });
    const events = flattenHistoryPages([
      makePage([first, second], 1, 4),
      makePage([second, third], 2, 4),
    ]);
    expect(events.map((event) => event.id)).toEqual(["a", "b", "c"]);
  });

  it("serves the whole demo history on its first page", () => {
    const page = getDemoOwnerListingHistory(1);
    expect(page.events).toHaveLength(DEMO_OWNER_LISTING_HISTORY_EVENTS.length);
    expect(nextHistoryPage(page)).toBeUndefined();
  });
});
