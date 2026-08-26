import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import type {
  ListingClaimPolicyDTO,
  MyListingClaimDTO,
} from "../api/listingClaims.api";
import { ListingClaimsPage } from "./ListingClaimsPage";

const POLICY: ListingClaimPolicyDTO = {
  reviewTurnaroundDays: 5,
  evidenceHints: ["An email address on the business's own domain."],
};

const PENDING_CLAIM: MyListingClaimDTO = {
  id: "claim-1",
  listingRef: "QPL-2026-0007",
  listingSlug: "casa-bica",
  listingName: "Casa Bica",
  claimant: null,
  note: "I have run the kitchen here since 2019.",
  status: "pending",
  reviewedBy: null,
  reviewedAt: null,
  createdAt: "2026-08-20T09:00:00.000Z",
  reviewTurnaroundDays: 5,
  expectedDecisionBy: "2026-08-25T09:00:00.000Z",
  ageDays: 3,
};

const APPROVED_CLAIM: MyListingClaimDTO = {
  ...PENDING_CLAIM,
  id: "claim-2",
  listingRef: "QPL-2026-0011",
  listingSlug: "livraria-rosa",
  listingName: "Livraria Rosa",
  note: null,
  status: "approved",
  reviewedBy: "moderator-id",
  reviewedAt: "2026-08-23T09:00:00.000Z",
  expectedDecisionBy: null,
  ageDays: 3,
};

let mockClaims: MyListingClaimDTO[] = [];
let mockIsLoading = false;
let mockIsError = false;

vi.mock("../api/useListingClaims", () => ({
  useMyListingClaims: () => ({
    claims: mockClaims,
    isLoading: mockIsLoading,
    isError: mockIsError,
    refetch: () => {},
  }),
  useListingClaimPolicy: () => ({ policy: POLICY, isLoading: false }),
}));

function renderPage(claims: MyListingClaimDTO[]) {
  mockClaims = claims;
  mockIsLoading = false;
  mockIsError = false;
  return render(
    <TestProviders>
      <ListingClaimsPage />
    </TestProviders>,
  );
}

describe("ListingClaimsPage", () => {
  // The `marketing` namespace loads lazily (catalogs/index.ts), so every
  // catalog string resolves after a post-commit fetch: await it rather than
  // reading the raw key back.
  it("points a member with no claims at how to claim a listing", async () => {
    renderPage([]);
    expect(
      await screen.findByText("You haven't claimed a listing yet"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Browse the local directory" }),
    ).toBeInTheDocument();
    // The persistent status region says what landed, so the result is
    // announced rather than left to silence. Queried by its text: `EmptyState`
    // is itself a `role="status"`, so the role alone is ambiguous here.
    expect(screen.getByText("No claims yet.")).toBeInTheDocument();
  });

  it("renders the server's wait, promised date and turnaround for a pending claim", async () => {
    renderPage([PENDING_CLAIM]);
    expect(
      await screen.findByRole("heading", { name: "Casa Bica", level: 2 }),
    ).toBeInTheDocument();
    // The status reads as words, never as colour alone.
    expect(screen.getByText("Waiting for review")).toBeInTheDocument();
    // `ageDays` and `reviewTurnaroundDays` come off the DTO, so the page must
    // render the server's numbers rather than deriving its own.
    expect(screen.getByText("Waiting 3 days so far.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "A moderator decides each claim within 5 days of it being filed.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/A decision is due by/)).toBeInTheDocument();
    expect(screen.getByText("1 claim.")).toBeInTheDocument();
    expect(screen.getByText(/QPL-2026-0007/)).toBeInTheDocument();
    expect(screen.getByText(PENDING_CLAIM.note as string)).toBeInTheDocument();
    // The claim's own slug, so the link lands on exactly the listing that
    // was claimed rather than on a name search that two similarly named
    // businesses would both answer.
    expect(
      screen.getByRole("link", { name: /See Casa Bica in the directory/ }),
    ).toHaveAttribute("href", "/local/directory/casa-bica");
  });

  it("offers the editor once a claim has been approved", async () => {
    renderPage([APPROVED_CLAIM]);
    expect(await screen.findByText("Approved")).toBeInTheDocument();
    expect(screen.getByText(/Reviewed on/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /See Livraria Rosa in the directory/ }),
    ).toHaveAttribute("href", "/local/directory/livraria-rosa");
    expect(
      screen.getByRole("link", { name: /Edit Livraria Rosa/ }),
    ).toHaveAttribute("href", "/local/directory/list/QPL-2026-0011/edit");
    // A decided claim stops counting down: no promised date remains.
    expect(screen.queryByText(/A decision is due by/)).not.toBeInTheDocument();
  });
});
