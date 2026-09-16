import { describe, expect, it, vi } from "vitest";
import type { TFunction } from "../../shared/i18n/types";
import {
  HIDDEN_PREVIEW_NOTIFICATION_TITLE,
  INCOMING_MESSAGE_TOAST_COOLDOWN_MS,
  buildIncomingMessageCopy,
  claimToastSlot,
  conversationPathFor,
  decideIncomingMessageBanner,
  findCachedConversationRow,
  incomingMessagePreviewText,
  isBannerEligibleMessage,
  isConversationRowMuted,
  resolveIncomingConversationRow,
  toOneLinePreview,
  type CachedConversationRow,
  type IncomingMessageBannerInput,
} from "./incomingMessageBanner";

const NOW = 1_800_000_000_000;

const translate: TFunction = (key, options) =>
  options ? `${key}|${JSON.stringify(options)}` : key;

const UNMUTED_DM_ROW: CachedConversationRow = {
  id: "conversation-1",
  name: "Ana",
};

function decide(overrides: Partial<IncomingMessageBannerInput>) {
  return decideIncomingMessageBanner({
    isDemoMode: false,
    conversationId: "conversation-1",
    activeConversationId: null,
    pathname: "/feed",
    visibilityState: "visible",
    notificationPermission: "granted",
    conversationRow: UNMUTED_DM_ROW,
    now: NOW,
    messageKind: "user",
    isMessageDeleted: false,
    ...overrides,
  });
}

describe("decideIncomingMessageBanner", () => {
  it("toasts on a visible tab away from the messages route", () => {
    expect(decide({})).toBe("toast");
  });

  it("toasts even when a stale requested thread matches, once off the messages route", () => {
    expect(decide({ activeConversationId: "conversation-1" })).toBe("toast");
  });

  it("ignores demo mode, system events and deleted messages", () => {
    expect(decide({ isDemoMode: true })).toBe("ignore");
    expect(decide({ messageKind: "system" })).toBe("ignore");
    expect(decide({ isMessageDeleted: true })).toBe("ignore");
  });

  it("ignores a muted conversation, visible or hidden", () => {
    const mutedRow = { ...UNMUTED_DM_ROW, muted: true };
    expect(decide({ conversationRow: mutedRow })).toBe("ignore");
    expect(
      decide({ conversationRow: mutedRow, visibilityState: "hidden" }),
    ).toBe("ignore");
  });

  it("ignores a conversation whose inbox row is unknown, visible or hidden", () => {
    expect(decide({ conversationRow: null })).toBe("ignore");
    expect(decide({ conversationRow: null, visibilityState: "hidden" })).toBe(
      "ignore",
    );
  });

  it("ignores the thread the member is viewing", () => {
    expect(
      decide({
        pathname: "/messages",
        activeConversationId: "conversation-1",
      }),
    ).toBe("ignore");
  });

  it("ignores a visible tab on the messages route with another thread open", () => {
    expect(
      decide({
        pathname: "/messages",
        activeConversationId: "conversation-2",
      }),
    ).toBe("ignore");
  });

  it("notifies from a hidden tab when permission is granted, including on the open thread", () => {
    expect(decide({ visibilityState: "hidden" })).toBe("notification");
    expect(
      decide({
        visibilityState: "hidden",
        pathname: "/messages",
        activeConversationId: "conversation-1",
      }),
    ).toBe("notification");
  });

  it("stays silent from a hidden tab without permission", () => {
    expect(
      decide({ visibilityState: "hidden", notificationPermission: "default" }),
    ).toBe("ignore");
    expect(
      decide({
        visibilityState: "hidden",
        notificationPermission: "unsupported",
      }),
    ).toBe("ignore");
  });
});

describe("findCachedConversationRow", () => {
  it("finds the row in any cached list and skips empty entries", () => {
    const row = { id: "conversation-1", name: "Ana", muted: true };
    expect(
      findCachedConversationRow(
        [
          [["conversations", false, ""], undefined],
          [["conversations", false, "x"], [row]],
        ],
        "conversation-1",
      ),
    ).toBe(row);
  });

  it("returns null when no list holds the conversation", () => {
    expect(findCachedConversationRow([], "conversation-1")).toBeNull();
  });
});

