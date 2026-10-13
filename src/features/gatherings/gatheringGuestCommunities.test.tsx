import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReducedMotionContext } from "../../app/providers/motionPrefs";
import { TestProviders } from "../../test/TestProviders";
import type { GatheringGuestCommunity } from "./api/eventCommunities.api";
import type { EventCommunityDTO } from "./api/events.api";
import { gatheringDetails, type GatheringDetail } from "./data";
import {
  GatheringCommunityCard,
  GatheringHeroCommunity,
} from "./GatheringCommunity";

// Demo mode is on in tests, and the demo viewer mods `queer-runners` and
// `trans-hub` (CommunityMembershipProvider's seed) and belongs nowhere else.
// The private fixtures below borrow the `trans-hub` slug only to exercise the
// roster check.

const { leaveMutate, syncAfterLeave } = vi.hoisted(() => ({
  leaveMutate: vi.fn(),
  syncAfterLeave: vi.fn(),
}));
vi.mock("./api/useCollabInvite", () => ({
  useLeaveCollab: () => ({ mutate: leaveMutate, isPending: false }),
  useSyncAfterLeaveCollab: () => syncAfterLeave,
}));

afterEach(() => {
  leaveMutate.mockReset();
  syncAfterLeave.mockReset();
  vi.useRealTimers();
});

const lead: EventCommunityDTO = {
  slug: "queer-social",
  name: "Queer Social Lisbon",
  accessTier: "public",
};

function guest(
  slug: string,
  name: string,
  overrides: Partial<GatheringGuestCommunity> = {},
): GatheringGuestCommunity {
  return {
    id: `row-${slug}`,
    slug,
    name,
    accessTier: "public",
    viewerManages: false,
    avatarImageUrl: null,
    ...overrides,
  };
}

function gatheringWith(
  community: EventCommunityDTO | undefined,
  guestCommunities: GatheringGuestCommunity[],
  viewerIsOrganizer = false,
): GatheringDetail {
  return {
    slug: "supper",
    title: "Supper",
    community,
    guestCommunities,
    viewerIsOrganizer,
  } as unknown as GatheringDetail;
}

function heroText(gathering: GatheringDetail): string {
  const { container } = render(
    <TestProviders>
      <div data-testid="hero">
        <GatheringHeroCommunity gathering={gathering} />
      </div>
    </TestProviders>,
  );
  return (
    container.querySelector('[data-testid="hero"]')?.textContent ?? ""
  ).trim();
}

describe("GatheringHeroCommunity", () => {
  it("names the lead alone as it always has", () => {
    expect(heroText(gatheringWith(lead, []))).toBe("With Queer Social Lisbon");
  });

  it("names the lead first, then a guest", () => {
    expect(
      heroText(gatheringWith(lead, [guest("drag-club", "Drag Club")])),
    ).toBe("With Queer Social Lisbon and Drag Club");
  });

  it("names two guests and counts the rest", () => {
    expect(
      heroText(
        gatheringWith(lead, [
          guest("drag-club", "Drag Club"),
          guest("book-club", "Book Club"),
          guest("choir", "Choir"),
          guest("swim", "Swim Team"),
        ]),
      ),
    ).toBe("With Queer Social Lisbon, Drag Club, Book Club and 2 more");
  });

  it("keeps a private guest from a viewer outside it", () => {
    expect(
      heroText(
        gatheringWith(lead, [
          guest("secret-circle", "Secret Circle", { accessTier: "private" }),
        ]),
      ),
    ).toBe("With Queer Social Lisbon");
  });

  it("names a private guest to its own members and to the organisers", () => {
    expect(
      heroText(
        gatheringWith(lead, [
          guest("trans-hub", "Trans & Non-Binary Hub", {
            accessTier: "private",
          }),
        ]),
      ),
    ).toBe("With Queer Social Lisbon and Trans & Non-Binary Hub");
    expect(
      heroText(
        gatheringWith(
          lead,
          [guest("secret-circle", "Secret Circle", { accessTier: "private" })],
          true,
        ),
      ),
    ).toBe("With Queer Social Lisbon and Secret Circle");
  });

  it("names only the guests when the lead is withheld", () => {
    expect(
      heroText(
        gatheringWith(
          { slug: "hidden-lead", name: "Hidden Lead", accessTier: "private" },
          [guest("drag-club", "Drag Club")],
        ),
      ),
    ).toBe("With Drag Club");
  });

  it("reads the demo gathering's accepted guest", () => {
    expect(heroText(gatheringDetails["queer-runners-run"]!)).toBe(
      "With Queer Runners Lisboa and Trans & Non-Binary Hub",
    );
  });
});

