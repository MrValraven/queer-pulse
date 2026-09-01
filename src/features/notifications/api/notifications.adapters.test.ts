import { describe, expect, it } from "vitest";
import { routes } from "../../../app/routeMap";
import type { TFunction } from "../../../shared/i18n/types";
import { createFormatters } from "../../../shared/i18n/format";
import { notificationDtoToView } from "./notifications.adapters";
import type { NotificationDTO } from "./notifications.api";

/** Echoes the key back, so assertions here are about mapping, not copy. */
const t: TFunction = (key) => key;
/** Real `Intl`-backed formatters bound to English, exercising the actual
 * date-formatting path rather than a stub. */
const fmt = createFormatters("en");

/** A notification shaped exactly as the backend entity serves it. */
function dto(overrides: Partial<NotificationDTO> = {}): NotificationDTO {
  return {
    id: "3f1c8a52-9b0e-4d6a-8f21-7c5e2b9a1d04",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type: "event_reminder",
    payload: { eventId: "e1" },
    read: false,
    createdAt: "2026-07-16T10:30:00.000Z",
    ...overrides,
  };
}

describe("notificationDtoToView", () => {
  describe("read → unread", () => {
    it("treats read: false as unread", () => {
      expect(notificationDtoToView(dto({ read: false }), t, fmt).unread).toBe(
        true,
      );
    });

    it("treats read: true as already read", () => {
      expect(notificationDtoToView(dto({ read: true }), t, fmt).unread).toBe(
        false,
      );
    });

    it("defaults a missing `read` to unread rather than swallowing the row", () => {
      // The original defect inverted: reading `dto.unread` (never sent) marked
      // everything read and pinned the bell badge to 0. Absent `read` must
      // never mean "already read".
      const missing = dto();
      delete (missing as Partial<NotificationDTO>).read;
      expect(notificationDtoToView(missing, t, fmt).unread).toBe(true);
    });
  });

  it("preserves the uuid id verbatim", () => {
    const view = notificationDtoToView(dto(), t, fmt);
    // Number(uuid) would be NaN — duplicate React keys and un-markable rows.
    expect(view.id).toBe("3f1c8a52-9b0e-4d6a-8f21-7c5e2b9a1d04");
    expect(Number.isNaN(view.id as number)).toBe(false);
  });

  it("derives the tab category from the backend type", () => {
    expect(
      notificationDtoToView(dto({ type: "event_invite" }), t, fmt).type,
    ).toBe("events");
    expect(
      notificationDtoToView(dto({ type: "connection_request" }), t, fmt).type,
    ).toBe("community");
  });

  it("renders text + meta through i18n keys, never blank", () => {
    const view = notificationDtoToView(dto(), t, fmt);
    expect(view.text).toBe("notifications:type.event_reminder.text");
    expect(view.meta).toBe("notifications:type.event_reminder.meta");
  });

  it("falls back safely for an unknown type", () => {
    const view = notificationDtoToView(dto({ type: "invented_later" }), t, fmt);
    expect(view.text).toBe("notifications:type.unknown.text");
    expect(view.type).toBe("platform");
    expect(view.icon).toBeDefined();
  });

  it("always attaches an icon", () => {
    expect(notificationDtoToView(dto(), t, fmt).icon?.Glyph).toBeTypeOf(
      "function",
    );
  });

  it("formats createdAt into a short label and tolerates a bad one", () => {
    expect(notificationDtoToView(dto(), t, fmt).time).not.toBe("");
    expect(
      notificationDtoToView(dto({ createdAt: "nonsense" }), t, fmt).time,
    ).toBe("");
  });

  describe("actor enrichment", () => {
    const actor = {
      slug: "ines",
      firstName: "Inês",
      lastName: "Tavares",
      avatarUrl: "https://cdn.example/ines.jpg",
    };

    it("links a connection row to the actor's profile with personalized copy", () => {
      const view = notificationDtoToView(
        dto({ type: "connection_accepted", actor }),
        t,
        fmt,
      );
      expect(view.actorSlug).toBe("ines");
      expect(view.actor).toEqual({
        name: "Inês Tavares",
        href: "/members/ines",
        textKey: "notifications:type.connection_accepted.textNamed",
      });
    });

    it("shows the actor's photo when present, a monogram otherwise", () => {
      const withPhoto = notificationDtoToView(
        dto({ type: "vouch_received", actor }),
        t,
        fmt,
      );
      expect(withPhoto.avatar?.src).toBe("https://cdn.example/ines.jpg");
      expect(withPhoto.avatar?.initials).toBe("IT");
      // The actor's avatar replaces the generic category icon.
      expect(withPhoto.icon).toBeUndefined();

      const noPhoto = notificationDtoToView(
        dto({ type: "vouch_received", actor: { ...actor, avatarUrl: null } }),
        t,
        fmt,
      );
      expect(noPhoto.avatar?.src).toBeUndefined();
      expect(noPhoto.avatar?.initials).toBe("IT");
    });

    it("leaves a row with no actor as an anonymous icon row", () => {
      const view = notificationDtoToView(
        dto({ type: "connection_request" }),
        t,
        fmt,
      );
      expect(view.actor).toBeUndefined();
      expect(view.avatar).toBeUndefined();
      expect(view.icon).toBeDefined();
    });
  });

  // PRD-15. "Someone wants to connect" carries its two answers, so a member
  // never has to go and find `/account/connections` to say yes.
  describe("connection request actions", () => {
    const actor = {
      slug: "ines",
      firstName: "Inês",
      lastName: "Tavares",
      avatarUrl: null,
    };

    it("offers accept and decline when the row names a connection and an actor", () => {
      const view = notificationDtoToView(
        dto({
          type: "connection_request",
          payload: { connectionId: "c-1" },
          actor,
        }),
        t,
        fmt,
      );
      expect(view.actions).toHaveLength(2);
      expect(view.actions?.[0]?.connectionResponse).toEqual({
        connectionId: "c-1",
        memberSlug: "ines",
        action: "accept",
        toast: "notifications:actions.acceptedToast",
      });
      expect(view.actions?.[1]?.connectionResponse?.action).toBe("decline");
      // Both still point at a real page, so a row whose mutation cannot run
      // never renders a dead control.
      expect(view.actions?.[0]?.href).toBe("/members/ines");
    });

    it("offers no buttons when the connection id is missing", () => {
      const view = notificationDtoToView(
        dto({ type: "connection_request", payload: {}, actor }),
        t,
        fmt,
      );
      expect(view.actions).toBeUndefined();
    });

    it("offers no buttons when the actor could not be resolved", () => {
      const view = notificationDtoToView(
        dto({ type: "connection_request", payload: { connectionId: "c-1" } }),
        t,
        fmt,
      );
      expect(view.actions).toBeUndefined();
    });
  });

  // The final review of the admin-queue arrival notifications feature asked
  // for these two directly: `adminQueueLabelKey` (formatNotification.test.ts)
  // was the label half of "a queue this build has never heard of still
  // reads," and this is the link half of the same path.
  describe("admin_queue_item source href", () => {
    it("links a known queue to its admin route", () => {
      const view = notificationDtoToView(
        dto({
          type: "admin_queue_item",
          payload: { source: "admin", queue: "invite_requests" },
        }),
        t,
        fmt,
      );
      expect(view.sourceHref).toBe(routes.adminJoinRequests);
    });

    it("leaves an unknown queue without a link rather than a broken one", () => {
      const view = notificationDtoToView(
        dto({
          type: "admin_queue_item",
          payload: { source: "admin", queue: "some_future_queue" },
        }),
        t,
        fmt,
      );
      expect(view.sourceHref).toBeUndefined();
    });
  });
});
