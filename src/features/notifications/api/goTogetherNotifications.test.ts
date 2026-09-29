import { describe, expect, it } from "vitest";
import { routes } from "../../../app/routeMap";
import { gatheringPath } from "../../gatherings/data";
import { createFormatters } from "../../../shared/i18n/format";
import { interpolate } from "../../../shared/i18n/translate";
import type { TFunction, TranslateOptions } from "../../../shared/i18n/types";
import {
  formatNotification,
  type NotificationKind,
} from "./formatNotification";
import { notificationDtoToView } from "./notifications.adapters";
import type { NotificationDTO } from "./notifications.api";

/**
 * The six Go together kinds' catalog strings (design spec 2026-09-28, F10),
 * exactly as written to the i18n scratch file the coordinator merges into
 * `catalogs/{en,pt}/notifications.ts`. Duplicated here rather than loaded
 * through the real catalog: this test has to pass before that merge lands,
 * the same reason `notifications.adapters.test.ts` binds its own key-echoing
 * `t` instead of the provider's.
 */
const GO_TOGETHER_STRINGS: Record<string, string> = {
  "notifications:type.go_together_pair_invite.text":
    "Someone wants to go together to {eventTitle}",
  "notifications:type.go_together_pair_invite.textNamed":
    "<profile>{name}</profile> wants to go to {eventTitle} together",
  "notifications:type.go_together_pair_invite.meta": "Go together invite",
  "notifications:type.go_together_group_ready.text":
    "Your group for {eventTitle} is ready",
  "notifications:type.go_together_group_ready.meta": "Go together group",
  "notifications:type.go_together_unmatched.text":
    "We couldn't put together a group for {eventTitle} this time",
  "notifications:type.go_together_unmatched.textFinal":
    "We weren't able to place you in a group for {eventTitle}",
  "notifications:type.go_together_unmatched.textHostOff":
    "The host switched Go together off for {eventTitle}",
  "notifications:type.go_together_unmatched.meta": "Go together update",
  "notifications:type.go_together_member_left.text":
    "Someone left your group for {eventTitle}",
  "notifications:type.go_together_member_left.meta": "Go together group",
  "notifications:type.go_together_meet_again.text":
    "Want to meet your group from {eventTitle} again?",
  "notifications:type.go_together_meet_again.meta": "Go together feedback",
  "notifications:type.go_together_mutual.text":
    "You and someone from {eventTitle} both want to meet again",
  "notifications:type.go_together_mutual.textNamed":
    "You and <profile>{name}</profile> both want to meet again",
  "notifications:type.go_together_mutual.meta": "New connection",
};

/** Real `{token}` interpolation over the strings above, so a test failure here
 *  means the token wiring is wrong rather than a stub swallowing it. */
const t: TFunction = (key: string, values?: TranslateOptions) =>
  interpolate(GO_TOGETHER_STRINGS[key] ?? key, values);

/** Echoes the key back: the sourceHref/category tests below never read
 *  rendered copy, the same reason `notifications.adapters.test.ts` uses one. */
const echoT: TFunction = (key) => key;

const fmt = createFormatters("en");

const EVENT_TITLE = "Queer Board Game Night";

const GO_TOGETHER_KINDS: NotificationKind[] = [
  "go_together_pair_invite",
  "go_together_group_ready",
  "go_together_unmatched",
  "go_together_member_left",
  "go_together_meet_again",
  "go_together_mutual",
];

/** A notification shaped exactly as the backend entity serves it. */
function dto(overrides: Partial<NotificationDTO> = {}): NotificationDTO {
  return {
    id: "3f1c8a52-9b0e-4d6a-8f21-7c5e2b9a1d04",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type: "go_together_pair_invite",
    payload: { eventId: "evt-1", eventTitle: EVENT_TITLE },
    read: false,
    createdAt: "2026-07-16T10:30:00.000Z",
    ...overrides,
  };
}

/** The resolved acting member `notificationDtoToView` names on a row whose
 *  payload carried a resolvable `actorId` (`go_together_pair_invite`'s
 *  inviter, `go_together_mutual`'s other member). */
