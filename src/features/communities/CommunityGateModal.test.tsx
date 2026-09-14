import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
const { gateCardMock, invitesMock } = vi.hoisted(() => {
  const gateCard: MockedFunction<typeof useCommunityGateCard> = vi.fn();
  const invites: MockedFunction<typeof useMyCommunityInvites> = vi.fn();
  return { gateCardMock: gateCard, invitesMock: invites };
});

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

function renderGate(onClose: () => void = () => {}) {
  return render(
    <TestProviders>
      <CommunityGateModal slug="closed-one" onClose={onClose} />
    </TestProviders>,
  );
}

describe("CommunityGateModal", () => {
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
});
