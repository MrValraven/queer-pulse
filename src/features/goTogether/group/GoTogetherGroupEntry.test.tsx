import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { GoTogetherGroupDTO } from "../api/goTogether.types";
import { GoTogetherGroupEntry } from "./GoTogetherGroupEntry";

/**
 * The compact group block on the gathering card. The group hooks are mocked
 * so each test drives the group it needs; the demo/live branches are covered
 * by the API layer's own tests.
 */

type MutateOptions = { onSuccess?: (result?: unknown) => void };

const { hookState } = vi.hoisted(() => ({
  hookState: { group: undefined as GoTogetherGroupDTO | undefined },
}));

const idleMutation = {
  isPending: false,
  isError: false,
  error: null,
  mutate: vi.fn<(body: unknown, options?: MutateOptions) => void>(),
};

vi.mock("../api/useGoTogetherGroup", () => ({
  useGoTogetherGroup: () => ({
    data: hookState.group,
    isError: false,
    refetch: vi.fn(),
  }),
  useGoTogetherCheckIn: () => idleMutation,
  useLeaveGoTogetherGroup: () => idleMutation,
  useAcceptGoTogetherMerge: () => idleMutation,
}));

function buildGroup(
  overrides: Partial<GoTogetherGroupDTO> = {},
): GoTogetherGroupDTO {
  return {
    id: "group-1",
    event: {
      id: "event-1",
      slug: "pride-picnic",
      title: "Pride picnic",
      startAt: "2026-10-10T16:00:00.000Z",
      endAt: null,
    },
    band: "strong",
    reasons: [{ kind: "energy", level: "calm" }],
    meetingPointNote: null,
    conversationId: null,
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
    feedback: { isOpen: true, closesAt: null, hasAnswered: false },
    ...overrides,
  };
}

function renderEntry(group: GoTogetherGroupDTO, isFeedbackDue = true) {
  hookState.group = group;
  render(
    <TestProviders>
      <GoTogetherGroupEntry
        groupId={group.id}
        eventSlug={group.event.slug}
        isFeedbackDue={isFeedbackDue}
      />
    </TestProviders>,
  );
}

afterEach(() => {
  hookState.group = undefined;
});

describe("GoTogetherGroupEntry", () => {
  it("links the feedback CTA through the route key", () => {
    renderEntry(buildGroup());
    expect(
      screen.getByRole("link", { name: "Tell us how it went" }),
    ).toHaveAttribute("href", "/go-together/feedback/group-1");
  });

  it("softens the feedback CTA to an edit action once answered", () => {
    renderEntry(
      buildGroup({
        feedback: { isOpen: true, closesAt: null, hasAnswered: true },
      }),
    );
    expect(
      screen.queryByRole("link", { name: "Tell us how it went" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Change how it went" }),
    ).toHaveAttribute("href", "/go-together/feedback/group-1");
  });

  it("links Open group chat while the member is in the chat", () => {
    renderEntry(buildGroup({ conversationId: "conversation-9" }), false);
    expect(
      screen.getByRole("link", { name: "Open group chat" }),
    ).toHaveAttribute("href", "/messages?c=conversation-9");
  });

  it("drops Open group chat once the member has left the chat", () => {
    renderEntry(
      buildGroup({
        conversationId: "conversation-9",
        isLeaveChatOnly: true,
        hasLeftChat: true,
      }),
      false,
    );
    expect(
      screen.queryByRole("link", { name: "Open group chat" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "See your group" }),
    ).toBeInTheDocument();
  });

  it("opens the group sheet from See your group", () => {
    renderEntry(buildGroup(), false);
    fireEvent.click(screen.getByRole("button", { name: "See your group" }));
    expect(
      screen.getByRole("dialog", { name: "Your Go together group" }),
    ).toBeInTheDocument();
  });
});
