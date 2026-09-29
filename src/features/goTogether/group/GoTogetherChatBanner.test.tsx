import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { Conversation } from "../../messages/data";
import type { GoTogetherGroupDTO } from "../api/goTogether.types";
import { GoTogetherChatBanner } from "./GoTogetherChatBanner";

/**
 * The one-line banner in a matched group's chat. The group hooks are mocked,
 * and the test records which group id the banner asked for, so a hidden
 * banner is also shown to leave the group unread.
 */

const { requestedGroupIds } = vi.hoisted(() => ({
  requestedGroupIds: [] as (string | undefined)[],
}));

const idleMutation = {
  isPending: false,
  isError: false,
  error: null,
  mutate: vi.fn(),
};

const group: GoTogetherGroupDTO = {
  id: "group-1",
  event: {
    id: "event-1",
    slug: "pride-picnic",
    title: "Pride picnic",
    startAt: "2026-10-10T16:00:00.000Z",
    endAt: null,
  },
  band: "good",
  reasons: [{ kind: "energy", level: "lively" }],
  meetingPointNote: null,
  conversationId: "conversation-1",
  isDissolved: false,
  members: [
    {
      memberRef: "member-ref-tiago",
      firstName: "Tiago",
      pronouns: "he/they",
      avatarUrl: null,
      isYou: true,
      isPairPartner: false,
      isHere: false,
      hasLeftEvent: false,
    },
  ],
  mergeOffer: null,
  isLeaveChatOnly: false,
  hasLeftChat: false,
  checkIn: { isOpen: false, isHere: false, hasLeftEvent: false },
  feedback: { isOpen: false, closesAt: null, hasAnswered: false },
};

vi.mock("../api/useGoTogetherGroup", () => ({
  useGoTogetherGroup: (groupId: string | undefined) => {
    requestedGroupIds.push(groupId);
    return {
      data: groupId ? group : undefined,
      isError: false,
      refetch: vi.fn(),
    };
  },
  useGoTogetherCheckIn: () => idleMutation,
  useLeaveGoTogetherGroup: () => idleMutation,
  useAcceptGoTogetherMerge: () => idleMutation,
}));

function conversation(overrides: Partial<Conversation>): Conversation {
  return {
    id: "conversation-1",
    initials: "PP",
    tint: "default",
    name: "Pride picnic",
    pronouns: "",
    connectedSince: "",
    time: "",
    preview: "",
    unread: false,
    messages: [],
    isGroup: true,
    hasLeft: false,
    eventMatchGroupId: "group-1",
    ...overrides,
  };
}

function renderBanner(overrides: Partial<Conversation>) {
  render(
    <TestProviders>
      <GoTogetherChatBanner conversation={conversation(overrides)} />
    </TestProviders>,
  );
}

afterEach(() => {
  requestedGroupIds.length = 0;
});

describe("GoTogetherChatBanner", () => {
  it("stays hidden in a DM", () => {
    renderBanner({ isGroup: false });
    expect(
      screen.queryByRole("region", { name: /Pride picnic/ }),
    ).not.toBeInTheDocument();
    expect(requestedGroupIds.every((groupId) => !groupId)).toBe(true);
  });

  it("stays hidden in a group chat with no matched group", () => {
    renderBanner({ eventMatchGroupId: null });
    expect(
      screen.queryByRole("button", { name: "See your group" }),
    ).not.toBeInTheDocument();
    expect(requestedGroupIds.every((groupId) => !groupId)).toBe(true);
  });

  it("stays hidden once the member has left the group", () => {
    renderBanner({ hasLeft: true });
    expect(
      screen.queryByRole("button", { name: "See your group" }),
    ).not.toBeInTheDocument();
    expect(requestedGroupIds.every((groupId) => !groupId)).toBe(true);
  });

  it("names the group, carries the gathering in its label and opens the group sheet", () => {
    renderBanner({});
    const banner = screen.getByRole("region", {
      name: "Your Go together group for Pride picnic",
    });
    // The chat header already shows the gathering's title.
    expect(banner).toHaveTextContent("Your Go together group");
    expect(banner).not.toHaveTextContent("Pride picnic");
    expect(screen.getByText("Good fit")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "See your group" }));

    expect(
      screen.getByRole("dialog", { name: "Your Go together group" }),
    ).toBeInTheDocument();
  });
});
