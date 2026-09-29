import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type {
  GoTogetherGroupDTO,
  GoTogetherGroupMemberDTO,
} from "../api/goTogether.types";
import { gatheringPath } from "../../gatherings/data";
import { GoTogetherGroupSheet } from "./GoTogetherGroupSheet";

/**
 * The full group sheet. The group hooks are mocked so each test drives the
 * group it needs and watches which mutation fires; the real hooks' demo and
 * live branches are covered by the API layer's own tests.
 */

type MutateOptions = { onSuccess?: (result?: unknown) => void };

const {
  hookState,
  checkInMutate,
  leaveMutate,
  acceptMergeMutate,
  focusHeadingAfterStateChange,
} = vi.hoisted(() => ({
  hookState: { group: undefined as GoTogetherGroupDTO | undefined },
  checkInMutate: vi.fn<(status: "here" | "left") => void>(),
  leaveMutate: vi.fn<(body: undefined, options?: MutateOptions) => void>(),
  acceptMergeMutate:
    vi.fn<(body: undefined, options?: MutateOptions) => void>(),
  focusHeadingAfterStateChange: vi.fn<() => void>(),
}));

const idleMutation = { isPending: false, isError: false, error: null };

vi.mock("../api/useGoTogetherGroup", () => ({
  useGoTogetherGroup: () => ({
    data: hookState.group,
    isError: false,
    refetch: vi.fn(),
  }),
  useGoTogetherCheckIn: () => ({ ...idleMutation, mutate: checkInMutate }),
  useLeaveGoTogetherGroup: () => ({ ...idleMutation, mutate: leaveMutate }),
  useAcceptGoTogetherMerge: () => ({
    ...idleMutation,
    mutate: acceptMergeMutate,
  }),
}));

// The card provides this in real use (see goTogetherCardFocus.ts); the sheet
// also opens from a plain chat banner with no card nearby, so the sheet must
// only ask for the focus move and never assume a provider is there.
vi.mock("../card/goTogetherCardFocus", () => ({
  useFocusHeadingAfterStateChange: () => focusHeadingAfterStateChange,
}));

function member(
  overrides: Partial<GoTogetherGroupMemberDTO>,
): GoTogetherGroupMemberDTO {
  return {
    slug: "sofia",
    firstName: "Sofia",
    pronouns: "she/her",
    avatarUrl: null,
    isYou: false,
    isPairPartner: false,
    isHere: false,
    hasLeftEvent: false,
    ...overrides,
  };
}

function buildGroup(overrides: Partial<GoTogetherGroupDTO> = {}) {
  // A server that ever sent a last name must still see it left off screen.
  const memberWithStrayLastName = Object.assign(
    member({ slug: "rui", firstName: "Rui", pronouns: "he/him" }),
    { lastName: "Marques" },
  );
  const group: GoTogetherGroupDTO = {
    id: "group-1",
    event: {
      id: "event-1",
      slug: "pride-picnic",
      title: "Pride picnic",
      startAt: "2026-10-10T16:00:00.000Z",
      endAt: null,
    },
    band: "strong",
    reasons: [
      { kind: "energy", level: "calm" },
      { kind: "area", areaId: "Arroios", count: 2, total: 4 },
    ],
    meetingPointNote: "By the fountain at the park entrance",
    conversationId: "conversation-1",
    isDissolved: false,
    members: [
      member({ slug: "tiago", firstName: "Tiago", isYou: true }),
      member({}),
      memberWithStrayLastName,
    ],
    mergeOffer: null,
    checkIn: { isOpen: true, isHere: false, hasLeftEvent: false },
    feedback: { isOpen: false, closesAt: null, hasAnswered: false },
    ...overrides,
  };
  return group;
}

function renderSheet(
  group: GoTogetherGroupDTO,
  openedFromConversationId?: string,
) {
  const onClose = vi.fn();
  hookState.group = group;
  render(
    <TestProviders>
      <GoTogetherGroupSheet
        groupId={group.id}
        eventSlug={group.event.slug}
        openedFromConversationId={openedFromConversationId}
        onClose={onClose}
      />
    </TestProviders>,
  );
  return onClose;
}

