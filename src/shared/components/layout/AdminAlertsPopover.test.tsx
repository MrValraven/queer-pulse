import { render, screen, within } from "@testing-library/react";
import { useRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { TestProviders } from "../../../test/TestProviders";
import { AdminAlertsPopover } from "./AdminAlertsPopover";
import type { AdminNavBadgeUnavailable } from "./AdminAlertsPopover";
import type { AdminNavBadgeCounts } from "./adminNavMatching";

const ZERO_COUNTS: AdminNavBadgeCounts = {
  moderation: 0,
  members: 0,
  partnerships: 0,
  verifications: 0,
  housingCoops: 0,
  listingClaims: 0,
  musicEvents: 0,
  leads: 0,
};

const badgeCounts = vi.hoisted(() => {
  const current: Record<string, number> = {};
  return { current };
});

vi.mock("./useAdminNavBadges", () => ({
  useAdminNavBadges: () => badgeCounts.current,
}));

/** The popover anchored to a bell, open, as the top bar renders it. */
function AlertsHarness({
  unavailable,
}: {
  unavailable?: AdminNavBadgeUnavailable;
}) {
  const bellRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={bellRef} type="button">
        Alerts
      </button>
      <AdminAlertsPopover
        anchorRef={bellRef}
        isOpen
        onClose={() => {}}
        unavailable={unavailable}
      />
    </>
  );
}

function renderAlerts(unavailable?: AdminNavBadgeUnavailable) {
  render(
    <TestProviders initialEntries={["/admin"]}>
      <MotionProvider>
        <AlertsHarness unavailable={unavailable} />
      </MotionProvider>
    </TestProviders>,
  );
  return screen.getByRole("dialog", { name: "Waiting on staff" });
}

describe("AdminAlertsPopover", () => {
  beforeEach(() => {
    badgeCounts.current = { ...ZERO_COUNTS };
  });

  it("lists only queues with a count above zero", () => {
    badgeCounts.current = { ...ZERO_COUNTS, moderation: 3, verifications: 2 };
    const popover = renderAlerts();

    expect(
      within(popover).getByRole("link", { name: "Open Moderation" }),
    ).toBeInTheDocument();
    expect(
      within(popover).getByRole("link", { name: "Open Verifications" }),
    ).toBeInTheDocument();
    expect(within(popover).getAllByRole("link")).toHaveLength(2);
    expect(
      within(popover).queryByRole("link", { name: "Open Leads" }),
    ).not.toBeInTheDocument();
  });

  it("shows the empty state when nothing is waiting", () => {
    const popover = renderAlerts();

    expect(
      within(popover).getByText("Nothing is waiting on you"),
    ).toBeInTheDocument();
    expect(within(popover).queryAllByRole("link")).toHaveLength(0);
  });

  it("shows Count unavailable for a failed read", () => {
    const popover = renderAlerts({ leads: true });

    const leadsLink = within(popover).getByRole("link", { name: "Open Leads" });
    expect(leadsLink).toHaveAccessibleDescription("Count unavailable");
    expect(leadsLink).not.toHaveTextContent("0");
    expect(
      within(popover).queryByText("Nothing is waiting on you"),
    ).not.toBeInTheDocument();
  });
});
