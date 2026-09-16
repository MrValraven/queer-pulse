import { describe, expect, it } from "vitest";
import type {
  AuthorSummary,
  ConversationResponse,
} from "../../../shared/contracts/contracts";
import type { TFunction } from "../../../shared/i18n/types";
import { conversationToView } from "./messages.adapters";

/**
 * PRD-349: `conversationToView` must map `ConversationResponse.muteMode`
 * onto the `Conversation` view model for BOTH a DM and a group row (the two
 * branches inside `conversationToView`/`groupConversationToView`), so the
 * row menu and inbox indicator can see the caller's real mute mode in live
 * mode instead of always reading `undefined` ("all").
 */

const fakeT: TFunction = (key) => key;

function author(overrides: Partial<AuthorSummary> = {}): AuthorSummary {
  return {
    handle: "jordan",
    displayName: "Jordan Park",
    avatarUrl: null,
    ...overrides,
  };
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

describe("conversationToView: muteMode mapping (DM)", () => {
  it("maps a mentionsOnly DM row's muteMode onto the view model", () => {
    const view = conversationToView(
      conversation({ muteMode: "mentionsOnly" }),
      fakeT,
    );
    expect(view.muteMode).toBe("mentionsOnly");
  });

  it("leaves an absent muteMode as undefined, honest about the unknown state", () => {
    const view = conversationToView(conversation({}), fakeT);
    expect(view.muteMode).toBeUndefined();
  });
});

describe("conversationToView: muteMode mapping (group)", () => {
  it("maps a mentionsOnly group row's muteMode onto the view model", () => {
    const view = conversationToView(
      conversation({
        kind: "group",
        type: "group",
        title: "Pride Brunch Crew",
        muteMode: "mentionsOnly",
      }),
      fakeT,
    );
    expect(view.isGroup).toBe(true);
    expect(view.muteMode).toBe("mentionsOnly");
  });
});
