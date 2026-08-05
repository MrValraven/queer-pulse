import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { FinancesSection, HealthSection } from "./GovernanceSections";
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

describe("HealthSection (governance overview)", () => {
  it("renders the health figures and no error alert on a successful load", () => {
    render(
      <TestProviders>
        <HealthSection />
      </TestProviders>,
    );
    // Stat value is plain data (not i18n), so it resolves synchronously.
    expect(screen.getByText("247")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the error/retry state — not an empty grid — when the fetch failed", () => {
    overviewState = { ...overviewOk(), health: [], error: true };
    render(
      <TestProviders>
        <HealthSection />
      </TestProviders>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
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
});

describe("FinancesSection (governance finances)", () => {
  it("re-fetches finances via its own hook's retry, independent of the overview", () => {
    financesState = { ...financesOk(), error: true };
    render(
      <TestProviders>
        <FinancesSection />
      </TestProviders>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(financesRetry).toHaveBeenCalledTimes(1);
    expect(overviewRetry).not.toHaveBeenCalled();
  });
});
