import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { routes } from "../../../app/routeMap";
import { ApiError } from "../../../shared/api/client";
import { createFormatters } from "../../../shared/i18n/format";
import { gatheringDetails, gatheringPath } from "../../gatherings/data";
import type { GatheringDetail } from "../../gatherings/data";
import type {
  GoTogetherCardDTO,
  GoTogetherGroupDTO,
} from "../api/goTogether.types";
import { goTogetherKeys } from "../api/goTogetherKeys";
import { GoTogetherCard } from "./GoTogetherCard";

/**
 * The Go together card on a gathering page. The card query, the card writes,
 * the connections list and the verification modal are mocked, so each test
 * drives one card state and checks what the member sees and what gets sent.
 */

/** What the mocked card and group queries answer with. Typed up front so
 *  each test can assign a DTO. */
interface CardMockState {
  data: GoTogetherCardDTO | undefined;
  error: Error | null;
  isFetching: boolean;
}
interface GroupMockState {
  data: GoTogetherGroupDTO | undefined;
}

const {
  cardState,
  mutationState,
  optInMutate,
  withdrawMutate,
  acceptPairMutate,
  declinePairMutate,
  revealMutate,
  answerAgainMutate,
  refetchCard,
  groupState,
} = vi.hoisted(() => {
  const cardMock: CardMockState = {
    data: undefined,
    error: null,
    isFetching: false,
  };
  const groupMock: GroupMockState = { data: undefined };
  return {
    cardState: cardMock,
    mutationState: {
      optInError: null as Error | null,
      answerAgainError: null as Error | null,
    },
    optInMutate: vi.fn(),
    withdrawMutate: vi.fn(),
    acceptPairMutate: vi.fn(),
    declinePairMutate: vi.fn(),
    revealMutate: vi.fn(),
    answerAgainMutate: vi.fn(),
    refetchCard: vi.fn(),
    groupState: groupMock,
  };
});

vi.mock("../api/useGoTogetherCard", () => ({
  useGoTogetherCard: () => ({
    data: cardState.data,
    error: cardState.error,
    isError: cardState.error !== null,
    isFetching: cardState.isFetching,
    refetch: refetchCard,
  }),
}));

vi.mock("../api/useGoTogetherMutations", () => ({
  useOptInGoTogether: () => ({
    mutate: optInMutate,
    isPending: false,
    error: mutationState.optInError,
  }),
  useWithdrawGoTogether: () => ({
    mutate: withdrawMutate,
    isPending: false,
    error: null,
  }),
  useAcceptGoTogetherPair: () => ({
    mutate: acceptPairMutate,
    isPending: false,
    error: null,
  }),
  useDeclineGoTogetherPair: () => ({
    mutate: declinePairMutate,
    isPending: false,
    error: null,
  }),
  useRevealDemoGoTogetherGroup: () => ({
    mutate: revealMutate,
    isPending: false,
    error: null,
  }),
  useAnswerGoTogetherHostQuestions: () => ({
    mutate: answerAgainMutate,
    isPending: false,
    error: mutationState.answerAgainError,
  }),
}));

