import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { HealthSection } from "./GovernanceSections";
import { FinancesSection } from "./GovernanceFinancesSection";
import type { GovernanceOverviewResult } from "./api/useGovernanceOverview";
import type { GovernanceFinancesResult } from "./api/useGovernanceFinances";

/**
 * The governance sections were reworked so a failed live fetch surfaces a
 * distinct error/retry state (`SectionError`, `role="alert"` + a "Try again"
 * button wired to the hook's `retry`) instead of a silently-empty grid. Both
 * data hooks now expose `error`/`retry`, so we mock them at the hook boundary
 * (precedent: `useAuthGateRedirect`/`GenesisPage` mock their hooks) and drive
 * the `error` flag, rather than standing up a live backend + MSW just to force
 * a rejection. `role="alert"` and the button role are static (not i18n), so the
 * assertions stay synchronous despite the lazy `governance` catalog.
 */

const overviewRetry = vi.fn();
let overviewState: GovernanceOverviewResult;

const financesRetry = vi.fn();
let financesState: GovernanceFinancesResult;

vi.mock("./api/useGovernanceOverview", () => ({
  useGovernanceOverview: () => overviewState,
}));

vi.mock("./api/useGovernanceFinances", () => ({
  useGovernanceFinances: () => financesState,
}));

function overviewOk(): GovernanceOverviewResult {
  return {
    health: [
      {
        value: "247",
        up: true,
        labelKey: "governance:health.stat.members.label",
        trendKey: "governance:health.trend.members",
        trendValues: undefined,
      },
    ],
    moderationSteps: [],
    council: [],
    principles: [],
    decisions: [],
    loading: false,
    error: false,
    retry: overviewRetry,
  };
}

function financesOk(): GovernanceFinancesResult {
  return {
    quarter: "2026-Q3",
    isPublished: true,
    provenance: { source: "manual", enteredAt: "2026-10-02T09:30:00.000Z" },
    stats: [],
    income: [],
    expense: [],
    eventNotes: [],
    reserve: null,
    partners: [],
    incomeTotal: null,
    expenseTotal: null,
    loading: false,
    error: false,
    retry: financesRetry,
  };
}

beforeEach(() => {
  overviewState = overviewOk();
  financesState = financesOk();
});

/**
 * `SectionError`'s alert, isolated from `ToastProvider`'s two always-mounted
 * live regions. Both toast regions render from first paint by design (WCAG
 * 4.1.3) and the assertive one also carries `role="alert"`, so a bare
 * `getByRole("alert")` matches multiple / a bare `queryByRole("alert")` is never
 * null. `SectionError` is the only alert that contains a retry button, so we
 * key off that. Returns null when no section is in its error state.
 */
function querySectionErrorAlert(): HTMLElement | null {
  return (
    screen
      .queryAllByRole("alert")
      .find((region) => within(region).queryByRole("button") !== null) ?? null
  );
}

describe("HealthSection (governance overview)", () => {
  it("renders the health figures and no error alert on a successful load", () => {
    render(
      <TestProviders>
        <HealthSection />
      </TestProviders>,
    );
    // Stat value is plain data (not i18n), so it resolves synchronously.
    expect(screen.getByText("247")).toBeInTheDocument();
    expect(querySectionErrorAlert()).toBeNull();
  });

  it("shows the error/retry state — not an empty grid — when the fetch failed", () => {
    overviewState = { ...overviewOk(), health: [], error: true };
    render(
      <TestProviders>
        <HealthSection />
      </TestProviders>,
    );
    expect(querySectionErrorAlert()).not.toBeNull();
    // The failed grid is replaced by the alert, so no stat value renders.
    expect(screen.queryByText("247")).not.toBeInTheDocument();
  });

  it("re-fetches the overview when the retry affordance is pressed", () => {
    overviewState = { ...overviewOk(), health: [], error: true };
    render(
      <TestProviders>
        <HealthSection />
      </TestProviders>,
    );
    // The only button inside the errored section is SectionError's retry.
    fireEvent.click(screen.getByRole("button"));
    expect(overviewRetry).toHaveBeenCalledTimes(1);
  });

  // PRD-448: with no entered tiles the section keeps its heading and says the
  // first report is still to come.
  it("shows the not-published line when the live overview has no tiles", async () => {
    overviewState = { ...overviewOk(), health: [] };
    render(
      <TestProviders>
        <HealthSection />
      </TestProviders>,
    );
    expect(
      await screen.findByText(/appear here once the governance team/i),
    ).toBeInTheDocument();
    expect(querySectionErrorAlert()).toBeNull();
  });
});

describe("FinancesSection (governance finances)", () => {
  it("re-fetches finances via its own hook's retry, independent of the overview", () => {
    financesState = { ...financesOk(), error: true };
    render(
      <TestProviders>
        <FinancesSection />
      </TestProviders>,
    );
    const sectionAlert = querySectionErrorAlert();
    expect(sectionAlert).not.toBeNull();
    fireEvent.click(within(sectionAlert!).getByRole("button"));
    expect(financesRetry).toHaveBeenCalledTimes(1);
    expect(overviewRetry).not.toHaveBeenCalled();
  });

  // PRD-447: the live endpoint's empty report renders one honest line where
  // the figures, the intro prose and the provenance label were.
  it("shows the not-published line when no report has been published", async () => {
    financesState = {
      ...financesOk(),
      quarter: null,
      isPublished: false,
      provenance: null,
    };
    render(
      <TestProviders>
        <FinancesSection />
      </TestProviders>,
    );
    expect(
      await screen.findByText(/once the first quarter is published/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/entered by the governance team/i)).toBeNull();
  });

  it("labels a published report with who entered the figures", async () => {
    render(
      <TestProviders>
        <FinancesSection />
      </TestProviders>,
    );
    expect(
      await screen.findByText(/entered by the governance team/i),
    ).toBeInTheDocument();
  });
});
