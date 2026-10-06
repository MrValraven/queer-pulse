import { describe, expect, it } from "vitest";
import { thread } from "../../../app/routeMap";
import { createFormatters } from "../../../shared/i18n/format";
import { interpolate } from "../../../shared/i18n/translate";
import type { TFunction, TranslateOptions } from "../../../shared/i18n/types";
import { formatNotification } from "./formatNotification";
import { notificationDtoToView } from "./notifications.adapters";
import type { NotificationDTO } from "./notifications.api";

const STRINGS: Record<string, string> = {
  "notifications:type.funding_deadline_soon.text":
    "{threadTitle} closes soon ({date}).",
  "notifications:type.funding_deadline_soon.7d.text":
    "{threadTitle} closes in 7 days ({date}).",
  "notifications:type.funding_deadline_soon.1d.text":
    "{threadTitle} closes tomorrow ({date}).",
  "notifications:type.funding_deadline_soon.threadTitleFallback":
    "A call you saved",
  "notifications:type.funding_deadline_soon.dateFallback":
    "date to be confirmed",
  "notifications:type.funding_deadline_changed.text":
    "{threadTitle}: deadline moved to {date}.",
  "notifications:type.funding_deadline_changed.threadTitleFallback":
    "A call you saved",
  "notifications:type.topic_new_post.text":
    "Someone posted in a topic you follow: {topicLabel}.",
  "notifications:type.topic_new_post.openCallsLabel": "Open funding calls",
};
const t: TFunction = (key: string, values?: TranslateOptions) =>
  interpolate(STRINGS[key] ?? key, values);
const echoT: TFunction = (key) => key;
const fmt = createFormatters("en");
const PAYLOAD = {
  source: "forum",
  threadSlug: "mare-2026",
  threadTitle: "Maré 2026",
  deadline: "2026-07-31T16:00:00.000Z",
};

function dto(overrides: Partial<NotificationDTO>): NotificationDTO {
  return {
    id: "6f1c8a52-9b0e-4d6a-8f21-7c5e2b9a1d04",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type: "funding_deadline_soon",
    payload: { ...PAYLOAD, stage: "7d" },
    read: false,
    createdAt: "2026-07-24T08:00:00.000Z",
    ...overrides,
  };
}

describe("funding deadline notifications", () => {
  it("reads the 7-day reminder with the deadline in Lisbon time", () => {
    const text = formatNotification(
      "funding_deadline_soon",
      { ...PAYLOAD, stage: "7d" },
      t,
      fmt,
    ).text;
    expect(text.startsWith("Maré 2026 closes in 7 days (")).toBe(true);
    expect(text).toContain("17:00");
  });

  it("reads the 1-day reminder", () => {
    expect(
      formatNotification(
        "funding_deadline_soon",
        { ...PAYLOAD, stage: "1d" },
        t,
        fmt,
      ).text,
    ).toContain("closes tomorrow");
  });

  it("keeps a whole sentence without a stage, a title or a date", () => {
    expect(
      formatNotification("funding_deadline_soon", { threadSlug: "x" }, t, fmt)
        .text,
    ).toBe("A call you saved closes soon (date to be confirmed).");
  });

  it("reads the moved deadline", () => {
    expect(
      formatNotification(
        "funding_deadline_changed",
        PAYLOAD,
        t,
        fmt,
      ).text.startsWith("Maré 2026: deadline moved to "),
    ).toBe(true);
  });

  it("files both under platform and opens the call", () => {
    expect(
      formatNotification("funding_deadline_changed", PAYLOAD, echoT, fmt)
        .category,
    ).toBe("platform");
    expect(notificationDtoToView(dto({}), echoT, fmt).sourceHref).toBe(
      thread("mare-2026"),
    );
    expect(
      notificationDtoToView(
        dto({ type: "funding_deadline_changed", payload: PAYLOAD }),
        echoT,
        fmt,
      ).sourceHref,
    ).toBe(thread("mare-2026"));
  });

  it("names the open-calls topic in the reader's language", () => {
    const text = formatNotification(
      "topic_new_post",
      {
        source: "forum",
        topicSlug: "open-call",
        topicLabel: "Open funding calls (EN only)",
        threadSlug: "x",
      },
      t,
      fmt,
    ).text;
    expect(text).toBe(
      "Someone posted in a topic you follow: Open funding calls.",
    );
  });
});
