import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { LandingFeaturesResult } from "../api/useLandingFeatures";
import { LiveDiscovery } from "./LiveDiscovery";

const mockUseLandingFeaturesPublic = vi.fn<() => LandingFeaturesResult>();

// Mocked at the module the component imports (not re-testing the hook here —
// that's useLandingFeatures.test.tsx's job) so this suite isolates exactly
// what the brief asks: does `LiveDiscovery` render nothing on an empty slice,
// and one card per curated member on a populated one.
vi.mock("../api/useLandingFeatures", () => ({
  useLandingFeaturesPublic: () => mockUseLandingFeaturesPublic(),
}));

describe("LiveDiscovery", () => {
  it("renders nothing when no members are curated", () => {
    mockUseLandingFeaturesPublic.mockReturnValue({
      members: [],
      communities: [],
      changemakers: [],
      isLoading: false,
    });

    const { container } = render(<LiveDiscovery />, {
      wrapper: TestProviders,
    });

    // `LiveDiscovery` returns null on an empty slice, so it contributes no
    // output of its own. We assert on ITS output (the `#discovery` section and
    // its member links) rather than an empty `container`, because
    // `TestProviders` mounts `ToastProvider`, whose two live regions
    // (role="status"/role="alert") are always present from first paint by
    // design and would otherwise make the container non-empty.
    expect(container.querySelector("#discovery")).toBeNull();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("renders nothing while the first fetch is still loading", () => {
    mockUseLandingFeaturesPublic.mockReturnValue({
      members: [],
      communities: [],
      changemakers: [],
      isLoading: true,
    });

    const { container } = render(<LiveDiscovery />, {
      wrapper: TestProviders,
    });

    // Same rationale as the empty-slice case above: `LiveDiscovery` renders
    // null while loading, so assert its `#discovery` section and links never
    // appear rather than an empty container (ToastProvider's always-mounted
    // live regions live there too).
    expect(container.querySelector("#discovery")).toBeNull();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("renders one card per curated member, linking to their public profile", async () => {
    mockUseLandingFeaturesPublic.mockReturnValue({
      members: [
        {
          id: "a",
          slug: "ana-silva",
          name: "Ana Silva",
          tagline: "Illustrator",
          avatarUrl: null,
          quote: "Come find me at the print swap.",
        },
        {
          id: "b",
          slug: "bea-costa",
          name: "Bea Costa",
          tagline: null,
          avatarUrl: null,
          quote: "I'm around for late-night debugging.",
        },
      ],
      communities: [],
      changemakers: [],
      isLoading: false,
    });

    render(<LiveDiscovery />, { wrapper: TestProviders });

    // Translated chrome (eyebrow/title/sub/CTA) loads lazily — findBy waits.
    await screen.findByText("Ana Silva");
    expect(screen.getByText("Bea Costa")).toBeInTheDocument();

    const memberLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("/public-profile/"));
    expect(memberLinks).toHaveLength(2);
    expect(memberLinks.map((link) => link.getAttribute("href"))).toEqual([
      "/public-profile/ana-silva",
      "/public-profile/bea-costa",
    ]);
  });
});