/** The mocked leave mutation answers at once, as a removal the server took. */
function succeedOnLeave(): void {
  leaveMutate.mockImplementation(
    (
      variables: { id: string; eventSlug?: string },
      callbacks: {
        onSuccess: (result: undefined, sent: typeof variables) => void;
      },
    ) => callbacks.onSuccess(undefined, variables),
  );
}

/** Renders the card with one guest the viewer runs, then removes it through
 *  the confirm. */
function renderCardAndRemove(isReducedMotion: boolean) {
  const rendered = render(
    <TestProviders>
      <ReducedMotionContext.Provider value={isReducedMotion}>
        <GatheringCommunityCard
          gathering={gatheringWith(lead, [
            guest("trans-hub", "Trans & Non-Binary Hub", {
              viewerManages: true,
            }),
          ])}
        />
      </ReducedMotionContext.Provider>
    </TestProviders>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Remove our community" }));
  const removeButtons = screen.getAllByRole("button", {
    name: "Remove our community",
  });
  fireEvent.click(removeButtons[removeButtons.length - 1]!);
  return rendered;
}

describe("GatheringCommunityCard", () => {
  it("lists every guest and offers Remove our community only where the viewer runs it", () => {
    render(
      <TestProviders>
        <GatheringCommunityCard
          gathering={gatheringWith(lead, [
            guest("trans-hub", "Trans & Non-Binary Hub", {
              viewerManages: true,
            }),
            guest("drag-club", "Drag Club"),
          ])}
        />
      </TestProviders>,
    );
    expect(screen.getAllByText("Guest community")).toHaveLength(2);
    expect(
      screen.getAllByRole("button", { name: "Remove our community" }),
    ).toHaveLength(1);
  });

  it("removes the community only after the confirm", () => {
    render(
      <TestProviders>
        <GatheringCommunityCard
          gathering={gatheringWith(lead, [
            guest("trans-hub", "Trans & Non-Binary Hub", {
              viewerManages: true,
            }),
          ])}
        />
      </TestProviders>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Remove our community" }),
    );
    expect(leaveMutate).not.toHaveBeenCalled();
    expect(
      screen.getByText("Remove Trans & Non-Binary Hub from this gathering?"),
    ).toBeInTheDocument();
    const removeButtons = screen.getAllByRole("button", {
      name: "Remove our community",
    });
    fireEvent.click(removeButtons[removeButtons.length - 1]!);
    expect(leaveMutate).toHaveBeenCalledWith(
      { id: "row-trans-hub", eventSlug: "supper" },
      expect.any(Object),
    );
  });

  it("closes the confirm and folds the row before the gathering drops the guest", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    succeedOnLeave();
    renderCardAndRemove(false);
    expect(
      screen.queryByText("Remove Trans & Non-Binary Hub from this gathering?"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Hosted with")).toHaveFocus();
    expect(syncAfterLeave).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(syncAfterLeave).toHaveBeenCalledTimes(1);
    expect(syncAfterLeave).toHaveBeenCalledWith({
      id: "row-trans-hub",
      eventSlug: "supper",
    });
  });

  it("drops the guest at once under reduced motion", () => {
    succeedOnLeave();
    renderCardAndRemove(true);
    expect(
      screen.queryByText("Remove Trans & Non-Binary Hub from this gathering?"),
    ).not.toBeInTheDocument();
    expect(syncAfterLeave).toHaveBeenCalledWith({
      id: "row-trans-hub",
      eventSlug: "supper",
    });
  });

  it("drops the guest when the row unmounts before its fold ends", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    succeedOnLeave();
    const { unmount } = renderCardAndRemove(false);
    expect(syncAfterLeave).not.toHaveBeenCalled();
    unmount();
    expect(syncAfterLeave).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(syncAfterLeave).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when no community may be named", () => {
    const { container } = render(
      <TestProviders>
        <div data-testid="card">
          <GatheringCommunityCard gathering={gatheringWith(undefined, [])} />
        </div>
      </TestProviders>,
    );
    expect(container.querySelector('[data-testid="card"]')?.textContent).toBe(
      "",
    );
  });
});
