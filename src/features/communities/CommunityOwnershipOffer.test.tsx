import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import type { TranslateOptions } from "../../shared/i18n/types";
import type { CommunityOwnershipOfferDTO } from "./api/communityOwnershipOffers.api";
import { CommunityOwnershipOfferPanel } from "./CommunityOwnershipOfferPanel";
import { CommunityOwnershipOffersSection } from "./CommunityOwnershipOffersSection";

/**
 * PRD-514. The owner's panel and the offered member's inbox, with the offer
 * hooks replaced by a hoisted state object so each case sets exactly the
 * offer, list and mutation outcome it needs. `t` echoes the key plus its
 * values, so the assertions read keys and tokens, independent of catalog text.
 */
interface MutateCallbacks {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

interface OfferHookState {
  ownerOffer: CommunityOwnershipOfferDTO | null;
  ownerOfferIsError: boolean;
  inbox: CommunityOwnershipOfferDTO[];
  cancelOutcome: Error | null;
  respondOutcome: Error | null;
  cancelCalls: number;
  respondCalls: Array<{ offerId: string; answer: string }>;
  toasts: Array<{ message: string; tone: string }>;
}

const state = vi.hoisted<OfferHookState>(() => ({
  ownerOffer: null,
  ownerOfferIsError: false,
  inbox: [],
  cancelOutcome: null,
  respondOutcome: null,
  cancelCalls: 0,
  respondCalls: [],
  toasts: [],
}));

function settle(outcome: Error | null, callbacks?: MutateCallbacks) {
  if (outcome) callbacks?.onError?.(outcome);
  else callbacks?.onSuccess?.();
  callbacks?.onSettled?.();
}

vi.mock("./api/useCommunityOwnershipOffers", () => ({
  useCommunityOwnershipOffer: () => ({
    offer: state.ownerOffer,
    isLoading: false,
    isError: state.ownerOfferIsError,
    refetch: () => {},
  }),
  useCancelCommunityOwnershipOffer: () => ({
    isPending: false,
    mutate: (_vars: undefined, callbacks?: MutateCallbacks) => {
      state.cancelCalls += 1;
      settle(state.cancelOutcome, callbacks);
    },
  }),
  useMyCommunityOwnershipOffers: () => ({
    offers: state.inbox,
    isLoading: false,
    isError: false,
    refetch: () => {},
  }),
  useRespondToOwnershipOffer: () => ({
    isPending: false,
    mutate: (
      vars: { offerId: string; answer: string },
      callbacks?: MutateCallbacks,
    ) => {
      state.respondCalls.push({ offerId: vars.offerId, answer: vars.answer });
      settle(state.respondOutcome, callbacks);
    },
  }),
}));

vi.mock("./OfferOwnershipModal", () => ({
  OfferOwnershipModal: () => <div data-testid="offer-picker" />,
}));

vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    language: "en",
    setLanguage: () => {},
    t: (key: string, values?: TranslateOptions) =>
      values ? `${key} ${JSON.stringify(values)}` : key,
  }),
}));

vi.mock("../../shared/i18n/format", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useFormat: () => ({ date: () => "2 December 2026" }),
}));

vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({
    showToast: (message: string, tone: string) =>
      state.toasts.push({ message, tone }),
  }),
}));

vi.mock("../../shared/components/ui", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  // A plain stand-in for the dialog: the portal, focus trap and motion are
  // the shared primitive's concern, and the flow is what is under test here.
  ConfirmDialog: ({
    open,
    title,
    description,
    confirmLabel,
    onConfirm,
  }: {
    open: boolean;
    title: ReactNode;
    description?: ReactNode;
    confirmLabel?: ReactNode;
    onConfirm: () => void;
  }) =>
    open ? (
      <div role="dialog">
        <p>{title}</p>
        <p>{description}</p>
        <button type="button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    ) : null,
}));

function offer(
  overrides: Partial<CommunityOwnershipOfferDTO> = {},
): CommunityOwnershipOfferDTO {
  return {
    id: "offer-1",
    communitySlug: "queer-runners",
    communityName: "Queer Runners Lisboa",
    offeree: {
      slug: "carla",
      firstName: "Carla",
      lastName: "Dias",
      avatarUrl: null,
    },
    offeredBy: {
      slug: "monica",
      firstName: "Mónica",
      lastName: "Resende",
      avatarUrl: null,
    },
    status: "offered",
    offeredAt: "2026-11-18T10:00:00.000Z",
    expiresAt: "2026-12-02T10:00:00.000Z",
    respondedAt: null,
    ...overrides,
  };
}

function renderInRouter(node: ReactNode) {
  return render(<MemoryRouter>{node}</MemoryRouter>);
}

beforeEach(() => {
  state.ownerOffer = null;
  state.ownerOfferIsError = false;
  state.inbox = [];
  state.cancelOutcome = null;
  state.respondOutcome = null;
  state.cancelCalls = 0;
  state.respondCalls = [];
  state.toasts = [];
});

