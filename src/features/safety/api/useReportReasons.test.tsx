import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { useReportReasons } from "./useReportReasons";
import { SUBJECT_REASONS } from "../reportReasons";

/**
 * The report path has to work when the network does not. Somebody reaching for
 * a report button is often in a bad moment, so these assert the fail-safe
 * contract rather than the happy path:
 *
 *  - the local list is on screen on FIRST paint, never a spinner or an empty
 *    radio group;
 *  - a failed fetch changes nothing and shows nothing;
 *  - a code this build has never heard of is still offerable, because that
 *    drift is the whole reason to ask the server;
 *  - a code it does know renders the LOCAL translated label, because the
 *    server's labels are English with no localization of their own.
 */

const fetchReportReasons = vi.hoisted(() => vi.fn());
const demoMode = vi.hoisted(() => ({ value: true }));

vi.mock("./reports.api", () => ({ fetchReportReasons }));
vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useDemoMode: () => ({ demoMode: demoMode.value, setDemoMode: vi.fn() }),
}));

function ReasonProbe({ subjectType = "member" as const }) {
  const reasons = useReportReasons(subjectType);
  return (
    <ul>
      {reasons.map((option) => (
        <li key={option.code} data-code={option.code}>
          {option.label}
        </li>
      ))}
    </ul>
  );
}

function renderProbe() {
  return render(
    <TestProviders>
      <ReasonProbe />
    </TestProviders>,
  );
}

describe("useReportReasons", () => {
  it("renders the local list synchronously, with no loading state", () => {
    demoMode.value = true;
    renderProbe();
    // Synchronous `getBy`, deliberately: an await here would mean a member saw
    // an empty reason list first.
    expect(screen.getAllByRole("listitem").length).toBe(
      SUBJECT_REASONS.member.length,
    );
  });

  it("never asks the network in demo mode", () => {
    demoMode.value = true;
    fetchReportReasons.mockClear();
    renderProbe();
    expect(fetchReportReasons).not.toHaveBeenCalled();
  });

  it("keeps the form working when the fetch fails, showing no error", async () => {
    demoMode.value = false;
    fetchReportReasons.mockRejectedValue(new Error("offline"));
    renderProbe();
    expect(screen.getAllByRole("listitem").length).toBe(
      SUBJECT_REASONS.member.length,
    );
    // Let the rejection settle rather than flushing a single microtask, so the
    // assertions below describe the state a member is actually left in.
    await waitFor(() => expect(fetchReportReasons).toHaveBeenCalled());
    // Nothing announced. `ToastProvider` keeps an assertive live region mounted
    // from first paint (assistive tech ignores a region inserted at announce
    // time), so the check is that every live region is still EMPTY, not that
    // none exists.
    for (const liveRegion of screen.queryAllByRole("alert")) {
      expect(liveRegion).toBeEmptyDOMElement();
    }
    expect(screen.getAllByRole("listitem").length).toBe(
      SUBJECT_REASONS.member.length,
    );
  });

  it("falls back to the local list when the server answers with nothing", async () => {
    demoMode.value = false;
    fetchReportReasons.mockResolvedValue([]);
    renderProbe();
    // Wait for the answer to land first: the local list is on screen from the
    // first paint, so asserting before the query settles would pass even if an
    // empty answer wiped the list.
    await waitFor(() => expect(fetchReportReasons).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getAllByRole("listitem")).toHaveLength(
        SUBJECT_REASONS.member.length,
      ),
    );
  });

  // The drift case. A catalogue entry this build predates must still reach the
  // member, or asking the server buys nothing.
  it("offers a code it has never heard of, using the server's own label", async () => {
    demoMode.value = false;
    fetchReportReasons.mockResolvedValue([
      { code: "harassment", label: "Targeted harassment or threats" },
      { code: "some_new_code", label: "A brand new reason" },
    ]);
    renderProbe();
    expect(await screen.findByText("A brand new reason")).toBeInTheDocument();
  });

  // The server's labels come from the backend's English `REASON_LABELS`, so
  // taking them verbatim would put English in front of a Portuguese member on
  // every report surface at once.
  it("prefers the local translated label over the server's English", async () => {
    demoMode.value = false;
    fetchReportReasons.mockResolvedValue([
      { code: "harassment", label: "SERVER ENGLISH TEXT" },
    ]);
    renderProbe();
    const item = await screen.findByText(/harassment/i);
    expect(item).toBeInTheDocument();
    expect(screen.queryByText("SERVER ENGLISH TEXT")).not.toBeInTheDocument();
  });

  it("takes the server's ordering and membership when it answers", async () => {
    demoMode.value = false;
    fetchReportReasons.mockResolvedValue([
      { code: "spam", label: "Spam" },
      { code: "other", label: "Other" },
    ]);
    renderProbe();
    // `findAllByRole` would resolve on the local list this hook paints
    // synchronously, so it can never observe the swap. Wait for the codes
    // themselves instead.
    await waitFor(() =>
      expect(
        screen.getAllByRole("listitem").map((node) => node.dataset.code),
      ).toEqual(["spam", "other"]),
    );
  });
});
