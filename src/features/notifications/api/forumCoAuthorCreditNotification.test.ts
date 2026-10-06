import { describe, expect, it } from "vitest";
import { thread } from "../../../app/routeMap";
import { createFormatters } from "../../../shared/i18n/format";
import { interpolate } from "../../../shared/i18n/translate";
import type { TFunction, TranslateOptions } from "../../../shared/i18n/types";
import { formatNotification } from "./formatNotification";
import { notificationDtoToView } from "./notifications.adapters";
import type { NotificationDTO } from "./notifications.api";

/** PRD-408: the notice a member gets when a thread credits them as co-author. */
const STRINGS: Record<string, string> = {
  "notifications:type.forum_co_author_credit.text":
    "You were credited as co-author on {threadTitle}.",
  "notifications:type.forum_co_author_credit.textNamed":
    "<profile>{name}</profile> credited you as co-author on {threadTitle}.",
  "notifications:type.forum_co_author_credit.meta": "Co-author credit",
  "notifications:type.forum_co_author_credit.threadTitleFallback": "a thread",
};
const t: TFunction = (key: string, values?: TranslateOptions) =>
  interpolate(STRINGS[key] ?? key, values);
const fmt = createFormatters("en");
const PAYLOAD = {
  source: "forum",
  threadSlug: "sns-guide",
  threadTitle: "The SNS guide",
};

function dto(overrides: Partial<NotificationDTO>): NotificationDTO {
  return {
    id: "3c7d2e10-5a4b-4f8e-9c21-0d6e7f8a9b1c",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type: "forum_co_author_credit",
    payload: PAYLOAD,
    read: false,
    createdAt: "2026-10-06T09:00:00.000Z",
    ...overrides,
  };
}

describe("forum co-author credit notifications", () => {
  it("names the thread and files under community", () => {
    const formatted = formatNotification(
      "forum_co_author_credit",
      PAYLOAD,
      t,
      fmt,
    );
    expect(formatted.text).toBe(
      "You were credited as co-author on The SNS guide.",
    );
    expect(formatted.meta).toBe("Co-author credit");
    expect(formatted.category).toBe("community");
  });

  it("keeps a whole sentence without a title", () => {
    expect(
      formatNotification("forum_co_author_credit", { source: "forum" }, t, fmt)
        .text,
    ).toBe("You were credited as co-author on a thread.");
  });

  it("names the author and keeps the title when the backend resolved one", () => {
    const view = notificationDtoToView(
      dto({
        actor: {
          slug: "jonas",
          firstName: "Jonas",
          lastName: "Weber",
          avatarUrl: null,
        },
      }),
      t,
      fmt,
    );
    expect(view.actor?.textKey).toBe(
      "notifications:type.forum_co_author_credit.textNamed",
    );
    expect(view.actor?.textValues?.threadTitle).toBe("The SNS guide");
  });

  it("keeps the generic sentence for a masked byline", () => {
    const view = notificationDtoToView(dto({ actor: null }), t, fmt);
    expect(view.actor).toBeUndefined();
    expect(view.text).toBe("You were credited as co-author on The SNS guide.");
  });

  it("opens the thread, where the remove-my-name action lives", () => {
    expect(notificationDtoToView(dto({}), t, fmt).sourceHref).toBe(
      thread("sns-guide"),
    );
  });
});
