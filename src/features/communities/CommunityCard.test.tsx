import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { CommunityCard } from "./CommunityCard";
import type { Community } from "../homepage/data/types";

/**
 * `coming-out` is one of the demo registry's flagship slugs (`private`
 * access, a five-person roster) AND, on purpose, the slug this suite gives a
 * live card DTO with a different access tier and activity number. A card
 * that still consulted `getLiving` in live mode would answer with the demo
 * fixture's private tier and roster. This suite guards against exactly that
 * regression.
 */
const COLLIDING_SLUG = "coming-out";

const demoModeState = vi.hoisted(() => ({ demoMode: false }));
vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useDemoMode: () => ({
    demoMode: demoModeState.demoMode,
    available: false,
    setDemoMode: vi.fn(),
    toggle: vi.fn(),
  }),
}));

function buildCommunity(overrides: Partial<Community> = {}): Community {
  return {
    href: "#",
    type: "support",
    typeLabel: "Support",
    name: "Coming Out Circle",
    description: "A quiet place to talk it through.",
    count: "67 members",
    joinLabel: "Request",
    slug: COLLIDING_SLUG,
    accessTier: "request",
    ...overrides,
  };
}

function renderCard(community: Community) {
  return render(
    <TestProviders>
      <CommunityCard community={community} joined={false} onJoin={vi.fn()} />
    </TestProviders>,
  );
}

describe("CommunityCard", () => {
  beforeEach(() => {
    demoModeState.demoMode = false;
  });

  it("live mode shows the card DTO tier for a slug the demo registry also uses", async () => {
    renderCard(buildCommunity());

    // i18n catalogs load lazily, so the first assertion needs findBy*.
    expect(await screen.findByText("Request")).toBeInTheDocument();
    expect(screen.queryByText("Enter quietly")).not.toBeInTheDocument();
    // The demo registry's "coming-out" roster owner never renders in live mode.
    expect(screen.queryByText("CV")).not.toBeInTheDocument();
  });

  it("demo mode keeps the flagship tier and roster", async () => {
    demoModeState.demoMode = true;
    renderCard(buildCommunity());

    expect(await screen.findByText("Enter quietly")).toBeInTheDocument();
    expect(screen.queryByText("Request")).not.toBeInTheDocument();
    expect(screen.getByText("CV")).toBeInTheDocument();
  });

  it("live mode shows the DTO's weekly activity", async () => {
    renderCard(buildCommunity({ activeThisWeek: 42 }));

    expect(await screen.findByText("42 active this week")).toBeInTheDocument();
    // The demo fixture's own number for this slug never leaks through.
    expect(screen.queryByText("14 active this week")).not.toBeInTheDocument();
  });
});