const ACTOR = {
  slug: "rui-mendes",
  firstName: "Rui",
  lastName: "Mendes",
  avatarUrl: null,
};

describe("formatNotification: Go together kinds", () => {
  it.each(GO_TOGETHER_KINDS)(
    "renders non-empty text and meta naming the gathering for %s",
    (kind) => {
      const { text, meta } = formatNotification(
        kind,
        {
          eventId: "evt-1",
          eventSlug: "queer-board-game-night",
          eventTitle: EVENT_TITLE,
        },
        t,
        fmt,
      );
      expect(text.length).toBeGreaterThan(0);
      expect(meta.length).toBeGreaterThan(0);
      expect(text).toContain(EVENT_TITLE);
      expect(text).not.toContain("{eventTitle}");
    },
  );

  it("maps go_together_mutual to the connections category connection_accepted shares", () => {
    const mutual = formatNotification(
      "go_together_mutual",
      { eventTitle: EVENT_TITLE },
      echoT,
      fmt,
    );
    const connectionAccepted = formatNotification(
      "connection_accepted",
      {},
      echoT,
      fmt,
    );
    expect(mutual.category).toBe(connectionAccepted.category);
  });

  it("maps the other five kinds to the events category", () => {
    for (const kind of GO_TOGETHER_KINDS) {
      if (kind === "go_together_mutual") continue;
      expect(
        formatNotification(kind, { eventTitle: EVENT_TITLE }, echoT, fmt)
          .category,
      ).toBe("events");
    }
  });
});

describe("formatNotification: go_together_unmatched isFinal", () => {
  it("renders the ongoing text when isFinal is false", () => {
    const { text } = formatNotification(
      "go_together_unmatched",
      { eventTitle: EVENT_TITLE, isFinal: false },
      t,
      fmt,
    );
    expect(text).toBe(
      `We couldn't put together a group for ${EVENT_TITLE} this time`,
    );
  });

  it("renders the same ongoing text when isFinal is missing", () => {
    const { text } = formatNotification(
      "go_together_unmatched",
      { eventTitle: EVENT_TITLE },
      t,
      fmt,
    );
    expect(text).toBe(
      `We couldn't put together a group for ${EVENT_TITLE} this time`,
    );
  });

  it("renders the calmer final-notice text when isFinal is true", () => {
    const { text } = formatNotification(
      "go_together_unmatched",
      { eventTitle: EVENT_TITLE, isFinal: true },
      t,
      fmt,
    );
    expect(text).toBe(
      `We weren't able to place you in a group for ${EVENT_TITLE}`,
    );
  });

  it("names the host switching Go together off when the reason says so", () => {
    const { text, meta } = formatNotification(
      "go_together_unmatched",
      { eventTitle: EVENT_TITLE, isFinal: true, reason: "hostSwitchedOff" },
      t,
      fmt,
    );
    expect(text).toBe(`The host switched Go together off for ${EVENT_TITLE}`);
    expect(meta).toBe("Go together update");
  });

  it("keeps the final text for any other reason value", () => {
    const { text } = formatNotification(
      "go_together_unmatched",
      { eventTitle: EVENT_TITLE, isFinal: true, reason: "somethingElse" },
      t,
      fmt,
    );
    expect(text).toBe(
      `We weren't able to place you in a group for ${EVENT_TITLE}`,
    );
  });

  it("keeps one shared meta line for both variants", () => {
    const ongoing = formatNotification(
      "go_together_unmatched",
      { eventTitle: EVENT_TITLE, isFinal: false },
      t,
      fmt,
    );
    const final = formatNotification(
      "go_together_unmatched",
      { eventTitle: EVENT_TITLE, isFinal: true },
      t,
      fmt,
    );
    expect(ongoing.meta).toBe(final.meta);
    expect(ongoing.meta.length).toBeGreaterThan(0);
  });

  it("keeps the events category regardless of isFinal", () => {
    expect(
      formatNotification(
        "go_together_unmatched",
        { eventTitle: EVENT_TITLE, isFinal: true },
        echoT,
        fmt,
      ).category,
    ).toBe("events");
  });
});

