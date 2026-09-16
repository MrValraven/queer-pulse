import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AuthorSummary,
  ConversationResponse,
  MessageResponse,
} from "../../../shared/contracts/contracts";
import type { TFunction } from "../../../shared/i18n/types";
import {
  conversationToView,
  groupMessages,
  previewForMessage,
} from "./messages.adapters";

// Coverage for the inbox/conversation adapters NOT already covered by
// `messages.adapters.test.ts` (which owns `clockLabel`/`timeLabel`/the
// time-labeling case of `messageToChat`): the conversation-row adapter
// (`conversationToView`, official/group/DM), the last-message preview
// adapter (`previewForMessage`), and `groupMessages`'s local-day bucketing.

const fakeT: TFunction = (key) => key;

function author(overrides: Partial<AuthorSummary> = {}): AuthorSummary {
  return {
    handle: "jordan",
    displayName: "Jordan Park",
    avatarUrl: null,
    ...overrides,
  };
}

function message(overrides: Partial<MessageResponse> = {}): MessageResponse {
  return {
    id: "m1",
    body: "hey there",
    createdAt: "2026-09-14T09:14:00Z",
    sender: author(),
    kind: "user",
    ...overrides,
  } as MessageResponse;
}

function conversation(
  overrides: Partial<ConversationResponse> = {},
): ConversationResponse {
  return {
    id: "c1",
    type: "dm",
    otherParticipant: author(),
    lastMessage: null,
    unreadCount: 0,
    updatedAt: "2026-09-14T09:14:00Z",
    myLastReadAt: null,
    otherLastReadAt: null,
    otherDeliveredAt: null,
    otherParticipantId: "u2",
    kind: "direct",
    title: null,
    avatarUrl: null,
    memberCount: 0,
    members: [],
    ...overrides,
  };
}

describe("conversationToView: official thread (no counterpart)", () => {
  it("falls back to the official name/initials when otherParticipant is null", () => {
    const view = conversationToView(
      conversation({ otherParticipant: null, otherParticipantId: null }),
      fakeT,
    );
    expect(view.official).toBe(true);
    expect(view.initials).toBe("QP");
    expect(view.name).toBe(fakeT("messages:conversation.officialName"));
  });
});

describe("conversationToView: group title/avatar come from the group itself", () => {
  it("uses the group's own title and avatar, ignoring member identities", () => {
    const dto = conversation({
      kind: "group",
      type: "group",
      title: "Pride Brunch Crew",
      avatarUrl: "https://cdn.example/group.png",
      memberCount: 2,
      members: [
        {
          id: "u1",
          handle: "ana",
          name: "Ana Silva",
          avatarUrl: "https://cdn.example/ana.png",
          role: "owner",
          lastReadAt: null,
          deliveredAt: null,
        },
        {
          id: "u2",
          handle: "bea",
          name: "Bea Costa",
          avatarUrl: "https://cdn.example/bea.png",
          role: "member",
          lastReadAt: null,
          deliveredAt: null,
        },
      ],
    });
    const view = conversationToView(dto, fakeT);
    expect(view.isGroup).toBe(true);
    expect(view.name).toBe("Pride Brunch Crew");
    expect(view.avatarUrl).toBe("https://cdn.example/group.png");
    expect(view.avatarUrl).not.toBe("https://cdn.example/ana.png");
    expect(view.avatarUrl).not.toBe("https://cdn.example/bea.png");
    // "PB": the group's own initials.
    expect(view.initials).toBe("PB");
  });

  it("falls back to a translated placeholder for an untitled group", () => {
    const view = conversationToView(
      conversation({ kind: "group", type: "group", title: null }),
      fakeT,
    );
    expect(view.name).toBe(fakeT("messages:group.untitled"));
  });
});

describe("conversationToView: DM", () => {
  it("uses the counterpart's own identity", () => {
    const dto = conversation({
      otherParticipant: author({
        handle: "jordan",
        displayName: "Jordan Park",
        avatarUrl: "https://cdn.example/jordan.png",
      }),
    });
    const view = conversationToView(dto, fakeT);
    expect(view.isGroup).toBeUndefined();
    expect(view.official).toBe(false);
    expect(view.name).toBe("Jordan Park");
    expect(view.avatarUrl).toBe("https://cdn.example/jordan.png");
  });
});

describe("conversationToView: missing last message", () => {
  it("gives an empty preview for a DM with no messages yet", () => {
    const view = conversationToView(conversation({ lastMessage: null }), fakeT);
    expect(view.preview).toBe("");
    expect(view.lastMessageBody).toBeUndefined();
  });

  it("gives an empty preview for a group with no messages yet", () => {
    const view = conversationToView(
      conversation({
        kind: "group",
        type: "group",
        title: "Empty Group",
        lastMessage: null,
      }),
      fakeT,
    );
    expect(view.preview).toBe("");
  });
});