describe("isConversationRowMuted", () => {
  it("reads a plain mute", () => {
    expect(isConversationRowMuted({ muted: true }, NOW)).toBe(true);
    expect(isConversationRowMuted({ muted: false }, NOW)).toBe(false);
    expect(isConversationRowMuted(null, NOW)).toBe(false);
  });

  it("lets a timed mute decide by its expiry", () => {
    const future = new Date(NOW + 60_000).toISOString();
    const past = new Date(NOW - 60_000).toISOString();
    expect(isConversationRowMuted({ mutedUntil: future }, NOW)).toBe(true);
    expect(isConversationRowMuted({ muted: true, mutedUntil: past }, NOW)).toBe(
      false,
    );
  });
});

describe("isBannerEligibleMessage", () => {
  it("refuses system events and deleted messages", () => {
    expect(isBannerEligibleMessage({ kind: "user", deletedAt: null })).toBe(
      true,
    );
    expect(isBannerEligibleMessage({ kind: "system", deletedAt: null })).toBe(
      false,
    );
    expect(
      isBannerEligibleMessage({ kind: "image", deletedAt: "2026-09-15" }),
    ).toBe(false);
  });
});

describe("resolveIncomingConversationRow, then the decision", () => {
  function hiddenTabDecision(conversationRow: CachedConversationRow | null) {
    return decide({ conversationRow, visibilityState: "hidden" });
  }

  it("cached muted: uses the cached row without loading, and ignores", async () => {
    const mutedRow = { id: "conversation-1", name: "Ana", muted: true };
    const loadConversationList = vi.fn();
    const conversationRow = await resolveIncomingConversationRow(
      "conversation-1",
      {
        readCachedLists: () => [[["conversations", false, ""], [mutedRow]]],
        loadConversationList,
      },
    );
    expect(conversationRow).toBe(mutedRow);
    expect(loadConversationList).not.toHaveBeenCalled();
    expect(decide({ conversationRow })).toBe("ignore");
    expect(hiddenTabDecision(conversationRow)).toBe("ignore");
  });

  it("uncached then muted: loads the list once, finds the mute, and ignores", async () => {
    const futureMute = new Date(NOW + 60_000).toISOString();
    const loadConversationList = vi.fn().mockResolvedValue([
      { id: "conversation-2", name: "Bea" },
      { id: "conversation-1", name: "Ana", mutedUntil: futureMute },
    ]);
    const conversationRow = await resolveIncomingConversationRow(
      "conversation-1",
      { readCachedLists: () => [], loadConversationList },
    );
    expect(loadConversationList).toHaveBeenCalledTimes(1);
    expect(conversationRow?.mutedUntil).toBe(futureMute);
    expect(decide({ conversationRow })).toBe("ignore");
    expect(hiddenTabDecision(conversationRow)).toBe("ignore");
  });

  it("uncached then unknown: a failed load or a missing row resolves null, and ignores", async () => {
    const failedRow = await resolveIncomingConversationRow("conversation-1", {
      readCachedLists: () => [[["conversations", false, ""], undefined]],
      loadConversationList: vi.fn().mockRejectedValue(new Error("offline")),
    });
    const missingRow = await resolveIncomingConversationRow("conversation-1", {
      readCachedLists: () => [],
      loadConversationList: vi
        .fn()
        .mockResolvedValue([{ id: "conversation-2", name: "Bea" }]),
    });
    expect(failedRow).toBeNull();
    expect(missingRow).toBeNull();
    expect(decide({ conversationRow: failedRow })).toBe("ignore");
    expect(hiddenTabDecision(missingRow)).toBe("ignore");
  });

  it("uncached then unmuted group: loads the row, banners it, and titles it with the group", async () => {
    const groupRow = {
      id: "conversation-1",
      name: "Brunch",
      isGroup: true,
      muted: false,
    };
    const conversationRow = await resolveIncomingConversationRow(
      "conversation-1",
      {
        readCachedLists: () => [],
        loadConversationList: vi.fn().mockResolvedValue([groupRow]),
      },
    );
    expect(conversationRow).toBe(groupRow);
    expect(decide({ conversationRow })).toBe("toast");
    expect(hiddenTabDecision(conversationRow)).toBe("notification");
    const copy = buildIncomingMessageCopy({
      senderName: "Ana",
      groupTitle: conversationRow?.isGroup ? conversationRow.name : null,
      previewText: "hi",
      isHidingPreviews: false,
      t: translate,
    });
    expect(copy.notificationTitle).toBe("Brunch");
    expect(copy.toastMessage).toBe(
      'messages:incomingBanner.groupMessage|{"name":"Ana","group":"Brunch","preview":"hi"}',
    );
  });
});

