import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { TestProviders } from "../../../test/TestProviders";
import type { AdminNavBadgeCounts } from "./adminNavMatching";
import { AdminShell } from "./AdminShell";

const ZERO_COUNTS: AdminNavBadgeCounts = {
  moderation: 0,
  members: 0,
  partnerships: 0,
  verifications: 0,
  housingCoops: 0,
  listingClaims: 0,
  musicEvents: 0,
  leads: 0,
  culturalProduction: 0,
};

const badges = vi.hoisted(() => ({
  counts: {},
}));

// The rail, the bell and the palette all read the queues through this module,
// so one stand-in drives every count the shell shows.
vi.mock("./useAdminNavBadges", () => ({
  useAdminNavBadges: () => badges.counts,
  useAdminNavBadgeStatus: () => ({ counts: badges.counts, unavailable: {} }),
}));

function renderShell() {
  return render(
    <TestProviders initialEntries={["/admin"]}>
      <MotionProvider>
        <AdminShell title="Overview">
          <p>Page body</p>
        </AdminShell>
      </MotionProvider>
    </TestProviders>,
  );
}

describe("AdminShell top bar", () => {
  beforeEach(() => {
    badges.counts = { ...ZERO_COUNTS };
  });

  it("the top bar trigger opens the admin palette", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByRole("button", { name: "Jump to a page" }));

    expect(
      await screen.findByRole("dialog", { name: "Jump to a page" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("combobox", { name: "Search admin pages" }),
      ).toHaveFocus(),
    );
  });

  it("the bell dot is hidden when nothing is waiting", () => {
    renderShell();

    const bell = screen.getByRole("button", { name: "Alerts" });
    expect(bell.querySelector("[data-alert-dot]")).toBeNull();
  });

  it("the alerts button opens the popover", async () => {
    badges.counts = { ...ZERO_COUNTS, moderation: 3 };
    const user = userEvent.setup();
    renderShell();

    // The bell names the waiting count, since its dot is silent.
    const bell = screen.getByRole("button", { name: "Alerts, 3 waiting" });
    expect(bell.querySelector("[data-alert-dot]")).not.toBeNull();
    await user.click(bell);

    expect(
      await screen.findByRole("dialog", { name: "Waiting on staff" }),
    ).toBeInTheDocument();
    expect(bell).toHaveAttribute("aria-expanded", "true");
  });
});
