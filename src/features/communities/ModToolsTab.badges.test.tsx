import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../app/providers/MotionProvider";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
import { resetCommunityBadgesDemo } from "./badges/communityBadgesDemoStore";
import { getLiving } from "./livingCommunities.data";
import { DEMO_SPACE_PARENTS_SLUG } from "./spaces.data";
import { ModToolsTab } from "./ModToolsTab";

const mocks = vi.hoisted(() => ({
  /** When set, the signed-in member reads as this profile slug. */
  viewerSlugOverride: { slug: null as string | null },
}));

vi.mock("../../app/providers/authContext", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../../app/providers/authContext")>();
  type AuthValue = ReturnType<typeof original.useAuth>;
  // One overridden value per (real value, slug): a fresh object on every call
  // re-runs every effect keyed on the session and loops the page forever.
  let cached: { source: AuthValue; slug: string; value: AuthValue } | null =
    null;
  return {
    ...original,
    useAuth: () => {
      const value = original.useAuth();
      const overrideSlug = mocks.viewerSlugOverride.slug;
      if (overrideSlug === null || !value.user) return value;
      if (cached?.source !== value || cached.slug !== overrideSlug) {
        cached = {
          source: value,
          slug: overrideSlug,
          value: {
            ...value,
            user: {
              ...value.user,
              profile: { ...value.user.profile, slug: overrideSlug },
            },
          },
        };
      }
      return cached.value;
    },
  };
});

const RUNNERS = "queer-runners";

// Spread as props: a literal `role` prop on a component trips jsx-a11y.
const MOD_VIEWER = { role: "mod" } as const;

const rosterPaging = {
  hasNextPage: false,
  fetchNextPage: () => Promise.resolve(),
  isFetchingNextPage: false,
  isFetchNextPageError: false,
};

function renderModTools(communitySlug: string, modSection: string) {
  const living = getLiving(communitySlug);
  if (!living) throw new Error(`No demo community ${communitySlug}`);
  return render(
    <TestProviders
      initialEntries={[
        `/community/${communitySlug}?tab=modtools&mod=${modSection}`,
      ]}
    >
      <MotionProvider>
        <ModToolsTab
          living={living}
          {...MOD_VIEWER}
          communityName={living.slug}
          rosterPaging={rosterPaging}
        />
      </MotionProvider>
    </TestProviders>,
  );
}

async function openMemberMenu(
  user: ReturnType<typeof userEvent.setup>,
  memberFirstName: string,
) {
  await user.click(
    await screen.findByRole("button", {
      name: new RegExp(`Actions for ${memberFirstName}`),
    }),
  );
}

describe("ModToolsTab badges wiring", () => {
  beforeEach(() => {
    resetCommunityBadgesDemo();
    mocks.viewerSlugOverride.slug = null;
  });

  it("opens the Badges pane from the rail", async () => {
    renderModTools(RUNNERS, "badges");
    await awaitCatalog("communities");

    const badgesTab = await screen.findByRole("tab", { name: "Badges" });
    expect(badgesTab).toHaveAttribute("aria-selected", "true");
    expect(
      await screen.findByRole("button", { name: "Create badge" }),
    ).toBeInTheDocument();
  });

  it("leaves Badges off the rail in a space", async () => {
    renderModTools(DEMO_SPACE_PARENTS_SLUG, "badges");
    await awaitCatalog("communities");

    const rail = await screen.findByRole("tablist", {
      name: "Mod tools sections",
    });
    expect(within(rail).queryByRole("tab", { name: "Badges" })).toBeNull();
    expect(within(rail).getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("offers Send a gift in a member's menu", async () => {
    const user = userEvent.setup();
    renderModTools(RUNNERS, "members");
    await awaitCatalog("communities");

    await openMemberMenu(user, "Sofia");

    expect(
      await screen.findByRole("menuitem", { name: "Send a gift" }),
    ).toBeInTheDocument();
  });

  it("leaves Send a gift off the viewer's own row", async () => {
    const user = userEvent.setup();
    mocks.viewerSlugOverride.slug = "sofia";
    renderModTools(RUNNERS, "members");
    await awaitCatalog("communities");

    await openMemberMenu(user, "Sofia");

    // The menu is open (it still offers the role actions), without the gift.
    expect(
      await screen.findByRole("menuitem", { name: "Remove from community" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Send a gift" })).toBeNull();
  });

  it("shows a member's worn badge on their mod row", async () => {
    renderModTools(RUNNERS, "members");
    await awaitCatalog("communities");

    expect(await screen.findByText("Old friend")).toBeInTheDocument();
  });
});