describe("incomingMessagePreviewText", () => {
  it("collapses a text body to one line", () => {
    expect(
      incomingMessagePreviewText(
        { kind: "user", body: "hey\n\nthere", attachment: null },
        translate,
      ),
    ).toBe("hey there");
  });

  it("uses the reader's kind word for an uncaptioned attachment", () => {
    expect(
      incomingMessagePreviewText(
        { kind: "image", body: "Foto", attachment: null },
        translate,
      ),
    ).toBe("messages:attachments.fallbackText");
    expect(
      incomingMessagePreviewText(
        { kind: "gif", body: "GIF", attachment: null },
        translate,
      ),
    ).toBe("messages:viewer.gifBadge");
    expect(
      incomingMessagePreviewText(
        { kind: "document", body: "File", attachment: null },
        translate,
      ),
    ).toBe("messages:attachments.documentFallbackText");
  });

  it("prefers a typed caption over the kind word", () => {
    const attachment = {
      url: "u",
      previewUrl: "p",
      width: 1,
      height: 1,
      provider: "upload",
      caption: "  at the march  ",
    };
    expect(
      incomingMessagePreviewText(
        { kind: "image", body: "Photo", attachment },
        translate,
      ),
    ).toBe("at the march");
  });
});

describe("toOneLinePreview", () => {
  it("cuts long text with an ellipsis within the limit", () => {
    const preview = toOneLinePreview("a".repeat(120), 10);
    expect(Array.from(preview)).toHaveLength(10);
    expect(preview.endsWith("…")).toBe(true);
  });
});

describe("buildIncomingMessageCopy", () => {
  const base = {
    senderName: "Ana",
    groupTitle: null,
    previewText: "hi",
    isHidingPreviews: false,
    t: translate,
  };

  it("names the sender in a DM", () => {
    const copy = buildIncomingMessageCopy(base);
    expect(copy.notificationTitle).toBe("Ana");
    expect(copy.notificationBody).toBe("hi");
    expect(copy.toastMessage).toBe(
      'messages:incomingBanner.message|{"name":"Ana","preview":"hi"}',
    );
  });

  it("titles a group message with the group", () => {
    const copy = buildIncomingMessageCopy({ ...base, groupTitle: "Brunch" });
    expect(copy.notificationTitle).toBe("Brunch");
    expect(copy.notificationBody).toBe(
      'messages:incomingBanner.message|{"name":"Ana","preview":"hi"}',
    );
    expect(copy.toastMessage).toBe(
      'messages:incomingBanner.groupMessage|{"name":"Ana","group":"Brunch","preview":"hi"}',
    );
  });

  it("names nobody and quotes nothing when previews are hidden", () => {
    const copy = buildIncomingMessageCopy({
      ...base,
      groupTitle: "Brunch",
      isHidingPreviews: true,
    });
    expect(copy).toEqual({
      toastMessage: "messages:thread.newMessage",
      notificationTitle: HIDDEN_PREVIEW_NOTIFICATION_TITLE,
      notificationBody: "messages:thread.newMessage",
    });
  });
});

describe("conversationPathFor", () => {
  it("builds the notification deep link", () => {
    expect(conversationPathFor("a b")).toBe("/messages?c=a%20b");
  });
});

describe("claimToastSlot", () => {
  it("allows one toast per conversation inside the cooldown", () => {
    const history = new Map<string, number>();
    expect(claimToastSlot(history, "conversation-1", NOW)).toBe(true);
    expect(claimToastSlot(history, "conversation-1", NOW + 1_000)).toBe(false);
    expect(claimToastSlot(history, "conversation-2", NOW + 1_000)).toBe(true);
    expect(
      claimToastSlot(
        history,
        "conversation-1",
        NOW + INCOMING_MESSAGE_TOAST_COOLDOWN_MS,
      ),
    ).toBe(true);
  });

  it("drops expired entries once the history is large", () => {
    const history = new Map<string, number>();
    for (let index = 0; index < 50; index += 1) {
      history.set(`old-${index}`, NOW - INCOMING_MESSAGE_TOAST_COOLDOWN_MS);
    }
    expect(claimToastSlot(history, "fresh", NOW)).toBe(true);
    expect(history.size).toBe(1);
  });
});
