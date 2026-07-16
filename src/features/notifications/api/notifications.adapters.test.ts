import { describe, expect, it } from "vitest";
import type { TFunction } from "../../../shared/i18n/types";
import { notificationDtoToView } from "./notifications.adapters";
import type { NotificationDTO } from "./notifications.api";

/** Echoes the key back, so assertions here are about mapping, not copy. */
const t: TFunction = (key) => key;

/** A notification shaped exactly as the backend entity serves it. */
function dto(overrides: Partial<NotificationDTO> = {}): NotificationDTO {
  return {
    id: "3f1c8a52-9b0e-4d6a-8f21-7c5e2b9a1d04",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type: "new_message",
    payload: { conversationId: "c1", messageId: "m1", senderId: "s1" },
    read: false,
    createdAt: "2026-07-16T10:30:00.000Z",
    ...overrides,
  };
}

describe("notificationDtoToView", () => {
  describe("read → unread", () => {
    it("treats read: false as unread", () => {
      expect(notificationDtoToView(dto({ read: false }), t).unread).toBe(true);
    });

    it("treats read: true as already read", () => {
      expect(notificationDtoToView(dto({ read: true }), t).unread).toBe(false);
    });

    it("defaults a missing `read` to unread rather than swallowing the row", () => {
      // The original defect inverted: reading `dto.unread` (never sent) marked
      // everything read and pinned the bell badge to 0. Absent `read` must
      // never mean "already read".
      const missing = dto();
      delete (missing as Partial<NotificationDTO>).read;
      expect(notificationDtoToView(missing, t).unread).toBe(true);
    });
  });

  it("preserves the uuid id verbatim", () => {
    const view = notificationDtoToView(dto(), t);
    // Number(uuid) would be NaN — duplicate React keys and un-markable rows.
    expect(view.id).toBe("3f1c8a52-9b0e-4d6a-8f21-7c5e2b9a1d04");
    expect(Number.isNaN(view.id as number)).toBe(false);
  });

  it("derives the tab category from the backend type", () => {
    expect(notificationDtoToView(dto({ type: "new_message" }), t).type).toBe(
      "messages",
    );
    expect(notificationDtoToView(dto({ type: "event_invite" }), t).type).toBe(
      "events",
    );
    expect(
      notificationDtoToView(dto({ type: "connection_request" }), t).type,
    ).toBe("community");
  });

  it("renders text + meta through i18n keys, never blank", () => {
    const view = notificationDtoToView(dto(), t);
    expect(view.text).toBe("notifications:type.new_message.text");
    expect(view.meta).toBe("notifications:type.new_message.meta");
  });

  it("falls back safely for an unknown type", () => {
    const view = notificationDtoToView(dto({ type: "invented_later" }), t);
    expect(view.text).toBe("notifications:type.unknown.text");
    expect(view.type).toBe("platform");
    expect(view.icon).toBeDefined();
  });

  it("always attaches an icon", () => {
    expect(notificationDtoToView(dto(), t).icon?.Glyph).toBeTypeOf("function");
  });

  it("formats createdAt into a short label and tolerates a bad one", () => {
    expect(notificationDtoToView(dto(), t).time).not.toBe("");
    expect(notificationDtoToView(dto({ createdAt: "nonsense" }), t).time).toBe(
      "",
    );
  });
});