describe("notificationDtoToView: Go together sourceHref", () => {
  it("opens the matched chat when go_together_group_ready carries a conversationId", () => {
    const view = notificationDtoToView(
      dto({
        type: "go_together_group_ready",
        payload: {
          eventId: "evt-1",
          eventSlug: "queer-board-game-night",
          eventTitle: EVENT_TITLE,
          groupId: "group-1",
          conversationId: "conv-42",
        },
      }),
      echoT,
      fmt,
    );
    expect(view.sourceHref).toBe(`${routes.messages}?c=conv-42`);
  });

  it("falls back to the gathering when go_together_group_ready has no conversationId", () => {
    const view = notificationDtoToView(
      dto({
        type: "go_together_group_ready",
        payload: {
          eventId: "evt-1",
          eventSlug: "queer-board-game-night",
          eventTitle: EVENT_TITLE,
          groupId: "group-1",
        },
      }),
      echoT,
      fmt,
    );
    expect(view.sourceHref).toBe(gatheringPath("queer-board-game-night"));
  });

  it.each([
    "go_together_pair_invite",
    "go_together_unmatched",
    "go_together_member_left",
    "go_together_mutual",
  ] as NotificationKind[])("opens the gathering for %s", (kind) => {
    const view = notificationDtoToView(
      dto({
        type: kind,
        payload: {
          eventId: "evt-1",
          eventSlug: "queer-board-game-night",
          eventTitle: EVENT_TITLE,
        },
      }),
      echoT,
      fmt,
    );
    expect(view.sourceHref).toBe(gatheringPath("queer-board-game-night"));
  });

  it("opens the feedback flow for go_together_meet_again", () => {
    const view = notificationDtoToView(
      dto({
        type: "go_together_meet_again",
        payload: {
          eventId: "evt-1",
          eventSlug: "queer-board-game-night",
          eventTitle: EVENT_TITLE,
          groupId: "group-7",
        },
      }),
      echoT,
      fmt,
    );
    expect(view.sourceHref).toBe("/go-together/feedback/group-7");
  });

  it("resolves no destination for go_together_meet_again missing a groupId", () => {
    const view = notificationDtoToView(
      dto({
        type: "go_together_meet_again",
        payload: {
          eventId: "evt-1",
          eventSlug: "queer-board-game-night",
          eventTitle: EVENT_TITLE,
        },
      }),
      echoT,
      fmt,
    );
    expect(view.sourceHref).toBeUndefined();
  });
});

describe("notificationDtoToView: Go together personalized actor", () => {
  it("names the inviter in go_together_pair_invite's textNamed key", () => {
    const view = notificationDtoToView(
      dto({
        type: "go_together_pair_invite",
        payload: { eventId: "evt-1", eventTitle: EVENT_TITLE },
        actor: ACTOR,
      }),
      t,
      fmt,
    );
    expect(view.actor?.textKey).toBe(
      "notifications:type.go_together_pair_invite.textNamed",
    );
    expect(view.actor?.textValues?.eventTitle).toBe(EVENT_TITLE);
    expect(view.actor?.name).toBe("Rui Mendes");
  });

  it("names the other member in go_together_mutual's textNamed key", () => {
    const view = notificationDtoToView(
      dto({
        type: "go_together_mutual",
        payload: {
          eventId: "evt-1",
          eventTitle: EVENT_TITLE,
          groupId: "group-1",
        },
        actor: ACTOR,
      }),
      t,
      fmt,
    );
    expect(view.actor?.textKey).toBe(
      "notifications:type.go_together_mutual.textNamed",
    );
    expect(view.actor?.textValues?.eventTitle).toBe(EVENT_TITLE);
  });

  it("keeps the generic text when neither row resolves an actor", () => {
    const pairInvite = notificationDtoToView(
      dto({
        type: "go_together_pair_invite",
        payload: { eventId: "evt-1", eventTitle: EVENT_TITLE },
      }),
      t,
      fmt,
    );
    expect(pairInvite.actor).toBeUndefined();
    expect(pairInvite.text).toBe(
      `Someone wants to go together to ${EVENT_TITLE}`,
    );
  });
});
