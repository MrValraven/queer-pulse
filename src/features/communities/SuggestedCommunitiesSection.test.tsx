import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SEED_CONNECTED } from "../connect/connections.data";
import { TestProviders } from "../../test/TestProviders";
import { SuggestedCommunitiesSection } from "./SuggestedCommunitiesSection";

/**
 * Whichever connection slugs the current test wants the viewer to have. The
 * mock below reads this on every render, so a test can hand the section an
 * empty social graph without touching localStorage or the real provider's
 * seeding.
 */
let connectedMemberSlugs: string[] = [...SEED_CONNECTED];

vi.mock("../../app/providers/useConnections", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../app/providers/useConnections")>();
  return {
    ...actual,
    // Spreading `actual` keeps ConnectionsContext itself real, so the
    // ConnectionsProvider inside TestProviders still works normally.
    useConnections: () => ({
      ...actual.useConnections(),
      connected: connectedMemberSlugs,
    }),
  };
});

function renderSection(excludeSlug?: string) {
  return render(
    <TestProviders>
      <SuggestedCommunitiesSection excludeSlug={excludeSlug} />
    </TestProviders>,
  );
}

describe("SuggestedCommunitiesSection", () => {
  it("shows communities the viewer's connections are already in", async () => {
    connectedMemberSlugs = [...SEED_CONNECTED];
    renderSection();

    // i18n catalogs load lazily, so the heading needs findBy*.
    expect(
      await screen.findByRole("heading", {
        name: "Suggested for you",
        level: 2,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Communities where people you are connected to have already landed.",
      ),
    ).toBeInTheDocument();
    // Four of the demo viewer's connections are on this roster, so it is one
    // of the highest-ranked suggestions.
    expect(await screen.findByText("Queer Elders")).toBeInTheDocument();
  });

  it("never suggests a community the viewer already belongs to", async () => {
    connectedMemberSlugs = [...SEED_CONNECTED];
    renderSection();

    await screen.findByRole("heading", { name: "Suggested for you" });
    // Seeded memberships in CommunityMembershipProvider.
    expect(screen.queryByText("Queer Runners Lisboa")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Trans & Non-Binary Hub"),
    ).not.toBeInTheDocument();
    // Private communities can never be a legitimate suggestion.
    expect(screen.queryByText("Coming-Out Support")).not.toBeInTheDocument();
  });

  it("drops the community the featured hero is already promoting", async () => {
    connectedMemberSlugs = [...SEED_CONNECTED];
    renderSection("queer-elders");

    await screen.findByRole("heading", { name: "Suggested for you" });
    expect(screen.queryByText("Queer Elders")).not.toBeInTheDocument();
    expect(screen.getByText("Queer & of Colour")).toBeInTheDocument();
  });

  it("renders nothing at all when the viewer has no connections", () => {
    connectedMemberSlugs = [];
    const { container } = renderSection();

    // No heading and no empty state: an empty result is the normal answer for
    // a member with no connections, not something to apologise for.
    expect(container).toBeEmptyDOMElement();
  });

  it("keeps the join wizard open when joining empties the band", async () => {
    // `diogo` is on exactly one demo roster the viewer can be suggested
    // (Queer Youth Network), so the band shows a single card and joining it
    // empties the list. Demo membership flips synchronously, which is the
    // harshest version of this path: the list is gone in the same commit that
    // asks the wizard for its welcome step.
    connectedMemberSlugs = ["diogo"];
    renderSection();

    fireEvent.click(await screen.findByRole("button", { name: "Join" }));
    fireEvent.click(await screen.findByRole("button", { name: "Continue" }));
    fireEvent.click(
      await screen.findByRole("button", {
        name: /I have read these house rules/,
      }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "Continue" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Join the community" }),
    );

    // The band is gone (the viewer has joined its only suggestion) and the
    // wizard is still standing on its welcome step.
    expect(
      await screen.findByText("Welcome to Queer Youth Network"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Suggested for you" }),
    ).not.toBeInTheDocument();

    // Dismissing the welcome step takes the whole section with it, which is
    // the honest outcome: there is nothing left to suggest.
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(
      screen.queryByText("Welcome to Queer Youth Network"),
    ).not.toBeInTheDocument();
  });
});
