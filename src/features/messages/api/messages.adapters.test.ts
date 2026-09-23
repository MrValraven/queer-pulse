import { describe, expect, it, vi, afterEach } from "vitest";
import type { MessageResponse } from "../../../shared/contracts/contracts";
import type { MessageViewer } from "../../../shared/api/mailboxViewer";
import type { ConversationResponse } from "./messages.api";
import {
  clockLabel,
  conversationToView,
  messageToChat,
  timeLabel,
} from "./messages.adapters";

// A month name in either catalog language. The point of `clockLabel` is that a
// bubble NEVER shows one, however old the message is.
const MONTH_NAME =
  /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|mai|ago|set|out|dez/i;
const CLOCK = /^\d{1,2}:\d{2}(\s?[AP]M)?$/i;

const NOW = new Date("2026-09-14T12:00:00Z");
const TODAY = "2026-09-14T09:14:00Z";
const LAST_MONTH = "2026-08-13T20:41:00Z";

/** A signed-out reader: no handle and no mailboxes. */
const anonymousViewer: MessageViewer = {
  myHandle: null,
  staffedIdentityIds: new Set(),
};

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
    const bubble = messageToChat(messageAt(LAST_MONTH), anonymousViewer);
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

const echoTranslator = ((key: string, options?: Record<string, unknown>) =>
  options && Object.keys(options).length > 0
    ? `${key} ${JSON.stringify(options)}`
    : key) as unknown as Parameters<typeof conversationToView>[1];

function movedNote(type = "moved_to_business_mailbox"): MessageResponse {
  return {
    ...messageAt(TODAY),
    kind: "system",
    body: "This conversation moved to the business mailbox",
    // Migration 1821260000000 writes the note with sender_id NULL, so the
    // server renders its sender as FORMER_MEMBER_AUTHOR.
    sender: {
      handle: "",
      displayName: "Former member",
      avatarUrl: null,
      isFormerMember: true,
    },
    systemEvent: {
      type,
      actorName: "Tiago Costa",
      targetName: null,
      actorHandle: "tiago",
      targetHandle: null,
      value: "11111111-1111-4111-8111-111111111111",
      actorIsMe: false,
      targetIsMe: false,
    },
  } as MessageResponse;
}

describe("system rows written by the mailbox migration", () => {
  it("keeps the moved event and never marks the row as a former member", () => {
    const bubble = messageToChat(movedNote(), anonymousViewer);
    expect(bubble.kind).toBe("system");
    expect(bubble.systemEvent?.type).toBe("moved_to_business_mailbox");
    expect(bubble.isSenderFormerMember).toBeUndefined();
    expect(bubble.senderName).toBeUndefined();
  });

  it("folds an event type from a newer server into the neutral fallback", () => {
    expect(
      messageToChat(movedNote("listing_transferred"), anonymousViewer)
        .systemEvent?.type,
    ).toBe("unknown");
  });

  it("localizes a system row as a direct thread's inbox preview", () => {
    const row = conversationToView(
      {
        id: "22222222-2222-4222-8222-222222222222",
        kind: "direct",
        type: "dm",
        otherParticipant: {
          handle: "fatima",
          displayName: "Fátima Mendes",
          avatarUrl: null,
        },
        lastMessage: movedNote(),
        unreadCount: 0,
        updatedAt: TODAY,
        members: [],
        memberPreview: [],
        memberCount: 0,
      } as unknown as ConversationResponse,
      echoTranslator,
    );
    expect(row.preview).toBe("messages:system.movedToBusinessMailbox");
  });
});
