import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  CouncilSection,
  DecisionsSection,
  ModerationSection,
  PrinciplesSection,
  RaiseSection,
} from "./GovernanceSections";
import type { GovernanceOverviewResult } from "./api/useGovernanceOverview";

/**
 * Extends the existing Health/Finances coverage to the five other governance
 * sections. The four overview-backed sections (Moderation, Council, Principles,
 * Decisions) all render `SectionError` (a synchronous `role="alert"` + a retry
 * button wired to the hook's `retry`) when the live fetch fails, instead of a
 * silently-empty list — so we mock the shared hook at its boundary and drive the
 * `error` flag. RaiseSection has no data hook but a real dual-mode branch: demo
 * shows a success toast, live an honest "coming soon" info toast (no backend
 * concern-intake endpoint exists) — so we flip a mutable `useDemoMode` and
 * capture `showToast`. `role="alert"`, the button role, and plain data (a
 * council name, a step number) are all synchronous.
 */

const retry = vi.fn();
let overviewState: GovernanceOverviewResult;

vi.mock("./api/useGovernanceOverview", () => ({
  useGovernanceOverview: () => overviewState,
}));

const showToast = vi.fn();
vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast }),
}));

let demoMode = true;
vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({
    demoMode,
    available: !demoMode,
    setDemoMode: () => {},
    toggle: () => {},
  }),
}));

function overviewOk(): GovernanceOverviewResult {
  return {
    health: [],
    moderationSteps: [],
    council: [],
    principles: [],
    decisions: [],
    loading: false,
    error: false,
    retry,
  };
}

beforeEach(() => {
  retry.mockReset();
  showToast.mockReset();
  demoMode = true;
  overviewState = overviewOk();
});

describe("ModerationSection", () => {
  it("renders the numbered steps on a successful load", () => {
    overviewState = {
      ...overviewOk(),
      moderationSteps: [
        {
          titleKey: "governance:steps.a.title",
          textKey: "governance:steps.a.text",
        },
      ],
    };
    render(
      <TestProviders>
        <ModerationSection />
      </TestProviders>,
    );
    // The step ordinal is plain data (index + 1), not i18n.
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the retry alert and re-fetches when the overview failed", () => {
    overviewState = { ...overviewOk(), error: true };
    render(
      <TestProviders>
        <ModerationSection />
      </TestProviders>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});

describe("CouncilSection", () => {
  it("renders each seat's (plain-data) name on a successful load", () => {
    overviewState = {
      ...overviewOk(),
      council: [
        {
          name: "Alex Rivera",
          initials: "AR",
          roleKey: "governance:council.chair",
          background: "rgba(0,0,0,.1)",
          color: "var(--plum)",
        },
      ],
    };
    render(
      <TestProviders>
        <CouncilSection />
      </TestProviders>,
    );
    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the retry alert and re-fetches on failure", () => {
    overviewState = { ...overviewOk(), error: true };
    render(
      <TestProviders>
        <CouncilSection />
      </TestProviders>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});

describe("PrinciplesSection", () => {
  it("shows the retry alert and re-fetches on failure", () => {
    overviewState = { ...overviewOk(), error: true };
    render(
      <TestProviders>
        <PrinciplesSection />
      </TestProviders>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});

describe("DecisionsSection", () => {
  it("shows the retry alert and re-fetches on failure", () => {
    overviewState = { ...overviewOk(), error: true };
    render(
      <TestProviders>
        <DecisionsSection />
      </TestProviders>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});

describe("RaiseSection dual-mode submit", () => {
  it("confirms with a success toast in demo mode", async () => {
    render(
      <TestProviders>
        <RaiseSection />
      </TestProviders>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Submit" }));
    expect(showToast).toHaveBeenCalledTimes(1);
    expect(showToast.mock.calls[0]![1]).toBe("success");
  });

  it("stays honest with an info 'coming soon' toast in live mode", async () => {
    demoMode = false;
    render(
      <TestProviders>
        <RaiseSection />
      </TestProviders>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Submit" }));
    expect(showToast).toHaveBeenCalledTimes(1);
    expect(showToast.mock.calls[0]![1]).toBe("info");
  });
});
