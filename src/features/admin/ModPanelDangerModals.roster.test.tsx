import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RosterMember } from "../communities/community.model";
import { TransferOwnershipModal } from "./ModPanelDangerModals";

/**
 * The mod panel's ownership offer dialog waits on the roster read. Loading
 * and failed reads must never read as "nobody else on the roster", which
 * hides the Send button and names a cause that is not true.
 */
interface RosterMockState {
  roster: RosterMember[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const rosterMock = vi.hoisted<RosterMockState>(() => ({
  roster: [],
  isLoading: false,
  isError: false,
  refetch: () => {},
}));

vi.mock("../communities/api/useRoster", () => ({
  useRoster: () => ({
    roster: rosterMock.roster,
    hasNextPage: false,
    fetchNextPage: () => {},
    isFetchingNextPage: false,
    isLoading: rosterMock.isLoading,
    isError: rosterMock.isError,
    refetch: rosterMock.refetch,
  }),
}));

vi.mock("../communities/api/useCommunityOwnershipOffers", () => ({
  useCommunityOwnershipOffer: () => ({ offer: null, isLoading: false }),
  useOfferCommunityOwnership: () => ({ isPending: false, mutate: () => {} }),
  useCancelCommunityOwnershipOffer: () => ({
    isPending: false,
    mutate: () => {},
  }),
}));

vi.mock("../communities/api/useCommunityMutations", () => ({
  useArchiveCommunity: () => ({ isPending: false, mutate: () => {} }),
}));

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));

vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    language: "en",
    setLanguage: () => {},
    t: (key: string) => key,
  }),
}));

vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: () => {} }),
}));

vi.mock("../../shared/components/ui", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  // A plain stand-in for the dialog: the portal, focus trap and motion are
  // the shared primitive's concern; the roster states are under test here.
  Modal: ({ children, footer }: { children: ReactNode; footer: ReactNode }) => (
    <div role="dialog">
      {children}
      {footer}
    </div>
  ),
}));

const EMPTY_TITLE = "admin:modPanel.settings.transfer.modal.emptyTitle";
const SEND_BUTTON = { name: "communities:ownershipOffer.send" };

beforeEach(() => {
  rosterMock.roster = [];
  rosterMock.isLoading = false;
  rosterMock.isError = false;
  rosterMock.refetch = () => {};
});

describe("TransferOwnershipModal roster states", () => {
  it("shows the waiting rows while the roster loads, with Send in place", () => {
    rosterMock.isLoading = true;
    render(<TransferOwnershipModal slug="queer-runners" onClose={() => {}} />);
    expect(
      screen.getByRole("status", {
        name: "communities:ownershipOffer.rosterLoading",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(EMPTY_TITLE)).toBeNull();
    expect(screen.getByRole("button", SEND_BUTTON)).toBeDisabled();
  });

  it("names a failed roster read and retries it", () => {
    const retry = vi.fn();
    rosterMock.isError = true;
    rosterMock.refetch = retry;
    render(<TransferOwnershipModal slug="queer-runners" onClose={() => {}} />);
    expect(
      screen.getByText("communities:ownershipOffer.rosterErrorTitle"),
    ).toBeInTheDocument();
    expect(screen.queryByText(EMPTY_TITLE)).toBeNull();
    expect(screen.queryByRole("button", SEND_BUTTON)).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "shared:loadError.retryCta" }),
    );
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("keeps the loaded rows when only a later page failed", () => {
    rosterMock.isError = true;
    rosterMock.roster = [
      {
        slug: "carla",
        name: "Carla Dias",
        initials: "CD",
        tint: "plum",
        role: "member",
      },
    ];
    render(<TransferOwnershipModal slug="queer-runners" onClose={() => {}} />);
    expect(
      screen.queryByText("communities:ownershipOffer.rosterErrorTitle"),
    ).toBeNull();
    expect(
      screen.getByRole("radio", { name: /Carla Dias/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", SEND_BUTTON)).toBeDisabled();
  });

  it("shows the empty state only once the read settled empty", () => {
    render(<TransferOwnershipModal slug="queer-runners" onClose={() => {}} />);
    expect(screen.getByText(EMPTY_TITLE)).toBeInTheDocument();
    expect(screen.queryByRole("button", SEND_BUTTON)).toBeNull();
  });
});
