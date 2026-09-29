import { fireEvent, render, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MockedFunction } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { CommunityGateModal } from "./CommunityGateModal";
import { useCommunityGateCard } from "./api/useCommunityGateCard";
import type { CommunityGateCardResult } from "./api/useCommunityGateCard";
import type {
  CommunityCardDTO,
  CommunityGateCardDTO,
} from "./api/communities.api";
import { useMyCommunityInvites } from "./api/useCommunityInvites";
import type { MyCommunityInvitesResult } from "./api/useCommunityInvites";
import type { MyCommunityInviteDTO } from "./api/communityInvites.api";

/**
 * `useCommunityGateCard` and `useMyCommunityInvites` are mocked directly so
 * each test can set up exactly the state it needs (loading / error / a given
 * tier / a given invitation) without a network layer. `vi.hoisted` is
 * required here because the mock factories below run before this file's own
 * top-level `const`s would otherwise be initialized. Typed against the real
 * hooks (`MockedFunction<typeof useX>`) so a shape change in either result
 * type is a compile error here, not a silent pass.
 */
const { gateCardMock, invitesMock, demoModeState } = vi.hoisted(() => {
  const gateCard: MockedFunction<typeof useCommunityGateCard> = vi.fn();
  const invites: MockedFunction<typeof useMyCommunityInvites> = vi.fn();
  return {
    gateCardMock: gateCard,
    invitesMock: invites,
    demoModeState: { isDemoMode: true },
  };
});

// Demo by default, which is what the suite has always run under. The one live
// case flips the flag, because withdrawing a request is live-only.
vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useDemoMode: () => ({
    demoMode: demoModeState.isDemoMode,
    setDemoMode: vi.fn(),
  }),
}));

// The wizard is its own suite. Here it is a stand-in whose two buttons play
// the two things the gate reacts to: a membership the server granted, and the
// wizard closing.
vi.mock("./CommunityJoinFlowModal", () => ({
  CommunityJoinFlowModal: ({
    onMembershipGranted,
    onClose,
  }: {
    onMembershipGranted?: () => void;
    onClose: () => void;
  }) => (
    <div role="dialog" aria-label="Join wizard">
      <button type="button" onClick={() => onMembershipGranted?.()}>
        Grant membership
      </button>
      <button type="button" onClick={onClose}>
        Close wizard
      </button>
    </div>
  ),
}));

vi.mock("./api/useCommunityGateCard", () => ({
  useCommunityGateCard: gateCardMock,
}));

vi.mock("./api/useCommunityInvites", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./api/useCommunityInvites")>();
  return {
    ...actual,
    useMyCommunityInvites: invitesMock,
  };
});

const LOADED: CommunityGateCardResult = {
  card: null,
  isLoading: false,
  isError: false,
  notFound: false,
  refetch: () => {},
};

const CARD: CommunityGateCardDTO = {
  slug: "closed-one",
  name: "Closed One",
  tagline: "A quiet corner",
  purpose: "Monthly meets",
  type: "social",
  accessTier: "request",
  tags: ["quiet"],
  city: "Lisbon",
  area: null,
  isOnline: false,
  languages: ["pt"],
  memberCount: 12,
  avatarImageUrl: null,
  coverImageUrl: null,
  nextGathering: null,
};

const NO_INVITES: MyCommunityInvitesResult = {
  invites: [],
  isLoading: false,
  isError: false,
  refetch: () => {},
};

const INVITE_CARD: CommunityCardDTO = {
  slug: "closed-one",
  name: "Closed One",
  type: "social",
  tagline: "A quiet corner",
  accessTier: "invite",
  ref: "QP-C-0001",
  memberCount: 12,
  activeThisWeek: 0,
  postsThisWeek: 0,
  myRole: null,
  coverImageUrl: null,
};

