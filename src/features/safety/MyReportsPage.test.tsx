import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { MyReportEntry } from "./api/useMyReports";
import { MyReportsPage } from "./MyReportsPage";

/**
 * The hook is mocked rather than driven through MSW because the three states
 * that matter here are the PAGE's, not the endpoint's: a list, nothing filed,
 * and a failed load. Driving them from the real `GET /reports/mine` would
 * make the assertions about transport, and demo mode (forced on in this suite)
 * never reaches the network at all.
 */
// `vi.hoisted` because `vi.mock` is itself hoisted above the imports: a plain
// `const` declared below would still be in its temporal dead zone when the
// factory runs.
const { useMyReports } = vi.hoisted(() => ({ useMyReports: vi.fn() }));
vi.mock("./api/useMyReports", () => ({ useMyReports }));

function entry(overrides: Partial<MyReportEntry> = {}): MyReportEntry {
  return {
    id: "report-1",
    reference: "QPR-2026-4A1C",
    subjectType: "post",
    reasonCode: "off_topic",
    status: "open",
    createdAt: "2026-09-01T10:00:00.000Z",
    resolvedAt: null,
    ...overrides,
  };
}

function renderPage() {
  render(
    <TestProviders initialEntries={["/account/reports"]}>
      <MyReportsPage />
    </TestProviders>,
  );
}

beforeEach(() => {
  useMyReports.mockReset();
});

describe("MyReportsPage", () => {
  it("lists each filed report with the reference code a member can quote back", async () => {
    useMyReports.mockReturnValue({
      data: [
        entry(),
        entry({ id: "report-2", reference: "QPR-2026-7BE2", status: "open" }),
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    renderPage();

    expect(await screen.findByText("QPR-2026-4A1C")).toBeInTheDocument();
    expect(screen.getByText("QPR-2026-7BE2")).toBeInTheDocument();
  });

  it("says a resolved report was closed, so the loop shuts without the bell", async () => {
    // The whole reason `resolvedAt` was plumbed through: a member who cleared
    // or missed the `report_resolved` notification still learns their report
    // was dealt with. An open one must NOT carry the same line.
    useMyReports.mockReturnValue({
      data: [
        entry({
          status: "resolved",
          resolvedAt: "2026-09-04T10:00:00.000Z",
        }),
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    renderPage();

    expect(await screen.findByText(/Closed/)).toBeInTheDocument();
  });

  it("leaves an open report without a closed line", async () => {
    useMyReports.mockReturnValue({
      data: [entry({ status: "open", resolvedAt: null })],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    renderPage();

    expect(await screen.findByText("QPR-2026-4A1C")).toBeInTheDocument();
    expect(screen.queryByText(/Closed/)).not.toBeInTheDocument();
  });

  it("explains that signed-out filings are missing rather than lost", async () => {
    useMyReports.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    renderPage();

    expect(
      await screen.findByText("You haven't filed any reports."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Reports filed while signed out aren't listed here/),
    ).toBeInTheDocument();
  });

  it("offers a retry on failure instead of reading as 'you filed none'", async () => {
    const refetch = vi.fn();
    useMyReports.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    renderPage();

    expect(
      await screen.findByText("We couldn't load your reports."),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalled();
    // The empty state must not also fire: "we couldn't load them" and "you
    // filed none" are different truths and only one of them is true here.
    expect(
      screen.queryByText("You haven't filed any reports."),
    ).not.toBeInTheDocument();
  });
});