afterEach(() => {
  hookState.group = undefined;
  checkInMutate.mockReset();
  leaveMutate.mockReset();
  acceptMergeMutate.mockReset();
  focusHeadingAfterStateChange.mockReset();
});

describe("GoTogetherGroupSheet", () => {
  it("shows each member's first name and pronouns and no last name", () => {
    renderSheet(buildGroup());
    expect(screen.getByText("Sofia")).toBeInTheDocument();
    expect(screen.getByText("she/her")).toBeInTheDocument();
    expect(screen.getByText("Rui")).toBeInTheDocument();
    expect(screen.getByText("he/him")).toBeInTheDocument();
    expect(screen.queryByText(/Marques/)).not.toBeInTheDocument();
  });

  it("offers I'm here before arrival and sends the here status", () => {
    renderSheet(buildGroup());
    fireEvent.click(screen.getByRole("button", { name: "I'm here" }));
    expect(checkInMutate).toHaveBeenCalledWith("here");
    expect(
      screen.queryByRole("button", { name: "I've left" }),
    ).not.toBeInTheDocument();
  });

  it("offers I've left once the member is here and sends the left status", () => {
    renderSheet(
      buildGroup({
        checkIn: { isOpen: true, isHere: true, hasLeftEvent: false },
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "I've left" }));
    expect(checkInMutate).toHaveBeenCalledWith("left");
    expect(
      screen.queryByRole("button", { name: "I'm here" }),
    ).not.toBeInTheDocument();
  });

  it("hides check-in while it is closed", () => {
    renderSheet(
      buildGroup({
        checkIn: { isOpen: false, isHere: false, hasLeftEvent: false },
      }),
    );
    expect(
      screen.queryByRole("button", { name: "I'm here" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "I've left" }),
    ).not.toBeInTheDocument();
  });

  it("asks before leaving, then leaves and closes the sheet", () => {
    leaveMutate.mockImplementation((_body, options) => options?.onSuccess?.());
    const onClose = renderSheet(buildGroup());

    fireEvent.click(screen.getByRole("button", { name: "Leave group" }));
    expect(leaveMutate).not.toHaveBeenCalled();

    const dialog = screen.getByRole("dialog", { name: "Leave this group?" });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Leave group" }),
    );

    expect(leaveMutate).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalled();
  });

  it("asks the card to move focus to its heading once the leave succeeds", () => {
    leaveMutate.mockImplementation((_body, options) => options?.onSuccess?.());
    renderSheet(buildGroup());

    fireEvent.click(screen.getByRole("button", { name: "Leave group" }));
    const dialog = screen.getByRole("dialog", { name: "Leave this group?" });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Leave group" }),
    );

    expect(focusHeadingAfterStateChange).toHaveBeenCalledTimes(1);
  });

  it("offers a merge and accepts it", () => {
    renderSheet(buildGroup({ mergeOffer: { groupId: "group-2" } }));
    fireEvent.click(screen.getByRole("button", { name: "Join another group" }));
    expect(acceptMergeMutate).toHaveBeenCalledTimes(1);
  });

  it("never shows a percentage", () => {
    renderSheet(buildGroup({ mergeOffer: { groupId: "group-2" } }));
    expect(document.body.textContent).not.toContain("%");
  });

  it("links Tell someone where you'll be to the gathering's Share plans", () => {
    renderSheet(buildGroup());
    expect(
      screen.getByRole("link", { name: "Tell someone where you'll be" }),
    ).toHaveAttribute("href", `${gatheringPath("pride-picnic")}?share=plans`);
  });

  it("hides Open group chat inside the chat it opens", () => {
    renderSheet(buildGroup(), "conversation-1");
    expect(
      screen.queryByRole("link", { name: "Open group chat" }),
    ).not.toBeInTheDocument();
  });

  it("offers the merged group's chat from inside the old one", () => {
    renderSheet(
      buildGroup({ conversationId: "conversation-2" }),
      "conversation-1",
    );
    expect(
      screen.getByRole("link", { name: "Open group chat" }),
    ).toHaveAttribute("href", "/messages?c=conversation-2");
  });
});
