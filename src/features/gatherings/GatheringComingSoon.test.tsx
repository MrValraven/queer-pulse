import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { routes } from "../../app/routeMap";
import { GatheringComingSoon } from "./GatheringComingSoon";

/**
 * The shared live-mode placeholder for the fixed-slug gathering prototype pages
 * (X-2 — gatherings had zero component tests). In live mode these routes have
 * no real gathering behind them, so they resolve to this placeholder instead of
 * firing RSVP/invite mutations at a hardcoded id. The component is a pure,
 * variant-driven presentational shell: each variant maps to its own title +
 * description while sharing one pair of escape-hatch CTAs.
 *
 * Rendered inside TestProviders (demo) because it nests a PageShell (Navbar +
 * Footer) that reads the app's providers — the placeholder's own content does
 * not branch on demo/live, so demo-mode providers render it faithfully.
 *
 * i18n note: `gatherings` is a lazy namespace → `findBy*` for translated copy.
 * Titles are split across an `<em>`, so we assert on the single-node
 * descriptions to tell the variants apart, plus the shared CTA links.
 */
describe("GatheringComingSoon", () => {
  it("routes the escape-hatch CTAs to the live events hub and home", async () => {
    render(
      <TestProviders>
        <GatheringComingSoon variant="event" />
      </TestProviders>,
    );

    const browse = await screen.findByRole("link", {
      name: "Browse gatherings",
    });
    expect(browse).toHaveAttribute("href", routes.events);
    expect(
      screen.getByRole("link", { name: "Back to home" }),
    ).toHaveAttribute("href", routes.homepage);
  });

  it("shows variant-specific copy (event vs. rsvp)", async () => {
    const { unmount } = render(
      <TestProviders>
        <GatheringComingSoon variant="event" />
      </TestProviders>,
    );
    expect(
      await screen.findByText(/it isn't a live event yet/i),
    ).toBeInTheDocument();
    unmount();

    render(
      <TestProviders>
        <GatheringComingSoon variant="rsvp" />
      </TestProviders>,
    );
    expect(
      await screen.findByText(/isn't tied to a live RSVP yet/i),
    ).toBeInTheDocument();
  });
});
