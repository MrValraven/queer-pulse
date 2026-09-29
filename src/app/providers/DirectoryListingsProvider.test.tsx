import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { blankDraft } from "../../features/marketing/listBusiness/listingFormDraft";
import type {
  ListingDraft,
  PendingListing,
} from "../../features/marketing/listBusiness/listBusiness.data";
import { DirectoryListingsProvider } from "./DirectoryListingsProvider";
import { useDirectoryListingsActions } from "./useDirectoryListingsActions";

/**
 * The platform holds a suggestion until someone claims it (leftovers item
 * #3): `addListing` must keep a `path: "suggest"` draft out of the member's
 * local overlay in both demo and live mode, while a `path: "claim"` draft
 * still lands in it. `useDemoMode` and `useListingMutations` are mocked so
 * the live-mode case never touches the network, the same way
 * `DraftsProvider.test.tsx` isolates its live path.
 */
let mockDemoMode = true;
const mockCreateListingMutateAsync = vi.fn();

vi.mock("./DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mockDemoMode }),
}));

vi.mock("../../features/marketing/listBusiness/api/useListings", () => ({
  useListingMutations: () => ({
    createListing: { mutateAsync: mockCreateListingMutateAsync },
    withdrawListing: { mutate: vi.fn() },
    deleteListing: { mutateAsync: vi.fn() },
  }),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <DirectoryListingsProvider>{children}</DirectoryListingsProvider>;
}

function suggestDraft(name: string): ListingDraft {
  return { ...blankDraft(), path: "suggest", name };
}

function claimDraft(name: string): ListingDraft {
  return { ...blankDraft(), path: "claim", name };
}

function persistedListing(
  overrides: Partial<PendingListing> = {},
): PendingListing {
  return {
    ...blankDraft(),
    path: "claim",
    ref: "QPL-LIVE-1",
    status: "review",
    slug: "cafe-live",
    submittedBy: "member-1",
    ...overrides,
  };
}

beforeEach(() => {
  mockDemoMode = true;
  mockCreateListingMutateAsync.mockReset();
});

describe("DirectoryListingsProvider (demo mode)", () => {
  it("keeps a suggested listing out of the member's local overlay", async () => {
    const { result } = renderHook(() => useDirectoryListingsActions(), {
      wrapper,
    });
    let created!: PendingListing;

    await act(async () => {
      created = await result.current.addListing(
        suggestDraft("Cafe Suggested"),
        "member-1",
      );
    });

    expect(created.path).toBe("suggest");
    expect(
      result.current.local.some((listing) => listing.ref === created.ref),
    ).toBe(false);
  });

  it("adds a claimed listing to the member's local overlay", async () => {
    const { result } = renderHook(() => useDirectoryListingsActions(), {
      wrapper,
    });
    let created!: PendingListing;

    await act(async () => {
      created = await result.current.addListing(
        claimDraft("Cafe Claimed"),
        "member-1",
      );
    });

    expect(
      result.current.local.some((listing) => listing.ref === created.ref),
    ).toBe(true);
  });
});

describe("DirectoryListingsProvider (live mode)", () => {
  beforeEach(() => {
    mockDemoMode = false;
  });

  it("keeps a persisted suggestion out of the member's local overlay", async () => {
    const persisted = persistedListing({
      path: "suggest",
      ref: "QPL-LIVE-2",
      slug: "cafe-live-2",
    });
    mockCreateListingMutateAsync.mockResolvedValueOnce(persisted);
    const { result } = renderHook(() => useDirectoryListingsActions(), {
      wrapper,
    });

    await act(async () => {
      await result.current.addListing(
        suggestDraft("Cafe Suggested"),
        "member-1",
      );
    });

    expect(
      result.current.local.some((listing) => listing.ref === persisted.ref),
    ).toBe(false);
  });

  it("adds a persisted claim to the member's local overlay", async () => {
    const persisted = persistedListing({
      path: "claim",
      ref: "QPL-LIVE-3",
      slug: "cafe-live-3",
    });
    mockCreateListingMutateAsync.mockResolvedValueOnce(persisted);
    const { result } = renderHook(() => useDirectoryListingsActions(), {
      wrapper,
    });

    await act(async () => {
      await result.current.addListing(claimDraft("Cafe Claimed"), "member-1");
    });

    expect(
      result.current.local.some((listing) => listing.ref === persisted.ref),
    ).toBe(true);
  });

  it("keeps a claim draft out of the overlay when the server persists it as a suggestion", async () => {
    const persisted = persistedListing({
      path: "suggest",
      ref: "QPL-LIVE-4",
      slug: "cafe-live-4",
    });
    mockCreateListingMutateAsync.mockResolvedValueOnce(persisted);
    const { result } = renderHook(() => useDirectoryListingsActions(), {
      wrapper,
    });

    await act(async () => {
      await result.current.addListing(claimDraft("Cafe Claimed"), "member-1");
    });

    expect(
      result.current.local.some((listing) => listing.ref === persisted.ref),
    ).toBe(false);
  });

  it("keeps a suggest draft out of the overlay when the server persists it as a claim", async () => {
    const persisted = persistedListing({
      path: "claim",
      ref: "QPL-LIVE-5",
      slug: "cafe-live-5",
    });
    mockCreateListingMutateAsync.mockResolvedValueOnce(persisted);
    const { result } = renderHook(() => useDirectoryListingsActions(), {
      wrapper,
    });

    await act(async () => {
      await result.current.addListing(
        suggestDraft("Cafe Suggested"),
        "member-1",
      );
    });

    expect(
      result.current.local.some((listing) => listing.ref === persisted.ref),
    ).toBe(false);
  });
});
