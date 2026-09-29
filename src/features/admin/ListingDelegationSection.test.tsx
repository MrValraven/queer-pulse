import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { routes } from "../../app/routeMap";
import { adminListingEditPath } from "./api/adminListingEdit.api";
import { ListingDelegationSection } from "./ListingDelegationSection";
import type { AdminListingDelegationDTO } from "./api/adminListingDelegation.api";

/**
 * The suggested-listings leftover this section covers: an unowned listing
 * reads as platform-held with an edit action, a platform-held suggestion
 * credits the suggester by name or slug, and an owned listing shows its
 * owner and drops the edit action. `useAdminListingDelegation` and the
 * mutation hooks its two child blocks call are mocked, the same way
 * `ModerationQueueHealthPanel.test.tsx` mocks its data hook, keeping this
 * suite's assertions on this section's own text and leaving the offer/roster
 * panels underneath it out of scope.
 */
let delegation: AdminListingDelegationDTO = { openOffer: null, coManagers: [] };

vi.mock("./api/useAdminListingDelegation", () => ({
  useAdminListingDelegation: () => ({
    delegation,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useOfferListingOwnership: () => ({ mutate: vi.fn(), isPending: false }),
  useRevokeListingOwnershipOffer: () => ({ mutate: vi.fn(), isPending: false }),
  useInviteListingCoManager: () => ({ mutate: vi.fn(), isPending: false }),
  useRevokeListingCoManager: () => ({ mutate: vi.fn(), isPending: false }),
}));

const LISTING_REF = "QPL-1";

function renderSection(
  overrides: Partial<{
    ownerSlug: string | null;
    suggesterSlug: string | null;
    suggesterName: string | null;
  }> = {},
) {
  return render(
    <ListingDelegationSection
      listingRef={LISTING_REF}
      ownerSlug={null}
      {...overrides}
    />,
    { wrapper: TestProviders },
  );
}

beforeEach(() => {
  delegation = { openOffer: null, coManagers: [] };
});

describe("ListingDelegationSection", () => {
  it("shows Held by QueerPulse and the edit action for an unowned listing", async () => {
    renderSection();

    expect(await screen.findByText("Held by QueerPulse.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit listing" })).toHaveAttribute(
      "href",
      adminListingEditPath(LISTING_REF),
    );
  });

  it("reads Suggested by the name and links to the member's profile when both are known", async () => {
    renderSection({ suggesterName: "Jane Doe", suggesterSlug: "jane-doe" });

    const link = await screen.findByRole("link", {
      name: "Suggested by Jane Doe",
    });
    expect(link).toHaveAttribute("href", `${routes.members}/jane-doe`);
  });

  it("falls back to the slug when only the suggester's slug is known", async () => {
    renderSection({ suggesterSlug: "jane-doe" });

    const link = await screen.findByRole("link", {
      name: "Suggested by @jane-doe",
    });
    expect(link).toHaveAttribute("href", `${routes.members}/jane-doe`);
  });

  it("shows Owned by the owner's slug and no edit action for an owned listing", async () => {
    renderSection({ ownerSlug: "olivia" });

    expect(await screen.findByText("Owned by @olivia")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Edit listing" }),
    ).not.toBeInTheDocument();
  });
});