vi.mock("../api/useGoTogetherGroup", () => ({
  useGoTogetherGroup: () => ({
    data: groupState.data,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useGoTogetherCheckIn: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  }),
  useLeaveGoTogetherGroup: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  }),
  useAcceptGoTogetherMerge: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

vi.mock("../../connect/api/useConnectionsList", () => ({
  useConnectionsList: () => ({
    views: [
      { slug: "sofia", name: "Sofia Reis", photo: undefined, pron: "she/her" },
      { slug: "rui", name: "Rui Matos", photo: undefined, pron: "he/him" },
    ],
    loading: false,
    isError: false,
    refetch: vi.fn(),
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
    total: 2,
  }),
}));

vi.mock("../../economy/StepUpVerificationModal", () => ({
  StepUpVerificationModal: ({ requiredLevel }: { requiredLevel: string }) => (
    <div data-testid="step-up-modal">{requiredLevel}</div>
  ),
}));

afterEach(() => {
  cardState.data = undefined;
  cardState.error = null;
  cardState.isFetching = false;
  groupState.data = undefined;
  mutationState.optInError = null;
  mutationState.answerAgainError = null;
  optInMutate.mockReset();
  withdrawMutate.mockReset();
  acceptPairMutate.mockReset();
  declinePairMutate.mockReset();
  revealMutate.mockReset();
  answerAgainMutate.mockReset();
  refetchCard.mockReset();
});

const SLUG = Object.keys(gatheringDetails)[0] ?? "portfolio-night";

const HOST_QUESTION = {
  id: "q1",
  prompt: "Picnic or pub after?",
  options: [
    { id: "q1o1", label: "Picnic" },
    { id: "q1o2", label: "Pub" },
  ],
};

function makeCard(overrides: Partial<GoTogetherCardDTO>): GoTogetherCardDTO {
  return {
    state: "notOptedIn",
    ineligibleReason: null,
    cutoffAt: "2026-10-08T17:00:00.000Z",
    optInClosesAt: "2026-10-10T13:00:00.000Z",
    hostQuestions: [HOST_QUESTION],
    pair: null,
    lens: null,
    groupId: null,
    profile: { exists: true, needsRefresh: false },
    unansweredHostQuestionIds: [],
    ...overrides,
  };
}

function makeGathering(
  myRsvpStatus: GatheringDetail["myRsvpStatus"] = "going",
): GatheringDetail {
  const base = gatheringDetails[SLUG] as GatheringDetail;
  return { ...base, slug: SLUG, myRsvpStatus };
}

function renderCard(
  card: GoTogetherCardDTO,
  gathering = makeGathering(),
  initialEntries?: string[],
) {
  cardState.data = card;
  const tree = (
    <TestProviders initialEntries={initialEntries}>
      <GoTogetherCard gathering={gathering} />
    </TestProviders>
  );
  const result = render(tree);
  return { ...result, rerenderCard: () => result.rerender(tree) };
}

function confirmButton(name: RegExp) {
  return screen.getByRole("button", { name });
}

function makeGroup(): GoTogetherGroupDTO {
  return {
    id: "group-1",
    event: {
      id: "event-1",
      slug: SLUG,
      title: "Portfolio night",
      startAt: "2026-10-10T19:00:00.000Z",
      endAt: null,
    },
    band: "strong",
    reasons: [],
    meetingPointNote: null,
    conversationId: "conv-1",
    isDissolved: false,
    members: [
      {
        memberRef: "member-tiago",
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
}

function makePair(
  direction: "sent" | "received",
): NonNullable<GoTogetherCardDTO["pair"]> {
  return {
    partner: {
      slug: "sofia",
      firstName: "Sofia",
      lastName: "Reis",
      pronouns: "she/her",
      avatarUrl: null,
    },
    status: "pending",
    direction,
  };
}

function makePairInviteCard(): GoTogetherCardDTO {
  return makeCard({ state: "pairInvite", pair: makePair("received") });
}

/** A cutoff three days ahead of now, so the reveal line shows a real date
 *  whenever the suite runs. */
function futureCutoff(): string {
  return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
}

describe("GoTogetherCard", () => {
  it("renders nothing when Go together is unavailable", () => {
    renderCard(makeCard({ state: "unavailable" }));
    expect(
      screen.queryByRole("heading", { name: "Go together" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("renders nothing for a member who is not going", () => {
    renderCard(makeCard({ state: "notOptedIn" }), makeGathering(null));
    expect(
      screen.queryByRole("heading", { name: "Go together" }),
    ).not.toBeInTheDocument();
  });

  it("links to the questionnaire with a return param back to the card on the gathering", () => {
    renderCard(makeCard({ state: "questionnaireNeeded" }));
    const link = screen.getByRole("link", { name: "Answer the questions" });
    expect(link).toHaveAttribute(
      "href",
      `${routes.goTogetherQuestionnaire}?return=${encodeURIComponent(`${gatheringPath(SLUG)}#go-together`)}`,
    );
  });

  it("gives the card section the anchor the return path points at", () => {
    renderCard(makeCard({ state: "notOptedIn" }));
    const heading = screen.getByRole("heading", { name: "Go together" });
    expect(heading.closest("section")).toHaveAttribute("id", "go-together");
  });

  it("focuses the card heading when the page opens on the card's anchor", () => {
    renderCard(makeCard({ state: "notOptedIn" }), makeGathering(), [
      `${gatheringPath(SLUG)}#go-together`,
    ]);
    expect(screen.getByRole("heading", { name: "Go together" })).toHaveFocus();
  });

  it("leaves focus alone when the page opens without the card's anchor", () => {
    renderCard(makeCard({ state: "notOptedIn" }), makeGathering(), [
      gatheringPath(SLUG),
    ]);
    expect(
      screen.getByRole("heading", { name: "Go together" }),
    ).not.toHaveFocus();
  });
});

describe("GoTogetherCard opt-in form", () => {
  it("shows the partner picker for With a friend and opts in as a pair", () => {
    renderCard(makeCard({ state: "notOptedIn" }));
    expect(
      screen.getByText("Going solo or with one friend?"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: /With a friend/ }));
    expect(screen.getByText("Who are you going with?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("option", { name: /Sofia Reis/ }));
    fireEvent.click(screen.getByRole("radio", { name: "Picnic" }));
    fireEvent.click(confirmButton(/Count me in/));

    expect(optInMutate).toHaveBeenCalledTimes(1);
    expect(optInMutate.mock.calls[0]?.[0]).toEqual({
      mode: "pair",
      partnerSlug: "sofia",
      hostAnswers: { q1: "q1o1" },
      lens: null,
      lensConsent: false,
    });
  });

  it("keeps confirm unavailable while a lens is chosen and consent is unticked", () => {
    renderCard(makeCard({ state: "notOptedIn" }));
    fireEvent.click(screen.getByRole("radio", { name: /Solo/ }));
    fireEvent.click(screen.getByRole("radio", { name: "Picnic" }));
    expect(confirmButton(/Count me in/)).not.toHaveAttribute("aria-disabled");

    fireEvent.click(
      screen.getByRole("radio", { name: /Trans and non-binary folks/ }),
    );
    expect(confirmButton(/Count me in/)).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    fireEvent.click(confirmButton(/Count me in/));
    expect(optInMutate).not.toHaveBeenCalled();

    const consent = screen.getByRole("checkbox");
    expect(consent).not.toBeChecked();
    fireEvent.click(consent);
    expect(confirmButton(/Count me in/)).not.toHaveAttribute("aria-disabled");

    fireEvent.click(confirmButton(/Count me in/));
    expect(optInMutate.mock.calls[0]?.[0]).toMatchObject({
      mode: "solo",
      lens: "transNonBinary",
      lensConsent: true,
    });
  });

  it("sends lens null and lensConsent false when No lens is chosen", () => {
    renderCard(makeCard({ state: "notOptedIn" }));
    fireEvent.click(screen.getByRole("radio", { name: /Solo/ }));
    fireEvent.click(screen.getByRole("radio", { name: "Pub" }));
    fireEvent.click(screen.getByRole("radio", { name: /Women and femmes/ }));
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("radio", { name: /No lens/ }));
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();

    fireEvent.click(confirmButton(/Count me in/));
    expect(optInMutate.mock.calls[0]?.[0]).toEqual({
      mode: "solo",
      hostAnswers: { q1: "q1o2" },
      lens: null,
      lensConsent: false,
    });
  });

  it("says why Count me in is unavailable and links the reason to the button", () => {
    renderCard(makeCard({ state: "notOptedIn" }));
    fireEvent.click(screen.getByRole("radio", { name: /With a friend/ }));
    const confirm = confirmButton(/Count me in/);
    expect(confirm).toBeEnabled();
    expect(confirm).toHaveAttribute("aria-disabled", "true");
    expect(confirm).toHaveAccessibleDescription("Pick a friend to continue.");
    confirm.focus();
    expect(confirm).toHaveFocus();

    fireEvent.click(screen.getByRole("option", { name: /Sofia Reis/ }));
    expect(confirmButton(/Count me in/)).toHaveAccessibleDescription(
      "Answer each question from the host to continue.",
    );

    fireEvent.click(screen.getByRole("radio", { name: "Picnic" }));
    expect(confirmButton(/Count me in/)).not.toHaveAttribute("aria-disabled");
    expect(confirmButton(/Count me in/)).not.toHaveAttribute(
      "aria-describedby",
    );
  });

  it("announces the reason when the unavailable Count me in is pressed", () => {
    renderCard(makeCard({ state: "notOptedIn" }));
    fireEvent.click(screen.getByRole("radio", { name: /With a friend/ }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    fireEvent.click(confirmButton(/Count me in/));
    expect(optInMutate).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Pick a friend to continue.",
    );
    expect(confirmButton(/Count me in/)).toHaveAccessibleDescription(
      "Pick a friend to continue.",
    );
  });

  it("refetches the card when opting in finds no questionnaire answers", () => {
    optInMutate.mockImplementation(
      (_body: unknown, options?: { onError?: (error: Error) => void }) =>
        options?.onError?.(
          new ApiError(409, "Profile needed", {
            code: "GO_TOGETHER_PROFILE_NEEDED",
          }),
        ),
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    cardState.data = makeCard({ state: "notOptedIn" });
    render(
      <TestProviders queryClient={queryClient}>
        <GoTogetherCard gathering={makeGathering()} />
      </TestProviders>,
    );
    fireEvent.click(screen.getByRole("radio", { name: /Solo/ }));
    fireEvent.click(screen.getByRole("radio", { name: "Picnic" }));
    fireEvent.click(confirmButton(/Count me in/));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: goTogetherKeys.cardRoot,
    });
  });

  it("shows the partner copy on PARTNER_UNAVAILABLE and keeps the mode and answers", () => {
    const { rerenderCard } = renderCard(makeCard({ state: "notOptedIn" }));
    fireEvent.click(screen.getByRole("radio", { name: /With a friend/ }));
    fireEvent.click(screen.getByRole("option", { name: /Rui Matos/ }));
    fireEvent.click(screen.getByRole("radio", { name: "Pub" }));
    fireEvent.click(confirmButton(/Count me in/));
    expect(optInMutate).toHaveBeenCalledTimes(1);

    mutationState.optInError = new ApiError(409, "Partner unavailable", {
      code: "GO_TOGETHER_PARTNER_UNAVAILABLE",
    });
    rerenderCard();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "That friend can't go together with you",
    );
    expect(
      screen.getByRole("radio", { name: /With a friend/ }),
    ).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("option", { name: /Rui Matos/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("radio", { name: "Pub" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});

describe("GoTogetherCard states after opting in", () => {
  it("shows the reveal time from cutoffAt and stops looking for a group", () => {
    const cutoffAt = futureCutoff();
    renderCard(makeCard({ state: "waiting", cutoffAt }));
    const format = createFormatters("en");
    const cutoff = new Date(cutoffAt);
    const day = format.date(cutoff, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const time = format.time(cutoff);
    expect(
      screen.getByText(`Your group lands ${day} at ${time}`),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Stop looking for a group" }),
    );
    expect(withdrawMutate).toHaveBeenCalledTimes(1);
  });

  it("says the group lands soon once the cutoff has passed", () => {
    renderCard(
      makeCard({ state: "waiting", cutoffAt: "2020-01-01T10:00:00.000Z" }),
    );
    expect(screen.getByText("Your group lands soon")).toBeInTheDocument();
    expect(screen.queryByText(/2020/)).not.toBeInTheDocument();
  });

  it("shows the pending line to a waiting member who sent a pair invite", () => {
    renderCard(makeCard({ state: "waiting", pair: makePair("sent") }));
    expect(screen.getByText(/Sofia/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Accept" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Change how I'm going" }),
    ).toBeInTheDocument();
  });

  it("lets a waiting member answer a pair invite they received", () => {
    const waitingInvitee = makeCard({
      state: "waiting",
      pair: makePair("received"),
    });
    const { unmount } = renderCard(waitingInvitee);
    expect(screen.getByText("Sofia wants to go together")).toBeInTheDocument();
    expect(screen.queryByText(/Waiting for Sofia/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Stop looking for a group" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Accept" }));
    fireEvent.click(screen.getByRole("radio", { name: "Pub" }));
    fireEvent.click(screen.getByRole("button", { name: "Go with Sofia" }));
    expect(acceptPairMutate.mock.calls[0]?.[0]).toEqual({
      hostAnswers: { q1: "q1o2" },
      lens: null,
      lensConsent: false,
    });
    expect(optInMutate).not.toHaveBeenCalled();
    unmount();

    renderCard(waitingInvitee);
    fireEvent.click(screen.getByRole("button", { name: "Decline" }));
    expect(declinePairMutate).toHaveBeenCalledTimes(1);
  });

  it("lets an unmatched member stop looking for a group", () => {
    renderCard(makeCard({ state: "unmatched" }));
    expect(
      screen.getByText("Not enough people for a group yet"),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Stop looking for a group" }),
    );
    expect(withdrawMutate).toHaveBeenCalledTimes(1);
  });

  it("opens Change how I'm going on the current mode under the mode question", () => {
    renderCard(makeCard({ state: "waiting" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Change how I'm going" }),
    );
    expect(
      screen.getByRole("radiogroup", { name: "How are you going?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Solo/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("opens the phone verification step for a member who is not verified", () => {
    renderCard(
      makeCard({ state: "ineligible", ineligibleReason: "notVerified" }),
    );
    expect(screen.queryByTestId("step-up-modal")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Verify my account" }));
    expect(screen.getByTestId("step-up-modal")).toHaveTextContent("phone");
  });

  it("offers Accept, which opens the host questions and lens step, and Decline", () => {
    const pairCard = makePairInviteCard();
    const { unmount } = renderCard(pairCard);
    expect(screen.getByText("Sofia wants to go together")).toBeInTheDocument();
    expect(
      screen.queryByRole("radio", { name: /No lens/ }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Accept" }));
    expect(screen.getByRole("radio", { name: /No lens/ })).toBeInTheDocument();
    expect(
      screen.queryByRole("radio", { name: /With a friend/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Picnic" }));
    fireEvent.click(screen.getByRole("button", { name: "Go with Sofia" }));
    expect(acceptPairMutate.mock.calls[0]?.[0]).toEqual({
      hostAnswers: { q1: "q1o1" },
      lens: null,
      lensConsent: false,
    });
    unmount();

    renderCard(pairCard);
    fireEvent.click(screen.getByRole("button", { name: "Decline" }));
    expect(declinePairMutate).toHaveBeenCalledTimes(1);
  });

  it("renders the group entry with a link to the group chat once grouped", async () => {
    groupState.data = makeGroup();
    renderCard(makeCard({ state: "grouped", groupId: "group-1" }));

    await waitFor(() => {
      const chatLinks = screen.getAllByRole("link").filter((link) => {
        const href = link.getAttribute("href") ?? "";
        return href.startsWith("/messages") && href.includes("c=conv-1");
      });
      expect(chatLinks.length).toBeGreaterThan(0);
    });
  });
});

/** Actions that swap the panel under the pressed button move focus to a
 *  sensible place, so it never drops to the page body. */
describe("GoTogetherCard focus", () => {
  const cardHeading = () =>
    screen.getByRole("heading", { name: "Go together" });

  it("moves focus to the card heading after Count me in succeeds", () => {
    optInMutate.mockImplementation(
      (_body: unknown, options?: { onSuccess?: () => void }) =>
        options?.onSuccess?.(),
    );
    renderCard(makeCard({ state: "notOptedIn" }));
    fireEvent.click(screen.getByRole("radio", { name: /Solo/ }));
    fireEvent.click(screen.getByRole("radio", { name: "Picnic" }));
    fireEvent.click(confirmButton(/Count me in/));

    expect(optInMutate).toHaveBeenCalledTimes(1);
    expect(cardHeading()).toHaveFocus();
  });

  it("keeps focus on the form when Count me in fails", () => {
    renderCard(makeCard({ state: "notOptedIn" }));
    fireEvent.click(screen.getByRole("radio", { name: /Solo/ }));
    fireEvent.click(screen.getByRole("radio", { name: "Picnic" }));
    const confirm = confirmButton(/Count me in/);
    confirm.focus();
    fireEvent.click(confirm);

    expect(cardHeading()).not.toHaveFocus();
    expect(confirm).toHaveFocus();
  });

  it("moves focus to the card heading when a stale refusal refetches the card into a new state", () => {
    optInMutate.mockImplementation(
      (_body: unknown, options?: { onError?: (error: Error) => void }) =>
        options?.onError?.(
          new ApiError(409, "Locked", { code: "GO_TOGETHER_LOCKED" }),
        ),
    );
    const { rerenderCard } = renderCard(makeCard({ state: "notOptedIn" }));
    fireEvent.click(screen.getByRole("radio", { name: /Solo/ }));
    fireEvent.click(screen.getByRole("radio", { name: "Picnic" }));
    const confirm = confirmButton(/Count me in/);
    confirm.focus();
    fireEvent.click(confirm);

    cardState.data = makeCard({ state: "closed" });
    rerenderCard();

    expect(
      screen.queryByRole("button", { name: /Count me in/ }),
    ).not.toBeInTheDocument();
    expect(cardHeading()).toHaveFocus();
  });

  it("moves focus to the card heading after Stop looking for a group succeeds", () => {
    withdrawMutate.mockImplementation(
      (_variables: unknown, options?: { onSuccess?: () => void }) =>
        options?.onSuccess?.(),
    );
    renderCard(makeCard({ state: "waiting" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Stop looking for a group" }),
    );

    expect(withdrawMutate).toHaveBeenCalledTimes(1);
    expect(cardHeading()).toHaveFocus();
  });

  it("focuses the form on Change how I'm going and returns focus on Go back", () => {
    renderCard(makeCard({ state: "waiting" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Change how I'm going" }),
    );
    expect(screen.getByRole("radio", { name: /Solo/ })).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "Go back" }));
    expect(
      screen.getByRole("button", { name: "Change how I'm going" }),
    ).toHaveFocus();
  });

  it("focuses the first host question when a pair invite is accepted", () => {
    renderCard(makePairInviteCard());
    fireEvent.click(screen.getByRole("button", { name: "Accept" }));
    expect(screen.getByRole("radio", { name: "Picnic" })).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "Go back" }));
    expect(screen.getByRole("button", { name: "Accept" })).toHaveFocus();
  });

  it("moves focus to the card heading after Decline succeeds", () => {
    declinePairMutate.mockImplementation(
      (_variables: unknown, options?: { onSuccess?: () => void }) =>
        options?.onSuccess?.(),
    );
    renderCard(makePairInviteCard());
    fireEvent.click(screen.getByRole("button", { name: "Decline" }));
    expect(cardHeading()).toHaveFocus();
  });
});

/** A failed card load says so inside the card, except a 404, which means
 *  Go together is switched off and the card stays out of sight. */
describe("GoTogetherCard load failures", () => {
  function renderFailedCard(
    error: Error,
    gathering = makeGathering(),
    card?: GoTogetherCardDTO,
  ) {
    cardState.error = error;
    cardState.data = card;
    const tree = (
      <TestProviders>
        <GoTogetherCard gathering={gathering} />
      </TestProviders>
    );
    const result = render(tree);
    return { ...result, rerenderCard: () => result.rerender(tree) };
  }

  it("shows an inline error with Retry when the card fails to load", () => {
    renderFailedCard(new ApiError(500, "Server error"));
    expect(
      screen.getByRole("heading", { name: "Go together" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Go together didn't load")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetchCard).toHaveBeenCalledTimes(1);
  });

  it("shows the inline error for a network drop too", () => {
    renderFailedCard(new TypeError("Failed to fetch"));
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  });

  it("keeps Retry pressable while the retry runs and sends no second request", () => {
    cardState.isFetching = true;
    renderFailedCard(new ApiError(503, "Unavailable"));
    const retry = screen.getByRole("button", { name: "Trying again" });
    expect(retry).toBeEnabled();
    fireEvent.click(retry);
    expect(refetchCard).not.toHaveBeenCalled();
  });

  it("renders nothing on a 404, because Go together is switched off", () => {
    renderFailedCard(new ApiError(404, "Not found"));
    expect(
      screen.queryByRole("heading", { name: "Go together" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Try again" }),
    ).not.toBeInTheDocument();
  });

  it("hides a card loaded earlier once a refetch answers 404", () => {
    renderFailedCard(
      new ApiError(404, "Not found"),
      makeGathering(),
      makeCard({ state: "waiting" }),
    );
    expect(
      screen.queryByRole("heading", { name: "Go together" }),
    ).not.toBeInTheDocument();
  });

  it("keeps a loaded card on screen when a background refetch fails", () => {
    renderFailedCard(
      new ApiError(500, "Server error"),
      makeGathering(),
      makeCard({ state: "waiting" }),
    );
    expect(
      screen.getByRole("button", { name: "Stop looking for a group" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Go together didn't load"),
    ).not.toBeInTheDocument();
  });

  it("renders nothing for a member with no RSVP when the load fails", () => {
    renderFailedCard(new ApiError(500, "Server error"), makeGathering(null));
    expect(
      screen.queryByRole("heading", { name: "Go together" }),
    ).not.toBeInTheDocument();
  });

  it("shows the inline error to a member who moved to maybe, who may still be grouped", () => {
    renderFailedCard(new ApiError(500, "Server error"), makeGathering("maybe"));
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  });

  it("moves focus to the card heading once a Retry loads the card", () => {
    const { rerenderCard } = renderFailedCard(new ApiError(500, "Error"));
    const retry = screen.getByRole("button", { name: "Try again" });
    retry.focus();
    fireEvent.click(retry);
    expect(refetchCard).toHaveBeenCalledTimes(1);

    cardState.error = null;
    cardState.data = makeCard({ state: "waiting" });
    rerenderCard();

    expect(
      screen.queryByRole("button", { name: "Try again" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Go together" })).toHaveFocus();
  });

  it("announces a Retry that fails again in a status region", () => {
    const { rerenderCard } = renderFailedCard(new ApiError(500, "Error"));
    const cardStatus = () =>
      within(
        screen
          .getByRole("heading", { name: "Go together" })
          .closest("section") as HTMLElement,
      ).getByRole("status");
    expect(cardStatus()).toBeEmptyDOMElement();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    cardState.isFetching = true;
    rerenderCard();
    cardState.isFetching = false;
    rerenderCard();

    expect(cardStatus()).toHaveTextContent(
      "Go together still didn't load. Try again in a moment.",
    );
  });
});

/** Switch-off and the end of matching, as the card reads them. */
describe("GoTogetherCard after matching ends", () => {
  it("says Go together has closed once the search has ended", () => {
    renderCard(makeCard({ state: "closed" }));
    expect(
      screen.getByText("Go together has closed for this gathering."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/we'll still try to group you/),
    ).not.toBeInTheDocument();
  });

  it("keeps the group entry for a feedback-due member, who keeps their state after a switch-off", async () => {
    groupState.data = makeGroup();
    renderCard(makeCard({ state: "feedbackDue", groupId: "group-1" }));
    await waitFor(() => {
      const chatLinks = screen.getAllByRole("link").filter((link) => {
        const href = link.getAttribute("href") ?? "";
        return href.startsWith("/messages") && href.includes("c=conv-1");
      });
      expect(chatLinks.length).toBeGreaterThan(0);
    });
  });
});

const SECOND_HOST_QUESTION = {
  id: "q2",
  prompt: "Early or late?",
  options: [
    { id: "q2o1", label: "Early" },
    { id: "q2o2", label: "Late" },
  ],
};

function makeAnswerAgainCard(
  overrides: Partial<GoTogetherCardDTO> = {},
): GoTogetherCardDTO {
  return makeCard({
    state: "waiting",
    hostQuestions: [HOST_QUESTION, SECOND_HOST_QUESTION],
    unansweredHostQuestionIds: ["q2"],
    ...overrides,
  });
}

/** The hosts changed a question after this member opted in: the waiting
 *  panel asks only that question again. */
describe("GoTogetherCard answering a changed host question", () => {
  it("asks only the changed question and sends only that answer", () => {
    renderCard(makeAnswerAgainCard());
    expect(
      screen.getByText("The hosts changed a question"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "You're still waiting for a group. Answer it again so we can match you well.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("radio", { name: "Picnic" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Late" }));
    fireEvent.click(screen.getByRole("button", { name: "Save my answer" }));
    expect(answerAgainMutate).toHaveBeenCalledTimes(1);
    expect(answerAgainMutate.mock.calls[0]?.[0]).toEqual({
      hostAnswers: { q2: "q2o2" },
    });
  });

  it("keeps Stop looking for a group beside the save", () => {
    renderCard(makeAnswerAgainCard());
    fireEvent.click(
      screen.getByRole("button", { name: "Stop looking for a group" }),
    );
    expect(withdrawMutate).toHaveBeenCalledTimes(1);
  });

  it("says why the save is unavailable until every asked question has an answer", () => {
    renderCard(
      makeAnswerAgainCard({ unansweredHostQuestionIds: ["q1", "q2"] }),
    );
    expect(
      screen.getByText("The hosts changed their questions"),
    ).toBeInTheDocument();
    const save = screen.getByRole("button", { name: "Save my answers" });
    expect(save).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(save);
    expect(answerAgainMutate).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Answer each question from the host to continue.",
    );

    fireEvent.click(screen.getByRole("radio", { name: "Pub" }));
    fireEvent.click(screen.getByRole("radio", { name: "Early" }));
    fireEvent.click(screen.getByRole("button", { name: "Save my answers" }));
    expect(answerAgainMutate.mock.calls[0]?.[0]).toEqual({
      hostAnswers: { q1: "q1o2", q2: "q2o1" },
    });
  });

  it("shows the usual waiting panel once nothing is left to answer", () => {
    renderCard(makeAnswerAgainCard({ unansweredHostQuestionIds: [] }));
    expect(
      screen.queryByText("The hosts changed a question"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Change how I'm going" }),
    ).toBeInTheDocument();
  });

  it("ignores ids the card no longer carries as questions", () => {
    renderCard(makeAnswerAgainCard({ unansweredHostQuestionIds: ["q9"] }));
    expect(
      screen.queryByText("The hosts changed a question"),
    ).not.toBeInTheDocument();
  });

  it("lets a pending pair invite come first", () => {
    renderCard(makeAnswerAgainCard({ pair: makePair("received") }));
    expect(screen.getByText("Sofia wants to go together")).toBeInTheDocument();
    expect(
      screen.queryByText("The hosts changed a question"),
    ).not.toBeInTheDocument();
  });

  it("moves focus to the card heading after the save succeeds", () => {
    answerAgainMutate.mockImplementation(
      (_body: unknown, options?: { onSuccess?: () => void }) =>
        options?.onSuccess?.(),
    );
    renderCard(makeAnswerAgainCard());
    fireEvent.click(screen.getByRole("radio", { name: "Early" }));
    fireEvent.click(screen.getByRole("button", { name: "Save my answer" }));
    expect(screen.getByRole("heading", { name: "Go together" })).toHaveFocus();
  });

  it.each([
    ["GO_TOGETHER_NOT_WAITING", 409],
    ["GO_TOGETHER_UNAVAILABLE", 409],
    ["GO_TOGETHER_INVALID_ANSWERS", 400],
  ])("refetches the card when the save is refused with %s", (code, status) => {
    answerAgainMutate.mockImplementation(
      (_body: unknown, options?: { onError?: (error: Error) => void }) =>
        options?.onError?.(new ApiError(status, "Refused", { code })),
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    cardState.data = makeAnswerAgainCard();
    render(
      <TestProviders queryClient={queryClient}>
        <GoTogetherCard gathering={makeGathering()} />
      </TestProviders>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Early" }));
    fireEvent.click(screen.getByRole("button", { name: "Save my answer" }));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: goTogetherKeys.cardRoot,
    });
  });

  it("shows the changed-questions copy on INVALID_ANSWERS", () => {
    mutationState.answerAgainError = new ApiError(400, "Invalid", {
      code: "GO_TOGETHER_INVALID_ANSWERS",
    });
    renderCard(makeAnswerAgainCard());
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The host's questions changed again. Answer them once more, then save.",
    );
  });

  it("refetches the card when the save answers 404, so a switched-off card hides", () => {
    answerAgainMutate.mockImplementation(
      (_body: unknown, options?: { onError?: (error: Error) => void }) =>
        options?.onError?.(new ApiError(404, "Not found")),
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    cardState.data = makeAnswerAgainCard();
    render(
      <TestProviders queryClient={queryClient}>
        <GoTogetherCard gathering={makeGathering()} />
      </TestProviders>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Early" }));
    fireEvent.click(screen.getByRole("button", { name: "Save my answer" }));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: goTogetherKeys.cardRoot,
    });
  });

  it("clears a choice when the host edits the asked question under the same ids", () => {
    const { rerenderCard } = renderCard(makeAnswerAgainCard());
    fireEvent.click(screen.getByRole("radio", { name: "Late" }));
    expect(screen.getByRole("radio", { name: "Late" })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    cardState.data = makeAnswerAgainCard({
      hostQuestions: [
        HOST_QUESTION,
        {
          ...SECOND_HOST_QUESTION,
          options: [
            { id: "q2o1", label: "Morning" },
            { id: "q2o2", label: "Evening" },
          ],
        },
      ],
    });
    rerenderCard();

    expect(screen.getByRole("radio", { name: "Evening" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    expect(
      screen.getByRole("button", { name: "Save my answer" }),
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("reads a restricted account's 403 as the ineligible copy", () => {
    mutationState.answerAgainError = new ApiError(403, "Restricted", {
      code: "ACCOUNT_RESTRICTED",
    });
    renderCard(makeAnswerAgainCard());
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Go together isn't available on your account right now.",
    );
  });

  it("falls back to the general copy when the save is rate limited", () => {
    mutationState.answerAgainError = new ApiError(429, "Too many requests");
    renderCard(makeAnswerAgainCard());
    expect(screen.getByRole("alert")).toHaveTextContent(
      "That didn't go through. Try again in a moment.",
    );
  });
});
