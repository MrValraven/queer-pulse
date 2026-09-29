import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
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
type ReportVariables = {
  memberRef: string;
  body: { reasonCode: string; detail?: string };
};

const {
  hookState,
  checkInMutate,
  leaveMutate,
  acceptMergeMutate,
  blockMutate,
  reportMutate,
  refetchGroup,
  focusHeadingAfterStateChange,
} = vi.hoisted(() => ({
  hookState: {
    group: undefined as GoTogetherGroupDTO | undefined,
    reportError: null as Error | null,
  },
  checkInMutate: vi.fn<(status: "here" | "left") => void>(),
  leaveMutate: vi.fn<(body: undefined, options?: MutateOptions) => void>(),
  acceptMergeMutate:
    vi.fn<(body: undefined, options?: MutateOptions) => void>(),
  blockMutate: vi.fn<(memberRef: string, options?: MutateOptions) => void>(),
  reportMutate:
    vi.fn<(variables: ReportVariables, options?: MutateOptions) => void>(),
  refetchGroup:
    vi.fn<() => Promise<{ error: unknown; data?: GoTogetherGroupDTO }>>(),
  focusHeadingAfterStateChange: vi.fn<() => void>(),
}));

const idleMutation = { isPending: false, isError: false, error: null };

vi.mock("../api/useGoTogetherGroup", () => ({
  useGoTogetherGroup: () => ({
    data: hookState.group,
    isError: false,
    refetch: refetchGroup,
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
vi.mock("../api/useGoTogetherGroupSafety", () => ({
  useBlockGoTogetherGroupMember: () => ({
    ...idleMutation,
    mutate: blockMutate,
  }),
  useReportGoTogetherGroupMember: () => ({
    ...idleMutation,
    isError: Boolean(hookState.reportError),
    error: hookState.reportError,
    mutate: reportMutate,
  }),
}));

vi.mock("../card/goTogetherCardFocus", () => ({
  useFocusHeadingAfterStateChange: () => focusHeadingAfterStateChange,
}));

function member(
  overrides: Partial<GoTogetherGroupMemberDTO>,
): GoTogetherGroupMemberDTO {
  return {
    memberRef: "member-ref-sofia",
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
    member({
      memberRef: "member-ref-rui",
      firstName: "Rui",
      pronouns: "he/him",
    }),
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
      member({
        memberRef: "member-ref-tiago",
        firstName: "Tiago",
        isYou: true,
      }),
      member({}),
      memberWithStrayLastName,
    ],
    mergeOffer: null,
    isLeaveChatOnly: false,
    hasLeftChat: false,
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
  hookState.reportError = null;
  checkInMutate.mockReset();
  blockMutate.mockReset();
  reportMutate.mockReset();
  refetchGroup.mockReset();
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

describe("GoTogetherGroupSheet leave wording (PRD-418)", () => {
  it("reads Leave group before the gathering starts", () => {
    renderSheet(buildGroup({ isLeaveChatOnly: false }));
    expect(
      screen.getByRole("button", { name: "Leave group" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Leave the chat" }),
    ).not.toBeInTheDocument();
  });

  it("reads Leave the chat from the start and says the member stays in the group", () => {
    leaveMutate.mockImplementation((_body, options) => options?.onSuccess?.());
    const onClose = renderSheet(buildGroup({ isLeaveChatOnly: true }));

    const leaveButton = screen.getByRole("button", { name: "Leave the chat" });
    expect(leaveButton).toHaveAccessibleDescription(
      "You stay in the group and can still say who you'd meet again.",
    );
    fireEvent.click(leaveButton);
    const dialog = screen.getByRole("dialog", { name: "Leave the chat?" });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Leave the chat" }),
    );

    expect(leaveMutate).toHaveBeenCalledTimes(1);
    // The card keeps its state, so there is no heading to move focus to.
    expect(focusHeadingAfterStateChange).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("offers no Leave the chat from the start when the group has no chat", () => {
    renderSheet(buildGroup({ isLeaveChatOnly: true, conversationId: null }));
    expect(
      screen.queryByRole("button", { name: "Leave the chat" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Leave group" }),
    ).not.toBeInTheDocument();
  });

  it("keeps Leave group before the start when the group has no chat", () => {
    renderSheet(buildGroup({ isLeaveChatOnly: false, conversationId: null }));
    expect(
      screen.getByRole("button", { name: "Leave group" }),
    ).toBeInTheDocument();
  });

  it("hides Open group chat and Leave once the member has left the chat", () => {
    renderSheet(buildGroup({ isLeaveChatOnly: true, hasLeftChat: true }));
    expect(
      screen.queryByRole("link", { name: "Open group chat" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Leave the chat" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Leave group" }),
    ).not.toBeInTheDocument();
  });
});

function openOptionsFor(name: string) {
  fireEvent.click(screen.getByRole("button", { name: `Options for ${name}` }));
}

describe("GoTogetherGroupSheet member block (PRD-421)", () => {
  it("offers options on every other member's row and none on your own", () => {
    renderSheet(buildGroup());
    expect(
      screen.getByRole("button", { name: "Options for Sofia" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByRole("button", { name: "Options for Rui" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Options for Tiago" }),
    ).not.toBeInTheDocument();
  });

  it("offers no member actions in an ended group", () => {
    renderSheet(buildGroup({ isDissolved: true }));
    expect(
      screen.queryByRole("button", { name: "Options for Sofia" }),
    ).not.toBeInTheDocument();
  });

  it("reveals Block and Report under the row and links no profile", () => {
    renderSheet(buildGroup());
    openOptionsFor("Sofia");
    expect(
      screen.getByRole("button", { name: "Options for Sofia" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: "Block Sofia" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Report Sofia" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Sofia/ })).toBeNull();
  });

  it("tells the blocker they move out of the group before they confirm", () => {
    renderSheet(buildGroup());
    openOptionsFor("Sofia");
    fireEvent.click(screen.getByRole("button", { name: "Block Sofia" }));

    const dialog = screen.getByRole("dialog", { name: "Block Sofia?" });
    expect(dialog).toHaveTextContent(/You'll move out of this group/);
    expect(dialog).toHaveTextContent(/isn't told why/);
    // Inside the last hours the blocker may land on "closed", so the copy
    // promises no return to waiting.
    expect(dialog).not.toHaveTextContent(/back to waiting/);
    expect(dialog).toHaveTextContent(/Your card shows what's next/);
    expect(blockMutate).not.toHaveBeenCalled();
  });

  it("words the block for after the start", () => {
    renderSheet(
      buildGroup({
        isLeaveChatOnly: true,
        event: {
          id: "event-1",
          slug: "pride-picnic",
          title: "Pride picnic",
          startAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          endAt: null,
        },
      }),
    );
    openOptionsFor("Sofia");
    fireEvent.click(screen.getByRole("button", { name: "Block Sofia" }));
    expect(
      screen.getByRole("dialog", { name: "Block Sofia?" }),
    ).toHaveTextContent(/You'll leave this group and its chat/);
  });

  it("blocks by member ref, then closes the sheet once the group answers 404", async () => {
    blockMutate.mockImplementation((_memberRef, options) =>
      options?.onSuccess?.(),
    );
    refetchGroup.mockResolvedValue({
      error: new ApiError(404, "Not found"),
    });
    const onClose = renderSheet(buildGroup());

    openOptionsFor("Sofia");
    fireEvent.click(screen.getByRole("button", { name: "Block Sofia" }));
    const dialog = screen.getByRole("dialog", { name: "Block Sofia?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Block" }));

    expect(blockMutate).toHaveBeenCalledWith(
      "member-ref-sofia",
      expect.anything(),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(refetchGroup).toHaveBeenCalledTimes(1);
    expect(focusHeadingAfterStateChange).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByText(/You've blocked Sofia and left that group/),
    ).toBeInTheDocument();
  });

  it("keeps the sheet open after a late block and focuses the members heading", async () => {
    blockMutate.mockImplementation((_memberRef, options) =>
      options?.onSuccess?.(),
    );
    const startedLongAgo = new Date(
      Date.now() - 20 * 60 * 60 * 1000,
    ).toISOString();
    const lateGroup = buildGroup({
      isLeaveChatOnly: true,
      event: {
        id: "event-1",
        slug: "pride-picnic",
        title: "Pride picnic",
        startAt: startedLongAgo,
        endAt: null,
      },
    });
    refetchGroup.mockResolvedValue({
      error: null,
      data: {
        ...lateGroup,
        members: lateGroup.members.filter(
          (listedMember) => listedMember.memberRef !== "member-ref-rui",
        ),
      },
    });
    const onClose = renderSheet(lateGroup);

    openOptionsFor("Rui");
    fireEvent.click(screen.getByRole("button", { name: "Block Rui" }));
    const dialog = screen.getByRole("dialog", { name: "Block Rui?" });
    expect(dialog).toHaveTextContent(/too late to change groups/);
    fireEvent.click(within(dialog).getByRole("button", { name: "Block" }));

    expect(await screen.findByText("You've blocked Rui.")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    // Nobody moves, so the card is not asked to take focus.
    expect(focusHeadingAfterStateChange).not.toHaveBeenCalled();
    expect(refetchGroup).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Who's going with you" }),
      ).toHaveFocus(),
    );
  });

  it("asks the card for focus as soon as a moving block succeeds", () => {
    blockMutate.mockImplementation((_memberRef, options) =>
      options?.onSuccess?.(),
    );
    // The group read never answers: the focus request must not wait for it.
    refetchGroup.mockReturnValue(new Promise(() => {}));
    renderSheet(buildGroup());

    openOptionsFor("Sofia");
    fireEvent.click(screen.getByRole("button", { name: "Block Sofia" }));
    const dialog = screen.getByRole("dialog", { name: "Block Sofia?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Block" }));

    expect(focusHeadingAfterStateChange).toHaveBeenCalledTimes(1);
  });

  it("reads the group once more when the first read still seats the blocker", async () => {
    blockMutate.mockImplementation((_memberRef, options) =>
      options?.onSuccess?.(),
    );
    const group = buildGroup();
    refetchGroup
      .mockResolvedValueOnce({ error: null, data: group })
      .mockResolvedValueOnce({ error: new ApiError(404, "Not found") });
    const onClose = renderSheet(group);

    openOptionsFor("Sofia");
    fireEvent.click(screen.getByRole("button", { name: "Block Sofia" }));
    const dialog = screen.getByRole("dialog", { name: "Block Sofia?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Block" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled(), {
      timeout: 3000,
    });
    expect(refetchGroup).toHaveBeenCalledTimes(2);
  });

  it("tells a member who came with a friend that the friend moves too", () => {
    const group = buildGroup();
    group.members = group.members.map((listedMember) =>
      listedMember.memberRef === "member-ref-sofia"
        ? { ...listedMember, isPairPartner: true }
        : listedMember,
    );
    renderSheet(group);

    openOptionsFor("Rui");
    fireEvent.click(screen.getByRole("button", { name: "Block Rui" }));
    expect(
      screen.getByRole("dialog", { name: "Block Rui?" }),
    ).toHaveTextContent("Sofia is coming with you, so they move with you.");
  });

  it("tells a member that blocking their friend ends the pair", () => {
    const group = buildGroup();
    group.members = group.members.map((listedMember) =>
      listedMember.memberRef === "member-ref-sofia"
        ? { ...listedMember, isPairPartner: true }
        : listedMember,
    );
    renderSheet(group);

    openOptionsFor("Sofia");
    fireEvent.click(screen.getByRole("button", { name: "Block Sofia" }));
    expect(
      screen.getByRole("dialog", { name: "Block Sofia?" }),
    ).toHaveTextContent("You and Sofia stop being a pair for this gathering.");
  });
});

describe("GoTogetherGroupSheet member options and report (PRD-421)", () => {
  it("keeps one member's options open at a time", () => {
    renderSheet(buildGroup());
    openOptionsFor("Sofia");
    openOptionsFor("Rui");
    expect(
      screen.getByRole("button", { name: "Options for Sofia" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByRole("button", { name: "Options for Rui" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.queryByRole("button", { name: "Block Sofia" }),
    ).not.toBeInTheDocument();
  });

  it("closes the options on Escape, refocuses their toggle and keeps the sheet open", () => {
    const onClose = renderSheet(buildGroup());
    openOptionsFor("Sofia");
    const blockButton = screen.getByRole("button", { name: "Block Sofia" });
    blockButton.focus();

    fireEvent.keyDown(blockButton, { key: "Escape" });

    expect(
      screen.queryByRole("button", { name: "Block Sofia" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Options for Sofia" }),
    ).toHaveFocus();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes the options on a press outside the row", () => {
    renderSheet(buildGroup());
    openOptionsFor("Sofia");

    fireEvent.pointerDown(screen.getByText("Pride picnic"));

    expect(
      screen.queryByRole("button", { name: "Block Sofia" }),
    ).not.toBeInTheDocument();
  });

  it("says a member who already left the group is gone", async () => {
    hookState.reportError = new ApiError(404, "Not found");
    renderSheet(buildGroup());
    openOptionsFor("Sofia");
    fireEvent.click(screen.getByRole("button", { name: "Report Sofia" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "They're no longer in this group.",
    );
  });

  it("reports by member ref with the chosen reason", async () => {
    renderSheet(buildGroup());
    openOptionsFor("Sofia");
    fireEvent.click(screen.getByRole("button", { name: "Report Sofia" }));

    const dialog = screen.getByRole("dialog", { name: "Report Sofia" });
    const send = await within(dialog).findByRole("button", {
      name: "Send report",
    });
    // Nothing is preselected, so nothing can be sent yet.
    expect(send).toBeDisabled();
    fireEvent.click(
      await within(dialog).findByRole("radio", {
        name: "Targeted harassment or threats",
      }),
    );
    fireEvent.click(send);

    expect(reportMutate).toHaveBeenCalledWith(
      {
        memberRef: "member-ref-sofia",
        body: { reasonCode: "harassment", detail: undefined },
      },
      expect.anything(),
    );
  });

  it("caps the report detail at the server's 4000 characters and ticks the chosen reason", async () => {
    renderSheet(buildGroup());
    openOptionsFor("Sofia");
    fireEvent.click(screen.getByRole("button", { name: "Report Sofia" }));

    const dialog = screen.getByRole("dialog", { name: "Report Sofia" });
    expect(within(dialog).getByRole("textbox")).toHaveAttribute(
      "maxlength",
      "4000",
    );
    const reason = await within(dialog).findByRole("radio", {
      name: "Targeted harassment or threats",
    });
    expect(reason.querySelector("svg")).toBeNull();
    fireEvent.click(reason);
    expect(reason).toHaveAttribute("aria-checked", "true");
    expect(reason.querySelector("svg")).not.toBeNull();
  });

  it("shows a flood cap's own message exactly as the server sent it", async () => {
    const capMessage =
      "You've sent several reports today. The ones you sent are with the moderators.";
    hookState.reportError = new ApiError(429, capMessage, {
      code: "REPORT_FLOOD_CAP",
      message: capMessage,
    });
    renderSheet(buildGroup());
    openOptionsFor("Sofia");
    fireEvent.click(screen.getByRole("button", { name: "Report Sofia" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(capMessage);
  });
});
