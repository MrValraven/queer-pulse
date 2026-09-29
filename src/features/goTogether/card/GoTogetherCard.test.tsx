import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  refetchCard,
  groupState,
} = vi.hoisted(() => {
  const cardMock: CardMockState = { data: undefined };
  const groupMock: GroupMockState = { data: undefined };
  return {
    cardState: cardMock,
    mutationState: { optInError: null as Error | null },
    optInMutate: vi.fn(),
    withdrawMutate: vi.fn(),
    acceptPairMutate: vi.fn(),
    declinePairMutate: vi.fn(),
    revealMutate: vi.fn(),
    refetchCard: vi.fn(),
    groupState: groupMock,
  };
});

vi.mock("../api/useGoTogetherCard", () => ({
  useGoTogetherCard: () => ({ data: cardState.data, refetch: refetchCard }),
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
  groupState.data = undefined;
  mutationState.optInError = null;
  optInMutate.mockReset();
  withdrawMutate.mockReset();
  acceptPairMutate.mockReset();
  declinePairMutate.mockReset();
  revealMutate.mockReset();
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
        slug: "tiago",
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
