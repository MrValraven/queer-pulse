import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { RosterMember } from "./community.model";
import { OfferOwnershipModal } from "./OfferOwnershipModal";

/**
 * The picker waits on the caller's roster read. A roster that is still
 * loading, or one that failed, must never read as "nobody else on the
 * roster": that line took the Send button away on every open from the
 * settings gate, and stayed on screen when the read failed.
 */
vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));

vi.mock("./api/useRoster", () => ({
  useRosterSearch: () => ({
    members: [],
    isSearching: false,
    isError: false,
    retry: () => {},
  }),
}));

vi.mock("./api/useCommunityOwnershipOffers", () => ({
  useOfferCommunityOwnership: () => ({ isPending: false, mutate: () => {} }),
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
  MemberSelectList: () => <div data-testid="member-picker" />,
}));

const LOADED_MEMBER: RosterMember = {
  slug: "carla",
  name: "Carla Dias",
  initials: "CD",
  tint: "plum",
  role: "member",
};

const EMPTY_LINE = "communities:detail.dangerZone.transfer.confirm.empty";
const SEND_BUTTON = { name: "communities:ownershipOffer.send" };

describe("OfferOwnershipModal roster states", () => {
  it("shows the waiting rows while the roster loads, with Send in place", () => {
    render(
      <OfferOwnershipModal
        slug="queer-runners"
        roster={[]}
        isRosterLoading
        onClose={() => {}}
      />,
    );
    expect(
      screen.getByRole("status", {
        name: "communities:ownershipOffer.rosterLoading",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(EMPTY_LINE)).toBeNull();
    expect(screen.getByRole("button", SEND_BUTTON)).toBeDisabled();
  });

  it("names a failed roster read and retries it", () => {
    const retry = vi.fn();
    render(
      <OfferOwnershipModal
        slug="queer-runners"
        roster={[]}
        isRosterError
        onRosterRetry={retry}
        onClose={() => {}}
      />,
    );
    expect(
      screen.getByText("communities:ownershipOffer.rosterErrorTitle"),
    ).toBeInTheDocument();
    expect(screen.queryByText(EMPTY_LINE)).toBeNull();
    expect(screen.queryByRole("button", SEND_BUTTON)).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "shared:loadError.retryCta" }),
    );
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("keeps the loaded rows when only a later page failed", () => {
    render(
      <OfferOwnershipModal
        slug="queer-runners"
        roster={[LOADED_MEMBER]}
        isRosterError
        onClose={() => {}}
      />,
    );
    expect(
      screen.queryByText("communities:ownershipOffer.rosterErrorTitle"),
    ).toBeNull();
    expect(screen.getByTestId("member-picker")).toBeInTheDocument();
    expect(screen.getByRole("button", SEND_BUTTON)).toBeDisabled();
  });

  it("says nobody else is on the roster only once the read settled empty", () => {
    render(
      <OfferOwnershipModal
        slug="queer-runners"
        roster={[]}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText(EMPTY_LINE)).toBeInTheDocument();
    expect(screen.queryByRole("button", SEND_BUTTON)).toBeNull();
  });
});
