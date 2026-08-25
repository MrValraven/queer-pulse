import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { PayoutsList } from "./StudioPayoutsSections";

/**
 * Studio is demo-only in live, so payouts has no adapter — only the loaded
 * list's interaction. `PayoutsList` takes `loading` + `onExport` as plain
 * props, so we render it directly with `loading={false}` (no `useSimulatedLoad`
 * timer to stub) and assert two things: the balance rows render their real
 * paid/pending status, and the Export-CSV control delegates to the `onExport`
 * callback the page owns (which writes the CSV + toast). The heading/status/CTA
 * copy comes from the lazy `studio` catalog, so those queries use `findBy*`;
 * the mock payout titles are plain data and use `getBy*`.
 *
 * Note: the sidebar's payout *threshold* is a presentational `<select>`
 * preference — it gates nothing and changes no ARIA/text — so it isn't asserted
 * here (there's no payout-request button in this surface to gate).
 */

describe("PayoutsList", () => {
  it("renders the loaded payout rows with their paid/pending status", async () => {
    render(
      <TestProviders>
        <PayoutsList loading={false} onExport={() => {}} />
      </TestProviders>,
    );

    // The most recent payout is pending; the rest are paid.
    expect(await screen.findByText("Pending")).toBeInTheDocument();
    expect(screen.getAllByText("Paid").length).toBeGreaterThan(0);
    // Plain (non-i18n) mock title of a real payout row.
    expect(screen.getByText(/June 2026 payout/)).toBeInTheDocument();
  });

  it("delegates CSV export to the onExport callback", async () => {
    const onExport = vi.fn();
    render(
      <TestProviders>
        <PayoutsList loading={false} onExport={onExport} />
      </TestProviders>,
    );

    fireEvent.click(await screen.findByRole("button", { name: /export csv/i }));
    expect(onExport).toHaveBeenCalledTimes(1);
  });
});