describe("the owner's ownership offer panel", () => {
  it("explains the offer and opens the picker while nothing is open", () => {
    renderInRouter(
      <CommunityOwnershipOfferPanel slug="queer-runners" roster={[]} />,
    );
    expect(
      screen.getByText("communities:ownershipOffer.explainer"),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: "communities:ownershipOffer.offerCta",
      }),
    );
    expect(screen.getByTestId("offer-picker")).toBeInTheDocument();
  });

  it("shows who the open offer went to, when it lapses, and cancels it", () => {
    state.ownerOffer = offer();
    renderInRouter(
      <CommunityOwnershipOfferPanel slug="queer-runners" roster={[]} />,
    );
    expect(
      screen.getByText(
        `communities:ownershipOffer.pending ${JSON.stringify({
          name: "Carla Dias",
          date: "2 December 2026",
        })}`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "communities:ownershipOffer.offerCta",
      }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "communities:ownershipOffer.cancel" }),
    );
    expect(state.cancelCalls).toBe(1);
    expect(state.toasts).toEqual([
      { message: "communities:ownershipOffer.cancelled", tone: "success" },
    ]);
  });

  it("tells the owner their member answered first when the cancel route refuses", () => {
    state.ownerOffer = offer();
    // DELETE /communities/:slug/ownership-offer answers this code once the
    // member has accepted or declined the offer.
    state.cancelOutcome = new ApiError(409, "x", {
      code: "OWNERSHIP_OFFER_ANSWERED",
    });
    renderInRouter(
      <CommunityOwnershipOfferPanel slug="queer-runners" roster={[]} />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "communities:ownershipOffer.cancel" }),
    );
    expect(state.toasts).toEqual([
      {
        message:
          "communities:ownershipOffer.ownerError.OWNERSHIP_OFFER_ANSWERED",
        tone: "error",
      },
    ]);
  });

  it("treats an answered offer as no open offer", () => {
    state.ownerOffer = offer({ status: "declined" });
    renderInRouter(
      <CommunityOwnershipOfferPanel slug="queer-runners" roster={[]} />,
    );
    expect(
      screen.getByRole("button", {
        name: "communities:ownershipOffer.offerCta",
      }),
    ).toBeInTheDocument();
  });
});

describe("the offered member's ownership inbox", () => {
  it("renders nothing while no offer is open", () => {
    renderInRouter(
      <div data-testid="host">
        <CommunityOwnershipOffersSection />
      </div>,
    );
    expect(screen.getByTestId("host")).toBeEmptyDOMElement();
  });

  it("lists the offer and accepts it after the confirm step", () => {
    state.inbox = [offer()];
    renderInRouter(<CommunityOwnershipOffersSection />);
    expect(
      screen.getByRole("link", { name: "Queer Runners Lisboa" }),
    ).toHaveAttribute("href", "/community/queer-runners");
    fireEvent.click(
      screen.getByRole("button", {
        name: `communities:ownershipOffer.acceptAriaLabel ${JSON.stringify({
          communityName: "Queer Runners Lisboa",
        })}`,
      }),
    );
    expect(state.respondCalls).toEqual([]);
    const dialog = screen.getByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", {
        name: "communities:ownershipOffer.accept",
      }),
    );
    expect(state.respondCalls).toEqual([
      { offerId: "offer-1", answer: "accept" },
    ]);
    expect(state.toasts[0]?.tone).toBe("success");
    expect(state.toasts[0]?.message).toContain(
      "communities:ownershipOffer.accepted",
    );
  });

  it("names the cause when accepting an offer on a community that changed hands", () => {
    state.inbox = [offer()];
    state.respondOutcome = new ApiError(409, "x", {
      code: "OWNERSHIP_OFFER_OWNER_CHANGED",
    });
    renderInRouter(<CommunityOwnershipOffersSection />);
    fireEvent.click(
      screen.getByRole("button", {
        name: `communities:ownershipOffer.acceptAriaLabel ${JSON.stringify({
          communityName: "Queer Runners Lisboa",
        })}`,
      }),
    );
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "communities:ownershipOffer.accept",
      }),
    );
    expect(state.toasts).toEqual([
      {
        message:
          "communities:ownershipOffer.error.OWNERSHIP_OFFER_OWNER_CHANGED",
        tone: "error",
      },
    ]);
  });

  it("names a withdrawn offer when the member answers it", () => {
    state.inbox = [offer()];
    state.respondOutcome = new ApiError(409, "x", {
      code: "OWNERSHIP_OFFER_CANCELLED",
    });
    renderInRouter(<CommunityOwnershipOffersSection />);
    fireEvent.click(
      screen.getByRole("button", {
        name: `communities:ownershipOffer.acceptAriaLabel ${JSON.stringify({
          communityName: "Queer Runners Lisboa",
        })}`,
      }),
    );
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "communities:ownershipOffer.accept",
      }),
    );
    expect(state.toasts).toEqual([
      {
        message: "communities:ownershipOffer.error.OWNERSHIP_OFFER_CANCELLED",
        tone: "error",
      },
    ]);
  });

  it("declines through its own confirm step", () => {
    state.inbox = [offer()];
    renderInRouter(<CommunityOwnershipOffersSection />);
    fireEvent.click(
      screen.getByRole("button", {
        name: `communities:ownershipOffer.declineAriaLabel ${JSON.stringify({
          communityName: "Queer Runners Lisboa",
        })}`,
      }),
    );
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "communities:ownershipOffer.decline",
      }),
    );
    expect(state.respondCalls).toEqual([
      { offerId: "offer-1", answer: "decline" },
    ]);
    expect(state.toasts).toEqual([
      { message: "communities:ownershipOffer.declined", tone: "success" },
    ]);
  });

  it("names an inactive offering owner by the inactive label", () => {
    state.inbox = [
      offer({
        offeredBy: {
          slug: "",
          firstName: "",
          lastName: "",
          avatarUrl: null,
          isInactiveMember: true,
        },
      }),
    ];
    renderInRouter(<CommunityOwnershipOffersSection />);
    expect(
      screen.getByText(
        `communities:ownershipOffer.inboxItem ${JSON.stringify({
          name: "common:member.inactiveLabel",
          communityName: "Queer Runners Lisboa",
        })}`,
      ),
    ).toBeInTheDocument();
  });
});
