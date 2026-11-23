import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { MotionProvider } from "../../app/providers/MotionProvider";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
import { currentUserSlug } from "../members/data/members";
import type { RosterMember } from "./community.model";
import type { CommunityRole } from "./membership.types";
import type { PulsePaging } from "./api/useCommunityPosts";
import { RosterTab } from "./RosterTab";
import { resetCommunityBadgesDemo } from "./badges/communityBadgesDemoStore";

const COMMUNITY_SLUG = "queer-runners";

const PAGING: PulsePaging = {
  hasNextPage: false,
  fetchNextPage: () => {},
  isFetchingNextPage: false,
};

function rosterMember(
  slug: string,
  name: string,
  role: RosterMember["role"],
): RosterMember {
  return { slug, name, initials: name.slice(0, 2), tint: "plum", role };
}

const ROSTER: RosterMember[] = [
  rosterMember("carla", "Carla Nunes", "mod"),
  rosterMember("sofia", "Sofia Andrade", "member"),
  rosterMember(currentUserSlug, "Tiago Costa", "member"),
];

async function renderRoster(options: {
  viewerRole: CommunityRole | null;
  isSpace?: boolean;
}) {
  render(
    <TestProviders>
      <MotionProvider>
        <RosterTab
          roster={ROSTER}
          total={ROSTER.length}
          slug={COMMUNITY_SLUG}
          paging={PAGING}
          viewerRole={options.viewerRole}
          isSpace={options.isSpace ?? false}
        />
      </MotionProvider>
    </TestProviders>,
  );
  await awaitCatalog("communities");
}

const sendGiftButton = (name: string) =>
  screen.queryByRole("button", { name: `Send a gift to ${name}` });

beforeEach(() => {
  resetCommunityBadgesDemo();
});

describe("RosterTab badges and gifts", () => {
  it("shows a member's worn badge on their card", async () => {
    await renderRoster({ viewerRole: "member" });

    expect(screen.getByText("Regular")).toBeInTheDocument();
  });

  it("offers staff a gift button on other members' cards", async () => {
    await renderRoster({ viewerRole: "mod" });

    expect(sendGiftButton("Sofia Andrade")).toBeInTheDocument();
    expect(sendGiftButton("Carla Nunes")).toBeInTheDocument();
    expect(sendGiftButton("Tiago Costa")).not.toBeInTheDocument();
  });

  it("opens the gift dialog for that member", async () => {
    const user = userEvent.setup();
    await renderRoster({ viewerRole: "mod" });

    await user.click(sendGiftButton("Sofia Andrade") as HTMLElement);

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText("Send a gift to Sofia Andrade"),
    ).toBeInTheDocument();
  });

  it("offers a plain member no gift button", async () => {
    await renderRoster({ viewerRole: "member" });

    expect(sendGiftButton("Sofia Andrade")).not.toBeInTheDocument();
  });

  it("offers no gift button in a space", async () => {
    await renderRoster({ viewerRole: "mod", isSpace: true });

    expect(sendGiftButton("Sofia Andrade")).not.toBeInTheDocument();
  });
});
