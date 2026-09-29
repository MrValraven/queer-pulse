import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProfileCommunityCard } from "./ProfileCommunityCard";
import { TestProviders } from "../../test/TestProviders";
import type { FeaturedCommunityRef } from "./profileCommunities.types";

const FEATURED_COMMUNITY_REF: FeaturedCommunityRef = {
  slug: "queer-runners",
  name: "Queer Runners",
  tagline: "Weekly runs",
  type: "sports",
  typeLabel: "Sports",
  countLabel: "128 members",
  role: "owner",
};

/** `coming-out` is one of the demo registry's flagship slugs (a five-person
 *  roster, owned by `catarina-vaz` / initials "CV"). A pin card that still
 *  consulted `getLiving` in live mode would draw that roster on a live
 *  community whose slug merely happens to collide with it. */
const COLLIDING_SLUG_COMMUNITY_REF: FeaturedCommunityRef = {
  slug: "coming-out",
  name: "Coming Out Circle",
  tagline: "A quiet place to talk it through.",
  type: "support",
  typeLabel: "Support",
  countLabel: "67 members",
  role: "member",
};

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

describe("ProfileCommunityCard", () => {
  beforeEach(() => {
    demoModeState.demoMode = false;
  });

  it("renders name, tagline, count, role badge, and links to the community", async () => {
    render(
      <TestProviders>
        <ProfileCommunityCard community={FEATURED_COMMUNITY_REF} />
      </TestProviders>,
    );
    // The role badge is the one translated string here; the `members` namespace
    // loads lazily (catalogs/index.ts), so await it: reading the raw key too
    // early races the catalog fetch. The rest are data fields, already
    // present on first render.
    expect(await screen.findByText("Owner")).toBeInTheDocument();
    expect(screen.getByText("Queer Runners")).toBeInTheDocument();
    expect(screen.getByText("Weekly runs")).toBeInTheDocument();
    expect(screen.getByText("128 members")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/community/queer-runners",
    );
  });

  it("live mode draws no demo roster for a colliding slug", async () => {
    render(
      <TestProviders>
        <ProfileCommunityCard community={COLLIDING_SLUG_COMMUNITY_REF} />
      </TestProviders>,
    );

    // i18n catalogs load lazily, so the first assertion needs findBy*.
    expect(await screen.findByText("Member")).toBeInTheDocument();
    expect(screen.getByText("Coming Out Circle")).toBeInTheDocument();
    expect(screen.queryByText("CV")).not.toBeInTheDocument();
  });
});
