import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { LivingCommunity, SpaceCardModel } from "./community.model";
import { SpacesTab } from "./SpacesTab";

/** What the mocked `useSubcommunities` hook answers with on the next render.
 *  Set per test so the suite can walk the tab through its four outcomes
 *  (loaded, empty, error, and the non-member note) with no network layer. */
let hookResult: {
  spaces: SpaceCardModel[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

/** Records every `(slug, options)` call the tab makes, so a test can assert
 *  the fetch itself was gated (`enabled: false`) on top of what rendered. */
const useSubcommunitiesMock = vi.fn();

vi.mock("./api/useSubcommunities", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./api/useSubcommunities")>();
  return {
    ...actual,
    useSubcommunities: (slug: string | undefined, options: unknown) => {
      useSubcommunitiesMock(slug, options);
      return hookResult;
    },
  };
});

/* The join wizard pulls in rules and membership queries; a stand-in that
 * names what it was opened with is all these tests need. */
vi.mock("./CommunityJoinFlowModal", () => ({
  CommunityJoinFlowModal: ({
    community,
    parentName,
  }: {
    community: { name: string };
    parentName?: string;
  }) => (
    <div role="dialog">
      Joining {community.name} in {parentName}
    </div>
  ),
}));

function space(overrides: Partial<SpaceCardModel> = {}): SpaceCardModel {
  return {
    href: "/community/runners-with-kids",
    slug: "runners-with-kids",
    type: "sports",
    typeLabel: "Sports",
    name: "Runners with kids",
    description:
      "Buggy-friendly routes and a Saturday park loop for parents who run.",
    count: "18 members",
    joinLabel: "Join",
    accessTier: "public",
    isMember: false,
    ...overrides,
  };
}

function livingCommunity(
  overrides: Partial<LivingCommunity> = {},
): LivingCommunity {
  return {
    slug: "queer-runners",
    accessTier: "public",
    rules: [],
    resources: [],
    events: [],
    roster: [],
    pinned: [],
    pulse: [],
    moments: [],
    stats: { members: 240, activeThisWeek: 12, postsThisWeek: 4 },
    frozenReason: null,
    parent: null,
    inheritedRules: null,
    allowsSubcommunities: true,
    subcommunityCount: 2,
    ...overrides,
  };
}

function renderTab(isParentMember = true) {
  return render(
    <TestProviders>
      <SpacesTab
        living={livingCommunity()}
        name="Queer Runners Lisboa"
        isParentMember={isParentMember}
      />
    </TestProviders>,
  );
}

describe("SpacesTab", () => {
  beforeEach(() => {
    hookResult = {
      spaces: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    useSubcommunitiesMock.mockClear();
  });

  it("shows the intro and every space for a parent member", async () => {
    hookResult = {
      spaces: [
        space(),
        space({
          slug: "flinta-night-runs",
          name: "FLINTA* night runs",
          description:
            "Evening runs for women, lesbian, intersex, non-binary, trans and agender runners.",
          count: "24 members",
          accessTier: "request",
        }),
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderTab(true);

    expect(
      await screen.findByText(
        "Smaller spaces inside Queer Runners Lisboa. Join the ones that fit you.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Runners with kids")).toBeInTheDocument();
    expect(screen.getByText("FLINTA* night runs")).toBeInTheDocument();
    expect(
      screen.queryByText("Join Queer Runners Lisboa first"),
    ).not.toBeInTheDocument();
  });

  it("renders the empty state when the parent hosts no spaces yet", async () => {
    hookResult = {
      spaces: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderTab(true);

    expect(await screen.findByText("No spaces yet")).toBeInTheDocument();
    expect(
      screen.getByText("Moderators can open a space from mod tools."),
    ).toBeInTheDocument();
  });

  it("tells a non-member to join the parent first", async () => {
    hookResult = {
      spaces: [space()],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderTab(false);

    // Once as the tab's note and once on the card, in place of its Join.
    expect(
      await screen.findAllByText("Join Queer Runners Lisboa first"),
    ).toHaveLength(2);
    // Browsing still works while not a member; only joining is gated.
    expect(screen.getByText("Runners with kids")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Join" }),
    ).not.toBeInTheDocument();
  });

  it("badges a space only for the viewer's own roster row", async () => {
    hookResult = {
      spaces: [
        space({ isMember: true, myRole: "member" }),
        // A parent moderator carries an effective role into every space, but
        // holds no row in this one.
        space({
          slug: "flinta-night-runs",
          name: "FLINTA* night runs",
          myRole: "co_owner",
          isMember: false,
        }),
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderTab(true);

    expect(await screen.findAllByText("You're in")).toHaveLength(1);
    // Only the space without a row offers a way in.
    expect(screen.getAllByRole("button", { name: "Join" })).toHaveLength(1);
  });

  it("words each card's action by the space's tier", async () => {
    hookResult = {
      spaces: [
        space({ slug: "open-space", name: "Open space" }),
        space({
          slug: "request-space",
          name: "Request space",
          accessTier: "request",
        }),
        space({
          slug: "invite-space",
          name: "Invite space",
          accessTier: "invite",
        }),
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderTab(true);

    expect(
      await screen.findByRole("button", { name: "Join" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Request to join" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Invitation only")).toBeInTheDocument();
  });

  it("opens the join wizard for the space, with the parent's name", async () => {
    hookResult = {
      spaces: [space()],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderTab(true);

    fireEvent.click(await screen.findByRole("button", { name: "Join" }));

    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Joining Runners with kids in Queer Runners Lisboa",
    );
  });

  it("does not fetch a gated parent's spaces for a non-member, and shows only the join note", async () => {
    hookResult = {
      spaces: [space()],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    render(
      <TestProviders>
        <SpacesTab
          living={livingCommunity({ accessTier: "request" })}
          name="Queer Runners Lisboa"
          isParentMember={false}
        />
      </TestProviders>,
    );

    expect(
      await screen.findByText("Join Queer Runners Lisboa first"),
    ).toBeInTheDocument();
    expect(useSubcommunitiesMock).toHaveBeenCalledWith("queer-runners", {
      enabled: false,
    });
    // No card, empty, or error state renders on top of the note: the tab
    // never actually asked the backend, which would 403 a non-member here.
    expect(screen.queryByText("Runners with kids")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Couldn't load the spaces."),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("No spaces yet")).not.toBeInTheDocument();
  });

  it("surfaces a failed fetch with a retry that calls refetch", async () => {
    const refetch = vi.fn();
    hookResult = { spaces: [], isLoading: false, isError: true, refetch };
    renderTab(true);

    const retryButton = await screen.findByRole("button", {
      name: "Try again",
    });
    expect(screen.getByText("Couldn't load the spaces.")).toBeInTheDocument();
    fireEvent.click(retryButton);
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