function invite(
  overrides: Partial<MyCommunityInviteDTO> = {},
): MyCommunityInviteDTO {
  return {
    id: "inv-1",
    community: INVITE_CARD,
    invitedBy: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function gateTree(onClose: () => void = () => {}) {
  return (
    <TestProviders initialEntries={["/communities?gate=closed-one"]}>
      <Routes>
        <Route
          path="/communities"
          element={<CommunityGateModal slug="closed-one" onClose={onClose} />}
        />
        <Route path="/community/:slug" element={<p>Inside the community</p>} />
      </Routes>
    </TestProviders>
  );
}

function renderGate(onClose: () => void = () => {}) {
  return render(gateTree(onClose));
}

/** The `<p>` status line that holds a piece of gate copy. */
function statusLine(text: RegExp) {
  return screen.getByText(text).closest("p");
}

describe("CommunityGateModal", () => {
  beforeEach(() => {
    demoModeState.isDemoMode = true;
  });

  it("renders the skeleton and no action while the card is loading", () => {
    gateCardMock.mockReturnValue({ ...LOADED, isLoading: true });
    invitesMock.mockReturnValue(NO_INVITES);

    const { container } = renderGate();

    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /ask to join|accept invitation/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("shows a retry action on error, and clicking it calls refetch", () => {
    const refetch = vi.fn();
    gateCardMock.mockReturnValue({ ...LOADED, isError: true, refetch });
    invitesMock.mockReturnValue(NO_INVITES);

    renderGate();

    expect(screen.getByText(/that did not load/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("closes silently when the community is gone or gated with no invitation", () => {
    const onClose = vi.fn();
    gateCardMock.mockReturnValue({ ...LOADED, notFound: true });
    invitesMock.mockReturnValue(NO_INVITES);

    renderGate(onClose);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("offers Ask to join on a request-tier community with no invitation", () => {
    gateCardMock.mockReturnValue({ ...LOADED, card: CARD });
    invitesMock.mockReturnValue(NO_INVITES);

    renderGate();

    expect(
      screen.getByRole("button", { name: /ask to join/i }),
    ).toBeInTheDocument();
  });

  it("offers Accept invitation to an invite-tier viewer who holds one", () => {
    gateCardMock.mockReturnValue({
      ...LOADED,
      card: { ...CARD, accessTier: "invite" },
    });
    invitesMock.mockReturnValue({ ...NO_INVITES, invites: [invite()] });

    renderGate();

    expect(
      screen.getByRole("button", { name: /accept invitation/i }),
    ).toBeInTheDocument();
  });

  // A `request`-tier viewer who HOLDS an invitation is admitted by spending
  // it, so the invitation has to win over the tier. "Ask to join" would file a
  // request for a moderator to review access this viewer has already been
  // granted. This is why `shouldReadInvitations` covers all three gated tiers
  // and not `invite`/`private` alone: narrowed to two, the shelf was never
  // read for a `request` card and the wrong action went up every time.
  it("offers Accept invitation to a request-tier viewer who holds one", () => {
    gateCardMock.mockReturnValue({ ...LOADED, card: CARD });
    invitesMock.mockReturnValue({
      ...NO_INVITES,
      invites: [
        invite({ community: { ...INVITE_CARD, accessTier: "request" } }),
      ],
    });

    renderGate();

    expect(
      screen.getByRole("button", { name: /accept invitation/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /ask to join/i }),
    ).not.toBeInTheDocument();
  });

  it("offers no action to an uninvited invite-tier viewer", () => {
    gateCardMock.mockReturnValue({
      ...LOADED,
      card: { ...CARD, accessTier: "invite" },
    });
    invitesMock.mockReturnValue(NO_INVITES);

    renderGate();

    expect(screen.getByText(/invitation only/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /accept invitation|ask to join/i }),
    ).not.toBeInTheDocument();
  });

  it("offers no action while the invitations shelf is still in flight", () => {
    gateCardMock.mockReturnValue({
      ...LOADED,
      card: { ...CARD, accessTier: "invite" },
    });
    invitesMock.mockReturnValue({ ...NO_INVITES, isLoading: true });

    renderGate();

    expect(
      screen.queryByRole("button", { name: /accept invitation/i }),
    ).not.toBeInTheDocument();
  });

  // The whole point of the surface: it is what an outsider may see, so
  // anything the community withheld must not be reachable through it.
  it("shows no roster, owner, rules or post content", () => {
    gateCardMock.mockReturnValue({ ...LOADED, card: CARD });
    invitesMock.mockReturnValue(NO_INVITES);

    const { container } = renderGate();

    expect(container.textContent).not.toMatch(/house rules|organiser|owner/i);
  });

  it("shows Members only instead of a count for a private community", () => {
    gateCardMock.mockReturnValue({
      ...LOADED,
      card: { ...CARD, accessTier: "private" },
    });
    invitesMock.mockReturnValue({ ...NO_INVITES, invites: [invite()] });

    renderGate();

    expect(screen.getByText(/members only/i)).toBeInTheDocument();
    expect(screen.queryByText(/12 members/i)).not.toBeInTheDocument();
  });

  // PRD-411. The server refuses a second request while one is pending, so the
  // card has to know the viewer already asked and say so.
  it("a pending applicant sees their request line and no Ask to join", () => {
    gateCardMock.mockReturnValue({
      ...LOADED,
      card: { ...CARD, myJoinRequestStatus: "pending" },
    });
    invitesMock.mockReturnValue(NO_INVITES);

    renderGate();

    expect(screen.getByText(/you asked to join/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /ask to join/i }),
    ).not.toBeInTheDocument();
  });

  it("a declined applicant is offered Ask to join again", () => {
    gateCardMock.mockReturnValue({
      ...LOADED,
      card: { ...CARD, myJoinRequestStatus: "declined" },
    });
    invitesMock.mockReturnValue(NO_INVITES);

    renderGate();

    expect(
      screen.getByRole("button", { name: /ask to join/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/you asked to join/i)).not.toBeInTheDocument();
  });

  it("an invitation outranks a pending request", () => {
    gateCardMock.mockReturnValue({
      ...LOADED,
      card: { ...CARD, myJoinRequestStatus: "pending" },
    });
    invitesMock.mockReturnValue({
      ...NO_INVITES,
      invites: [
        invite({ community: { ...INVITE_CARD, accessTier: "request" } }),
      ],
    });

    renderGate();

    expect(
      screen.getByRole("button", { name: /accept invitation/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/you asked to join/i)).not.toBeInTheDocument();
  });

  it("live mode offers Withdraw request and opens the confirm", () => {
    demoModeState.isDemoMode = false;
    gateCardMock.mockReturnValue({
      ...LOADED,
      card: { ...CARD, myJoinRequestStatus: "pending" },
    });
    invitesMock.mockReturnValue(NO_INVITES);

    renderGate();

    expect(
      screen.queryByText(/withdraw your request to closed one/i),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: /withdraw request to join closed one/i,
      }),
    );
    expect(
      screen.getByText(/withdraw your request to closed one/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /leave it pending/i }),
    ).toHaveFocus();
  });
});

describe("CommunityGateModal withdraw, focus and way in", () => {
  beforeEach(() => {
    demoModeState.isDemoMode = true;
  });

  // Design M5: the trigger and the confirm's commit button both read
  // "Withdraw request". The trigger names its community, so the two
  // controls carry different accessible names.
  it("the withdraw trigger and the confirm's commit have different names", () => {
    demoModeState.isDemoMode = false;
    gateCardMock.mockReturnValue({
      ...LOADED,
      card: { ...CARD, myJoinRequestStatus: "pending" },
    });
    invitesMock.mockReturnValue(NO_INVITES);

    renderGate();
    fireEvent.click(
      screen.getByRole("button", {
        name: /withdraw request to join closed one/i,
      }),
    );

    expect(
      screen.getAllByRole("button", { name: /^withdraw request$/i }),
    ).toHaveLength(1);
  });

  // Design S6: demo members get the same way out as live ones.
  it("demo mode offers Withdraw request and confirms it with a toast", () => {
    gateCardMock.mockReturnValue({
      ...LOADED,
      card: { ...CARD, myJoinRequestStatus: "pending" },
    });
    invitesMock.mockReturnValue(NO_INVITES);

    renderGate();
    fireEvent.click(
      screen.getByRole("button", {
        name: /withdraw request to join closed one/i,
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /^withdraw request$/i }),
    );

    expect(screen.getByText(/request withdrawn/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/withdraw your request to closed one/i),
    ).not.toBeInTheDocument();
  });

  // Design M2: the Withdraw button the confirm hands focus back to is gone
  // once the request is, so focus moves to the line that replaced it.
  it("focus moves to the new status line after a withdraw lands", () => {
    gateCardMock.mockReturnValue({
      ...LOADED,
      card: { ...CARD, myJoinRequestStatus: "pending" },
    });
    invitesMock.mockReturnValue(NO_INVITES);

    const { rerender } = renderGate();
    gateCardMock.mockReturnValue({
      ...LOADED,
      card: { ...CARD, myJoinRequestStatus: null },
    });
    rerender(gateTree());

    expect(statusLine(/this community reviews who joins/i)).toHaveFocus();
  });

  it("focus waits for the wizard to close before moving to the pending line", () => {
    gateCardMock.mockReturnValue({ ...LOADED, card: CARD });
    invitesMock.mockReturnValue(NO_INVITES);

    const { rerender } = renderGate();
    fireEvent.click(screen.getByRole("button", { name: /ask to join/i }));
    gateCardMock.mockReturnValue({
      ...LOADED,
      card: { ...CARD, myJoinRequestStatus: "pending" },
    });
    rerender(gateTree());

    expect(statusLine(/you asked to join/i)).not.toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: /close wizard/i }));
    expect(statusLine(/you asked to join/i)).toHaveFocus();
  });

  it("a request approved while the gate is open offers the way in", () => {
    gateCardMock.mockReturnValue({
      ...LOADED,
      card: { ...CARD, myJoinRequestStatus: "pending" },
    });
    invitesMock.mockReturnValue(NO_INVITES);

    const { rerender } = renderGate();
    gateCardMock.mockReturnValue({
      ...LOADED,
      card: { ...CARD, myJoinRequestStatus: "approved" },
    });
    rerender(gateTree());

    expect(statusLine(/your request was approved/i)).toHaveFocus();
    expect(
      screen.getByRole("link", { name: /open the community/i }),
    ).toHaveAttribute("href", "/community/closed-one");
    expect(
      screen.queryByRole("button", { name: /ask to join/i }),
    ).not.toBeInTheDocument();
  });

  // The card reports the newest request of any status, so an approval found
  // on open can belong to somebody who has since left.
  it("an approval found on open falls through to the tier action", () => {
    gateCardMock.mockReturnValue({
      ...LOADED,
      card: { ...CARD, myJoinRequestStatus: "approved" },
    });
    invitesMock.mockReturnValue(NO_INVITES);

    renderGate();

    expect(
      screen.getByRole("button", { name: /ask to join/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/your request was approved/i),
    ).not.toBeInTheDocument();
  });

  // FE Fix 3: an invitee admitted from the gate lands inside the community
  // when the wizard closes.
  it("closing the wizard after a granted membership opens the community", () => {
    gateCardMock.mockReturnValue({
      ...LOADED,
      card: { ...CARD, accessTier: "invite" },
    });
    invitesMock.mockReturnValue({ ...NO_INVITES, invites: [invite()] });

    renderGate();
    fireEvent.click(screen.getByRole("button", { name: /accept invitation/i }));
    fireEvent.click(screen.getByRole("button", { name: /grant membership/i }));
    fireEvent.click(screen.getByRole("button", { name: /close wizard/i }));

    expect(screen.getByText(/inside the community/i)).toBeInTheDocument();
  });

  it("closing the wizard without a membership stays on the gate", () => {
    gateCardMock.mockReturnValue({ ...LOADED, card: CARD });
    invitesMock.mockReturnValue(NO_INVITES);

    renderGate();
    fireEvent.click(screen.getByRole("button", { name: /ask to join/i }));
    fireEvent.click(screen.getByRole("button", { name: /close wizard/i }));

    expect(screen.queryByText(/inside the community/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ask to join/i }),
    ).toBeInTheDocument();
  });
});