describe("conversationToView: markedUnreadAt / archive / mute mapping", () => {
  it("carries every inbox-row flag through, and ORs markedUnreadAt into unread", () => {
    const dto = conversation({
      unreadCount: 0,
      markedUnreadAt: "2026-09-14T08:00:00Z",
      archivedAt: "2026-09-13T08:00:00Z",
      muted: true,
      mutedUntil: "2026-09-20T00:00:00Z",
    });
    const view = conversationToView(dto, fakeT);
    // Manually marked unread even though the count-based rule alone is false.
    expect(view.unread).toBe(true);
    expect(view.markedUnreadAt).toBe(dto.markedUnreadAt);
    expect(view.archivedAt).toBe(dto.archivedAt);
    expect(view.muted).toBe(true);
    expect(view.mutedUntil).toBe(dto.mutedUntil);
  });

  it("is unread from the count alone when nothing was manually marked", () => {
    const view = conversationToView(conversation({ unreadCount: 3 }), fakeT);
    expect(view.unread).toBe(true);
    expect(view.markedUnreadAt).toBeUndefined();
  });

  it("is read when neither the count nor a manual mark says otherwise", () => {
    const view = conversationToView(conversation({ unreadCount: 0 }), fakeT);
    expect(view.unread).toBe(false);
  });
});

describe("conversationToView: draft mapping", () => {
  it("carries the server draft through onto the row", () => {
    const view = conversationToView(
      conversation({ draft: "hello, still typing" }),
      fakeT,
    );
    expect(view.draft).toBe("hello, still typing");
  });

  it("maps a null draft to undefined", () => {
    const view = conversationToView(conversation({ draft: null }), fakeT);
    expect(view.draft).toBeUndefined();
  });
});

describe("conversationToView: ENG-253 list-row preview fields", () => {
  it("maps memberPreview/hasDraft/draftPreview for a group row", () => {
    const dto = conversation({
      kind: "group",
      type: "group",
      title: "Pride Brunch Crew",
      members: [],
      memberPreview: [
        { id: "u1", handle: "ana", name: "Ana Silva", avatarUrl: null },
        { id: "u2", handle: "bea", name: "Bea Costa", avatarUrl: null },
      ],
      hasDraft: true,
      draftPreview: "still typing this one out",
    });
    const view = conversationToView(dto, fakeT);
    expect(view.memberPreview).toEqual(dto.memberPreview);
    expect(view.hasDraft).toBe(true);
    expect(view.draftPreview).toBe("still typing this one out");
    // The trimmed full roster stays a real, empty array: this build's own
    // useConversationDetail is what refills it for the open thread.
    expect(view.members).toEqual([]);
  });

  it("defaults hasDraft/draftPreview/otherLastReadInstant when the DTO omits them", () => {
    const view = conversationToView(conversation({}), fakeT);
    expect(view.hasDraft).toBe(false);
    expect(view.draftPreview).toBeNull();
    expect(view.otherLastReadInstant).toBeNull();
  });

  it("maps a DM's otherLastReadInstant distinctly from otherLastReadAt", () => {
    const view = conversationToView(
      conversation({
        otherLastReadAt: "2026-09-14T09:00:00Z",
        otherLastReadInstant: "2026-09-14T09:03:12Z",
      }),
      fakeT,
    );
    expect(view.otherLastReadAt).toBe("2026-09-14T09:00:00Z");
    expect(view.otherLastReadInstant).toBe("2026-09-14T09:03:12Z");
  });
});

describe("previewForMessage", () => {
  it("is the bare body for a DM", () => {
    expect(previewForMessage(false, message({ body: "hi there" }))).toBe(
      "hi there",
    );
  });

  it("prefixes a group member's message with their first name", () => {
    const groupMessage = message({
      body: "hi there",
      sender: author({ displayName: "Ana Silva" }),
    });
    expect(previewForMessage(true, groupMessage)).toBe("Ana: hi there");
  });

  it("prefixes a group system message with the actor's first name, no colon", () => {
    const systemMessage = message({
      body: "created the group",
      kind: "system",
      sender: author({ displayName: "Ana Silva" }),
    });
    expect(previewForMessage(true, systemMessage)).toBe(
      "Ana created the group",
    );
  });
});

describe("groupMessages: local-day boundaries", () => {
  // Pinned to UTC so the local/UTC calendar-day boundary this suite exercises
  // stays the same on every machine that runs it. Stubbed per test (not once
  // in beforeAll): the suite's global `afterEach` (src/test/setup.ts) calls
  // `vi.unstubAllEnvs()` after every test, which would already clear a
  // beforeAll-only stub before the second test here runs. `vi.stubEnv`
  // restores the original value (or removes the key entirely when it had
  // none) rather than writing the literal string "undefined" that a plain
  // `process.env.TZ = originalTz` restore would leave for later tests.
  beforeEach(() => {
    vi.stubEnv("TZ", "UTC");
  });

  it("keeps two same-day messages in one bucket", () => {
    const groups = groupMessages(
      [
        message({ id: "a", createdAt: "2026-09-14T08:00:00Z" }),
        message({ id: "b", createdAt: "2026-09-14T23:55:00Z" }),
      ],
      null,
    );
    expect(groups).toHaveLength(1);
    expect(groups[0]!.items).toHaveLength(2);
    expect(groups[0]!.dayKey).toBe("2026-09-14");
  });

  it("splits into a new bucket the instant local midnight passes", () => {
    const groups = groupMessages(
      [
        message({ id: "a", createdAt: "2026-09-14T23:59:00Z" }),
        message({ id: "b", createdAt: "2026-09-15T00:01:00Z" }),
      ],
      null,
    );
    expect(groups).toHaveLength(2);
    expect(groups[0]!.dayKey).toBe("2026-09-14");
    expect(groups[1]!.dayKey).toBe("2026-09-15");
  });
});
